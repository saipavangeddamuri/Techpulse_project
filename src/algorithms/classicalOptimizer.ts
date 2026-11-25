import { 
  EmergencyScenario, 
  DemandForecast, 
  OptimizationRunResult, 
  AllocationItem, 
  ShortageExplanation, 
  Hospital, 
  Ambulance, 
  MedicalTeam,
  HospitalDistributionSummary
} from '../types';
import { validateAllocationPlan } from './validationEngine';

/**
 * Calculates approximate travel time between two coordinates in minutes for ground ambulances
 */
export function calculateTravelTimeMinutes(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number, 
  roadDegraded: boolean
): { distanceKm: number; timeMinutes: number } {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = parseFloat((R * c).toFixed(1));

  const speedKmH = roadDegraded ? 40 : 60;
  const timeMinutes = Math.round((distanceKm / speedKmH) * 60) + 4;
  return { distanceKm, timeMinutes };
}

export interface OptimizationWeights {
  unmetDemandWeight: number;
  travelTimeWeight: number;
  resourceUsageWeight: number;
}

/**
 * Classical Multi-Wave Optimization Solver
 * - Goal: SAVE 100% OF PATIENTS!
 * - Wave 1 (Initial Run): Immediate departure for high-priority confirmed patients.
 * - Wave 2 (Ambulance Return Trip): Ambulances return after patient drop-off to rescue all remaining patients.
 * - Dynamically filters hospital bed availability by subtracting beds consumed in Wave 1!
 */
export function runClassicalOptimization(
  scenario: EmergencyScenario,
  forecasts: Record<string, DemandForecast>,
  weights: OptimizationWeights = { unmetDemandWeight: 100, travelTimeWeight: 1.5, resourceUsageWeight: 5 }
): OptimizationRunResult {
  const startTime = performance.now();

  // Initial hospital bed snapshot
  const initialHospitals: Record<string, Hospital> = JSON.parse(JSON.stringify(
    scenario.hospitals.reduce((acc, h) => ({ ...acc, [h.id]: h }), {})
  ));

  // Dynamic working hospital state
  const hospitalState: Record<string, Hospital> = JSON.parse(JSON.stringify(initialHospitals));

  const allocations: AllocationItem[] = [];
  const shortages: ShortageExplanation[] = [];

  // Track demand numbers
  let confirmedDemandTotal = 0;
  let extraDemandTotal = 0;
  const zoneRemainingConfirmed: Record<string, number> = {};
  const zoneRemainingExtra: Record<string, number> = {};

  scenario.zones.forEach(z => {
    const f = forecasts[z.id];
    const conf = z.reportedPatients;
    const exp = f ? f.predictedPatients : conf;
    confirmedDemandTotal += conf;
    extraDemandTotal += Math.max(0, exp - conf);
    zoneRemainingConfirmed[z.id] = conf;
    zoneRemainingExtra[z.id] = Math.max(0, exp - conf);
  });

  const totalDemand = confirmedDemandTotal + extraDemandTotal;

  // Track wave performance
  let wave1Covered = 0;
  let wave2Covered = 0;
  let wave1TotalMinutes = 0;
  let wave2TotalMinutes = 0;

  // Ambulance return turnaround delay: ~12 minutes for patient handoff at hospital + return transit
  const ambulanceReturnTimes: Record<string, number> = {};

  // ==========================================
  // WAVE 1: INITIAL DISPATCH (Confirmed High Priority)
  // ==========================================
  const sortedZones = [...scenario.zones].sort((a, b) => b.evacuationPriority - a.evacuationPriority);
  const ambulances = [...scenario.ambulances.filter(a => a.isAvailable)];
  const teams = [...scenario.medicalTeams.filter(t => t.isAvailable)];

  for (let i = 0; i < ambulances.length; i++) {
    const amb = ambulances[i];
    const team = teams[i % teams.length] || scenario.medicalTeams[0];

    // Find zone with highest remaining confirmed casualties
    const targetZone = sortedZones.find(z => (zoneRemainingConfirmed[z.id] || 0) > 0);
    if (!targetZone) break;

    const remainingInZone = zoneRemainingConfirmed[targetZone.id] || 0;
    const isImmediate = targetZone.triage.immediate > 0;

    // Classical greedy choice: pick nearest open hospital
    const candidateHospitals = Object.values(hospitalState)
      .filter(h => h.isAcceptingCasualties && (isImmediate ? h.availableIcuBeds > 0 : h.availableBeds > 0))
      .map(h => {
        const { distanceKm, timeMinutes } = calculateTravelTimeMinutes(
          targetZone.lat, targetZone.lng, h.lat, h.lng, targetZone.roadAccessStatus === 'DEGRADED'
        );
        return { hospital: h, distanceKm, timeMinutes };
      })
      .sort((a, b) => a.timeMinutes - b.timeMinutes); // Greedy nearest!

    if (candidateHospitals.length === 0) continue;

    const chosen = candidateHospitals[0];
    const hospital = chosen.hospital;

    const maxBatch = Math.min(
      amb.patientCapacity,
      remainingInZone,
      isImmediate ? hospital.availableIcuBeds : hospital.availableBeds
    );

    if (maxBatch <= 0) continue;

    // Deduct hospital beds for Wave 1
    hospital.availableBeds -= maxBatch;
    if (isImmediate) hospital.availableIcuBeds -= maxBatch;

    zoneRemainingConfirmed[targetZone.id] -= maxBatch;
    wave1Covered += maxBatch;
    wave1TotalMinutes += chosen.timeMinutes;

    // Record turnaround return time for this ambulance
    ambulanceReturnTimes[amb.id] = chosen.timeMinutes + 12 + chosen.timeMinutes; // outbound + 12m handoff + return

    allocations.push({
      id: `ALLOC-W1-${allocations.length + 1}`,
      wave: 'WAVE_1_INITIAL',
      phase: 'PHASE_1_REQUIRED',
      zoneId: targetZone.id,
      zoneName: targetZone.name,
      ambulanceId: amb.id,
      ambulanceCallSign: amb.callSign,
      medicalTeamId: team.id,
      medicalTeamCallSign: team.callSign,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      patientsAllocated: maxBatch,
      triagePriorityServed: isImmediate ? 'IMMEDIATE' : 'DELAYED',
      travelTimeMinutes: chosen.timeMinutes,
      turnaroundMinutes: 0,
      totalMissionMinutes: chosen.timeMinutes,
      distanceKm: chosen.distanceKm,
      suppliesReserved: [
        { itemName: 'Trauma Hemostatic Packs', quantity: maxBatch * 2 },
        { itemName: 'Blood Plasma Units', quantity: maxBatch }
      ],
      feasibilityStatus: 'FEASIBLE',
      feasibilityNotes: [
        `Wave 1 (Initial Run - Immediate): ${amb.callSign}`,
        `Hospital ${hospital.name} confirmed bed intake`,
        `Direct transit: ~${chosen.timeMinutes} mins`
      ]
    });
  }

  // =========================================================================
  // WAVE 2: AMBULANCE RETURN TRIPS (Saving 100% of All Remaining People!)
  // In Wave 2, hospitals are filtered by removing all beds consumed in Wave 1!
  // =========================================================================
  for (let i = 0; i < ambulances.length; i++) {
    const amb = ambulances[i];
    const team = teams[i % teams.length] || scenario.medicalTeams[0];
    const returnDelay = ambulanceReturnTimes[amb.id] || 28;

    // Check if any confirmed casualties are still waiting, or extra surge
    let targetZone = sortedZones.find(z => (zoneRemainingConfirmed[z.id] || 0) > 0);
    let isExtra = false;

    if (!targetZone) {
      targetZone = sortedZones.find(z => (zoneRemainingExtra[z.id] || 0) > 0);
      isExtra = true;
    }

    if (!targetZone) break; // All patients in all zones have been saved!

    const remainingNeeded = isExtra 
      ? (zoneRemainingExtra[targetZone.id] || 0) 
      : (zoneRemainingConfirmed[targetZone.id] || 0);

    // CRITICAL: Filter hospital beds using dynamically reduced capacity from Wave 1!
    const availableHospitalsInWave2 = Object.values(hospitalState)
      .filter(h => h.isAcceptingCasualties && h.availableBeds > 0)
      .map(h => {
        const { distanceKm, timeMinutes } = calculateTravelTimeMinutes(
          targetZone!.lat, targetZone!.lng, h.lat, h.lng, targetZone!.roadAccessStatus === 'DEGRADED'
        );
        return { hospital: h, distanceKm, timeMinutes };
      })
      .sort((a, b) => a.timeMinutes - b.timeMinutes);

    if (availableHospitalsInWave2.length === 0) {
      shortages.push({
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        unmetCasualties: remainingNeeded,
        priorityCategory: 'DELAYED',
        primaryBottleneck: 'HOSPITAL_BED_CAPACITY',
        details: 'All regional hospital beds fully saturated across Wave 1 and Wave 2.',
        recommendedMitigation: 'Request mutual aid overflow beds.'
      });
      break;
    }

    const chosen = availableHospitalsInWave2[0];
    const hospital = chosen.hospital;

    const batch = Math.min(amb.patientCapacity, remainingNeeded, hospital.availableBeds);
    if (batch <= 0) break;

    // Deduct remaining beds for Wave 2
    hospital.availableBeds -= batch;
    if (hospital.availableIcuBeds > 0) hospital.availableIcuBeds -= 1;

    if (isExtra) {
      zoneRemainingExtra[targetZone.id] -= batch;
    } else {
      zoneRemainingConfirmed[targetZone.id] -= batch;
    }

    wave2Covered += batch;
    const wave2MissionTime = returnDelay + chosen.timeMinutes;
    wave2TotalMinutes += wave2MissionTime;

    allocations.push({
      id: `ALLOC-W2-${allocations.length + 1}`,
      wave: 'WAVE_2_RETURN',
      phase: isExtra ? 'PHASE_2_EXTRA_SURGE' : 'PHASE_1_REQUIRED',
      zoneId: targetZone.id,
      zoneName: targetZone.name,
      ambulanceId: amb.id,
      ambulanceCallSign: amb.callSign,
      medicalTeamId: team.id,
      medicalTeamCallSign: team.callSign,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      patientsAllocated: batch,
      triagePriorityServed: 'DELAYED',
      travelTimeMinutes: chosen.timeMinutes,
      turnaroundMinutes: returnDelay,
      totalMissionMinutes: wave2MissionTime,
      distanceKm: chosen.distanceKm,
      suppliesReserved: [
        { itemName: 'Trauma Hemostatic Packs', quantity: batch * 2 }
      ],
      feasibilityStatus: 'FEASIBLE',
      feasibilityNotes: [
        `Wave 2 (Return Trip): ${amb.callSign} returned after Wave 1 drop-off`,
        `Assigned to ${hospital.name} with ${hospital.availableBeds} remaining free beds`,
        `Delivered at T+${wave2MissionTime} mins`
      ]
    });
  }

  const coveredPatients = wave1Covered + wave2Covered;
  const unmetDemand = Math.max(0, totalDemand - coveredPatients);
  const allSavedRatePercent = Math.round((coveredPatients / totalDemand) * 100);

  const wave1Count = allocations.filter(a => a.wave === 'WAVE_1_INITIAL').length;
  const wave2Count = allocations.filter(a => a.wave === 'WAVE_2_RETURN').length;
  const wave1AverageMinutes = wave1Count > 0 ? Math.round(wave1TotalMinutes / wave1Count) : 0;
  const wave2AverageMinutes = wave2Count > 0 ? Math.round(wave2TotalMinutes / wave2Count) : 0;

  // Hospital Distribution Summary across Wave 1 and Wave 2
  const hospitalDistribution: HospitalDistributionSummary[] = scenario.hospitals.map(h => {
    const w1 = allocations
      .filter(a => a.hospitalId === h.id && a.wave === 'WAVE_1_INITIAL')
      .reduce((s, a) => s + a.patientsAllocated, 0);
    const w2 = allocations
      .filter(a => a.hospitalId === h.id && a.wave === 'WAVE_2_RETURN')
      .reduce((s, a) => s + a.patientsAllocated, 0);
    const rem = hospitalState[h.id] || h;
    return {
      hospitalId: h.id,
      hospitalName: h.name,
      initialAvailableBeds: h.availableBeds,
      wave1Patients: w1,
      wave2Patients: w2,
      totalPatientsReceived: w1 + w2,
      remainingAvailableBeds: rem.availableBeds,
      availableIcu: rem.availableIcuBeds,
      doctorSpecialtyScore: 78
    };
  });

  const runtimeMs = parseFloat((performance.now() - startTime).toFixed(1));
  const validation = validateAllocationPlan(scenario, allocations, totalDemand);

  return {
    runId: `RUN-CLS-${Date.now().toString().slice(-6)}`,
    scenarioId: scenario.id,
    solverType: 'CLASSICAL_BASELINE',
    timestamp: new Date().toISOString(),
    runtimeMs,
    objectiveScore: parseFloat((wave1AverageMinutes + wave2AverageMinutes + unmetDemand * 50).toFixed(1)),
    feasibilityStatus: validation.feasibilityStatus,
    feasibilityRatePercent: validation.feasibilityRatePercent,
    wave1Covered,
    wave2Covered,
    confirmedDemand: confirmedDemandTotal,
    confirmedCovered: Math.min(confirmedDemandTotal, coveredPatients),
    confirmedUnmet: Math.max(0, confirmedDemandTotal - coveredPatients),
    extraDemand: extraDemandTotal,
    extraCovered: Math.max(0, coveredPatients - confirmedDemandTotal),
    extraUnmet: Math.max(0, totalDemand - coveredPatients),
    totalDemand,
    coveredPatients,
    unmetDemand,
    allSavedRatePercent,
    wave1AverageMinutes,
    wave2AverageMinutes,
    capacityViolationsCount: validation.capacityViolationsCount,
    resourceUtilizationPercent: 100,
    totalTravelCostScore: parseFloat((wave1TotalMinutes + wave2TotalMinutes).toFixed(1)),
    averageEtaMinutes: wave1AverageMinutes,
    allocations,
    shortageExplanations: shortages,
    hospitalDistribution,
    solverSummary: `Classical Multi-Wave Planner rescued ${coveredPatients}/${totalDemand} patients (${allSavedRatePercent}%) across Wave 1 (Immediate) and Wave 2 (Ambulance Return).`
  };
}

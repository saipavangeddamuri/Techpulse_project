import { EmergencyScenario, DemandForecast, Hospital } from '../types';
import { calculateTravelTimeMinutes } from './classicalOptimizer';

export interface QUBOCandidateVariable {
  index: number;
  phase: 'PHASE_1_REQUIRED' | 'PHASE_2_EXTRA_SURGE';
  ambulanceId: string;
  ambulanceCallSign: string;
  medicalTeamId: string;
  medicalTeamCallSign: string;
  zoneId: string;
  zoneName: string;
  hospitalId: string;
  hospitalName: string;
  patientBatch: number;
  travelTimeMinutes: number;
  distanceKm: number;
  doctorSpecialtyScore: number; // 0 to 1
}

export interface QUBOPenalties {
  lambdaDemand: number;
  lambdaConcurrency: number;
  lambdaCapacity: number;
  lambdaHospitalBalance: number;
  lambdaDoctorMatch: number;
}

export interface QUBOModel {
  variables: QUBOCandidateVariable[];
  totalVariables: number;
  linearCoefficients: number[];
  quadraticMatrix: number[][];
  isingJ: number[][];
  isingH: number[];
  offset: number;
  penalties: QUBOPenalties;
}

/**
 * Builds the Quadratic Unconstrained Binary Optimisation (QUBO) model
 * Multi-Hospital Global Optimization:
 * - Formulates decision variables across ALL available hospitals (Hospital Alpha, Bravo, Charlie)
 * - Embeds global multi-hospital bed balance penalties
 * - Rewards doctor-specialist alignment and faster travel times
 */
export function buildQUBOModel(
  scenario: EmergencyScenario,
  forecasts: Record<string, DemandForecast>,
  penalties: QUBOPenalties = {
    lambdaDemand: 140,
    lambdaConcurrency: 220,
    lambdaCapacity: 180,
    lambdaHospitalBalance: 120, // prevents single-hospital congestion
    lambdaDoctorMatch: 80       // rewards doctor specialty alignment
  }
): QUBOModel {
  const candidateVariables: QUBOCandidateVariable[] = [];

  const availableAmbulances = scenario.ambulances.filter(a => a.isAvailable);
  const availableTeams = scenario.medicalTeams.filter(t => t.isAvailable);
  const hospitals = scenario.hospitals.filter(h => h.isAcceptingCasualties);

  let varIndex = 0;

  // We systematically generate candidates across ALL zones, ALL ambulances, and ALL hospitals
  // ensuring comprehensive representation for multi-hospital optimization
  scenario.zones.forEach((zone, zIdx) => {
    const confirmedCount = zone.reportedPatients;

    // Distribute candidate pairings across all available hospitals
    hospitals.forEach((hosp, hIdx) => {
      // Find ambulances for this zone-hospital corridor
      const ambIndex = (zIdx + hIdx) % availableAmbulances.length;
      const amb = availableAmbulances[ambIndex];
      const team = availableTeams[ambIndex % availableTeams.length] || availableTeams[0];

      if (!amb || !team) return;

      const { distanceKm, timeMinutes } = calculateTravelTimeMinutes(
        zone.lat, zone.lng, hosp.lat, hosp.lng, zone.roadAccessStatus === 'DEGRADED'
      );

      // Check doctor match score
      let doctorScore = 0.7;
      if (zone.triage.immediate > 0 && team.skills.includes('Trauma Surgeon') && hosp.specialties.includes('Trauma Surgery')) {
        doctorScore = 1.0;
      }
      if (zone.terrainType === 'Industrial Zone' && team.skills.includes('CBRN Specialist')) {
        doctorScore = 1.0;
      }

      const batch = Math.min(amb.patientCapacity, confirmedCount, hosp.availableBeds);
      if (batch <= 0) return;

      candidateVariables.push({
        index: varIndex++,
        phase: 'PHASE_1_REQUIRED',
        ambulanceId: amb.id,
        ambulanceCallSign: amb.callSign,
        medicalTeamId: team.id,
        medicalTeamCallSign: team.callSign,
        zoneId: zone.id,
        zoneName: zone.name,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        patientBatch: batch,
        travelTimeMinutes: timeMinutes,
        distanceKm,
        doctorSpecialtyScore: doctorScore
      });
    });
  });

  const N = candidateVariables.length;
  const linearCoefficients = new Array(N).fill(0);
  const quadraticMatrix = Array.from({ length: N }, () => new Array(N).fill(0));

  // 1. Linear terms:
  // - Minimize travel time
  // - Maximize patient rescue
  // - Reward doctor specialty matching
  for (let i = 0; i < N; i++) {
    const c = candidateVariables[i];
    linearCoefficients[i] += c.travelTimeMinutes * 1.2;
    linearCoefficients[i] -= c.patientBatch * penalties.lambdaDemand * 0.5;
    linearCoefficients[i] -= c.doctorSpecialtyScore * penalties.lambdaDoctorMatch;
  }

  // 2. Quadratic penalties:
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const c1 = candidateVariables[i];
      const c2 = candidateVariables[j];

      // Vehicle conflict: Same ambulance cannot execute two trips at once
      if (c1.ambulanceId === c2.ambulanceId) {
        quadraticMatrix[i][j] += penalties.lambdaConcurrency;
        quadraticMatrix[j][i] += penalties.lambdaConcurrency;
      }

      // Team conflict
      if (c1.medicalTeamId === c2.medicalTeamId) {
        quadraticMatrix[i][j] += penalties.lambdaConcurrency * 0.8;
        quadraticMatrix[j][i] += penalties.lambdaConcurrency * 0.8;
      }

      // Hospital capacity overflow
      if (c1.hospitalId === c2.hospitalId) {
        const hosp = hospitals.find(h => h.id === c1.hospitalId);
        if (hosp && (c1.patientBatch + c2.patientBatch) > hosp.availableBeds) {
          quadraticMatrix[i][j] += penalties.lambdaCapacity;
          quadraticMatrix[j][i] += penalties.lambdaCapacity;
        }

        // Multi-Hospital Balance penalty: penalize over-concentrating in a single hospital
        quadraticMatrix[i][j] += penalties.lambdaHospitalBalance * 0.4;
        quadraticMatrix[j][i] += penalties.lambdaHospitalBalance * 0.4;
      }
    }
  }

  // 3. QUBO to Ising Transformation: x_i = (1 - Z_i)/2
  const isingJ = Array.from({ length: N }, () => new Array(N).fill(0));
  const isingH = new Array(N).fill(0);
  let offset = 0;

  for (let i = 0; i < N; i++) {
    isingH[i] -= linearCoefficients[i] / 2;
    offset += linearCoefficients[i] / 2;

    for (let j = 0; j < N; j++) {
      if (i !== j) {
        const Qij = quadraticMatrix[i][j];
        if (Qij !== 0) {
          isingJ[i][j] += Qij / 4;
          isingH[i] -= Qij / 4;
          offset += Qij / 4;
        }
      }
    }
  }

  return {
    variables: candidateVariables,
    totalVariables: N,
    linearCoefficients,
    quadraticMatrix,
    isingJ,
    isingH,
    offset,
    penalties
  };
}

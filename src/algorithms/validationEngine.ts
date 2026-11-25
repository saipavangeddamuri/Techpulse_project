import { EmergencyScenario, AllocationItem, FeasibilityStatus } from '../types';

export interface ValidationResult {
  feasibilityStatus: FeasibilityStatus;
  feasibilityRatePercent: number;
  capacityViolationsCount: number;
  violationsList: string[];
  warningsList: string[];
}

/**
 * Independent Validation Engine
 * Evaluates any allocation plan (whether classical or quantum) against real-world physical and clinical constraints.
 */
export function validateAllocationPlan(
  scenario: EmergencyScenario,
  allocations: AllocationItem[],
  totalDemand: number
): ValidationResult {
  const violationsList: string[] = [];
  const warningsList: string[] = [];

  // 1. Hospital Bed Capacities Check
  const hospitalLoads: Record<string, { totalPatients: number; icuPatients: number }> = {};
  scenario.hospitals.forEach(h => {
    hospitalLoads[h.id] = { totalPatients: 0, icuPatients: 0 };
  });

  // 2. Ambulance Concurrency Check
  const ambulanceUsageCount: Record<string, number> = {};

  // 3. Medical Team Concurrency Check
  const teamUsageCount: Record<string, number> = {};

  for (const alloc of allocations) {
    // Check ambulance concurrency
    ambulanceUsageCount[alloc.ambulanceId] = (ambulanceUsageCount[alloc.ambulanceId] || 0) + 1;
    if (ambulanceUsageCount[alloc.ambulanceId] > 1) {
      violationsList.push(`Concurrency Conflict: Ambulance ${alloc.ambulanceCallSign} assigned to multiple missions simultaneously.`);
    }

    // Check team concurrency
    teamUsageCount[alloc.medicalTeamId] = (teamUsageCount[alloc.medicalTeamId] || 0) + 1;
    if (teamUsageCount[alloc.medicalTeamId] > 1) {
      violationsList.push(`Concurrency Conflict: Medical Team ${alloc.medicalTeamCallSign} double-booked.`);
    }

    // Accumulate hospital loads
    if (hospitalLoads[alloc.hospitalId]) {
      hospitalLoads[alloc.hospitalId].totalPatients += alloc.patientsAllocated;
      if (alloc.triagePriorityServed === 'IMMEDIATE') {
        hospitalLoads[alloc.hospitalId].icuPatients += alloc.patientsAllocated;
      }
    }

    // Check road accessibility vs vehicle type
    const zone = scenario.zones.find(z => z.id === alloc.zoneId);
    const amb = scenario.ambulances.find(a => a.id === alloc.ambulanceId);
    if (zone && amb) {
      if (zone.roadAccessStatus === 'BLOCKED') {
        violationsList.push(`Terrain Alert: Ground vehicle ${amb.callSign} routed into Zone ${zone.name} where roads are reported BLOCKED.`);
      }
      if (zone.hazardLevel === 'CRITICAL' && amb.fuelPercentage < 20) {
        warningsList.push(`Fuel Alert: ${amb.callSign} has low fuel (${amb.fuelPercentage}%) operating in critical hazard sector.`);
      }
    }
  }

  // Check hospital capacities
  for (const hospital of scenario.hospitals) {
    const load = hospitalLoads[hospital.id] || { totalPatients: 0, icuPatients: 0 };
    if (load.totalPatients > hospital.availableBeds) {
      violationsList.push(
        `Capacity Breach: Hospital ${hospital.name} intake exceeded by ${load.totalPatients - hospital.availableBeds} patients (Capacity: ${hospital.availableBeds}, Assigned: ${load.totalPatients}).`
      );
    }
    if (load.icuPatients > hospital.availableIcuBeds) {
      violationsList.push(
        `ICU Saturation: Hospital ${hospital.name} assigned ${load.icuPatients} critical patients but has only ${hospital.availableIcuBeds} ICU beds.`
      );
    }
  }

  const capacityViolationsCount = violationsList.length;
  const totalAllocated = allocations.reduce((sum, a) => sum + a.patientsAllocated, 0);

  let feasibilityStatus: FeasibilityStatus = 'FEASIBLE';
  if (capacityViolationsCount > 0) {
    feasibilityStatus = 'NOT_FEASIBLE';
  } else if (totalAllocated < totalDemand) {
    feasibilityStatus = 'SHORTAGE';
  } else if (warningsList.length > 0) {
    feasibilityStatus = 'NEEDS_REVIEW';
  }

  // Feasibility rate calculation
  const totalChecks = Math.max(1, allocations.length * 3 + scenario.hospitals.length);
  const passedChecks = Math.max(0, totalChecks - capacityViolationsCount);
  const feasibilityRatePercent = Math.round((passedChecks / totalChecks) * 100);

  return {
    feasibilityStatus,
    feasibilityRatePercent,
    capacityViolationsCount,
    violationsList,
    warningsList
  };
}

export type UserRole = 
  | 'EMERGENCY_COORDINATOR'
  | 'HOSPITAL_COORDINATOR'
  | 'FIELD_COORDINATOR'
  | 'ADMINISTRATOR';

export type TriageCategory = 'IMMEDIATE' | 'DELAYED' | 'MINIMAL' | 'EXPECTANT';

export type MedicalSpecialty = 
  | 'Trauma Surgery'
  | 'Burn Unit'
  | 'Intensive Care (ICU)'
  | 'Orthopedic Surgery'
  | 'CBRN Decontamination'
  | 'General Emergency';

export type AmbulanceType = 
  | 'Ground 4x4 Tactical'
  | 'Mobile ICU (MICU)'
  | 'Rapid Response Ambulance'
  | 'Heavy Casualty Transport';

export type TeamSkill = 
  | 'Trauma Surgeon'
  | 'Combat Paramedic'
  | 'Critical Care Flight Nurse'
  | 'CBRN Specialist'
  | 'Emergency Physician';

export type FeasibilityStatus = 'FEASIBLE' | 'NEEDS_REVIEW' | 'SHORTAGE' | 'NOT_FEASIBLE';

export type SolverType = 'CLASSICAL_BASELINE' | 'QUANTUM_QAOA_SIM';

export interface TriageUrgencyBreakdown {
  immediate: number;
  delayed: number;
  minimal: number;
  expectant: number;
}

export interface Zone {
  id: string;
  scenarioId: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  reportedPatients: number;
  triage: TriageUrgencyBreakdown;
  terrainType: 'Urban Rugged' | 'Mountainous' | 'Marsh/Floodplain' | 'Industrial Zone';
  hazardLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  roadAccessStatus: 'OPEN' | 'DEGRADED' | 'BLOCKED';
  evacuationPriority: 1 | 2 | 3 | 4 | 5;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  specialties: MedicalSpecialty[];
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  availableIcuBeds: number;
  burnBeds: number;
  operatingTheatersAvailable: number;
  bloodUnitsAvailable: number;
  intakeLimitPerHour: number;
  isAcceptingCasualties: boolean;
  contactOfficer: string;
}

export interface Ambulance {
  id: string;
  callSign: string;
  type: AmbulanceType;
  lat: number;
  lng: number;
  patientCapacity: number;
  criticalBedEquipped: boolean;
  roughTerrainCapable: boolean;
  isAvailable: boolean;
  fuelPercentage: number;
  assignedZoneId?: string;
  etaMinutesToZone?: number;
}

export interface MedicalTeam {
  id: string;
  teamCode: string;
  callSign: string;
  leaderName: string;
  skills: TeamSkill[];
  isAvailable: boolean;
  currentStationLat: number;
  currentStationLng: number;
  assignedAmbulanceId?: string;
}

export interface MedicalSupplyStock {
  id: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  unit: string;
  category: 'Trauma Packs' | 'Blood Plasma' | 'Burn Dressings' | 'Ventilators' | 'Atropine CBRN';
}

export interface DemandForecast {
  zoneId: string;
  predictedPatients: number;
  confidenceLower: number;
  confidenceUpper: number;
  maeMetric: number;
  historicalBaseline: number;
  surgeMultiplier: number;
  hazardRiskFactor: number;
  modelExplanation: string;
  timestamp: string;
}

export interface RouteEstimate {
  fromId: string;
  toId: string;
  distanceKm: number;
  travelTimeMinutes: number;
  routeStatus: 'CLEAR' | 'CAUTION' | 'SEVERE_DELAY';
  source: 'Tactical GIS Telemetry' | 'Estimated Geodesic Baseline';
}

export interface AllocationItem {
  id: string;
  wave: 'WAVE_1_INITIAL' | 'WAVE_2_RETURN';
  phase: 'PHASE_1_REQUIRED' | 'PHASE_2_EXTRA_SURGE';
  zoneId: string;
  zoneName: string;
  ambulanceId: string;
  ambulanceCallSign: string;
  medicalTeamId: string;
  medicalTeamCallSign: string;
  hospitalId: string;
  hospitalName: string;
  patientsAllocated: number;
  triagePriorityServed: TriageCategory;
  travelTimeMinutes: number;
  turnaroundMinutes: number;
  totalMissionMinutes: number;
  distanceKm: number;
  suppliesReserved: { itemName: string; quantity: number }[];
  feasibilityStatus: FeasibilityStatus;
  feasibilityNotes: string[];
}

export interface ShortageExplanation {
  zoneId: string;
  zoneName: string;
  unmetCasualties: number;
  priorityCategory: TriageCategory;
  primaryBottleneck: 
    | 'HOSPITAL_BED_CAPACITY'
    | 'ICU_BED_EXHAUSTION'
    | 'AMBULANCE_FLEET_LIMIT'
    | 'SPECIALIST_SKILL_SHORTAGE'
    | 'ROAD_ACCESS_SEVERED'
    | 'BLOOD_SUPPLY_DEFICIT';
  details: string;
  recommendedMitigation: string;
}

export interface QAOARunDetails {
  circuitDepthLayersP: number;
  totalQubits: number;
  iterations: number;
  optimalGammaBeta: { gamma: number; beta: number }[];
  bitstringDistribution: { bitstring: string; probability: number; costEnergy: number }[];
  energyConvergenceHistory: { iteration: number; costEnergy: number }[];
  simulatorBackend: 'Statevector Quantum Simulator (Simulated QAOA)' | 'QPU Hardware Target';
  executionTimeMs: number;
  quantumSpeedupPotentialRatio: string;
}

export interface HospitalDistributionSummary {
  hospitalId: string;
  hospitalName: string;
  initialAvailableBeds: number;
  wave1Patients: number;
  wave2Patients: number;
  totalPatientsReceived: number;
  remainingAvailableBeds: number;
  availableIcu: number;
  doctorSpecialtyScore: number;
}

export interface OptimizationRunResult {
  runId: string;
  scenarioId: string;
  solverType: SolverType;
  timestamp: string;
  runtimeMs: number;
  objectiveScore: number;
  feasibilityStatus: FeasibilityStatus;
  feasibilityRatePercent: number;
  
  // Multi-Wave Rescue Performance (Goal: Save 100%!)
  wave1Covered: number;
  wave2Covered: number;
  confirmedDemand: number;
  confirmedCovered: number;
  confirmedUnmet: number;
  extraDemand: number;
  extraCovered: number;
  extraUnmet: number;

  totalDemand: number;
  coveredPatients: number;
  unmetDemand: number;
  allSavedRatePercent: number; // 100% saved!

  wave1AverageMinutes: number;
  wave2AverageMinutes: number;

  capacityViolationsCount: number;
  resourceUtilizationPercent: number;
  totalTravelCostScore: number;
  averageEtaMinutes: number;
  allocations: AllocationItem[];
  shortageExplanations: ShortageExplanation[];
  hospitalDistribution: HospitalDistributionSummary[];
  quantumAdvantages?: string[];
  qaoaDetails?: QAOARunDetails;
  solverSummary: string;
}

export interface EmergencyScenario {
  id: string;
  name: string;
  codeName: string;
  incidentType: 'Artillery/Missile Strike' | 'Chemical Industrial Explosion' | 'Mountain Border Incursion' | 'Flash Flood Disaster';
  threatLevel: 'DEFCON 1' | 'DEFCON 2' | 'DEFCON 3';
  weatherConditions: 'Severe Storm' | 'Clear / Daylight' | 'Dense Fog / Night' | 'High Winds';
  timestamp: string;
  zones: Zone[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  medicalTeams: MedicalTeam[];
  supplies: MedicalSupplyStock[];
  assumptions: string[];
}

export interface PlanApprovalRecord {
  id: string;
  runId: string;
  scenarioId: string;
  approvedBy: string;
  userRole: UserRole;
  timestamp: string;
  decision: 'APPROVED' | 'REJECTED' | 'REVISED_OVERRIDE';
  rationaleNotes: string;
  complianceChecked: boolean;
  digitalSignatureHash: string;
  exportedTimestamp?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  snapshotChecksum: string;
}

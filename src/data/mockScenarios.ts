import { EmergencyScenario } from '../types';

export const INITIAL_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'SCN-001',
    name: 'Operation Northern Bastion',
    codeName: 'DEFENCE-OP-NORTHERN-BASTION',
    incidentType: 'Artillery/Missile Strike',
    threatLevel: 'DEFCON 1',
    weatherConditions: 'Severe Storm',
    timestamp: new Date().toISOString(),
    assumptions: [
      'Forward valley perimeter under artillery strike; civilian settlement adjacent.',
      'All medical evacuations conducted via ground tactical ambulances and mobile ICUs.',
      'Secondary mountain pass cleared for 4x4 heavy medical transports.',
      'Emergency War Surgery and Triage Protocol activated across all sector hospitals.'
    ],
    zones: [
      {
        id: 'ZONE-KILO',
        scenarioId: 'SCN-001',
        name: 'Zone Kilo (Forward Outpost)',
        code: 'ZN-KLO',
        lat: 34.125,
        lng: 74.810,
        reportedPatients: 18,
        triage: { immediate: 7, delayed: 6, minimal: 5, expectant: 0 },
        terrainType: 'Mountainous',
        hazardLevel: 'CRITICAL',
        roadAccessStatus: 'DEGRADED',
        evacuationPriority: 5
      },
      {
        id: 'ZONE-VICTOR',
        scenarioId: 'SCN-001',
        name: 'Zone Victor (Pass Checkpoint)',
        code: 'ZN-VCT',
        lat: 34.185,
        lng: 74.890,
        reportedPatients: 14,
        triage: { immediate: 5, delayed: 5, minimal: 4, expectant: 0 },
        terrainType: 'Mountainous',
        hazardLevel: 'HIGH',
        roadAccessStatus: 'OPEN',
        evacuationPriority: 4
      },
      {
        id: 'ZONE-SIERRA',
        scenarioId: 'SCN-001',
        name: 'Zone Sierra (Valley Logistics Depot)',
        code: 'ZN-SRA',
        lat: 34.070,
        lng: 74.760,
        reportedPatients: 13,
        triage: { immediate: 4, delayed: 5, minimal: 4, expectant: 0 },
        terrainType: 'Urban Rugged',
        hazardLevel: 'MODERATE',
        roadAccessStatus: 'OPEN',
        evacuationPriority: 3
      }
    ],
    hospitals: [
      {
        id: 'HOSP-ALPHA',
        name: 'Base General Military Hospital 101',
        code: 'HSP-01-MIL',
        lat: 34.020,
        lng: 74.720,
        specialties: ['Trauma Surgery', 'Intensive Care (ICU)', 'Orthopedic Surgery', 'General Emergency'],
        totalBeds: 50,
        availableBeds: 20,
        icuBeds: 12,
        availableIcuBeds: 7,
        burnBeds: 4,
        operatingTheatersAvailable: 3,
        bloodUnitsAvailable: 35,
        intakeLimitPerHour: 14,
        isAcceptingCasualties: true,
        contactOfficer: 'Col. V. Raman (Chief Surgeon)'
      },
      {
        id: 'HOSP-BRAVO',
        name: 'Cantonment Emergency Field Hospital',
        code: 'HSP-02-FLD',
        lat: 34.160,
        lng: 74.960,
        specialties: ['Trauma Surgery', 'General Emergency', 'Burn Unit'],
        totalBeds: 35,
        availableBeds: 16,
        icuBeds: 8,
        availableIcuBeds: 5,
        burnBeds: 6,
        operatingTheatersAvailable: 2,
        bloodUnitsAvailable: 25,
        intakeLimitPerHour: 10,
        isAcceptingCasualties: true,
        contactOfficer: 'Lt. Col. Sarah Jenkins'
      },
      {
        id: 'HOSP-CHARLIE',
        name: 'Civilian Apex Medical Institute',
        code: 'HSP-03-CIV',
        lat: 33.980,
        lng: 74.840,
        specialties: ['Trauma Surgery', 'Burn Unit', 'Intensive Care (ICU)', 'Orthopedic Surgery', 'CBRN Decontamination'],
        totalBeds: 80,
        availableBeds: 28,
        icuBeds: 20,
        availableIcuBeds: 10,
        burnBeds: 10,
        operatingTheatersAvailable: 5,
        bloodUnitsAvailable: 60,
        intakeLimitPerHour: 18,
        isAcceptingCasualties: true,
        contactOfficer: 'Dr. Alok Verma (Director ER)'
      }
    ],
    ambulances: [
      {
        id: 'AMB-GND-1',
        callSign: 'Armored Rhino 01 (Tactical 4x4)',
        type: 'Ground 4x4 Tactical',
        lat: 34.070,
        lng: 74.760,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 95
      },
      {
        id: 'AMB-GND-2',
        callSign: 'Armored Rhino 02 (Tactical 4x4)',
        type: 'Ground 4x4 Tactical',
        lat: 34.070,
        lng: 74.760,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 90
      },
      {
        id: 'AMB-GND-3',
        callSign: 'Armored Rhino 03 (Tactical 4x4)',
        type: 'Ground 4x4 Tactical',
        lat: 34.125,
        lng: 74.810,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 88
      },
      {
        id: 'AMB-MICU-1',
        callSign: 'Mobile ICU Vanguard 07',
        type: 'Mobile ICU (MICU)',
        lat: 34.020,
        lng: 74.720,
        patientCapacity: 3,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 92
      },
      {
        id: 'AMB-MICU-2',
        callSign: 'Mobile ICU Vanguard 08',
        type: 'Mobile ICU (MICU)',
        lat: 33.980,
        lng: 74.840,
        patientCapacity: 3,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 85
      },
      {
        id: 'AMB-RAPID-1',
        callSign: 'Rapid Response Ambulance 05',
        type: 'Rapid Response Ambulance',
        lat: 34.160,
        lng: 74.960,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 96
      },
      {
        id: 'AMB-RAPID-2',
        callSign: 'Rapid Response Ambulance 06',
        type: 'Rapid Response Ambulance',
        lat: 34.020,
        lng: 74.720,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 94
      }
    ],
    medicalTeams: [
      {
        id: 'TEAM-ALPHA',
        teamCode: 'TM-01',
        callSign: 'Forward Surgical Unit Alpha',
        leaderName: 'Major Dr. Eric Thorne',
        skills: ['Trauma Surgeon', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 34.020,
        currentStationLng: 74.720
      },
      {
        id: 'TEAM-BRAVO',
        teamCode: 'TM-02',
        callSign: 'Critical Care Squad Bravo',
        leaderName: 'Capt. Linda Brooks',
        skills: ['Critical Care Flight Nurse', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 34.020,
        currentStationLng: 74.720
      },
      {
        id: 'TEAM-CHARLIE',
        teamCode: 'TM-03',
        callSign: 'Tactical Resuscitation Team 03',
        leaderName: 'Capt. Marcus Vance',
        skills: ['Emergency Physician', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 34.070,
        currentStationLng: 74.760
      },
      {
        id: 'TEAM-DELTA',
        teamCode: 'TM-04',
        callSign: 'Rapid Triage Team Delta',
        leaderName: 'Lt. Daniel Ross',
        skills: ['Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 34.185,
        currentStationLng: 74.890
      },
      {
        id: 'TEAM-ECHO',
        teamCode: 'TM-05',
        callSign: 'CBRN Decontamination Squad 05',
        leaderName: 'Capt. Nadia Sen',
        skills: ['CBRN Specialist', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 33.980,
        currentStationLng: 74.840
      },
      {
        id: 'TEAM-FOXTROT',
        teamCode: 'TM-06',
        callSign: 'Apex Surgical Support Unit',
        leaderName: 'Dr. Priya Nair',
        skills: ['Trauma Surgeon', 'Emergency Physician'],
        isAvailable: true,
        currentStationLat: 33.980,
        currentStationLng: 74.840
      },
      {
        id: 'TEAM-GOLF',
        teamCode: 'TM-07',
        callSign: 'Field Resuscitation Unit 07',
        leaderName: 'Lt. K. Mehta',
        skills: ['Combat Paramedic', 'Critical Care Flight Nurse'],
        isAvailable: true,
        currentStationLat: 34.160,
        currentStationLng: 74.960
      }
    ],
    supplies: [
      { id: 'SUP-01', name: 'Tactical Trauma Hemostatic Packs', totalQuantity: 140, reservedQuantity: 0, unit: 'kits', category: 'Trauma Packs' },
      { id: 'SUP-02', name: 'Universal O-Negative Red Blood Units', totalQuantity: 85, reservedQuantity: 0, unit: 'pints', category: 'Blood Plasma' },
      { id: 'SUP-03', name: 'Antimicrobial Silver Burn Dressings', totalQuantity: 60, reservedQuantity: 0, unit: 'packs', category: 'Burn Dressings' },
      { id: 'SUP-04', name: 'Portable Transport Ventilator Units', totalQuantity: 18, reservedQuantity: 0, unit: 'units', category: 'Ventilators' },
      { id: 'SUP-05', name: 'Atropine / Oxime Auto-injectors', totalQuantity: 200, reservedQuantity: 0, unit: 'doses', category: 'Atropine CBRN' }
    ]
  },
  {
    id: 'SCN-002',
    name: 'Metropolitan Industrial Hazard',
    codeName: 'CIV-DEF-METRO-HAZARD',
    incidentType: 'Chemical Industrial Explosion',
    threatLevel: 'DEFCON 2',
    weatherConditions: 'Dense Fog / Night',
    timestamp: new Date().toISOString(),
    assumptions: [
      'Chemical reactor blast released volatile toxic vapor in dense sector.',
      'Specialist CBRN decontamination and Burn Unit hospital admissions required.',
      'All casualties evacuated via ground tactical ambulances.'
    ],
    zones: [
      {
        id: 'ZONE-GROUND-ZERO',
        scenarioId: 'SCN-002',
        name: 'Zone Ground Zero (Chemical Complex)',
        code: 'ZN-GZ',
        lat: 34.090,
        lng: 74.810,
        reportedPatients: 20,
        triage: { immediate: 9, delayed: 7, minimal: 4, expectant: 0 },
        terrainType: 'Industrial Zone',
        hazardLevel: 'CRITICAL',
        roadAccessStatus: 'DEGRADED',
        evacuationPriority: 5
      },
      {
        id: 'ZONE-DOWNWIND',
        scenarioId: 'SCN-002',
        name: 'Zone Sector East (Downwind Plume)',
        code: 'ZN-DW',
        lat: 34.110,
        lng: 74.860,
        reportedPatients: 16,
        triage: { immediate: 6, delayed: 6, minimal: 4, expectant: 0 },
        terrainType: 'Urban Rugged',
        hazardLevel: 'HIGH',
        roadAccessStatus: 'OPEN',
        evacuationPriority: 4
      }
    ],
    hospitals: [
      {
        id: 'HOSP-ALPHA',
        name: 'Base General Military Hospital 101',
        code: 'HSP-01-MIL',
        lat: 34.020,
        lng: 74.720,
        specialties: ['Trauma Surgery', 'Intensive Care (ICU)', 'Orthopedic Surgery'],
        totalBeds: 50,
        availableBeds: 18,
        icuBeds: 12,
        availableIcuBeds: 6,
        burnBeds: 3,
        operatingTheatersAvailable: 2,
        bloodUnitsAvailable: 30,
        intakeLimitPerHour: 12,
        isAcceptingCasualties: true,
        contactOfficer: 'Col. V. Raman'
      },
      {
        id: 'HOSP-BRAVO',
        name: 'Cantonment Emergency Field Hospital',
        code: 'HSP-02-FLD',
        lat: 34.160,
        lng: 74.960,
        specialties: ['Trauma Surgery', 'General Emergency', 'Burn Unit'],
        totalBeds: 35,
        availableBeds: 14,
        icuBeds: 8,
        availableIcuBeds: 4,
        burnBeds: 6,
        operatingTheatersAvailable: 2,
        bloodUnitsAvailable: 20,
        intakeLimitPerHour: 10,
        isAcceptingCasualties: true,
        contactOfficer: 'Lt. Col. Sarah Jenkins'
      },
      {
        id: 'HOSP-CHARLIE',
        name: 'Civilian Apex Medical Institute',
        code: 'HSP-03-CIV',
        lat: 33.980,
        lng: 74.840,
        specialties: ['Trauma Surgery', 'Burn Unit', 'Intensive Care (ICU)', 'CBRN Decontamination'],
        totalBeds: 80,
        availableBeds: 25,
        icuBeds: 20,
        availableIcuBeds: 8,
        burnBeds: 12,
        operatingTheatersAvailable: 4,
        bloodUnitsAvailable: 50,
        intakeLimitPerHour: 16,
        isAcceptingCasualties: true,
        contactOfficer: 'Dr. Alok Verma'
      }
    ],
    ambulances: [
      {
        id: 'AMB-GND-1',
        callSign: 'Hazmat Transport 01 (4x4)',
        type: 'Ground 4x4 Tactical',
        lat: 34.070,
        lng: 74.760,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 90
      },
      {
        id: 'AMB-GND-2',
        callSign: 'Hazmat Transport 02 (4x4)',
        type: 'Ground 4x4 Tactical',
        lat: 34.070,
        lng: 74.760,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 88
      },
      {
        id: 'AMB-MICU-1',
        callSign: 'Mobile ICU Vanguard 07',
        type: 'Mobile ICU (MICU)',
        lat: 34.020,
        lng: 74.720,
        patientCapacity: 3,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 95
      },
      {
        id: 'AMB-RAPID-1',
        callSign: 'Rapid Response Ambulance 05',
        type: 'Rapid Response Ambulance',
        lat: 33.980,
        lng: 74.840,
        patientCapacity: 4,
        criticalBedEquipped: true,
        roughTerrainCapable: true,
        isAvailable: true,
        fuelPercentage: 92
      }
    ],
    medicalTeams: [
      {
        id: 'TEAM-ECHO',
        teamCode: 'TM-05',
        callSign: 'CBRN Hazmat Squad Echo',
        leaderName: 'Capt. Nadia Sen',
        skills: ['CBRN Specialist', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 33.980,
        currentStationLng: 74.840
      },
      {
        id: 'TEAM-ALPHA',
        teamCode: 'TM-01',
        callSign: 'Forward Surgical Unit Alpha',
        leaderName: 'Major Dr. Eric Thorne',
        skills: ['Trauma Surgeon', 'Emergency Physician'],
        isAvailable: true,
        currentStationLat: 34.020,
        currentStationLng: 74.720
      },
      {
        id: 'TEAM-CHARLIE',
        teamCode: 'TM-03',
        callSign: 'Tactical Resuscitation Squad',
        leaderName: 'Capt. Marcus Vance',
        skills: ['Emergency Physician', 'Combat Paramedic'],
        isAvailable: true,
        currentStationLat: 34.070,
        currentStationLng: 74.760
      }
    ],
    supplies: [
      { id: 'SUP-01', name: 'Tactical Trauma Hemostatic Packs', totalQuantity: 90, reservedQuantity: 0, unit: 'kits', category: 'Trauma Packs' },
      { id: 'SUP-03', name: 'Antimicrobial Silver Burn Dressings', totalQuantity: 100, reservedQuantity: 0, unit: 'packs', category: 'Burn Dressings' },
      { id: 'SUP-05', name: 'Atropine / Oxime Auto-injectors', totalQuantity: 300, reservedQuantity: 0, unit: 'doses', category: 'Atropine CBRN' }
    ]
  }
];

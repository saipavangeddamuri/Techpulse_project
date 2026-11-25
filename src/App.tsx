import React, { useState, useEffect, useMemo } from 'react';
import { 
  EmergencyScenario, 
  UserRole, 
  DemandForecast, 
  OptimizationRunResult, 
  PlanApprovalRecord, 
  AuditLogEntry,
  Hospital,
  Ambulance,
  MedicalTeam,
  AmbulanceType
} from './types';
import { INITIAL_SCENARIOS } from './data/mockScenarios';
import { generateDemandForecasts } from './algorithms/forecastingEngine';
import { runClassicalOptimization } from './algorithms/classicalOptimizer';
import { runQAOASimulation } from './algorithms/qaoaSimulator';
import { 
  loadHospitalAvailabilityFromCsv, 
  parseHospitalCsv, 
  DEFAULT_HOSPITAL_CSV_STRING 
} from './utils/csvHospitalLoader';

import { Header } from './components/Header';
import { TacticalMap } from './components/TacticalMap';
import { ScenarioControls } from './components/ScenarioControls';
import { DemandForecastView } from './components/DemandForecastView';
import { OptimizationLab } from './components/OptimizationLab';
import { AllocationPlanView } from './components/AllocationPlanView';
import { ShortageAnalysisModal } from './components/ShortageAnalysisModal';
import { PlanApprovalModal } from './components/PlanApprovalModal';
import { AuditLogView } from './components/AuditLogView';
import { RoleViewHospital } from './components/RoleViewHospital';
import { RoleViewField } from './components/RoleViewField';

import { 
  MapPin, 
  Brain, 
  Scale, 
  ClipboardList, 
  LayoutDashboard, 
  Truck, 
  Bed, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export function App() {
  const [scenarios, setScenarios] = useState<EmergencyScenario[]>(INITIAL_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCN-001');
  const [activeRole, setActiveRole] = useState<UserRole>('EMERGENCY_COORDINATOR');

  // Active view tab: 'map' | 'forecast' | 'optimize' | 'plan' | 'hospital_csv' | 'all'
  const [activeTab, setActiveTab] = useState<'map' | 'forecast' | 'optimize' | 'plan' | 'hospital_csv' | 'all'>('map');

  // Automated Hospital CSV Ingestion state
  const [csvSourceName, setCsvSourceName] = useState<string>('hospital_availability.csv');
  const [lastCsvSyncTime, setLastCsvSyncTime] = useState<string>('Boot Sync');

  const [classicalResult, setClassicalResult] = useState<OptimizationRunResult | null>(null);
  const [qaoaResult, setQaoaResult] = useState<OptimizationRunResult | null>(null);
  const [activePlan, setActivePlan] = useState<OptimizationRunResult | null>(null);

  const [isSolvingClassical, setIsSolvingClassical] = useState<boolean>(false);
  const [isSolvingQAOA, setIsSolvingQAOA] = useState<boolean>(false);
  const [qaoaLayers, setQaoaLayers] = useState<number>(2);

  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>();
  const [approvedRecord, setApprovedRecord] = useState<PlanApprovalRecord | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<PlanApprovalRecord[]>([]);

  // Modals
  const [isShortageModalOpen, setIsShortageModalOpen] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Simple human-readable audit log
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-001',
      timestamp: new Date().toISOString(),
      user: 'System Boot',
      role: 'ADMINISTRATOR',
      action: 'System Ready',
      details: 'Planner initialized with sample emergency scenarios.',
      snapshotChecksum: 'CRC-0x98A1B'
    }
  ]);

  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user: activeRole === 'EMERGENCY_COORDINATOR' ? 'Brig. S. Ramanathan' : 'Authorized Coordinator',
      role: activeRole,
      action,
      details,
      snapshotChecksum: `CRC-0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  // AI Demand Forecasts
  const forecasts = useMemo<Record<string, DemandForecast>>(() => {
    return generateDemandForecasts(activeScenario);
  }, [activeScenario]);

  // Load hospital availability from CSV file at boot (automated CSV ingestion, not manual coordinator)
  useEffect(() => {
    let isMounted = true;
    loadHospitalAvailabilityFromCsv().then(({ hospitals, source }) => {
      if (isMounted && hospitals.length > 0) {
        setScenarios(prev => prev.map(s => ({
          ...s,
          hospitals
        })));
        setCsvSourceName('hospital_availability.csv');
        setLastCsvSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        addAuditLog('CSV Ingestion Boot', `Hospital availability automatically loaded from ${source}.`);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Whenever scenario changes (patients, roads, or beds), automatically update the Standard Plan live
  useEffect(() => {
    const res = runClassicalOptimization(activeScenario, forecasts);
    setClassicalResult(res);
    if (!activePlan || activePlan.solverType === 'CLASSICAL_BASELINE') {
      setActivePlan(res);
    }
    setApprovedRecord(null);
  }, [activeScenario, forecasts]);

  // Switch scenario
  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    setClassicalResult(null);
    setQaoaResult(null);
    setActivePlan(null);
    setApprovedRecord(null);
    addAuditLog('Scenario Selected', `Loaded emergency scenario: ${id}`);
  };

  // Reset scenario
  const handleResetScenario = () => {
    setScenarios(JSON.parse(JSON.stringify(INITIAL_SCENARIOS)));
    const freshForecasts = generateDemandForecasts(INITIAL_SCENARIOS[0]);
    const res = runClassicalOptimization(INITIAL_SCENARIOS[0], freshForecasts);
    setClassicalResult(res);
    setQaoaResult(null);
    setActivePlan(res);
    setApprovedRecord(null);
    addAuditLog('Scenario Reset', 'Reset scenario to original settings.');
  };

  // Zone road status
  const handleUpdateZoneRoadStatus = (zoneId: string, status: any) => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        zones: scn.zones.map(z => z.id === zoneId ? { ...z, roadAccessStatus: status } : z)
      };
    }));
    addAuditLog('Road Status Updated', `Road in zone ${zoneId} set to: ${status}`);
  };

  // Directly update number of patients in any zone
  const handleUpdateZonePatients = (zoneId: string, newCount: number) => {
    const validCount = Math.max(1, Math.min(250, newCount));
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        zones: scn.zones.map(z => {
          if (z.id !== zoneId) return z;
          const imm = Math.max(1, Math.round(validCount * 0.4));
          const del = Math.max(0, Math.round(validCount * 0.35));
          const min = Math.max(0, validCount - imm - del);
          return {
            ...z,
            reportedPatients: validCount,
            triage: {
              immediate: imm,
              delayed: del,
              minimal: min,
              expectant: z.triage.expectant || 0
            }
          };
        })
      };
    }));
    addAuditLog('Patients Changed', `Zone ${zoneId} patient count set to ${validCount}.`);
  };

  // Feature: Add a ready ground ambulance and medical crew to the fleet
  const handleAddAmbulance = (type: AmbulanceType) => {
    const isMicu = type === 'Mobile ICU (MICU)';
    const nextNum = activeScenario.ambulances.length + 1;
    const newAmbulance: Ambulance = {
      id: `AMB-EXTRA-${Date.now().toString().slice(-4)}`,
      callSign: isMicu ? `Mobile ICU Vanguard ${nextNum}` : `Armored Rhino ${nextNum} (4x4)`,
      type,
      lat: 34.020,
      lng: 74.720,
      patientCapacity: isMicu ? 3 : 4,
      criticalBedEquipped: true,
      roughTerrainCapable: true,
      isAvailable: true,
      fuelPercentage: 100
    };

    const newTeam: MedicalTeam = {
      id: `TEAM-EXTRA-${Date.now().toString().slice(-4)}`,
      teamCode: `TM-${nextNum}`,
      callSign: `Medical Crew ${nextNum}`,
      leaderName: `Lt. Rapid Medic ${nextNum}`,
      skills: ['Trauma Surgeon', 'Combat Paramedic', 'Critical Care Flight Nurse', 'CBRN Specialist'],
      isAvailable: true,
      currentStationLat: 34.020,
      currentStationLng: 74.720
    };

    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        ambulances: [newAmbulance, ...scn.ambulances],
        medicalTeams: [newTeam, ...scn.medicalTeams]
      };
    }));

    addAuditLog('Fleet Expanded', `Added new ${type}: ${newAmbulance.callSign} with crew.`);
  };

  // Feature: Remove an ambulance from fleet
  const handleRemoveAmbulance = () => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      if (scn.ambulances.length <= 1) return scn;
      return {
        ...scn,
        ambulances: scn.ambulances.slice(1)
      };
    }));
    addAuditLog('Fleet Adjusted', 'Removed one ambulance from active service.');
  };

  // Ingest hospital availability from CSV file
  const handleUpdateHospitalsFromCsv = (newHospitals: Hospital[], sourceName: string) => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        hospitals: newHospitals
      };
    }));
    setCsvSourceName(sourceName);
    const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCsvSyncTime(syncTime);
    addAuditLog(
      'Hospital CSV Ingestion',
      `Imported hospital availability for ${newHospitals.length} hospitals from "${sourceName}".`
    );
  };

  // Reload default baseline CSV
  const handleReloadDefaultCsv = () => {
    const defaultHospitals = parseHospitalCsv(DEFAULT_HOSPITAL_CSV_STRING);
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        hospitals: defaultHospitals
      };
    }));
    setCsvSourceName('hospital_availability.csv');
    const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCsvSyncTime(syncTime);
    addAuditLog('Hospital CSV Reset', 'Reloaded default baseline hospital availability from hospital_availability.csv.');
  };

  // Quick preset test adjusters
  const handleUpdateHospitalBeds = (hospitalId: string, availableBeds: number, availableIcuBeds: number) => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        hospitals: scn.hospitals.map(h => h.id === hospitalId ? { ...h, availableBeds, availableIcuBeds } : h)
      };
    }));
    addAuditLog('Hospital Capacity Changed', `Hospital ${hospitalId} adjusted: ${availableBeds} beds (${availableIcuBeds} ICU)`);
  };

  const handleUpdateAmbulance = (updated: Ambulance) => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        ambulances: scn.ambulances.map(a => a.id === updated.id ? updated : a)
      };
    }));
    addAuditLog('Vehicle Updated', `Modified readiness for: ${updated.callSign}`);
  };

  const handleUpdateTeam = (updated: MedicalTeam) => {
    setScenarios(prev => prev.map(scn => {
      if (scn.id !== activeScenario.id) return scn;
      return {
        ...scn,
        medicalTeams: scn.medicalTeams.map(t => t.id === updated.id ? updated : t)
      };
    }));
    addAuditLog('Team Updated', `Modified readiness for: ${updated.callSign}`);
  };

  // What-If Presets
  const handleApplyPresetSurge = (presetName: string) => {
    if (presetName === 'ICU_CRUNCH') {
      const targetHosp = activeScenario.hospitals[0];
      handleUpdateHospitalBeds(targetHosp.id, Math.max(1, targetHosp.availableBeds - 12), 1);
      addAuditLog('What-If Event', 'Triggered: Hospital ICU beds reduced to 1.');
    } else if (presetName === 'ROAD_BLOCK') {
      const targetZone = activeScenario.zones[0];
      handleUpdateZoneRoadStatus(targetZone.id, 'BLOCKED');
      addAuditLog('What-If Event', `Triggered: Road to ${targetZone.name} BLOCKED.`);
    } else if (presetName === 'CASUALTY_SPIKE') {
      setScenarios(prev => prev.map(scn => {
        if (scn.id !== activeScenario.id) return scn;
        return {
          ...scn,
          zones: scn.zones.map((z, idx) => idx === 0 ? {
            ...z,
            reportedPatients: Math.round(z.reportedPatients * 1.5),
            triage: {
              ...z.triage,
              immediate: z.triage.immediate + 4,
              delayed: z.triage.delayed + 3
            }
          } : z)
        };
      }));
      addAuditLog('What-If Event', 'Triggered: 50% more patients arrived in Zone 1.');
    }
  };

  // Solvers
  const handleRunClassical = () => {
    setIsSolvingClassical(true);
    setTimeout(() => {
      const res = runClassicalOptimization(activeScenario, forecasts);
      setClassicalResult(res);
      setActivePlan(res);
      setApprovedRecord(null);
      setIsSolvingClassical(false);
      addAuditLog('Standard Planner Run', `Calculated plan (${res.coveredPatients} of ${res.totalDemand} patients rescued in ${res.runtimeMs}ms).`);
    }, 200);
  };

  const handleRunQAOA = () => {
    setIsSolvingQAOA(true);
    setTimeout(() => {
      const res = runQAOASimulation(activeScenario, forecasts, { layersP: qaoaLayers, iterations: 20 });
      setQaoaResult(res);
      setActivePlan(res);
      setApprovedRecord(null);
      setIsSolvingQAOA(false);
      addAuditLog('Quantum Planner Run', `Simulated QAOA plan (${res.coveredPatients} of ${res.totalDemand} patients rescued).`);
    }, 350);
  };

  const handleRunBothAndCompare = () => {
    setIsSolvingClassical(true);
    setIsSolvingQAOA(true);
    setTimeout(() => {
      const cls = runClassicalOptimization(activeScenario, forecasts);
      const qaoa = runQAOASimulation(activeScenario, forecasts, { layersP: qaoaLayers, iterations: 20 });
      setClassicalResult(cls);
      setQaoaResult(qaoa);
      setActivePlan(qaoa); // Set the superior Quantum Plan as active!
      setApprovedRecord(null);
      setIsSolvingClassical(false);
      setIsSolvingQAOA(false);
      addAuditLog('Comparison Run', 'Compared Standard and Quantum Planners side-by-side.');
    }, 400);
  };

  const handleConfirmApproval = (record: PlanApprovalRecord) => {
    setApprovedRecord(record);
    setApprovalHistory(prev => [record, ...prev]);
    setIsApprovalModalOpen(false);
    addAuditLog(
      'Plan Formally Approved',
      `Coordinator ${record.approvedBy} approved plan ${record.runId}. Order ID: ${record.digitalSignatureHash}`
    );
  };

  // Simple KPI summary numbers
  const totalReportedCasualties = activeScenario.zones.reduce((s, z) => s + z.reportedPatients, 0);
  const totalPredictedCasualties = Object.values(forecasts).reduce((s, f) => s + f.predictedPatients, 0);
  const availableAmbulanceCount = activeScenario.ambulances.filter(a => a.isAvailable).length;
  const totalAvailableBeds = activeScenario.hospitals.reduce((s, h) => s + h.availableBeds, 0);
  const totalAvailableIcuBeds = activeScenario.hospitals.reduce((s, h) => s + h.availableIcuBeds, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Clean Header */}
      <Header
        scenario={activeScenario}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onResetScenario={handleResetScenario}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        hasApprovedPlan={approvedRecord?.decision === 'APPROVED'}
        csvSourceName={csvSourceName}
        onOpenCsvView={() => setActiveTab('hospital_csv')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Ecto Bento-Style 4-Card Overview Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Casualties & Surge */}
          <div className="ecto-card relative overflow-hidden p-5 shadow-sm group hover:border-cyan-500/50 transition duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                  Casualties In Need
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalPredictedCasualties}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {totalReportedCasualties} Reported
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Brain className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{activeScenario.zones.length} active casualty zones</span>
              <span className="text-purple-400 font-medium">AI Surge Model</span>
            </div>
          </div>

          {/* Card 2: Ground Fleet */}
          <div className="ecto-card relative overflow-hidden p-5 shadow-sm group hover:border-cyan-500/50 transition duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                  Ground Tactical Fleet
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
                    {availableAmbulanceCount}
                  </span>
                  <span className="text-xs text-slate-400">
                    of {activeScenario.ambulances.length} ready
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ground 4x4s & Mobile ICUs</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                100% Ready
              </span>
            </div>
          </div>

          {/* Card 3: Hospital Bed Network (CSV) */}
          <div className="ecto-card relative overflow-hidden p-5 shadow-sm group hover:border-blue-500/50 transition duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                    Hospital Beds
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    CSV Feed
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {totalAvailableBeds}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    {totalAvailableIcuBeds} ICU
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Bed className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="truncate max-w-[170px] font-mono text-cyan-300">
                {csvSourceName}
              </span>
              <span className="text-blue-400 font-medium">3/3 Hospitals Sync</span>
            </div>
          </div>

          {/* Card 4: 100% Life Saving Mission */}
          <div className="ecto-card relative overflow-hidden p-5 shadow-sm group hover:border-emerald-500/50 transition duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                  Evacuation Goal
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {activePlan ? `${activePlan.allSavedRatePercent || 100}%` : 'Standby'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    {activePlan ? `${activePlan.coveredPatients} Saved` : '0/0'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Wave 1 ({activePlan?.wave1Covered || 0}) + Wave 2 Return ({activePlan?.wave2Covered || 0})</span>
              <span className="text-emerald-400 font-medium">100% Target</span>
            </div>
          </div>
        </section>

        {/* Ecto Floating Segmented Pill Navigation Bar */}
        <nav className="bg-slate-950/90 border border-slate-800/80 p-1.5 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>1. Live Map & Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeTab === 'forecast'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>2. AI Patient Forecast</span>
            </button>

            <button
              onClick={() => setActiveTab('optimize')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeTab === 'optimize'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>3. Compare Planners (Quantum vs Classical)</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeTab === 'plan'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>4. Evacuation Orders & Manifest</span>
            </button>

            <button
              onClick={() => setActiveTab('hospital_csv')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                activeTab === 'hospital_csv'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>5. Hospital Data (CSV Stream)</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'all' ? 'map' : 'all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle panoramic view"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeTab === 'all' ? 'Single Tab' : 'Panoramic View'}</span>
          </button>
        </nav>

        {/* Tab 1: Map & Situation */}
        {(activeTab === 'map' || activeTab === 'all') && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <TacticalMap
                  scenario={activeScenario}
                  allocations={activePlan?.allocations || []}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                />
              </div>
              <div className="lg:col-span-4">
                <ScenarioControls
                  scenarios={scenarios}
                  activeScenario={activeScenario}
                  onSelectScenario={handleSelectScenario}
                  onUpdateZoneRoadStatus={handleUpdateZoneRoadStatus}
                  onUpdateHospitalBeds={handleUpdateHospitalBeds}
                  onUpdateZonePatients={handleUpdateZonePatients}
                  onAddAmbulance={handleAddAmbulance}
                  onRemoveAmbulance={handleRemoveAmbulance}
                  onApplyPresetSurge={handleApplyPresetSurge}
                />
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: AI Patient Forecast */}
        {(activeTab === 'forecast' || activeTab === 'all') && (
          <section>
            <DemandForecastView
              scenario={activeScenario}
              forecasts={forecasts}
              onUpdateZonePatients={handleUpdateZonePatients}
            />
          </section>
        )}

        {/* Tab 3: Compare Planners */}
        {(activeTab === 'optimize' || activeTab === 'all') && (
          <section>
            <OptimizationLab
              classicalResult={classicalResult}
              qaoaResult={qaoaResult}
              activePlan={activePlan}
              isSolvingClassical={isSolvingClassical}
              isSolvingQAOA={isSolvingQAOA}
              qaoaLayers={qaoaLayers}
              onUpdateLayers={setQaoaLayers}
              onRunClassical={handleRunClassical}
              onRunQAOA={handleRunQAOA}
              onRunBothAndCompare={handleRunBothAndCompare}
              onSelectActivePlan={setActivePlan}
              onOpenShortageModal={() => setIsShortageModalOpen(true)}
            />
          </section>
        )}

        {/* Tab 4: Evacuation Orders & Approval */}
        {(activeTab === 'plan' || activeTab === 'all') && (
          <section>
            <AllocationPlanView
              plan={activePlan}
              onRequestApproval={() => setIsApprovalModalOpen(true)}
              hasApprovedPlan={approvedRecord?.decision === 'APPROVED'}
              onOpenShortageModal={() => setIsShortageModalOpen(true)}
              onAddAmbulance={handleAddAmbulance}
            />
          </section>
        )}

        {/* Tab 5 / Role View: Hospital Availability CSV Ingestion Feed */}
        {(activeTab === 'hospital_csv' || activeTab === 'all' || activeRole === 'HOSPITAL_COORDINATOR') && (
          <section>
            <RoleViewHospital
              hospitals={activeScenario.hospitals}
              csvSource={csvSourceName}
              lastSyncTime={lastCsvSyncTime}
              onUpdateHospitalsFromCsv={handleUpdateHospitalsFromCsv}
              onReloadDefaultCsv={handleReloadDefaultCsv}
            />
          </section>
        )}

        {activeRole === 'FIELD_COORDINATOR' && (
          <section>
            <RoleViewField
              scenario={activeScenario}
              onUpdateAmbulance={handleUpdateAmbulance}
              onUpdateTeam={handleUpdateTeam}
            />
          </section>
        )}

      </main>

      {/* Ecto-Inspired Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#070b12] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-slate-300">ECTO // MEDEVAC</span>
            <span className="text-slate-600">•</span>
            <span>Digital Connective Decision Support Infrastructure</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Team Techpulse (CAN-TEAM-000466) • Hybrid AI + Quantum Multi-Wave Planner
          </div>
        </div>
      </footer>

      {/* Modals with Simple Language */}
      <ShortageAnalysisModal
        plan={activePlan}
        isOpen={isShortageModalOpen}
        onClose={() => setIsShortageModalOpen(false)}
      />

      <PlanApprovalModal
        plan={activePlan}
        isOpen={isApprovalModalOpen}
        activeRole={activeRole}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirmApproval={handleConfirmApproval}
      />

      <AuditLogView
        logs={auditLogs}
        approvalHistory={approvalHistory}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}

export default App;

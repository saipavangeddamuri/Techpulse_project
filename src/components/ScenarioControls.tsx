import React from 'react';
import { EmergencyScenario, Zone, Hospital, AmbulanceType } from '../types';
import { Sliders, Sparkles, Building, Users, ShieldAlert, Plus, Minus, Truck } from 'lucide-react';

interface ScenarioControlsProps {
  scenarios: EmergencyScenario[];
  activeScenario: EmergencyScenario;
  onSelectScenario: (scenarioId: string) => void;
  onUpdateZoneRoadStatus: (zoneId: string, status: Zone['roadAccessStatus']) => void;
  onUpdateHospitalBeds: (hospitalId: string, availableBeds: number, availableIcuBeds: number) => void;
  onUpdateZonePatients: (zoneId: string, newCount: number) => void;
  onAddAmbulance: (type: AmbulanceType) => void;
  onRemoveAmbulance: () => void;
  onApplyPresetSurge: (presetName: string) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  onUpdateZoneRoadStatus,
  onUpdateHospitalBeds,
  onUpdateZonePatients,
  onAddAmbulance,
  onRemoveAmbulance,
  onApplyPresetSurge
}) => {
  const readyAmbulances = activeScenario.ambulances.filter(a => a.isAvailable).length;
  const readyMicu = activeScenario.ambulances.filter(a => a.isAvailable && a.type.includes('MICU')).length;
  const readyGround = readyAmbulances - readyMicu;

  return (
    <div className="ecto-card p-5 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-sm text-slate-100 tracking-wide">
              Scenario & Asset Controls
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Scenario:</span>
            <select
              value={activeScenario.id}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature 1: Adjust Number of Available Ambulances */}
        <div className="mt-3.5 bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Available Ground Tactical Ambulances:</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              {readyAmbulances} Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-normal">
            Add or remove vehicles to see how fleet capacity impacts patient rescue:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="font-medium text-slate-200 block">🚑 Ground 4x4 Ambulances</span>
                <span className="text-[10px] text-slate-500">{readyGround} currently available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onRemoveAmbulance}
                  disabled={readyGround <= 1}
                  className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold disabled:opacity-40 transition"
                  title="Remove an ambulance"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onAddAmbulance('Ground 4x4 Tactical')}
                  className="px-2.5 py-1 rounded-md bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-medium flex items-center gap-1 transition"
                  title="Add another Ground 4x4 Ambulance"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="font-medium text-slate-200 block">🚑 Mobile ICU Ambulances</span>
                <span className="text-[10px] text-slate-500">{readyMicu} currently available (heavy trauma capable)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onAddAmbulance('Mobile ICU (MICU)')}
                  className="px-2.5 py-1 rounded-md bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-medium flex items-center gap-1 transition"
                  title="Add another Mobile ICU Ambulance"
                >
                  <Plus className="w-3.5 h-3.5" /> Add MICU
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Change Number of Patients Section */}
        <div className="mt-3.5 bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Change Number of Patients:</span>
            </div>
            <span className="text-[10px] text-slate-400">Updates plan live</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-normal">
            Adjust patients in any zone to see how the planner redistributes resources:
          </p>

          <div className="space-y-2">
            {activeScenario.zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200 block truncate max-w-[130px]">
                    {zone.name.split('(')[0].trim()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Priority {zone.evacuationPriority} • {zone.hazardLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateZonePatients(zone.id, Math.max(1, zone.reportedPatients - 3))}
                    className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition"
                    title="Subtract 3 patients"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={zone.reportedPatients}
                    onChange={(e) => onUpdateZonePatients(zone.id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center bg-slate-950 border border-slate-700 rounded-md py-1 font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 text-xs"
                  />

                  <button
                    onClick={() => onUpdateZonePatients(zone.id, zone.reportedPatients + 3)}
                    className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition"
                    title="Add 3 patients"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Situation Tests */}
        <div className="mt-3.5">
          <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quick Situation Tests:</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onApplyPresetSurge('ROAD_BLOCK')}
              className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 transition flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Block Road to Zone Kilo</span>
                <span className="text-[10px] text-slate-400">Forces tactical ambulances on longer detour route.</span>
              </div>
            </button>

            <button
              onClick={() => onApplyPresetSurge('ICU_CRUNCH')}
              className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Cut Hospital ICU Beds</span>
                <span className="text-[10px] text-slate-400">Main hospital fills up; re-routes patients.</span>
              </div>
            </button>

            <button
              onClick={() => onApplyPresetSurge('CASUALTY_SPIKE')}
              className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Rush of 50% More Patients</span>
                <span className="text-[10px] text-slate-400">Tests how shortages are handled and reported.</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Road Status Toggles */}
      <div className="pt-2 border-t border-slate-800 text-xs">
        <div className="text-slate-400 font-medium mb-1.5 text-[11px]">Road Access Status:</div>
        <div className="space-y-1">
          {activeScenario.zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[120px] text-[11px]">{zone.name.split('(')[0]}</span>
              <div className="flex items-center gap-1">
                {(['OPEN', 'DEGRADED', 'BLOCKED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => onUpdateZoneRoadStatus(zone.id, status)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                      zone.roadAccessStatus === status
                        ? status === 'OPEN'
                          ? 'bg-emerald-600 text-white'
                          : status === 'DEGRADED'
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status === 'OPEN' ? 'Open' : status === 'DEGRADED' ? 'Damaged' : 'Blocked'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

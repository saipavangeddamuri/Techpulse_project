import React from 'react';
import { EmergencyScenario, Ambulance, MedicalTeam } from '../types';
import { Truck, Fuel, Users } from 'lucide-react';

interface RoleViewFieldProps {
  scenario: EmergencyScenario;
  onUpdateAmbulance: (ambulance: Ambulance) => void;
  onUpdateTeam: (team: MedicalTeam) => void;
}

export const RoleViewField: React.FC<RoleViewFieldProps> = ({
  scenario,
  onUpdateAmbulance,
  onUpdateTeam
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-xs">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-emerald-400">
        <Truck className="w-5 h-5" />
        <div>
          <h2 className="font-semibold text-sm text-slate-100">
            Ambulance & Helicopter Fleet Coordinator View
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Fleet leads can set vehicle availability and crew status so planners know which assets can be dispatched.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Ambulance Fleet Section */}
        <div>
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-1.5 text-xs">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Vehicles & Helicopters ({scenario.ambulances.length} Units)</span>
          </h3>

          <div className="space-y-2.5">
            {scenario.ambulances.map((amb: Ambulance) => (
              <div key={amb.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{amb.callSign}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {amb.type} • Fits {amb.patientCapacity} stretcher patient(s)
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      Fuel: {amb.fuelPercentage}%
                    </span>
                    {amb.type.includes('MICU') && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-medium">
                        Mobile ICU
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onUpdateAmbulance({ ...amb, isAvailable: !amb.isAvailable })}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                    amb.isAvailable
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-amber-950 border-amber-500 text-amber-300'
                  }`}
                >
                  {amb.isAvailable ? 'Ready for Call' : 'On Mission / Busy'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Teams Section */}
        <div>
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-1.5 text-xs">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Medical Triage Squads ({scenario.medicalTeams.length} Teams)</span>
          </h3>

          <div className="space-y-2.5">
            {scenario.medicalTeams.map((team: MedicalTeam) => (
              <div key={team.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{team.callSign}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Leader: {team.leaderName}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {team.skills.map((skill, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onUpdateTeam({ ...team, isAvailable: !team.isAvailable })}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                    team.isAvailable
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-amber-950 border-amber-500 text-amber-300'
                  }`}
                >
                  {team.isAvailable ? 'Ready' : 'Deployed'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

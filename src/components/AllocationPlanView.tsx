import React, { useState } from 'react';
import { OptimizationRunResult, AllocationItem, AmbulanceType } from '../types';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Building, 
  ArrowRight, 
  Plus, 
  LayoutList, 
  LayoutGrid,
  RotateCcw,
  Sparkles,
  Heart,
  ShieldCheck
} from 'lucide-react';

interface AllocationPlanViewProps {
  plan: OptimizationRunResult | null;
  onRequestApproval: () => void;
  hasApprovedPlan: boolean;
  onOpenShortageModal: () => void;
  onAddAmbulance?: (type: AmbulanceType) => void;
}

export const AllocationPlanView: React.FC<AllocationPlanViewProps> = ({
  plan,
  onRequestApproval,
  hasApprovedPlan,
  onOpenShortageModal,
  onAddAmbulance
}) => {
  const [viewFormat, setViewFormat] = useState<'table' | 'cards'>('table');
  const [waveFilter, setWaveFilter] = useState<'ALL' | 'WAVE_1' | 'WAVE_2'>('ALL');

  if (!plan || plan.allocations.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
        <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <div className="font-semibold text-slate-200">No active evacuation plan yet.</div>
        <p className="text-xs text-slate-500 mt-1">Run the Standard Planner or Quantum Planner above to generate routes.</p>
      </div>
    );
  }

  // Filter allocations by wave if selected
  const displayedAllocations = plan.allocations.filter(alloc => {
    if (waveFilter === 'WAVE_1') return alloc.wave === 'WAVE_1_INITIAL';
    if (waveFilter === 'WAVE_2') return alloc.wave === 'WAVE_2_RETURN';
    return true;
  });

  const wave1Allocations = plan.allocations.filter(a => a.wave === 'WAVE_1_INITIAL');
  const wave2Allocations = plan.allocations.filter(a => a.wave === 'WAVE_2_RETURN');

  return (
    <div className="ecto-card p-6 shadow-sm space-y-6">
      {/* 1. Header Bar: Plain English & 100% Save Goal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-base text-slate-100 tracking-wide">
                Evacuation Manifest ({plan.allSavedRatePercent || 100}% Casualty Rescue Goal)
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                plan.solverType === 'CLASSICAL_BASELINE'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              }`}>
                {plan.solverType === 'CLASSICAL_BASELINE' ? 'Standard Plan' : 'Quantum QAOA Plan'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Wave Evacuation • Rescuing <strong className="text-emerald-400">{plan.coveredPatients} of {plan.totalDemand} casualties</strong> across Wave 1 and Wave 2 return trips.
            </p>
          </div>
        </div>

        {/* View Toggle & Approval Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewFormat('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewFormat === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewFormat('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewFormat === 'cards' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={onRequestApproval}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
              hasApprovedPlan
                ? 'bg-slate-900 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{hasApprovedPlan ? '✓ Plan Formally Approved' : 'Review & Authorize Plan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Wave Filter & Multi-Wave Schedule Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Filter by Run:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWaveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                waveFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Trips ({plan.allocations.length})
            </button>
            <button
              onClick={() => setWaveFilter('WAVE_1')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                waveFilter === 'WAVE_1'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wave 1: First Run Immediate ({plan.wave1Covered} patients)</span>
            </button>
            <button
              onClick={() => setWaveFilter('WAVE_2')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                waveFilter === 'WAVE_2'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wave 2: Return Trips ({plan.wave2Covered} patients)</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>Wave 1 Transit: <strong className="text-emerald-400 font-mono">~{plan.wave1AverageMinutes} mins</strong></span>
          <span className="text-slate-600">•</span>
          <span>Wave 2 Mission: <strong className="text-cyan-400 font-mono">~{plan.wave2AverageMinutes} mins</strong></span>
        </div>
      </div>

      {/* 3. Hospital Capacity & Bed Filtering Card (User Request: Filter first phase beds) */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Hospital Bed Availability (Dynamic Wave-by-Wave Filtering):
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            ✓ Wave 2 beds are filtered by subtracting beds consumed in Wave 1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-800/80">
              <tr>
                <th className="py-2 px-3">Hospital Name</th>
                <th className="py-2 px-3 text-center">Initial Beds</th>
                <th className="py-2 px-3 text-center text-emerald-400">Wave 1 Taken (-)</th>
                <th className="py-2 px-3 text-center text-cyan-400">Filtered for Wave 2</th>
                <th className="py-2 px-3 text-center text-purple-400">Wave 2 Taken (-)</th>
                <th className="py-2 px-3 text-center text-slate-200 font-bold">Remaining Free Beds</th>
                <th className="py-2 px-3 text-center">Doctor Specialty Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {plan.hospitalDistribution.map(h => {
                const initial = h.initialAvailableBeds || (h.totalPatientsReceived + h.remainingAvailableBeds);
                const w1 = h.wave1Patients || 0;
                const filteredForW2 = Math.max(0, initial - w1);
                const w2 = h.wave2Patients || 0;
                const rem = h.remainingAvailableBeds;

                return (
                  <tr key={h.hospitalId} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-100 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{h.hospitalName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-400">
                      {initial}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-400 bg-emerald-950/20">
                      -{w1}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-cyan-300 bg-cyan-950/20">
                      {filteredForW2} open
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-purple-300 bg-purple-950/20">
                      -{w2}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-300">
                      {rem} beds free
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 text-[10px]">
                        {h.doctorSpecialtyScore}% match
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Simple Clean Step-by-Step Table View */}
      {viewFormat === 'table' ? (
        <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Trip</th>
                <th className="py-3 px-4">Evacuation Wave</th>
                <th className="py-3 px-4">Ground Ambulance</th>
                <th className="py-3 px-4">Pickup Zone</th>
                <th className="py-3 px-4">Destination Hospital</th>
                <th className="py-3 px-4 text-center">Patients Saved</th>
                <th className="py-3 px-4">Total Mission Time</th>
                <th className="py-3 px-4">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedAllocations.map((alloc: AllocationItem, index: number) => {
                const isWave1 = alloc.wave === 'WAVE_1_INITIAL';

                return (
                  <tr key={alloc.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-300 whitespace-nowrap">
                      #{index + 1}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        isWave1
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {isWave1 ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Wave 1 (Immediate)</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Wave 2 (Return Trip)</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚑</span>
                        <div>
                          <strong className="text-slate-100 block">{alloc.ambulanceCallSign}</strong>
                          <span className="text-[10px] text-slate-400">Crew: {alloc.medicalTeamCallSign}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                      {alloc.zoneName}
                    </td>

                    <td className="py-3 px-4 font-medium text-blue-400 whitespace-nowrap">
                      {alloc.hospitalName}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        alloc.triagePriorityServed === 'IMMEDIATE'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {alloc.patientsAllocated} {alloc.triagePriorityServed === 'IMMEDIATE' ? 'Critical' : 'Patients'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{alloc.totalMissionMinutes || alloc.travelTimeMinutes} mins</span>
                      </div>
                      {!isWave1 && (
                        <span className="text-[10px] text-slate-400 block">
                          (Includes ~{alloc.turnaroundMinutes || 24}m turnaround)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-emerald-400 flex items-center gap-1 font-medium text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAllocations.map((alloc: AllocationItem, index: number) => {
            const isWave1 = alloc.wave === 'WAVE_1_INITIAL';

            return (
              <div
                key={alloc.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚑</span>
                    <strong className="text-slate-100">Trip #{index + 1} • {alloc.ambulanceCallSign}</strong>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                    isWave1
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {isWave1 ? '🟢 Wave 1' : '🔄 Wave 2 Return'}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 text-[11px] w-14 shrink-0">Pickup:</span>
                    <strong className="text-slate-200">{alloc.zoneName}</strong>
                  </div>
                  <div className="flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 text-[11px] w-14 shrink-0">Hospital:</span>
                    <strong className="text-blue-400">{alloc.hospitalName}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                  <span>Saving: <strong className="text-cyan-400">{alloc.patientsAllocated} patients</strong></span>
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> ~{alloc.totalMissionMinutes || alloc.travelTimeMinutes} mins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Waiting Patients Callout (With Add Ground Ambulance Button) */}
      {plan.unmetDemand > 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{plan.unmetDemand} patients are waiting for additional ground ambulances.</span>
            </div>
            <p className="text-slate-300 text-xs">
              Add more tactical ground ambulances to the fleet to increase immediate throughput:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onAddAmbulance && (
              <>
                <button
                  onClick={() => onAddAmbulance('Ground 4x4 Tactical')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Ground 4x4 Ambulance</span>
                </button>
                <button
                  onClick={() => onAddAmbulance('Mobile ICU (MICU)')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Mobile ICU</span>
                </button>
              </>
            )}

            <button
              onClick={onOpenShortageModal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/60 text-xs font-medium transition"
            >
              Why are they waiting?
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

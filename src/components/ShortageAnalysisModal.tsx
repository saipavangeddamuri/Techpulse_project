import React from 'react';
import { ShortageExplanation, OptimizationRunResult } from '../types';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface ShortageAnalysisModalProps {
  plan: OptimizationRunResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShortageAnalysisModal: React.FC<ShortageAnalysisModalProps> = ({
  plan,
  isOpen,
  onClose
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Why Are Some Patients Waiting?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent explanation of why {plan.unmetDemand} patients cannot be picked up in this wave.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Reassuring Banner */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-600/50 rounded-xl space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Safety First: We never promise an impossible rescue plan.</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Unlike simplistic dispatch systems that send ambulances to hospitals that have no empty beds, this planner explicitly flags shortages so commanders can take immediate action.
            </p>
          </div>

          {/* Shortage breakdown cards */}
          {plan.shortageExplanations.length > 0 ? (
            <div className="space-y-3">
              {plan.shortageExplanations.map((shortage: ShortageExplanation, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-100 text-sm">{shortage.zoneName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[11px] font-semibold">
                      {shortage.unmetCasualties} {shortage.priorityCategory.toLowerCase()} patients waiting
                    </span>
                  </div>

                  {/* Plain English Reason */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
                      The Constraint:
                    </span>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {shortage.details}
                    </p>
                  </div>

                  {/* Suggested Solution */}
                  <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/50 space-y-1 text-emerald-300">
                    <div className="flex items-center gap-1.5 font-semibold text-[11px] text-emerald-400">
                      <Lightbulb className="w-4 h-4" />
                      <span>Recommended Action for Coordinators:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {shortage.recommendedMitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="font-medium text-slate-200">Zero Shortages!</div>
              <p className="text-xs text-slate-500 mt-1">All patients are assigned to safe hospital beds with available ambulances.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};

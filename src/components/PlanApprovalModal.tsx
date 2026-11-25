import React, { useState } from 'react';
import { OptimizationRunResult, UserRole, PlanApprovalRecord } from '../types';
import { CheckCircle, X, ShieldCheck, Download, User } from 'lucide-react';

interface PlanApprovalModalProps {
  plan: OptimizationRunResult | null;
  isOpen: boolean;
  activeRole: UserRole;
  onClose: () => void;
  onConfirmApproval: (record: PlanApprovalRecord) => void;
}

export const PlanApprovalModal: React.FC<PlanApprovalModalProps> = ({
  plan,
  isOpen,
  activeRole,
  onClose,
  onConfirmApproval
}) => {
  const [officerName, setOfficerName] = useState<string>('Brig. S. Ramanathan (Emergency Director)');
  const [rationale, setRationale] = useState<string>('Plan reviewed and approved. Triage priorities verified. All hospital beds confirmed ready.');
  const [complianceChecked, setComplianceChecked] = useState<boolean>(true);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISED_OVERRIDE'>('APPROVED');

  if (!isOpen || !plan) return null;

  const handleSignOrder = () => {
    const hash = 'ORD-' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

    const record: PlanApprovalRecord = {
      id: `APPR-${Date.now().toString().slice(-6)}`,
      runId: plan.runId,
      scenarioId: plan.scenarioId,
      approvedBy: officerName,
      userRole: activeRole,
      timestamp: new Date().toISOString(),
      decision,
      rationaleNotes: rationale,
      complianceChecked,
      digitalSignatureHash: hash,
      exportedTimestamp: new Date().toISOString()
    };

    onConfirmApproval(record);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EVACUATION-PLAN-${plan.runId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-slate-100 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Coordinator Review & Plan Approval
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every evacuation plan requires review by a human coordinator before dispatch.
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick Plan Summary Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-semibold text-slate-200">Plan Summary:</span>
              <span className="text-[11px] px-2 py-0.5 bg-slate-900 rounded border border-slate-700 font-medium">
                {plan.solverType === 'CLASSICAL_BASELINE' ? 'Standard Plan' : 'Quantum Plan'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Patients Rescued</span>
                <strong className="text-emerald-400 text-sm">{plan.coveredPatients}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Patients Waiting</span>
                <strong className={plan.unmetDemand > 0 ? 'text-amber-400 text-sm' : 'text-slate-300 text-sm'}>
                  {plan.unmetDemand}
                </strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block">Active Dispatches</span>
                <strong className="text-cyan-400 text-sm">{plan.allocations.length}</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Your Name and Title:</label>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="bg-transparent text-slate-200 w-full focus:outline-none"
                  placeholder="Officer name..."
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Decision:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`py-2 rounded-lg font-semibold border transition ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Approve Plan
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REVISED_OVERRIDE')}
                  className={`py-2 rounded-lg font-semibold border transition ${
                    decision === 'REVISED_OVERRIDE'
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Adjust Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`py-2 rounded-lg font-semibold border transition ${
                    decision === 'REJECTED'
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Reject Plan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Review Notes:</label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none text-xs"
              />
            </div>

            <label className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={complianceChecked}
                onChange={(e) => setComplianceChecked(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300 leading-normal">
                I verify that destination hospitals have confirmed open beds and ambulances have qualified crews.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Plan (JSON)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg hover:bg-slate-800 text-slate-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOrder}
              disabled={!complianceChecked || !officerName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Authorise Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

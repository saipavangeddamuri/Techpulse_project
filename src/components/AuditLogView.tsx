import React from 'react';
import { AuditLogEntry, PlanApprovalRecord } from '../types';
import { History, X, Shield, Download, Clock } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
  approvalHistory: PlanApprovalRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  approvalHistory,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleExportAudit = () => {
    const auditData = {
      exportedAt: new Date().toISOString(),
      system: 'Emergency Medical Evacuation Planner',
      team: 'Techpulse (CAN-TEAM-000466)',
      approvedPlans: approvalHistory,
      activityLog: logs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ACTIVITY-LOG-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Activity History & Approved Plans
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                A transparent record of who tested scenarios, ran planners, and signed orders.
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
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Approved Orders Section */}
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Approved Plans ({approvalHistory.length})</span>
            </div>

            {approvalHistory.length > 0 ? (
              <div className="space-y-2">
                {approvalHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-400 text-xs">{rec.id} • {rec.decision}</span>
                      <span className="text-[11px] text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-200">
                      Approved by: <strong>{rec.approvedBy}</strong> ({rec.userRole.replace(/_/g, ' ')})
                    </div>
                    <p className="text-slate-400 italic text-[11px]">
                      "{rec.rationaleNotes}"
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                      Digital Order Stamp: {rec.digitalSignatureHash}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center">
                No plans approved yet. Run a planner and click "Review & Approve Plan" to sign an order.
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div>
            <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Activity ({logs.length} actions)</span>
            </div>

            <div className="space-y-1.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <span className="text-[11px] text-cyan-400 font-mono whitespace-nowrap pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">
                      {log.action} <span className="text-slate-400 font-normal">by {log.user}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download History (JSON)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

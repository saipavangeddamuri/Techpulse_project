import React, { useState, useEffect } from 'react';
import { UserRole, EmergencyScenario } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  RotateCcw,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  scenario: EmergencyScenario;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetScenario: () => void;
  onOpenAudit: () => void;
  hasApprovedPlan: boolean;
  csvSourceName?: string;
  onOpenCsvView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  activeRole,
  onRoleChange,
  onResetScenario,
  onOpenAudit,
  hasApprovedPlan,
  csvSourceName = 'hospital_availability.csv',
  onOpenCsvView
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090d16]/90 border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Ecto-Inspired Brand Mark & Title */}
        <div className="flex items-center gap-3.5">
          {/* Ecto Connective Tissue Geometric Emblem */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl blur opacity-35 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
                <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
                <path d="m5.6 5.6 2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" strokeOpacity="0.6" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ECTO <span className="text-cyan-400 font-light">//</span> MEDEVAC
              </span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                Decision Intelligence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                CAN-TEAM-000466
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{scenario.name}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Telemetry Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" />
                {timeString}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Modern Operational Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Plan Status Indicator */}
          {hasApprovedPlan ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plan Approved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Human Approval</span>
            </div>
          )}

          {/* Hospital CSV Feed Pill */}
          <button
            onClick={onOpenCsvView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/40 hover:border-blue-400/80 text-blue-300 text-xs font-medium transition shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            title="Hospital availability loaded directly from CSV file"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">CSV Feed:</span>
            <span className="font-mono text-cyan-300 text-[11px]">{csvSourceName}</span>
          </button>

          {/* Role Selector Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="EMERGENCY_COORDINATOR" className="bg-slate-950 text-slate-200">Emergency Coordinator</option>
              <option value="HOSPITAL_COORDINATOR" className="bg-slate-950 text-slate-200">Hospital Data (CSV Feed)</option>
              <option value="FIELD_COORDINATOR" className="bg-slate-950 text-slate-200">Ambulance Team Lead</option>
              <option value="ADMINISTRATOR" className="bg-slate-950 text-slate-200">Administrator</option>
            </select>
          </div>

          {/* Audit History Button */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
            title="View History and Changes"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition"
            title="Reset to default scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

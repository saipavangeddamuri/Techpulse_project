import React from 'react';
import { EmergencyScenario, DemandForecast } from '../types';
import { Brain, TrendingUp, Info, Plus, Minus } from 'lucide-react';

interface DemandForecastViewProps {
  scenario: EmergencyScenario;
  forecasts: Record<string, DemandForecast>;
  onUpdateZonePatients?: (zoneId: string, count: number) => void;
}

export const DemandForecastView: React.FC<DemandForecastViewProps> = ({
  scenario,
  forecasts,
  onUpdateZonePatients
}) => {
  const totalReported = scenario.zones.reduce((sum, z) => sum + z.reportedPatients, 0);
  const totalPredicted = Object.values(forecasts).reduce((sum, f) => sum + f.predictedPatients, 0);
  const surgeDifference = totalPredicted - totalReported;

  return (
    <div className="ecto-card p-6 shadow-sm space-y-5">
      {/* Header with Plain English Explanation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-slate-100 tracking-wide">
              AI Casualty Surge Forecasting (Predictive Telemetry)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Initial field calls underestimate real demand. Our neural model projects expected walk-in and secondary casualties.
            </p>
          </div>
        </div>

        {/* Global Summary Pill */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs shadow-inner">
          <span className="text-slate-400">Calls so far: <strong className="text-slate-200 font-mono">{totalReported}</strong></span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">AI expects: <strong className="text-purple-400 font-mono">{totalPredicted} total</strong></span>
          {surgeDifference > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[11px] font-medium ml-1">
              +{surgeDifference} expected surge
            </span>
          )}
        </div>
      </div>

      {/* Zone Forecast Cards in Plain English */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {scenario.zones.map((zone) => {
          const forecast = forecasts[zone.id];
          if (!forecast) return null;

          return (
            <div
              key={zone.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                {/* Zone Name & Status */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-slate-100">{zone.name}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    zone.hazardLevel === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {zone.hazardLevel === 'CRITICAL' ? 'High Danger Zone' : 'Moderate Hazard'}
                  </span>
                </div>

                {/* Patient Numbers Big & Clear with Edit Buttons */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 mb-3">
                  <div className="grid grid-cols-2 gap-2 text-center pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Reported So Far</span>
                      <span className="text-xl font-bold text-slate-100">{zone.reportedPatients}</span>
                      <span className="text-[10px] text-slate-500 block">people</span>
                    </div>
                    <div className="border-l border-slate-800 pl-2">
                      <span className="text-[11px] text-purple-400 block font-medium">AI Expects</span>
                      <span className="text-xl font-bold text-purple-300">{forecast.predictedPatients}</span>
                      <span className="text-[10px] text-purple-400/80 block">people</span>
                    </div>
                  </div>

                  {/* Direct Count Buttons */}
                  {onUpdateZonePatients && (
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Adjust count:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateZonePatients(zone.id, Math.max(1, zone.reportedPatients - 3))}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-0.5"
                          title="Reduce patients by 3"
                        >
                          <Minus className="w-3 h-3" /> 3
                        </button>
                        <button
                          onClick={() => onUpdateZonePatients(zone.id, zone.reportedPatients + 3)}
                          className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-0.5"
                          title="Increase patients by 3"
                        >
                          <Plus className="w-3 h-3" /> 3
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plain English explanation of the forecast */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 space-y-1 mb-3">
                  <div className="font-medium text-slate-200 flex items-center gap-1.5 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Why did AI predict this number?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {zone.roadAccessStatus === 'BLOCKED'
                      ? 'Roads are blocked. People cannot drive themselves to safety, meaning more casualties will require rescue.'
                      : zone.terrainType === 'Mountainous'
                      ? 'Rough mountain terrain slows evacuation and causes secondary injuries, increasing expected patients.'
                      : 'High activity sector with potential for additional patients to arrive at aid stations.'}
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    Confidence range: between {forecast.confidenceLower} and {forecast.confidenceUpper} patients.
                  </div>
                </div>

                {/* Urgency breakdown */}
                <div>
                  <div className="text-xs text-slate-400 mb-1.5 flex justify-between">
                    <span>Patient Urgency:</span>
                    <span>{zone.triage.immediate} critical • {zone.triage.delayed} serious</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Critical / Immediate (needs ICU)
                      </span>
                      <strong className="text-slate-200">{zone.triage.immediate}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Serious (needs hospital bed)
                      </span>
                      <strong className="text-slate-200">{zone.triage.delayed}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Minor injuries
                      </span>
                      <strong className="text-slate-200">{zone.triage.minimal}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

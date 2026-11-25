import React, { useRef, useState } from 'react';
import { Hospital } from '../types';
import { 
  Building, 
  Bed, 
  HeartPulse, 
  Droplet, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { parseHospitalCsv, downloadHospitalCsv } from '../utils/csvHospitalLoader';

interface RoleViewHospitalProps {
  hospitals: Hospital[];
  csvSource: string;
  lastSyncTime: string;
  onUpdateHospitalsFromCsv: (hospitals: Hospital[], sourceName: string) => void;
  onReloadDefaultCsv: () => void;
}

export const RoleViewHospital: React.FC<RoleViewHospitalProps> = ({
  hospitals,
  csvSource,
  lastSyncTime,
  onUpdateHospitalsFromCsv,
  onReloadDefaultCsv
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseHospitalCsv(text);
        if (parsed.length === 0) {
          throw new Error('No valid hospital records found in CSV.');
        }
        onUpdateHospitalsFromCsv(parsed, file.name);
        setUploadStatus({
          type: 'success',
          message: `Successfully loaded ${parsed.length} hospitals from "${file.name}". Evacuation planners updated!`
        });
      } catch (err: any) {
        setUploadStatus({
          type: 'error',
          message: `Failed to parse CSV: ${err.message || 'Invalid CSV format.'}`
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    downloadHospitalCsv(hospitals, 'hospital_availability.csv');
  };

  const totalBeds = hospitals.reduce((s, h) => s + h.availableBeds, 0);
  const totalIcu = hospitals.reduce((s, h) => s + h.availableIcuBeds, 0);

  return (
    <div className="ecto-card p-6 shadow-sm space-y-6 text-xs">
      {/* 1. Header Bar: Automated CSV Data Stream */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-base text-slate-100 tracking-wide">
                Hospital Availability (Automated CSV Ingestion Stream)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CSV Active Stream
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Data Source: <strong className="text-cyan-300 font-mono">{csvSource}</strong> • Last synced: {lastSyncTime}
            </p>
          </div>
        </div>

        {/* Action Buttons: Upload CSV, Download, Reload */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New CSV File</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition"
            title="Download active hospital availability CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={onReloadDefaultCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition"
            title="Reset to default baseline CSV file"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* 2. Upload Feedback Notice */}
      {uploadStatus && (
        <div className={`p-3 rounded-lg flex items-center gap-2.5 text-xs ${
          uploadStatus.type === 'success'
            ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
            : 'bg-red-950/70 border border-red-500/50 text-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* 3. Plain English Explanation Banner */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Automated Hospital Ingestion Stream (No Coordinator Manual Input)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Hospital availability is loaded automatically from <code className="text-cyan-400 font-mono">hospital_availability.csv</code>. To modify hospital capacities, upload an updated CSV file above.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
          <span>Total Free Beds: <strong className="text-emerald-400">{totalBeds}</strong></span>
          <span>•</span>
          <span>ICU Beds: <strong className="text-amber-400">{totalIcu}</strong></span>
        </div>
      </div>

      {/* 4. Live Table of Hospitals Loaded from CSV */}
      <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Hospital ID</th>
              <th className="py-3 px-4">Hospital Facility Name</th>
              <th className="py-3 px-4 text-center">Available Beds</th>
              <th className="py-3 px-4 text-center">Available ICU</th>
              <th className="py-3 px-4 text-center">Blood Units</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Medical Specialties (from CSV)</th>
              <th className="py-3 px-4">Contact Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {hospitals.map((hosp) => (
              <tr key={hosp.id} className="hover:bg-slate-900/50 transition">
                <td className="py-3 px-4 font-mono text-cyan-400 font-medium whitespace-nowrap">
                  {hosp.id}
                </td>

                <td className="py-3 px-4 font-medium text-slate-100 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{hosp.name}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-center font-bold text-emerald-400 whitespace-nowrap">
                  <span className="bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    {hosp.availableBeds} / {hosp.totalBeds}
                  </span>
                </td>

                <td className="py-3 px-4 text-center font-bold text-amber-400 whitespace-nowrap">
                  <span className="bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">
                    {hosp.availableIcuBeds} ICU
                  </span>
                </td>

                <td className="py-3 px-4 text-center text-slate-200 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1 text-slate-300">
                    <Droplet className="w-3.5 h-3.5 text-red-400" />
                    <span>{hosp.bloodUnitsAvailable} units</span>
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    hosp.isAcceptingCasualties
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-red-950 text-red-300 border-red-800'
                  }`}>
                    {hosp.isAcceptingCasualties ? 'Open / Receiving' : 'Diverting'}
                  </span>
                </td>

                <td className="py-3 px-4 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {hosp.specialties.map((s, idx) => (
                      <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                  {hosp.contactOfficer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

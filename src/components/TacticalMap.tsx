import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyScenario, AllocationItem } from '../types';

interface TacticalMapProps {
  scenario: EmergencyScenario;
  allocations: AllocationItem[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  scenario,
  allocations,
  selectedZoneId,
  onSelectZone
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [34.08, 74.82],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    // Dark clean map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Plot Zones (Casualty centers)
    scenario.zones.forEach((zone) => {
      const isSelected = zone.id === selectedZoneId;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute w-11 h-11 rounded-full ${
            zone.hazardLevel === 'CRITICAL' ? 'bg-red-500/25 border-red-500/60' : 'bg-amber-500/25 border-amber-500/60'
          } border-2 animate-ping opacity-40"></div>
          <div class="relative w-9 h-9 rounded-full ${
            zone.hazardLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-600'
          } flex flex-col items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white/90 transition-transform ${
            isSelected ? 'scale-125 ring-4 ring-cyan-400' : ''
          }">
            <span>${zone.reportedPatients}</span>
          </div>
          <div class="absolute -bottom-5 bg-slate-950 text-[10px] px-1.5 py-0.2 rounded border border-slate-700 text-slate-200 whitespace-nowrap font-medium">
            ${zone.name.split('(')[0].trim()}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-zone-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: customIcon });
      marker.on('click', () => onSelectZone(zone.id));

      const popupContent = `
        <div class="p-2 font-sans text-xs">
          <div class="font-bold text-sm text-cyan-400 mb-1">${zone.name}</div>
          <div class="space-y-1 mb-2">
            <div>Reported Patients: <strong class="text-red-400">${zone.reportedPatients} casualties</strong></div>
            <div>Danger Level: <strong class="${zone.hazardLevel === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}">${zone.hazardLevel}</strong></div>
            <div>Road Status: <strong class="${zone.roadAccessStatus === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'}">${zone.roadAccessStatus === 'BLOCKED' ? 'Blocked (Helo Only)' : 'Open'}</strong></div>
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-700 text-[11px] text-slate-300">
            Triage: ${zone.triage.immediate} Urgent • ${zone.triage.delayed} Serious • ${zone.triage.minimal} Minor
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
    });

    // 2. Plot Hospitals
    scenario.hospitals.forEach((hosp) => {
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-blue-600 border-2 border-cyan-300 flex items-center justify-center text-white shadow-lg">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/>
            </svg>
          </div>
          <div class="absolute -top-3 -right-2 bg-slate-950 text-[10px] px-1 rounded border border-blue-400 text-cyan-300 font-bold">
            ${hosp.availableBeds} beds
          </div>
          <div class="absolute -bottom-5 bg-slate-950 text-[10px] px-1.5 py-0.2 rounded border border-slate-700 text-slate-200 whitespace-nowrap font-medium">
            ${hosp.name.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-hosp-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-2 font-sans text-xs">
          <div class="font-bold text-sm text-blue-400 mb-1">${hosp.name}</div>
          <div class="space-y-1 mb-2">
            <div>Available Beds: <strong class="text-emerald-400">${hosp.availableBeds}</strong> of ${hosp.totalBeds} total</div>
            <div>ICU Critical Beds: <strong class="text-amber-400">${hosp.availableIcuBeds}</strong> of ${hosp.icuBeds}</div>
            <div>Intake Capacity: <strong>${hosp.intakeLimitPerHour} patients / hour</strong></div>
          </div>
          <div class="text-[11px] text-slate-300 bg-slate-900 p-1 rounded border border-slate-700">
            Specialties: ${hosp.specialties.join(', ')}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
    });

    // 3. Plot Ground Ambulances and Mobile ICUs
    scenario.ambulances.forEach((amb) => {
      const isMicu = amb.type.includes('MICU') || amb.type.includes('Mobile ICU');
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full ${isMicu ? 'bg-cyan-600 border-cyan-300' : 'bg-emerald-600 border-emerald-300'} border flex items-center justify-center text-white text-[11px] shadow">
            🚑
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-amb-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([amb.lat, amb.lng], { icon: customIcon });
      marker.bindPopup(`
        <div class="p-2 text-xs">
          <div class="font-bold text-cyan-300">${amb.callSign}</div>
          <div>Type: ${amb.type}</div>
          <div>Capacity: ${amb.patientCapacity} patient(s)</div>
          <div>Fuel Level: ${amb.fuelPercentage}%</div>
          <div class="${amb.isAvailable ? 'text-emerald-400' : 'text-amber-400'} font-semibold mt-1">
            ${amb.isAvailable ? 'Ready for Dispatch' : 'On Active Mission'}
          </div>
        </div>
      `);
      marker.addTo(layerGroup);
    });

    // 4. Plot Active Routes
    if (allocations && allocations.length > 0) {
      allocations.forEach((alloc, idx) => {
        const zone = scenario.zones.find(z => z.id === alloc.zoneId);
        const hosp = scenario.hospitals.find(h => h.id === alloc.hospitalId);

        if (zone && hosp) {
          const latlngs: [number, number][] = [
            [zone.lat, zone.lng],
            [hosp.lat, hosp.lng]
          ];

          const polyline = L.polyline(latlngs, {
            color: idx % 2 === 0 ? '#00f0ff' : '#10b981',
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 8'
          });

          polyline.bindPopup(`
            <div class="p-2 text-xs">
              <div class="text-cyan-400 font-bold mb-1">Evacuation Route #${idx + 1}</div>
              <div>From: <strong>${zone.name}</strong></div>
              <div>To: <strong>${hosp.name}</strong></div>
              <div>Patients Rescued: <strong class="text-emerald-400">${alloc.patientsAllocated}</strong> (${alloc.triagePriorityServed})</div>
              <div>Vehicle: ${alloc.ambulanceCallSign}</div>
              <div>Trip Time: <strong class="text-amber-400">${alloc.travelTimeMinutes} mins</strong> (${alloc.distanceKm} km)</div>
            </div>
          `);

          polyline.addTo(layerGroup);
        }
      });
    }

  }, [scenario, allocations, selectedZoneId, onSelectZone]);

  return (
    <div className="ecto-card relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg bg-slate-950">
      {/* Top Map Banner */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/70 text-xs font-medium shadow-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-slate-100 font-semibold tracking-wide">Live Operations Grid</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 text-[11px]">{scenario.zones.length} Zones, {scenario.hospitals.length} Hospitals</span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-[400] bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-xl">
        <div className="font-semibold text-slate-200 text-xs mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Tactical Map Legend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-300"></span>
          <span className="text-slate-300 text-[11px]">Casualty Zones</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 border border-cyan-300"></span>
          <span className="text-slate-300 text-[11px]">Hospitals (Trauma / ICU)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-cyan-600/80 border border-cyan-400 text-[9px] flex items-center justify-center">🚑</span>
          <span className="text-slate-300 text-[11px]">Mobile ICU (MICU)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-600/80 border border-emerald-400 text-[9px] flex items-center justify-center">🚑</span>
          <span className="text-slate-300 text-[11px]">Ground 4x4 Ambulance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
          <span className="text-slate-300 text-[11px]">Planned Corridor</span>
        </div>
      </div>

      {/* Map DOM */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

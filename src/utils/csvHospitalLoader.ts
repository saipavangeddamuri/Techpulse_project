import { Hospital, MedicalSpecialty } from '../types';

export const VALID_SPECIALTIES: MedicalSpecialty[] = [
  'Trauma Surgery',
  'Burn Unit',
  'Intensive Care (ICU)',
  'Orthopedic Surgery',
  'CBRN Decontamination',
  'General Emergency'
];

export const DEFAULT_HOSPITAL_CSV_STRING = `hospital_id,hospital_name,code,total_beds,available_beds,icu_beds,available_icu_beds,burn_beds,operating_theaters_available,blood_units_available,intake_limit_per_hour,is_accepting_casualties,specialties,contact_officer,lat,lng
HOSP-ALPHA,Base General Military Hospital 101,HSP-01-MIL,50,20,12,7,4,3,35,14,true,"Trauma Surgery; Intensive Care (ICU); Orthopedic Surgery; General Emergency",Col. V. Raman (Chief Surgeon),34.020,74.720
HOSP-BRAVO,Cantonment Emergency Field Hospital,HSP-02-FLD,35,16,8,5,6,2,25,10,true,"Trauma Surgery; General Emergency; Burn Unit",Lt. Col. Sarah Jenkins,34.160,74.960
HOSP-CHARLIE,Civilian Apex Medical Institute,HSP-03-CIV,80,28,20,10,10,5,60,18,true,"Trauma Surgery; Burn Unit; Intensive Care (ICU); Orthopedic Surgery; CBRN Decontamination",Dr. Alok Verma (Director ER),33.980,74.840`;

/**
 * Splits a CSV line taking quoted fields into account
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses raw CSV content into typed Hospital[] array
 */
export function parseHospitalCsv(csvContent: string): Hospital[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header line and at least one hospital record.');
  }

  const headerLine = lines[0].toLowerCase();
  const headers = parseCsvLine(headerLine);

  const getColIndex = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getColIndex(['hospital_id', 'id', 'hospitalid']);
  const nameIdx = getColIndex(['hospital_name', 'name', 'hospitalname']);
  const codeIdx = getColIndex(['code', 'hospital_code']);
  const totalBedsIdx = getColIndex(['total_beds', 'totalbeds', 'beds']);
  const availBedsIdx = getColIndex(['available_beds', 'availablebeds', 'free_beds']);
  const icuBedsIdx = getColIndex(['icu_beds', 'icubeds']);
  const availIcuIdx = getColIndex(['available_icu_beds', 'availableicubeds', 'free_icu_beds', 'available_icu']);
  const burnBedsIdx = getColIndex(['burn_beds', 'burnbeds']);
  const otIdx = getColIndex(['operating_theaters_available', 'operating_theaters', 'theaters']);
  const bloodIdx = getColIndex(['blood_units_available', 'blood_units', 'blood']);
  const intakeIdx = getColIndex(['intake_limit_per_hour', 'intake_limit', 'intake']);
  const acceptingIdx = getColIndex(['is_accepting_casualties', 'is_accepting', 'accepting', 'status']);
  const specialtiesIdx = getColIndex(['specialties', 'services', 'capabilities']);
  const contactIdx = getColIndex(['contact_officer', 'contact', 'officer']);
  const latIdx = getColIndex(['lat', 'latitude']);
  const lngIdx = getColIndex(['lng', 'longitude', 'lon']);

  const hospitals: Hospital[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    const values = parseCsvLine(rawLine);
    if (values.length === 0 || !values[0]) continue;

    const id = idIdx !== -1 && values[idIdx] ? values[idIdx] : `HOSP-${i}`;
    const name = nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : `Hospital ${id}`;
    const code = codeIdx !== -1 && values[codeIdx] ? values[codeIdx] : `HSP-${i}`;

    const totalBeds = totalBedsIdx !== -1 ? parseInt(values[totalBedsIdx], 10) || 40 : 40;
    const availableBeds = availBedsIdx !== -1 ? parseInt(values[availBedsIdx], 10) || 15 : 15;
    const icuBeds = icuBedsIdx !== -1 ? parseInt(values[icuBedsIdx], 10) || 10 : 10;
    const availableIcuBeds = availIcuIdx !== -1 ? parseInt(values[availIcuIdx], 10) || 5 : 5;
    const burnBeds = burnBedsIdx !== -1 ? parseInt(values[burnBedsIdx], 10) || 4 : 4;
    const operatingTheatersAvailable = otIdx !== -1 ? parseInt(values[otIdx], 10) || 2 : 2;
    const bloodUnitsAvailable = bloodIdx !== -1 ? parseInt(values[bloodIdx], 10) || 30 : 30;
    const intakeLimitPerHour = intakeIdx !== -1 ? parseInt(values[intakeIdx], 10) || 12 : 12;

    const acceptingRaw = acceptingIdx !== -1 ? values[acceptingIdx]?.toLowerCase() : 'true';
    const isAcceptingCasualties = acceptingRaw === 'true' || acceptingRaw === 'open' || acceptingRaw === '1' || acceptingRaw === 'yes';

    let specialties: MedicalSpecialty[] = ['Trauma Surgery', 'General Emergency'];
    if (specialtiesIdx !== -1 && values[specialtiesIdx]) {
      const rawSpec = values[specialtiesIdx].replace(/^["']|["']$/g, '');
      const parsed = rawSpec.split(/[;,]/).map(s => s.trim()).filter(Boolean);
      const matched = parsed.filter((s): s is MedicalSpecialty => VALID_SPECIALTIES.includes(s as MedicalSpecialty));
      if (matched.length > 0) specialties = matched;
    }

    const contactOfficer = contactIdx !== -1 && values[contactIdx] ? values[contactIdx] : 'ER Triage Officer';
    const lat = latIdx !== -1 ? parseFloat(values[latIdx]) || (34.020 + (i - 1) * 0.07) : (34.020 + (i - 1) * 0.07);
    const lng = lngIdx !== -1 ? parseFloat(values[lngIdx]) || (74.720 + (i - 1) * 0.08) : (74.720 + (i - 1) * 0.08);

    hospitals.push({
      id,
      name,
      code,
      lat,
      lng,
      specialties,
      totalBeds,
      availableBeds,
      icuBeds,
      availableIcuBeds,
      burnBeds,
      operatingTheatersAvailable,
      bloodUnitsAvailable,
      intakeLimitPerHour,
      isAcceptingCasualties,
      contactOfficer
    });
  }

  return hospitals;
}

/**
 * Formats a Hospital[] array back into a CSV formatted string
 */
export function exportHospitalsToCsv(hospitals: Hospital[]): string {
  const headers = [
    'hospital_id',
    'hospital_name',
    'code',
    'total_beds',
    'available_beds',
    'icu_beds',
    'available_icu_beds',
    'burn_beds',
    'operating_theaters_available',
    'blood_units_available',
    'intake_limit_per_hour',
    'is_accepting_casualties',
    'specialties',
    'contact_officer',
    'lat',
    'lng'
  ];

  const rows = hospitals.map(h => {
    const formattedSpecialties = `"${h.specialties.join('; ')}"`;
    return [
      h.id,
      `"${h.name}"`,
      h.code,
      h.totalBeds,
      h.availableBeds,
      h.icuBeds,
      h.availableIcuBeds,
      h.burnBeds,
      h.operatingTheatersAvailable,
      h.bloodUnitsAvailable,
      h.intakeLimitPerHour,
      h.isAcceptingCasualties,
      formattedSpecialties,
      `"${h.contactOfficer}"`,
      h.lat,
      h.lng
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers browser download of current hospital availability CSV
 */
export function downloadHospitalCsv(hospitals: Hospital[], filename = 'hospital_availability.csv'): void {
  const csvContent = exportHospitalsToCsv(hospitals);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Loads hospital availability from the CSV file / public path, falling back to embedded baseline
 */
export async function loadHospitalAvailabilityFromCsv(): Promise<{ hospitals: Hospital[]; rawCsv: string; source: string }> {
  try {
    const response = await fetch('/data/hospital_availability.csv');
    if (response.ok) {
      const text = await response.text();
      const parsed = parseHospitalCsv(text);
      if (parsed.length > 0) {
        return { hospitals: parsed, rawCsv: text, source: 'public/data/hospital_availability.csv (Live File)' };
      }
    }
  } catch (err) {
    console.warn('Could not fetch /data/hospital_availability.csv, falling back to bundled CSV dataset:', err);
  }

  // Fallback to embedded standard CSV
  const defaultParsed = parseHospitalCsv(DEFAULT_HOSPITAL_CSV_STRING);
  return { 
    hospitals: defaultParsed, 
    rawCsv: DEFAULT_HOSPITAL_CSV_STRING, 
    source: 'hospital_availability.csv (Standard Dataset)' 
  };
}

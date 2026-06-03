import { supabase, isSupabaseEnabled } from './supabaseClient.js';

// Mirrors what the edge function returns when Supabase is unavailable
const MOCK_RESULT = [
  { vin: '2T3A1RFV4SW564340', bayCode: 'TW-A01' },
  { vin: '2T3UWRFV7SW261969', bayCode: 'TW-A02' },
  { vin: '3TMLB5JN3SM178449', bayCode: 'TW-A03' },
  { vin: '4T1DAACK6SU566558', bayCode: 'TW-A04' },
  { vin: '2T3P1RFV2SC561402', bayCode: 'TW-A05' },
];

/**
 * Send a base64-encoded image to the extract-load-sheet edge function.
 * Falls back to mock OCR data when Supabase is not configured.
 * @param {string} imageBase64 - base64 image string (no data-URI prefix)
 * @returns {{ extractedVins: Array<{vin:string, bayCode:string}>, confidence: number }}
 */
export async function extractLoadSheet(imageBase64) {
  if (!isSupabaseEnabled()) {
    return { extractedVins: MOCK_RESULT, confidence: 0.92 };
  }

  const { data, error } = await supabase.functions.invoke('extract-load-sheet', {
    body: { imageBase64 },
  });

  if (error) throw new Error(error.message ?? 'Edge function error');
  if (!data?.success || !Array.isArray(data.extractedVins)) {
    throw new Error('OCR returned no usable data');
  }

  return { extractedVins: data.extractedVins, confidence: data.confidence ?? 1 };
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.1';

interface ExtractRequest {
  filePath?: string;
  fileName?: string;
}

interface ExtractedVehicle {
  vin: string;
  row?: number;
  stall?: string;
  sequence?: number;
  rawLine?: string;
  confidence: number;
}

interface ExtractedSheet {
  loadNumber?: string;
  pickupYard?: string;
  dealerDestination?: string;
  shipper?: string;
  consignee?: string;
  deliveryNotes?: string;
  routeSequence?: string[];
  vehicles: ExtractedVehicle[];
  rawText: string;
  documentTitle?: string;
  confidence: number;
}

const VIN_REGEX = /\b[A-HJ-NPR-Z0-9]{17}\b/g;

/**
 * Extract text from Document AI response
 */
function extractTextFromDocumentAI(response: Record<string, unknown>): string {
  try {
    const document = response.document as Record<string, unknown>;
    if (!document) return '';

    const text = document.text as string;
    return text || '';
  } catch {
    return '';
  }
}

/**
 * Extract all VINs from text
 */
function extractVINsFromText(text: string): ExtractedVehicle[] {
  const matches = text.matchAll(VIN_REGEX);
  const vehicles: ExtractedVehicle[] = [];
  let sequence = 0;

  for (const match of matches) {
    vehicles.push({
      vin: match[0],
      sequence: sequence++,
      rawLine: text.substring(Math.max(0, match.index! - 50), match.index! + 67).trim(),
      confidence: 0.95,
    });
  }

  return vehicles;
}

/**
 * Extract metadata (load number, yard, etc.) from text
 */
function extractMetadata(text: string): Partial<ExtractedSheet> {
  const result: Partial<ExtractedSheet> = {};

  // Load number patterns
  const loadMatch = text.match(/(?:load\s+(?:#|number|ref|ref\.|id)[:\s]+)(\d{6,}|[A-Z0-9-]{6,})/i);
  if (loadMatch) {
    result.loadNumber = loadMatch[1];
  }

  // Pickup yard patterns
  const yardMatch = text.match(/(?:pickup\s+(?:at|from|yard)[:\s]+)([A-Z0-9\s,]+?)(?:\n|$)/i);
  if (yardMatch) {
    result.pickupYard = yardMatch[1].trim();
  }

  // Dealer / destination patterns
  const dealerMatch = text.match(/(?:dealer|destination)[:\s]+([A-Z][A-Za-z0-9\s,&.-]+?)(?:\n|$)/i);
  if (dealerMatch) {
    result.dealerDestination = dealerMatch[1].trim();
  }

  // Shipper patterns
  const shipperMatch = text.match(/(?:shipper|from)[:\s]+([A-Z][A-Za-z0-9\s,&.-]*?)(?:\n|$)/i);
  if (shipperMatch) {
    result.shipper = shipperMatch[1].trim();
  }

  // Consignee patterns
  const consigneeMatch = text.match(/(?:consignee|to)[:\s]+([A-Z][A-Za-z0-9\s,&.-]*?)(?:\n|$)/i);
  if (consigneeMatch) {
    result.consignee = consigneeMatch[1].trim();
  }

  // Delivery notes
  const notesMatch = text.match(/(?:notes?|special\s+instructions?)[:\s]+([A-Za-z0-9\s,.!?-]*?)(?:\n|$)/i);
  if (notesMatch) {
    result.deliveryNotes = notesMatch[1].trim();
  }

  return result;
}

/**
 * Call Document AI API with REST endpoint
 */
async function callDocumentAI(
  fileContent: Uint8Array,
  mimeType: string,
  apiKey: string,
  projectId: string,
  location: string,
  processorId: string
): Promise<Record<string, unknown> | null> {
  try {
    // Encode file as base64
    const base64Content = btoa(String.fromCharCode(...Array.from(fileContent)));

    const url = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: base64Content,
          mimeType,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Document AI API returned ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Document AI call error:', err);
    return null;
  }
}

/**
 * Download file from Supabase Storage
 */
async function downloadFileFromStorage(
  supabase: ReturnType<typeof createClient>,
  filePath: string
): Promise<Uint8Array | null> {
  try {
    const { data, error } = await supabase.storage
      .from('load-sheets')
      .download(filePath);

    if (error) {
      console.error('Storage download error:', error);
      return null;
    }

    return new Uint8Array(await data.arrayBuffer());
  } catch (err) {
    console.error('Download error:', err);
    return null;
  }
}

/**
 * Extract load sheet with fallback to sample data
 */
async function extractLoadSheet(
  filePathOrName: string,
  supabase: ReturnType<typeof createClient>,
  apiKey: string | undefined,
  projectId: string | undefined,
  location: string | undefined,
  processorId: string | undefined
): Promise<ExtractedSheet> {
  // If API key is not configured, return fallback
  if (!apiKey || !projectId || !location || !processorId) {
    console.warn('Document AI not configured; using fallback');
    return {
      loadNumber: 'SAMPLE-001',
      pickupYard: 'BNSF Orillia',
      dealerDestination: 'Multiple dealers',
      vehicles: [],
      rawText: 'Document AI not configured. Please set all required secrets.',
      confidence: 0,
    };
  }

  // Download file from Supabase Storage
  const fileContent = await downloadFileFromStorage(supabase, filePathOrName);
  if (!fileContent) {
    console.warn('Failed to download file from storage');
    return {
      vehicles: [],
      rawText: 'Failed to download file from storage',
      confidence: 0,
    };
  }

  // Determine MIME type from filename
  const mimeType = filePathOrName.toLowerCase().endsWith('.pdf')
    ? 'application/pdf'
    : 'image/jpeg';

  // Call Document AI
  const documentAIResponse = await callDocumentAI(
    fileContent,
    mimeType,
    apiKey,
    projectId,
    location,
    processorId
  );

  if (!documentAIResponse) {
    console.warn('Document AI processing failed');
    return {
      vehicles: [],
      rawText: 'Document AI processing failed',
      confidence: 0,
    };
  }

  // Extract text from response
  const rawText = extractTextFromDocumentAI(documentAIResponse);

  // Extract VINs
  const vehicles = extractVINsFromText(rawText);

  // Extract metadata
  const metadata = extractMetadata(rawText);

  return {
    loadNumber: metadata.loadNumber,
    pickupYard: metadata.pickupYard,
    dealerDestination: metadata.dealerDestination,
    shipper: metadata.shipper,
    consignee: metadata.consignee,
    deliveryNotes: metadata.deliveryNotes,
    vehicles,
    rawText,
    confidence: vehicles.length > 0 ? 0.85 : 0.3,
  };
}

export default async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body: ExtractRequest = await req.json();

    if (!body.filePath && !body.fileName) {
      return new Response(
        JSON.stringify({ error: 'filePath or fileName is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase is not configured on server' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Document AI credentials from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_DOCUMENT_AI_API_KEY');
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
    const location = Deno.env.get('GOOGLE_DOCUMENT_AI_LOCATION');
    const processorId = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');

    // Extract load sheet
    const result = await extractLoadSheet(
      body.filePath || body.fileName || '',
      supabase,
      apiKey,
      projectId,
      location,
      processorId
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.1';

const INVALID_VIN_CHARS = /[IOQ]/i;

interface DecodeRequest {
  vin?: string;
}

interface VehicleSpecs {
  vin: string;
  year?: string | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  bodyStyle?: string | null;
  vehicleType?: string | null;
  curbWeightLb?: number | null;
  lengthIn?: number | null;
  widthIn?: number | null;
  heightIn?: number | null;
  groundClearanceIn?: number | null;
  source: string;
  confidence: string;
  needsVerification: boolean;
  fromCache?: boolean;
  raw_response?: Record<string, unknown>;
}

/** I, O, Q are excluded from VINs by ISO 3779 */
function validateVin(raw: unknown): { valid: boolean; vin?: string; reason?: string } {
  const vin = String(raw ?? '').trim().toUpperCase();

  if (!vin) {
    return { valid: false, reason: 'VIN is required' };
  }

  if (vin.length !== 17) {
    return { valid: false, reason: `VIN must be 17 characters (got ${vin.length})` };
  }

  if (INVALID_VIN_CHARS.test(vin)) {
    return { valid: false, reason: 'VIN contains invalid character (I, O, or Q)' };
  }

  return { valid: true, vin };
}

/** Normalize Auto.dev response into Montar format */
function normalizeAutoDevResponse(vin: string, raw: Record<string, unknown>): VehicleSpecs {
  // Extract fields from Auto.dev response
  const year = raw.year ? String(raw.year) : null;
  const make = raw.make ? String(raw.make) : null;
  const model = raw.model ? String(raw.model) : null;
  const trim = raw.trim ? String(raw.trim) : null;
  const bodyStyle = raw.body_style ? String(raw.body_style) : null;
  const vehicleType = raw.vehicle_type ? String(raw.vehicle_type) : null;
  const curbWeightLb = raw.curb_weight_lb ? Number(raw.curb_weight_lb) : null;
  const lengthIn = raw.length_in ? Number(raw.length_in) : null;
  const widthIn = raw.width_in ? Number(raw.width_in) : null;
  const heightIn = raw.height_in ? Number(raw.height_in) : null;
  const groundClearanceIn = raw.ground_clearance_in ? Number(raw.ground_clearance_in) : null;

  // Determine confidence based on available critical fields
  const hasCritical = curbWeightLb && lengthIn && heightIn;
  let confidence = 'partial_provider';
  let needsVerification = false;

  if (hasCritical) {
    confidence = 'provider';
  }

  // Mark for verification if any critical dimension is missing
  if (!curbWeightLb || !lengthIn || !widthIn || !heightIn) {
    needsVerification = true;
  }

  return {
    vin,
    year,
    make,
    model,
    trim,
    bodyStyle,
    vehicleType,
    curbWeightLb,
    lengthIn,
    widthIn,
    heightIn,
    groundClearanceIn,
    source: 'auto.dev',
    confidence,
    needsVerification,
    raw_response: raw,
  };
}

/** Fallback response when Auto.dev data is unavailable */
function fallbackSpecs(vin: string, reason: string): VehicleSpecs {
  return {
    vin,
    source: 'fallback',
    confidence: 'none',
    needsVerification: true,
    raw_response: { error: reason },
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
    const body: DecodeRequest = await req.json();
    const validation = validateVin(body.vin);

    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.reason }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const vin = validation.vin!;

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

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('vehicle_specs')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache lookup error:', cacheError);
    }

    if (cached) {
      // Return cached result
      const result: VehicleSpecs = {
        vin: cached.vin,
        year: cached.year,
        make: cached.make,
        model: cached.model,
        trim: cached.trim,
        bodyStyle: cached.body_style,
        vehicleType: cached.vehicle_type,
        curbWeightLb: cached.curb_weight_lb,
        lengthIn: cached.length_in,
        widthIn: cached.width_in,
        heightIn: cached.height_in,
        groundClearanceIn: cached.ground_clearance_in,
        source: cached.source,
        confidence: cached.confidence,
        needsVerification: cached.needs_verification,
        fromCache: true,
        raw_response: cached.raw_response,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Not cached — fetch from Auto.dev
    const autoDevKey = Deno.env.get('AUTO_DEV_API_KEY');

    if (!autoDevKey) {
      return new Response(
        JSON.stringify({ error: 'AUTO_DEV_API_KEY is not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Call Auto.dev API server-side
    let autoDevData: Record<string, unknown> | null = null;
    try {
      const autoDevRes = await fetch(
        `https://api.auto.dev/v1/vin/${vin}/specs`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${autoDevKey}`,
            'Accept': 'application/json',
          },
        }
      );

      if (autoDevRes.ok) {
        autoDevData = await autoDevRes.json();
      } else if (autoDevRes.status === 401 || autoDevRes.status === 403) {
        console.error('Auto.dev auth failed:', autoDevRes.status);
        // Return error — invalid key or unauthorized
        return new Response(
          JSON.stringify({ error: 'Auto.dev authentication failed' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } else {
        console.warn(`Auto.dev returned ${autoDevRes.status} for VIN ${vin}`);
      }
    } catch (err) {
      console.error('Auto.dev API error:', err);
    }

    // Normalize result
    const result = autoDevData
      ? normalizeAutoDevResponse(vin, autoDevData)
      : fallbackSpecs(vin, 'Auto.dev API failed');

    // Save to database if we got data from Auto.dev
    if (autoDevData) {
      const { error: insertError } = await supabase.from('vehicle_specs').insert({
        vin: result.vin,
        year: result.year,
        make: result.make,
        model: result.model,
        trim: result.trim,
        body_style: result.bodyStyle,
        vehicle_type: result.vehicleType,
        curb_weight_lb: result.curbWeightLb,
        length_in: result.lengthIn,
        width_in: result.widthIn,
        height_in: result.heightIn,
        ground_clearance_in: result.groundClearanceIn,
        source: result.source,
        confidence: result.confidence,
        needs_verification: result.needsVerification,
        raw_response: result.raw_response,
      });

      if (insertError && insertError.code !== '23505') {
        // 23505 = unique constraint violation (VIN already exists)
        console.error('Insert error:', insertError);
      }
    }

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

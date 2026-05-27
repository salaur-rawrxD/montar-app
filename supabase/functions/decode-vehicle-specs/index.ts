import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIMEOUT_MS = 10_000

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/** Convert Auto.dev response fields to Montar's internal shape. */
function normalize(vin: string, raw: Record<string, unknown>) {
  // Auto.dev returns dimensions in inches and weight in lbs at the top level
  // or nested under specs/dimensions depending on endpoint version.
  const specs = (raw.specs ?? raw) as Record<string, unknown>
  const dims  = (specs.dimensions ?? specs) as Record<string, unknown>

  const curbWeightLb      = Number(raw.curb_weight ?? specs.curb_weight ?? raw.weight) || null
  const lengthIn          = Number(dims.length_in  ?? dims.length  ?? raw.length)  || null
  const widthIn           = Number(dims.width_in   ?? dims.width   ?? raw.width)   || null
  const heightIn          = Number(dims.height_in  ?? dims.height  ?? raw.height)  || null
  const groundClearanceIn = Number(dims.ground_clearance_in ?? dims.ground_clearance) || null

  return {
    vin,
    year:               String(raw.year  ?? '').trim() || null,
    make:               String(raw.make  ?? '').trim() || null,
    model:              String(raw.model ?? '').trim() || null,
    trim:               String(raw.trim  ?? '').trim() || null,
    bodyStyle:          String(raw.body_style ?? raw.bodyStyle ?? '').trim() || null,
    vehicleType:        String(raw.vehicle_type ?? raw.vehicleType ?? '').trim() || null,
    curbWeightLb,
    lengthIn,
    widthIn,
    heightIn,
    groundClearanceIn,
    source:             'auto.dev',
    confidence:         curbWeightLb ? 'specs' : 'identity_only',
    needsVerification:  !curbWeightLb,
    fromCache:          false,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { vin } = await req.json()

    if (!vin || typeof vin !== 'string' || vin.length !== 17) {
      return json({ error: 'Invalid VIN' }, 400)
    }

    const apiKey = Deno.env.get('AUTO_DEV_API_KEY')

    if (!apiKey) {
      return json({ error: 'AUTO_DEV_API_KEY not configured' }, 500)
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let autoDevRes: Response
    try {
      autoDevRes = await fetch(`https://api.auto.dev/v1/vin/${vin}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }

    if (autoDevRes.status === 404) {
      // VIN not in Auto.dev database — return identity-only fallback so the
      // caller can still use NHTSA data without treating this as an error.
      return json({
        vin,
        year: null, make: null, model: null, trim: null,
        bodyStyle: null, vehicleType: null,
        curbWeightLb: null, lengthIn: null, widthIn: null,
        heightIn: null, groundClearanceIn: null,
        source: 'auto.dev_not_found',
        confidence: 'none',
        needsVerification: true,
        fromCache: false,
      })
    }

    if (!autoDevRes.ok) {
      return json({ error: `Auto.dev error ${autoDevRes.status}` }, 502)
    }

    const raw = await autoDevRes.json() as Record<string, unknown>
    return json(normalize(vin, raw))

  } catch (err) {
    const reason = (err as Error)?.name === 'AbortError' ? 'Auto.dev timeout' : (err as Error)?.message
    return json({ error: reason ?? 'Internal error' }, 500)
  }
})

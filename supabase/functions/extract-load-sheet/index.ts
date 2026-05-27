import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    // Mock OCR response - replace with real OCR service in production
    const mockVins = [
      { vin: '2T3A1RFV4SW564340', bayCode: 'TW-A01' },
      { vin: '2T3UWRFV7SW261969', bayCode: 'TW-A02' },
      { vin: '3TMLB5JN3SM178449', bayCode: 'TW-A03' },
      { vin: '4T1DAACK6SU566558', bayCode: 'TW-A04' },
      { vin: '2T3P1RFV2SC561402', bayCode: 'TW-A05' },
    ]

    return new Response(
      JSON.stringify({
        success: true,
        extractedVins: mockVins,
        confidence: 0.92,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

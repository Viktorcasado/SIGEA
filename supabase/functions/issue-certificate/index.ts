// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error("Invalid token")

    const { event_id } = await req.json()
    console.log(`[issue-certificate] Request for Event: ${event_id}, User: ${user.id}`);

    // 1. Verify registration and 10-minute rule
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('registered_at, events(workload)')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .single()

    if (regError || !registration) throw new Error("User is not registered for this event.")

    const registeredAt = new Date(registration.registered_at)
    const now = new Date()
    const diffMins = (now.getTime() - registeredAt.getTime()) / 60000

    if (diffMins < 10) {
      throw new Error(`Certificate not available yet. Please wait ${Math.ceil(10 - diffMins)} more minutes.`)
    }

    // 2. Check if already issued
    const { data: existing } = await supabase
      .from('certificados')
      .select('id')
      .eq('evento_id', event_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) throw new Error("Certificate already issued.")

    // 3. Generate codes
    const validationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const certCode = `SIGEA-${event_id.substring(0,4)}-${new Date().getFullYear().toString().slice(-2)}`;
    const workload = registration.events?.workload || 0;

    // 4. Insert record using service role
    const { data: cert, error: insertError } = await supabase
      .from('certificados')
      .insert({
        evento_id: event_id,
        user_id: user.id,
        codigo_validacao: validationCode,
        codigo_certificado: certCode,
        carga_horaria: workload
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, certificate: cert }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error("[issue-certificate] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
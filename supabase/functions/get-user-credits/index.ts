
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the user from the auth header
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    console.log(`Getting credits for user: ${user.id}`)

    // Get the user's credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    // Initialize with default credits if not found
    if (creditsError && creditsError.code === 'PGRST116') {
      console.log(`No credits found for user ${user.id}, initializing with default 25`)
      // Record not found - insert default credits
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, credits: 25 })

      if (insertError) {
        throw new Error('Failed to initialize user credits: ' + insertError.message)
      }

      return new Response(
        JSON.stringify({ credits: 25 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (creditsError) {
      throw new Error('Failed to get user credits: ' + creditsError.message)
    }

    console.log(`Retrieved credits for user ${user.id}: ${credits.credits}`)

    return new Response(
      JSON.stringify({ credits: credits.credits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-user-credits function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

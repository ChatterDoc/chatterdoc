

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.18.0'

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
    // Initialize Stripe with the secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-08-16',
    })

    // Get account information
    const account = await stripe.accounts.retrieve()
    
    return new Response(
      JSON.stringify({ 
        account_id: account.id,
        business_profile: account.business_profile,
        email: account.email,
        display_name: account.display_name || account.business_profile?.name,
        country: account.country,
        test_mode: !account.charges_enabled // If charges aren't enabled, it's likely test mode
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error identifying Stripe account:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


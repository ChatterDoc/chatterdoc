import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('Missing authorization header')
    }
    
    // Get request body
    const { priceId } = await req.json()

    if (!priceId) {
      throw new Error('Missing priceId in request body')
    }

    // Initialize Stripe with the secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-08-16',
    })

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

    // Define our updated product pricing options
    const prices = {
      'credits-30': { price: 1500, credits: 30 },    // $15.00
      'credits-180': { price: 6000, credits: 180 },   // $60.00
      'credits-1000': { price: 20000, credits: 1000 }, // $200.00
    }

    // Validate priceId
    if (!Object.keys(prices).includes(priceId)) {
      throw new Error('Invalid price ID')
    }

    const selectedPrice = prices[priceId]

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPrice.credits} Sentiment Analysis Credits`,
              description: `Purchase of ${selectedPrice.credits} credits for sentiment analysis`,
            },
            unit_amount: selectedPrice.price, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'https://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'https://localhost:3000'}/credits`,
      client_reference_id: user.id,
      metadata: {
        credits: selectedPrice.credits.toString(),
      },
    })

    // Save the pending order
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: selectedPrice.price,
        credit_amount: selectedPrice.credits,
        status: 'pending',
      })

    if (insertError) {
      console.error('Error inserting order:', insertError)
      // Continue anyway, as the payment should still work
    }

    // Return the checkout URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-checkout function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

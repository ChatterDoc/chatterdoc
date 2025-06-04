
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

    // Get session ID from request body
    const { sessionId } = await req.json()
    if (!sessionId) {
      throw new Error('Missing sessionId in request body')
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

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      throw new Error('Stripe session not found')
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the order from the database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found for this session')
    }

    // Check if the order has already been processed
    if (order.status === 'completed') {
      // Return the credit amount but don't add credits again
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyProcessed: true, 
          credits: order.credit_amount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the order status to prevent duplicate processing
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id)

    if (updateOrderError) {
      throw new Error('Failed to update order status')
    }

    console.log(`Processing order ${order.id} for user ${user.id}, adding ${order.credit_amount} credits`)
    
    // Get current user credits first
    const { data: userCredits, error: getUserCreditsError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()
    
    if (getUserCreditsError && getUserCreditsError.code !== 'PGRST116') {
      throw new Error('Failed to get user credits')
    }

    let currentCredits = 0
    if (userCredits) {
      currentCredits = userCredits.credits
    }
    
    const newCreditAmount = currentCredits + order.credit_amount
    console.log(`Current credits: ${currentCredits}, Adding: ${order.credit_amount}, New total: ${newCreditAmount}`)

    // Update user credits directly without using RPC call
    if (userCredits) {
      // Update existing credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits: newCreditAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error('Failed to update user credits: ' + updateError.message)
      }
    } else {
      // Insert new credits record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits: order.credit_amount
        })

      if (insertError) {
        throw new Error('Failed to insert user credits: ' + insertError.message)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits: newCreditAmount,
        added: order.credit_amount,
        message: `Successfully added ${order.credit_amount} credits to your account!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in verify-payment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

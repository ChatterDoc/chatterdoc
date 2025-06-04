
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Disable JWT verification for this function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the API key from the authorization header
    const authorization = req.headers.get('authorization')
    console.log('Authorization header received:', authorization ? 'Present' : 'Missing')
    
    if (!authorization) {
      console.error('Missing authorization header')
      return new Response(JSON.stringify({ error: 'Missing API key', code: 401 }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Extract the API key, handling different formats: "Bearer xxx" or just "xxx"
    let apiKey = authorization
    if (authorization.startsWith('Bearer ')) {
      apiKey = authorization.replace('Bearer ', '')
    }
    
    console.log('Extracted API key (masked):', apiKey.substring(0, 5) + '...')
    
    // Parse request body
    let body
    try {
      body = await req.json()
      console.log('Request body:', body)
    } catch (error) {
      console.error('Error parsing request body:', error)
      return new Response(JSON.stringify({ error: 'Invalid request body', code: 400 }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const { text, rating } = body
    
    if (!text && rating === undefined) {
      console.error('Missing required fields - no text or rating provided')
      return new Response(JSON.stringify({ error: 'Text or rating is required', code: 400 }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Check if Supabase URL and service key are available
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials')
      return new Response(JSON.stringify({ error: 'Server configuration error', code: 500 }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the API key record from the database
    console.log('Looking up API key in database...')
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .maybeSingle()
    
    if (apiKeyError) {
      console.error('API key lookup error:', apiKeyError)
      return new Response(JSON.stringify({ error: 'Database error', code: 500 }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    if (!apiKeyData) {
      // Debug logging to understand why API key is not found
      console.error('API key not found in database')
      console.log('API key used (masked):', apiKey.substring(0, 5) + '...')
      
      // Check total number of API keys in the database for debugging
      const { data: allKeys, error: allKeysError } = await supabase
        .from('api_keys')
        .select('id, api_key')
        
      if (!allKeysError && allKeys) {
        console.log(`Total API keys in database: ${allKeys.length}`)
        // Log partial keys for debugging (masked for security)
        allKeys.forEach(k => console.log('Available key (masked):', k.api_key.substring(0, 5) + '...'))
      }
      
      return new Response(JSON.stringify({ error: 'Invalid API key', code: 401 }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('API key validated successfully for user:', apiKeyData.user_id)
    
    // Get the widget settings for the user
    const { data: settingsData } = await supabase
      .from('widget_settings')
      .select('*')
      .eq('user_id', apiKeyData.user_id)
      .maybeSingle()
      
    // Insert the feedback
    console.log('Inserting feedback into database...')
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        user_id: apiKeyData.user_id,
        api_key_id: apiKeyData.id, // Store which API key was used
        text: text || '',
        rating: rating || 0,
        source: req.headers.get('origin') || 'Unknown'
      })
      .select()
      .single()
    
    if (feedbackError) {
      console.error('Error inserting feedback:', feedbackError)
      return new Response(JSON.stringify({ error: 'Failed to save feedback', code: 500 }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Feedback saved successfully:', feedback.id)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Feedback submitted successfully',
      id: feedback.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in submit-feedback function:', error)
    return new Response(JSON.stringify({ 
      error: `Failed to submit feedback: ${error.message}`,
      code: 500
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

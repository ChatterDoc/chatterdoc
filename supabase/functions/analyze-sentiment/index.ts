
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Parse request body
    let body
    try {
      body = await req.json()
      console.log('Request body:', body)
    } catch (error) {
      console.error('Error parsing request body:', error)
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { feedbackId } = body

    if (!feedbackId) {
      console.error('Missing feedbackId in request')
      return new Response(JSON.stringify({ error: 'feedbackId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get authorization header
    const authorization = req.headers.get('authorization')
    console.log('Authorization header present:', !!authorization)
    
    let userId: string | undefined
    
    if (authorization) {
      // If token is provided, verify it - but don't fail if it's not valid
      try {
        // Extract token from Bearer format
        const token = authorization.replace('Bearer ', '')
        console.log('Token extracted from authorization header')
        
        // Get user ID from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)
        
        if (!userError && user) {
          userId = user.id
          console.log('User authenticated successfully:', userId)
        } else {
          console.log('Token validation failed, proceeding without user authentication')
        }
      } catch (error) {
        console.log('Error processing token, proceeding without user authentication:', error)
      }
    }
    
    // Get the feedback from the database
    console.log('Fetching feedback with ID:', feedbackId)
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', feedbackId)
      .single()
    
    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError)
      return new Response(JSON.stringify({ error: `Feedback not found: ${feedbackError.message}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    if (!feedback) {
      console.error(`No feedback found with ID: ${feedbackId}`)
      return new Response(JSON.stringify({ error: 'Feedback not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // If we have authenticated user, verify ownership
    if (userId && feedback.user_id !== userId) {
      console.error(`User ${userId} does not own feedback ${feedbackId}`)
      return new Response(JSON.stringify({ error: 'You do not have permission to analyze this feedback' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Check credit usage only for authenticated users
    if (userId) {
      console.log('Checking credits for user:', userId)
      const { data: hasCredits, error: creditError } = await supabase.rpc('use_analysis_credit', { user_id_param: userId })
        .single()
      
      if (creditError) {
        console.error('Error checking credits:', creditError)
        return new Response(JSON.stringify({ 
          error: 'Failed to check credits',
          details: creditError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      console.log('Credit check result:', hasCredits)
      
      if (!hasCredits) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      console.log('No authenticated user, skipping credit check')
    }
    
    if (!feedback.text || feedback.text.trim() === '') {
      console.error('Feedback text is empty, cannot analyze sentiment')
      return new Response(JSON.stringify({ error: 'Feedback text is empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Analyzing feedback text:', feedback.text)
    
    // Enhanced rule-based sentiment analysis
    const sentiment = analyzeTextSentiment(feedback.text, feedback.rating)
    
    // Update the feedback in the database with our sentiment analysis
    const { error: updateError } = await supabase
      .from('feedback')
      .update({ 
        sentiment: sentiment,
        analyzed: true 
      })
      .eq('id', feedbackId)
    
    if (updateError) {
      console.error('Error updating feedback in database:', updateError)
      throw new Error(`Failed to update feedback with sentiment analysis: ${updateError.message}`)
    }
    
    console.log('Successfully updated feedback with sentiment analysis:', sentiment)
    
    let creditsData = null
    // Get remaining credits for authenticated users
    if (userId) {
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single()
      
      creditsData = userCredits
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      sentiment: sentiment,
      credits: creditsData?.credits || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in analyze-sentiment function:', error)
    return new Response(JSON.stringify({ 
      error: `Failed to analyze sentiment: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Enhanced rule-based sentiment analysis function
function analyzeTextSentiment(text: string, rating?: number | null): 'positive' | 'negative' | 'neutral' {
  const lowercaseText = text.toLowerCase();
  
  // Extended wordlists for better accuracy
  const positiveWords = [
    // Strong positive
    "love", "excellent", "amazing", "outstanding", "perfect", "fantastic", 
    "wonderful", "superb", "brilliant", "exceptional", "terrific", "awesome",
    
    // Positive
    "good", "great", "happy", "pleased", "satisfied", "enjoy", "impressive",
    "nice", "thank", "thanks", "grateful", "appreciate", "helpful", "recommend",
    "better", "best", "improved", "well", "easy", "convenient", "user-friendly",
    "clear", "smooth", "reliable", "efficient", "effective", "fast", "responsive",
    "intuitive", "valuable", "worth", "beneficial", "pleased", "glad", "joy",
    
    // Positive modifiers
    "very", "really", "extremely", "highly", "absolutely"
  ];
  
  const negativeWords = [
    // Strong negative
    "hate", "terrible", "awful", "horrible", "dreadful", "abysmal", "disgusting",
    "frustrating", "disappointing", "useless", "pointless", "waste",
    
    // Negative
    "bad", "poor", "difficult", "hard", "confusing", "slow", "broken", "fail",
    "issue", "problem", "bug", "error", "crash", "glitch", "annoying", "dislike",
    "unhappy", "dissatisfied", "not working", "doesn't work", "can't", "cannot",
    "never", "worst", "fix", "trouble", "difficult", "complicated", "inconsistent",
    "unreliable", "expensive", "overpriced", "lacking", "missing", "incomplete",
    
    // Criticism indicators
    "but", "however", "though", "although", "despite", "unfortunately", "sadly",
    "fix", "improve", "should", "could", "would", "need to", "needs"
  ];
  
  // Context modifiers that can flip sentiment
  const negationWords = ["not", "no", "never", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "cannot"];
  
  // Split text into sentences
  const sentences = lowercaseText.split(/[.!?]+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Process each sentence separately to better handle negations
  sentences.forEach(sentence => {
    if (!sentence.trim()) return;
    
    const words = sentence.split(/\s+/);
    let hasNegation = false;
    
    // Check for negation words in this sentence
    for (const word of words) {
      if (negationWords.includes(word)) {
        hasNegation = true;
        break;
      }
    }
    
    // Count sentiment words, considering negation
    for (const word of words) {
      // Check if word is in positive list
      if (positiveWords.includes(word)) {
        if (hasNegation) {
          negativeScore += 1; // Negated positive becomes negative
        } else {
          positiveScore += 1;
        }
      }
      
      // Check if word is in negative list
      if (negativeWords.includes(word)) {
        if (hasNegation) {
          positiveScore += 0.5; // Negated negative becomes somewhat positive
        } else {
          negativeScore += 1;
        }
      }
    }
    
    // Look for phrases (2-3 word combinations)
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = words[i] + " " + words[i + 1];
      
      // Strong positive phrases
      if (["really good", "very good", "quite good", "so good", "very nice", "really great"].includes(twoWordPhrase)) {
        positiveScore += hasNegation ? -1.5 : 1.5;
      }
      
      // Strong negative phrases
      if (["very bad", "really bad", "so bad", "too bad", "not good", "very poor"].includes(twoWordPhrase)) {
        negativeScore += hasNegation ? -1.5 : 1.5;
      }
    }
  });
  
  // Consider the rating if provided
  if (rating) {
    if (rating >= 4) {
      positiveScore += 2;
    } else if (rating <= 2) {
      negativeScore += 2;
    }
  }
  
  // Determine final sentiment
  if (positiveScore > negativeScore * 1.2) {
    return "positive";
  } else if (negativeScore > positiveScore * 1.2) {
    return "negative";
  } else {
    return "neutral";
  }
}

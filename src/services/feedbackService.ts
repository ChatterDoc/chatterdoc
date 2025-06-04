import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Feedback, WidgetSettings, SentimentType, ApiKey } from '@/utils/types';

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const generateApiKey = async (name: string = 'Default API Key', userId?: string): Promise<ApiKey> => {
  try {
    const authUserId = userId || await getUserId();
    const apiKeyString = `sk_${uuidv4().replace(/-/g, '')}`;
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({ 
        user_id: authUserId, 
        api_key: apiKeyString,
        name: name
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      apiKey: data.api_key,
      name: data.name,
      userId: data.user_id,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error generating API key:', error);
    throw error;
  }
};

export const getUserApiKeys = async (userId?: string): Promise<ApiKey[]> => {
  try {
    const authUserId = userId || await getUserId();
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', authUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      const newKey = await generateApiKey('Default API Key', authUserId);
      return [newKey];
    }
    
    return data.map(key => ({
      id: key.id,
      apiKey: key.api_key,
      name: key.name,
      userId: key.user_id,
      createdAt: key.created_at
    }));
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
};

export const getUserApiKey = async (userId?: string): Promise<string | null> => {
  try {
    const keys = await getUserApiKeys(userId);
    return keys.length > 0 ? keys[0].apiKey : null;
  } catch (error) {
    console.error('Error getting API key:', error);
    throw error;
  }
};

export const updateApiKeyName = async (keyId: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ name })
      .eq('id', keyId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating API key name:', error);
    throw error;
  }
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('api_key', apiKey)
      .single();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

export const getWidgetSettings = async (userId?: string, apiKeyId?: string): Promise<WidgetSettings> => {
  try {
    const authUserId = userId || await getUserId();
    
    let query = supabase
      .from('widget_settings')
      .select('*')
      .eq('user_id', authUserId);
    
    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        const defaultSettings = {
          title: 'We value your feedback!',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          primaryColor: '#3b82f6',
          showLogo: true,
          logoUrl: '',
          feedbackType: 'text',
          userId: authUserId,
          apiKeyId: apiKeyId,
          buttonStyle: 'rectangle',
          ratingScale: 5,
          showPrompt: true,
          customPrompt: 'How was your experience with our product?',
          position: 'bottom-right',
          showRating: false,
          ratingType: 'stars',
          buttonText: 'Feedback'
        } as WidgetSettings;
        
        await saveWidgetSettings(defaultSettings);
        
        return defaultSettings;
      }
      throw error;
    }
    
    return {
      userId: data.user_id,
      apiKeyId: data.api_key_id,
      title: data.title,
      backgroundColor: data.background_color,
      textColor: data.text_color,
      primaryColor: data.primary_color,
      showLogo: data.show_logo,
      logoUrl: data.logo_url,
      feedbackType: data.feedback_type,
      buttonStyle: data.button_style || 'rectangle',
      ratingScale: data.rating_scale || 5,
      showPrompt: data.show_prompt !== undefined ? data.show_prompt : true,
      customPrompt: data.custom_prompt || 'How was your experience with our product?',
      position: data.position || 'bottom-right', 
      showRating: data.show_rating !== undefined ? data.show_rating : false,
      ratingType: data.rating_type || 'stars',
      buttonText: data.button_text || 'Feedback',
      buttonIcon: data.button_icon
    } as WidgetSettings;
  } catch (error) {
    console.error('Error getting widget settings:', error);
    throw error;
  }
};

export const saveWidgetSettings = async (settings: WidgetSettings): Promise<void> => {
  try {
    // First, check if settings already exist for this user and API key
    const { data: existingSettings, error: checkError } = await supabase
      .from('widget_settings')
      .select('id')
      .eq('user_id', settings.userId)
      .eq('api_key_id', settings.apiKeyId || '')
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    // If settings exist, update them
    if (existingSettings) {
      const { error: updateError } = await supabase
        .from('widget_settings')
        .update({ 
          title: settings.title,
          background_color: settings.backgroundColor,
          text_color: settings.textColor,
          primary_color: settings.primaryColor,
          show_logo: settings.showLogo,
          logo_url: settings.logoUrl,
          feedback_type: settings.feedbackType,
          button_style: settings.buttonStyle,
          rating_scale: settings.ratingScale,
          show_prompt: settings.showPrompt,
          custom_prompt: settings.customPrompt,
          position: settings.position,
          show_rating: settings.showRating,
          rating_type: settings.ratingType,
          button_text: settings.buttonText,
          button_icon: settings.buttonIcon,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id);
      
      if (updateError) throw updateError;
    } else {
      // If no settings exist, create new ones
      const { error: insertError } = await supabase
        .from('widget_settings')
        .insert({ 
          user_id: settings.userId,
          api_key_id: settings.apiKeyId,
          title: settings.title,
          background_color: settings.backgroundColor,
          text_color: settings.textColor,
          primary_color: settings.primaryColor,
          show_logo: settings.showLogo,
          logo_url: settings.logoUrl,
          feedback_type: settings.feedbackType,
          button_style: settings.buttonStyle,
          rating_scale: settings.ratingScale,
          show_prompt: settings.showPrompt,
          custom_prompt: settings.customPrompt,
          position: settings.position,
          show_rating: settings.showRating,
          rating_type: settings.ratingType,
          button_text: settings.buttonText,
          button_icon: settings.buttonIcon,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error saving widget settings:', error);
    throw error;
  }
};

export const submitFeedback = async (apiKey: string, text: string, rating?: number): Promise<Feedback> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text, rating })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit feedback');
    }
    
    const result = await response.json();
    
    return {
      id: result.id,
      userId: '',
      apiKey,
      text,
      rating: rating || 0,
      sentiment: undefined,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getFeedbackByUserId = async (userId?: string, apiKeyId?: string): Promise<Feedback[]> => {
  try {
    const authUserId = userId || await getUserId();
    
    let query = supabase
      .from('feedback')
      .select('*, api_keys(name, api_key)')
      .eq('user_id', authUserId);
    
    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      apiKey: item.api_keys?.api_key || '',
      apiKeyName: item.api_keys?.name || 'Unknown',
      apiKeyId: item.api_key_id,
      text: item.text,
      rating: item.rating,
      sentiment: item.sentiment as SentimentType,
      createdAt: item.created_at,
      analyzed: item.analyzed,
      source: item.source
    }));
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
};

export const analyzeFeedbackSentiment = async (feedback: Feedback): Promise<Feedback> => {
  try {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Starting sentiment analysis for feedback:', feedback.id);
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session ? session.access_token : anonKey;
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ feedbackId: feedback.id })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from analyze-sentiment:', errorData);
      
      // Special handling for insufficient credits
      if (response.status === 402) {
        throw new Error('INSUFFICIENT_CREDITS');
      }
      
      throw new Error(errorData.error || 'Failed to analyze sentiment');
    }
    
    const result = await response.json();
    console.log('Sentiment analysis result:', result);
    
    const updatedFeedback = { 
      ...feedback, 
      sentiment: result.sentiment,
      analyzed: true,
      credits: result.credits // Store remaining credits from response
    };
    
    return updatedFeedback;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

export const getWidgetCode = (apiKey: string, settings: WidgetSettings): string => {
  // Generate a minimal widget script that loads settings from the server
  return `
<!-- Chatter Doc Widget -->
<script>
  (function() {
    // Load the widget with API key
    const sleekApiKey = "${apiKey}";
    const scriptEl = document.createElement('script');
    scriptEl.src = "https://dpklkjssynqixtbmrbfj.supabase.co/functions/v1/load-widget?apiKey=" + sleekApiKey;
    scriptEl.async = true;
    document.body.appendChild(scriptEl);
  })();
</script>
<!-- End Chatter Doc Widget -->
  `;
};

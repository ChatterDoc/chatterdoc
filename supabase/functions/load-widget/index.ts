import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/javascript',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from the URL query parameters
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('apiKey');

    if (!apiKey) {
      return new Response(
        'console.error("Chatter Doc: Missing API key");',
        { headers: corsHeaders, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate API key and get associated API key ID
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error('Invalid API key:', apiKeyError);
      return new Response(
        'console.error("Chatter Doc: Invalid API key");',
        { headers: corsHeaders, status: 401 }
      );
    }

    // Fetch widget settings for the API key
    const { data: settings, error: settingsError } = await supabase
      .from('widget_settings')
      .select('*')
      .eq('api_key_id', apiKeyData.id)
      .eq('user_id', apiKeyData.user_id)
      .single();

    if (settingsError) {
      console.error('Error fetching widget settings:', settingsError);
      // Use default settings if none are found
      const defaultSettings = {
        title: 'We value your feedback!',
        background_color: '#ffffff',
        text_color: '#1f2937',
        primary_color: '#3b82f6',
        show_logo: false,
        logo_url: '',
        feedback_type: 'text',
        button_style: 'rectangle',
        rating_scale: 5,
        show_prompt: true,
        custom_prompt: 'How was your experience with our product?',
        position: 'bottom-right',
        rating_type: 'stars',
        button_text: 'Feedback'
      };
      
      return generateWidgetScript(apiKey, defaultSettings, corsHeaders);
    }

    return generateWidgetScript(apiKey, settings, corsHeaders);

  } catch (error) {
    console.error('Error in load-widget function:', error);
    return new Response(
      'console.error("Chatter Doc: Server error");',
      { headers: corsHeaders, status: 500 }
    );
  }
});

function generateWidgetScript(apiKey: string, settings: any, headers: HeadersInit): Response {
  // Determine position styles based on widget settings
  let positionStyles = '';
  
  if (settings.position === 'bottom-right') {
    positionStyles = "bottom: 24px; right: 24px;";
  } else if (settings.position === 'bottom-left') {
    positionStyles = "bottom: 24px; left: 24px;";
  } else if (settings.position === 'top-right') {
    positionStyles = "top: 24px; right: 24px;";
  } else if (settings.position === 'top-left') {
    positionStyles = "top: 24px; left: 24px;";
  } else {
    // Default to bottom-right
    positionStyles = "bottom: 24px; right: 24px;";
  }
  
  // Determine button HTML based on style
  let buttonHTML = '';
  if (settings.button_style === 'circle') {
    buttonHTML = `
      button.style.width = '56px';
      button.style.height = '56px';
      button.style.borderRadius = '50%';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.backgroundColor = '${settings.primary_color}';
      button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
    `;
  } else if (settings.button_style === 'chat') {
    buttonHTML = `
      button.style.width = '56px';
      button.style.height = '56px';
      button.style.borderRadius = '50%';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.backgroundColor = '${settings.primary_color}';
      button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
    `;
  } else {
    buttonHTML = `
      button.style.padding = '12px 24px';
      button.style.borderRadius = '12px';
      button.style.backgroundColor = '${settings.primary_color}';
      button.style.fontSize = '14px';
      button.style.fontWeight = '600';
      button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      button.textContent = '${settings.button_text || 'Feedback'}';
    `;
  }
  
  // Generate rating UI based on settings
  let ratingHTML = '';
  if (settings.feedback_type === 'rating' || settings.feedback_type === 'both') {
    if (settings.rating_type === 'emoji') {
      ratingHTML = `
        <div id="sleek-rating-container" style="margin-bottom: 20px;">
          <p style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: ${settings.text_color}; text-align: center;">Rate your experience:</p>
          <div id="sleek-emojis" style="display: flex; justify-content: center; gap: 8px;">
            <span data-rating="1" style="font-size: 32px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; padding: 4px;">😞</span>
            <span data-rating="2" style="font-size: 32px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; padding: 4px;">😐</span>
            <span data-rating="3" style="font-size: 32px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; padding: 4px;">🙂</span>
            <span data-rating="4" style="font-size: 32px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; padding: 4px;">😀</span>
            <span data-rating="5" style="font-size: 32px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; padding: 4px;">😍</span>
          </div>
        </div>
      `;
    } else {
      const totalStars = settings.rating_scale || 5;
      let starsHtml = '';
      for (let i = 0; i < totalStars; i++) {
        starsHtml += `<span data-rating="${i+1}" style="font-size: 28px; cursor: pointer; margin: 0 4px; transition: all 0.2s ease; color: #e5e7eb;">★</span>`;
      }
      
      ratingHTML = `
        <div id="sleek-rating-container" style="margin-bottom: 20px;">
          <p style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: ${settings.text_color}; text-align: center;">Rate your experience:</p>
          <div id="sleek-stars" style="display: flex; justify-content: center;">
            ${starsHtml}
          </div>
        </div>
      `;
    }
  }
  
  // Generate text feedback UI based on settings
  let textFeedbackHTML = '';
  if (settings.feedback_type === 'text' || settings.feedback_type === 'both') {
    textFeedbackHTML = `
      <div style="width: 100%; box-sizing: border-box;">
        <textarea id="sleek-feedback-text" placeholder="Tell us what you think..." 
          style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 16px; 
          border: 2px solid #f3f4f6; border-radius: 12px; min-height: 120px; 
          margin-bottom: 20px; resize: none; font-size: 14px; line-height: 1.5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          outline: none; background-color: #fafbfc;"></textarea>
      </div>
    `;
  }
  
  // Logo HTML
  let logoHTML = '';
  if (settings.show_logo && settings.logo_url) {
    logoHTML = `<img src="${settings.logo_url}" alt="Logo" style="height: 32px; border-radius: 6px;">`;
  }
  
  // Prompt HTML
  let promptHTML = '';
  if (settings.show_prompt) {
    promptHTML = `
      <p style="margin-bottom: 20px; font-size: 15px; color: ${settings.text_color}; line-height: 1.6;">
        ${settings.custom_prompt || 'How was your experience with our product?'}
      </p>
    `;
  }
  
  const script = `
  (function() {
    var container = document.createElement('div');
    container.id = 'sleek-feedback-widget';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    
    // Apply positioning styles individually
    ${positionStyles.split(';').filter(s => s.trim()).map(style => {
      const [prop, value] = style.split(':');
      return `container.style.${prop.trim()} = '${value.trim()}';`;
    }).join('\n    ')}
    
    var button = document.createElement('button');
    ${buttonHTML}
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Add hover effect
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.05)';
      this.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    });
    
    button.addEventListener('click', function() {
      if (document.getElementById('sleek-feedback-form')) {
        document.getElementById('sleek-feedback-form').remove();
      } else {
        showFeedbackForm();
      }
    });
    
    container.appendChild(button);
    document.body.appendChild(container);
    
    function showFeedbackForm() {
      var formContainer = document.createElement('div');
      formContainer.id = 'sleek-feedback-form';
      formContainer.style.position = 'fixed';
      formContainer.style.boxSizing = 'border-box';
      
      // Position the form based on button position
      if ('${settings.position}'.includes('bottom')) {
        formContainer.style.bottom = '90px';
      } else {
        formContainer.style.top = '90px';
      }
      
      if ('${settings.position}'.includes('right')) {
        formContainer.style.right = '24px';
      } else {
        formContainer.style.left = '24px';
      }
      
      formContainer.style.width = '380px';
      formContainer.style.maxWidth = 'calc(100vw - 48px)';
      formContainer.style.backgroundColor = '${settings.background_color}';
      formContainer.style.borderRadius = '20px';
      formContainer.style.padding = '24px';
      formContainer.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
      formContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      formContainer.style.zIndex = '10000';
      formContainer.style.border = '1px solid rgba(0, 0, 0, 0.05)';
      formContainer.style.backdropFilter = 'blur(10px)';
      formContainer.style.animation = 'slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Add animation keyframes
      var style = document.createElement('style');
      style.textContent = \`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      \`;
      document.head.appendChild(style);
      
      formContainer.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: ${settings.text_color}; letter-spacing: -0.025em;">${settings.title}</h3>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${logoHTML}
            <button id="sleek-close-btn" style="background: #f3f4f6; border: none; cursor: pointer; font-size: 18px; color: #6b7280; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">&times;</button>
          </div>
        </div>
        ${promptHTML}
        ${textFeedbackHTML}
        ${ratingHTML}
        <button id="sleek-submit-btn" style="background: linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%); color: white; border: none; border-radius: 12px; padding: 16px 24px; cursor: pointer; width: 100%; font-size: 16px; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">Submit Feedback</button>
      \`;
      
      document.body.appendChild(formContainer);
      
      // Add textarea focus effect
      var textarea = document.getElementById('sleek-feedback-text');
      if (textarea) {
        textarea.addEventListener('focus', function() {
          this.style.borderColor = '${settings.primary_color}';
          this.style.backgroundColor = '#ffffff';
          this.style.boxShadow = '0 0 0 3px ' + '${settings.primary_color}' + '20';
        });
        
        textarea.addEventListener('blur', function() {
          this.style.borderColor = '#f3f4f6';
          this.style.backgroundColor = '#fafbfc';
          this.style.boxShadow = 'none';
        });
      }
      
      // Add submit button hover effect
      var submitBtn = document.getElementById('sleek-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-1px)';
          this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        submitBtn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
      }
      
      // Add close button hover effect
      var closeBtn = document.getElementById('sleek-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('mouseenter', function() {
          this.style.backgroundColor = '#e5e7eb';
          this.style.color = '#374151';
        });
        
        closeBtn.addEventListener('mouseleave', function() {
          this.style.backgroundColor = '#f3f4f6';
          this.style.color = '#6b7280';
        });
      }
      
      // Handle star ratings
      var stars = document.querySelectorAll('#sleek-stars span');
      var emojis = document.querySelectorAll('#sleek-emojis span');
      var selectedRating = 0;
      
      if (stars.length > 0) {
        stars.forEach(function(star) {
          star.addEventListener('mouseenter', function() {
            var rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
            this.style.transform = 'scale(1.1)';
          });
          
          star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
            this.style.transform = 'scale(1)';
          });
          
          star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            highlightStars(selectedRating);
          });
        });
        
        function highlightStars(rating) {
          stars.forEach(function(star, index) {
            if (index < rating) {
              star.style.color = '${settings.primary_color}';
            } else {
              star.style.color = '#e5e7eb';
            }
          });
        }
      }
      
      // Handle emoji ratings
      if (emojis.length > 0) {
        emojis.forEach(function(emoji) {
          emoji.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = '#f3f4f6';
          });
          
          emoji.addEventListener('mouseleave', function() {
            if (parseInt(this.getAttribute('data-rating')) !== selectedRating) {
              this.style.transform = 'scale(1)';
              this.style.backgroundColor = 'transparent';
            }
          });
          
          emoji.addEventListener('click', function() {
            emojis.forEach(function(e) {
              e.style.transform = 'scale(1)';
              e.style.backgroundColor = 'transparent';
            });
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = '${settings.primary_color}20';
            selectedRating = parseInt(this.getAttribute('data-rating'));
          });
        });
      }
      
      document.getElementById('sleek-close-btn').addEventListener('click', function() {
        formContainer.style.animation = 'slideOutDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(function() {
          formContainer.remove();
        }, 200);
      });
      
      document.getElementById('sleek-submit-btn').addEventListener('click', function() {
        var feedbackText = '';
        if (document.getElementById('sleek-feedback-text')) {
          feedbackText = document.getElementById('sleek-feedback-text').value;
        }
        
        if (feedbackText.trim() !== '' || selectedRating > 0) {
          submitFeedback(feedbackText, selectedRating);
          formContainer.innerHTML = \`
            <div style="text-align: center; padding: 40px 20px;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: ${settings.text_color};">Thank you!</h3>
              <p style="margin-bottom: 24px; color: #6b7280; font-size: 15px; line-height: 1.5;">Your feedback helps us improve our product.</p>
              <button id="sleek-close-thanks-btn" style="background: linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%); color: white; border: none; border-radius: 12px; padding: 12px 24px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s ease;">Close</button>
            </div>
          \`;
          
          document.getElementById('sleek-close-thanks-btn').addEventListener('click', function() {
            formContainer.style.animation = 'slideOutDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(function() {
              formContainer.remove();
            }, 200);
          });
        }
      });
      
      // Add slideOutDown animation
      style.textContent += \`
        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
        }
      \`;
    }
    
    function submitFeedback(text, rating) {
      fetch('https://dpklkjssynqixtbmrbfj.supabase.co/functions/v1/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${apiKey}'
        },
        body: JSON.stringify({ text: text, rating: rating })
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
      });
    }
  })();
  `;
  
  return new Response(script, { headers });
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserApiKey } from '@/services/feedbackService';

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    // Get the user's API key
    const fetchApiKey = async () => {
      try {
        const key = await getUserApiKey();
        if (key) {
          setApiKey(key);
          console.log("API key fetched successfully");
        } else {
          console.error("No API key returned");
          toast({
            title: "Error",
            description: "Failed to load API key. Please go to settings to generate one.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
        toast({
          title: "Error",
          description: "Failed to load API key. Please go to settings to generate one.",
          variant: "destructive",
        });
      }
    };
    
    fetchApiKey();
    
    // Create feedback button
    const container = document.createElement('div');
    container.id = 'sleek-feedback-widget';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    
    const button = document.createElement('button');
    button.textContent = 'Feedback';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '8px 16px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    
    button.addEventListener('click', () => {
      if (document.getElementById('sleek-feedback-form')) {
        document.getElementById('sleek-feedback-form')?.remove();
      } else {
        showFeedbackForm();
      }
    });
    
    container.appendChild(button);
    document.body.appendChild(container);
    
    function showFeedbackForm() {
      // Don't show the form if we don't have an API key
      if (!apiKey) {
        toast({
          title: "Error",
          description: "No API key available. Please go to settings to generate one.",
          variant: "destructive",
        });
        return;
      }
      
      const formContainer = document.createElement('div');
      formContainer.id = 'sleek-feedback-form';
      formContainer.style.position = 'fixed';
      formContainer.style.bottom = '70px';
      formContainer.style.right = '20px';
      formContainer.style.width = '300px';
      formContainer.style.backgroundColor = 'white';
      formContainer.style.borderRadius = '8px';
      formContainer.style.padding = '16px';
      formContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
      formContainer.style.fontFamily = 'Arial, sans-serif';
      formContainer.style.zIndex = '10000';
      
      formContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px;">We value your feedback!</h3>
          <button id="sleek-close-btn" style="background: none; border: none; cursor: pointer; font-size: 16px;">&times;</button>
        </div>
        <textarea id="sleek-feedback-text" placeholder="Tell us what you think..." style="width: 100%; padding: 16px; border: 2px solid #f3f4f6; border-radius: 12px; min-height: 80px; margin-bottom: 12px; resize: none; font-size: 14px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; outline: none; background-color: #fafbfc; box-sizing: border-box;"></textarea>
        <div id="sleek-rating-container" style="margin-bottom: 12px; text-align: center;">
          <p style="margin-bottom: 8px; font-size: 14px;">Rate your experience:</p>
          <div id="sleek-stars" style="display: flex; justify-content: center;">
            <span data-rating="1" style="font-size: 24px; cursor: pointer; margin: 0 2px; color: #ccc;">★</span>
            <span data-rating="2" style="font-size: 24px; cursor: pointer; margin: 0 2px; color: #ccc;">★</span>
            <span data-rating="3" style="font-size: 24px; cursor: pointer; margin: 0 2px; color: #ccc;">★</span>
            <span data-rating="4" style="font-size: 24px; cursor: pointer; margin: 0 2px; color: #ccc;">★</span>
            <span data-rating="5" style="font-size: 24px; cursor: pointer; margin: 0 2px; color: #ccc;">★</span>
          </div>
        </div>
        <button id="sleek-submit-btn" style="background-color: #3b82f6; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; width: 100%;">Submit Feedback</button>
      `;
      
      document.body.appendChild(formContainer);
      
      // Add textarea focus effect
      const textarea = document.getElementById('sleek-feedback-text') as HTMLTextAreaElement;
      if (textarea) {
        textarea.addEventListener('focus', function() {
          this.style.borderColor = '#3b82f6';
          this.style.backgroundColor = '#ffffff';
          this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });
        
        textarea.addEventListener('blur', function() {
          this.style.borderColor = '#f3f4f6';
          this.style.backgroundColor = '#fafbfc';
          this.style.boxShadow = 'none';
        });
      }
      
      let stars = document.querySelectorAll('#sleek-stars span');
      let selectedRating = 0;
      
      stars.forEach(function(star) {
        star.addEventListener('mouseenter', function() {
          const starElement = this as HTMLElement;
          const rating = parseInt(starElement.getAttribute('data-rating') || '0');
          highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
          highlightStars(selectedRating);
        });
        
        star.addEventListener('click', function() {
          const starElement = this as HTMLElement;
          selectedRating = parseInt(starElement.getAttribute('data-rating') || '0');
          highlightStars(selectedRating);
        });
      });
      
      function highlightStars(rating: number) {
        stars.forEach(function(star, index) {
          const starElement = star as HTMLElement;
          if (index < rating) {
            starElement.style.color = '#FFD700';
          } else {
            starElement.style.color = '#ccc';
          }
        });
      }
      
      document.getElementById('sleek-close-btn')?.addEventListener('click', () => {
        formContainer.remove();
      });
      
      document.getElementById('sleek-submit-btn')?.addEventListener('click', async () => {
        const feedbackTextElement = document.getElementById('sleek-feedback-text') as HTMLTextAreaElement;
        const feedbackText = feedbackTextElement?.value || '';
        
        if (feedbackText.trim() !== '' || selectedRating > 0) {
          if (!apiKey) {
            toast({
              title: "Error",
              description: "No API key available. Please go to settings to generate one.",
              variant: "destructive",
            });
            return;
          }
          
          try {
            await submitFeedbackToSupabase(feedbackText, selectedRating);
            formContainer.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 16px;">Thank you for your feedback!</p>
                <button id="sleek-close-thanks-btn" style="background-color: #3b82f6; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer;">Close</button>
              </div>
            `;
            
            setFeedbackSubmitted(true);
            
            document.getElementById('sleek-close-thanks-btn')?.addEventListener('click', () => {
              formContainer.remove();
            });
          } catch (error) {
            console.error('Error submitting feedback:', error);
            toast({
              title: "Error",
              description: "Failed to submit feedback. Please try again.",
              variant: "destructive",
            });
          }
        }
      });
    }
    
    return () => {
      // Clean up
      const widget = document.getElementById('sleek-feedback-widget');
      if (widget) widget.remove();
      
      const form = document.getElementById('sleek-feedback-form');
      if (form) form.remove();
    };
  }, [apiKey, toast]);

  const submitFeedbackToSupabase = async (text: string, rating: number) => {
    if (!apiKey) {
      throw new Error('No API key available');
    }
    
    try {
      console.log("Submitting feedback with API key:", apiKey.substring(0, 5) + '...');
      
      // Use the full URL for the Supabase function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/submit-feedback`;
      
      console.log("Submitting to:", functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          text, 
          rating 
        })
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        console.error('Server response error:', responseData);
        throw new Error(responseData.error || 'Failed to submit feedback');
      }
      
      const responseData = await response.json();
      console.log('Feedback submitted successfully:', responseData);
      
      toast({
        title: "Success",
        description: "Your feedback has been submitted.",
      });
      
      setFeedbackSubmitted(true);
      return responseData;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to App
        </Button>
        <h1 className="text-3xl font-bold mb-2">Demo Website</h1>
        <p className="text-muted-foreground">This simulates your website with the Chatter Doc widget embedded.</p>
      </header>
      
      <div className="max-w-3xl mx-auto">
        <div className="p-6 border border-border rounded-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Our Demo Site</h2>
          <p className="mb-4">This is a demonstration of how the Chatter Doc widget works on your website. Click the "Feedback" button in the bottom right corner to try it out.</p>
          <p>After submitting feedback, you'll be able to see it in your Chatter Doc dashboard in real-time.</p>
        </div>
        
        {feedbackSubmitted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 mb-8">
            <h3 className="font-medium mb-2">Feedback Submitted Successfully!</h3>
            <p className="text-sm">Your feedback has been recorded. Go to the <a href="/dashboard" className="text-primary underline">dashboard</a> to view it.</p>
          </div>
        )}
        
        <div className="p-6 border border-border rounded-md mb-8">
          <h2 className="text-xl font-semibold mb-4">About Our Product</h2>
          <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur consectetur, nisi nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
          <p>Nullam euismod, nisi vel consectetur consectetur, nisi nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
        </div>
      </div>
    </div>
  );
};

export default Demo;

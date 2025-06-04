import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AuthNav from '@/components/AuthNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import CreditCard from '@/components/CreditCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Credits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditOptions = [
    {
      id: 'credits-30',
      title: 'Starter',
      price: '$15.00',
      credits: 30,
      description: 'Perfect for getting started with sentiment analysis',
      popular: false
    },
    {
      id: 'credits-180',
      title: 'Pro',
      price: '$60.00',
      credits: 180,
      description: 'Best value for regular feedback analysis',
      popular: true
    },
    {
      id: 'credits-1000',
      title: 'Business',
      price: '$200.00',
      credits: 1000,
      description: 'Ideal for businesses with high volumes of feedback',
      popular: false
    }
  ];

  const handleBuyCredits = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to purchase credits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      toast({
        title: "Checkout Failed",
        description: "There was a problem creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Purchase Credits</h1>
        <p className="text-muted-foreground mb-8">
          Credits are used for sentiment analysis of feedback. Each analysis costs 1 credit.
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Creating checkout session...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {creditOptions.map((option) => (
              <CreditCard
                key={option.id}
                title={option.title}
                price={option.price}
                credits={option.credits}
                description={option.description}
                popular={option.popular}
                onSelect={() => handleBuyCredits(option.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Credits;

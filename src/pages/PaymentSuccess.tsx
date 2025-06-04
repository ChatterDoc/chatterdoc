
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AuthNav from '@/components/AuthNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number | null>(null);
  const [addedCredits, setAddedCredits] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) {
        setError('You need to be signed in to verify your payment');
        setIsVerifying(false);
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('Missing session information');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) throw new Error(error.message);

        if (data.alreadyProcessed) {
          setAddedCredits(data.credits);
          setMessage('This payment has already been processed.');
        } else if (data.success) {
          setCreditAmount(data.credits);
          setAddedCredits(data.added);
          setMessage(data.message || `Successfully added ${data.added} credits to your account!`);
          
          toast({
            title: "Payment Successful",
            description: `${data.added} credits have been added to your account!`,
          });
        } else {
          setError('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [user, location.search, toast]);

  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-lg border border-border bg-card shadow-sm"
          >
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-xl font-semibold">Verifying your payment...</h1>
                <p className="text-muted-foreground mt-2">Please wait while we confirm your purchase</p>
              </div>
            ) : error ? (
              <>
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <AlertTitle>Payment Verification Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                
                <div className="flex justify-center mt-6">
                  <Button onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                  
                  {addedCredits && (
                    <div className="bg-muted py-3 px-5 rounded-full font-mono text-xl mb-4">
                      +{addedCredits} credits
                    </div>
                  )}
                  
                  {creditAmount && (
                    <p className="text-center text-muted-foreground mb-1">
                      Total balance: {creditAmount} credits
                    </p>
                  )}
                  
                  <p className="text-center text-muted-foreground mb-6">
                    {message || 'Your payment was processed successfully.'}
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button onClick={() => navigate('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;

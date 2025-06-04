
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import PricingPreview from '@/components/PricingPreview';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PricingPreview />
      
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Customer Feedback?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of businesses using ChatterDoc to understand and act on customer insights.
          </p>
          
          {isSignedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-6 text-lg"
              >
                Go to Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/demo')}
                className="px-8 py-6 text-lg"
              >
                Try Demo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/sign-up')}
                className="px-8 py-6 text-lg"
              >
                Sign Up Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/sign-in')}
                className="px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <footer className="bg-gray-50 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold">CD</span>
              </div>
              <h1 className="text-xl font-semibold">ChatterDoc</h1>
            </div>
            
            <div className="flex gap-8">
              <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChatterDoc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

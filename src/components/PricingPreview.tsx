import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CreditCard as CreditCardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  creditsAmount: number;
  buttonText: string;
  onClick: () => void;
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  description,
  features,
  popular = false,
  creditsAmount,
  buttonText,
  onClick
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col ${
        popular ? 'border-primary shadow-lg relative' : ''
      }`}>
        {popular && (
          <div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-primary text-white text-xs font-medium py-1 px-3 rounded-full">
            MOST POPULAR
          </div>
        )}
        
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-muted-foreground text-sm">one-time</span>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-primary">{creditsAmount}</span>
            <span className="text-muted-foreground ml-1">credits</span>
          </div>
          
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onClick} 
            variant={popular ? "default" : "outline"} 
            className="w-full"
          >
            <CreditCardIcon className="mr-2 h-4 w-4" /> {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const PricingPreview: React.FC = () => {
  const navigate = useNavigate();
  
  const pricingTiers = [
    {
      title: "Starter",
      price: "$15.00",
      description: "Perfect for getting started with sentiment analysis",
      creditsAmount: 30,
      buttonText: "Get Started",
      features: [
        "30 sentiment analysis credits",
        "Real-time feedback analysis",
        "Basic reporting",
        "No subscription required"
      ],
      popular: false
    },
    {
      title: "Pro",
      price: "$60.00",
      description: "Best value for regular feedback analysis",
      creditsAmount: 180,
      buttonText: "Best Value",
      features: [
        "180 sentiment analysis credits",
        "Advanced reporting",
        "Trend analysis",
        "Export options",
        "No subscription required"
      ],
      popular: true
    },
    {
      title: "Business",
      price: "$200.00",
      description: "Ideal for businesses with high volumes of feedback",
      creditsAmount: 1000,
      buttonText: "Go Business",
      features: [
        "1000 sentiment analysis credits",
        "Advanced analytics dashboard",
        "Priority support",
        "Team collaboration",
        "Custom reporting",
        "No subscription required"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Pay only for what you use with our credit-based pricing. No subscriptions or hidden fees.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              {...tier}
              onClick={() => navigate('/credits')}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Need more credits? <a href="/contact" className="text-primary hover:underline">Contact us</a> for custom enterprise plans.</p>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;

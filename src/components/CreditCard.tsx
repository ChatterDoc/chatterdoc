
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard as CreditCardIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreditCardProps {
  title: string;
  price: string;
  credits: number;
  description: string;
  popular?: boolean;
  onSelect: () => void;
}

const CreditCard: React.FC<CreditCardProps> = ({
  title,
  price,
  credits,
  description,
  popular = false,
  onSelect
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full flex flex-col ${
        popular ? 'border-primary shadow-lg' : 'border-border'
      }`}>
        {popular && (
          <div className="bg-primary text-white text-xs font-semibold py-1 px-3 rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2">
            POPULAR
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {title}
            <span className="text-2xl">{price}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="flex justify-center items-center text-center mt-2">
            <Coins className="h-8 w-8 text-amber-500 mr-2" />
            <span className="text-4xl font-bold">{credits}</span>
            <span className="text-muted-foreground ml-2 text-sm">credits</span>
          </div>
          
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center">
              <Zap className="h-4 w-4 text-green-500 mr-2" />
              <span>Analyze sentiment in feedback</span>
            </li>
            <li className="flex items-center">
              <Zap className="h-4 w-4 text-green-500 mr-2" />
              <span>1 credit = 1 analysis</span>
            </li>
            <li className="flex items-center">
              <Zap className="h-4 w-4 text-green-500 mr-2" />
              <span>No subscription or recurring fees</span>
            </li>
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onSelect} 
            className="w-full" 
            variant={popular ? "default" : "outline"}
          >
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Buy Credits
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CreditCard;

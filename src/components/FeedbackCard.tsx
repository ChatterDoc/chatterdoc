
import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, RefreshCw, Loader2, Star, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/utils/types';
import { motion } from 'framer-motion';

interface FeedbackCardProps {
  feedback: Feedback;
  onAnalyze: (feedback: Feedback) => Promise<void>;
  isAnalyzing: boolean;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
  feedback, 
  onAnalyze, 
  isAnalyzing 
}) => {
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSentimentBadge = () => {
    if (!feedback.sentiment) return null;
    
    const badgeClass = 
      feedback.sentiment === 'positive' 
        ? 'bg-success/20 text-success' 
        : feedback.sentiment === 'negative'
          ? 'bg-destructive/20 text-destructive'
          : 'bg-muted text-muted-foreground';
    
    const icon = 
      feedback.sentiment === 'positive' 
        ? <ThumbsUp size={14} /> 
        : feedback.sentiment === 'negative'
          ? <ThumbsDown size={14} />
          : null;
    
    return (
      <div className={`absolute top-0 right-0 p-2 text-sm font-medium rounded-bl-lg ${badgeClass}`}>
        <div className="flex items-center gap-1">
          {icon}
          <span className="capitalize">{feedback.sentiment}</span>
        </div>
      </div>
    );
  };

  const renderStars = () => {
    if (!feedback.rating) return null;
    
    return (
      <div className="flex items-center text-amber-500 mt-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            size={16} 
            fill={index < feedback.rating ? "currentColor" : "none"} 
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-6 shadow-lg relative overflow-hidden"
    >
      {getSentimentBadge()}
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Customer Feedback</h3>
          <p className="text-muted-foreground text-sm">{formatDate(feedback.createdAt)}</p>
        </div>
      </div>
      
      <p className="text-card-foreground mb-4">{feedback.text}</p>
      
      {renderStars()}
      
      {!feedback.sentiment && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAnalyze(feedback)}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Analyze Sentiment
                <span className="ml-2 flex items-center text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  <Coins className="h-3 w-3 mr-1" />
                  1
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackCard;

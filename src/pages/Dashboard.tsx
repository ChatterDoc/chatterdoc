import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AuthNav from '@/components/AuthNav';
import { getFeedbackByUserId, analyzeFeedbackSentiment, getUserApiKeys } from '@/services/feedbackService';
import { Feedback, ApiKey } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Loader2, RefreshCw, ThumbsUp, ThumbsDown, Coins,
  Filter, Tag, ExternalLink, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import FeedbackCard from '@/components/FeedbackCard';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('all');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [showApiError, setShowApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [showInsufficientCreditsAlert, setShowInsufficientCreditsAlert] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          const userApiKeys = await getUserApiKeys(user.id);
          setApiKeys(userApiKeys);
          
          const feedbackData = await getFeedbackByUserId(user.id);
          setFeedback(feedbackData);
          setFilteredFeedback(feedbackData);
          
          // Load user credits
          await fetchCredits();
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast({
            title: "Error loading data",
            description: "There was a problem loading your dashboard data.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, toast]);

  const fetchCredits = async () => {
    if (!user) return;
    
    setLoadingCredits(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-credits');
      
      if (error) throw new Error(error.message);
      if (data && 'credits' in data) {
        // Fix: Use type assertion to handle the unknown value
        setCredits(data.credits as number);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    if (selectedApiKeyId === 'all') {
      setFilteredFeedback(feedback);
    } else {
      setFilteredFeedback(feedback.filter(item => item.apiKeyId === selectedApiKeyId));
    }
  }, [selectedApiKeyId, feedback]);

  const handleCreateWidget = () => {
    navigate('/customize');
  };

  const handleViewDemo = () => {
    navigate('/demo');
  };

  const handleBuyCredits = () => {
    navigate('/credits');
  };

  const handleAnalyzeSentiment = async (feedbackItem: Feedback) => {
    if (!feedbackItem.sentiment) {
      setAnalyzingId(feedbackItem.id);
      try {
        const updatedFeedback = await analyzeFeedbackSentiment(feedbackItem);
        
        // Update credit count from response
        if (updatedFeedback && 'credits' in updatedFeedback) {
          // Fix: Use type assertion to handle the unknown value
          setCredits(updatedFeedback.credits as number);
        } else {
          // If not returned in response, refresh credits
          await fetchCredits();
        }
        
        // Update feedback list
        setFeedback(prev => 
          prev.map(item => item.id === updatedFeedback.id ? updatedFeedback : item)
        );
        
        toast({
          title: "Analysis Complete",
          description: "Feedback sentiment has been analyzed.",
        });
      } catch (error) {
        console.error('Error analyzing sentiment:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('INSUFFICIENT_CREDITS')) {
          setShowInsufficientCreditsAlert(true);
        } else if (errorMessage.includes('OpenAI API')) {
          setApiErrorMessage(errorMessage);
          setShowApiError(true);
        } else {
          toast({
            title: "Analysis Failed",
            description: "Unable to analyze sentiment. Please try again.",
            variant: "destructive",
          });
        }
      }
      setAnalyzingId(null);
    }
  };

  const handleBulkAnalyze = async () => {
    const unanalyzedFeedback = filteredFeedback.filter(item => !item.sentiment);
    if (unanalyzedFeedback.length > 0) {
      setBulkAnalyzing(true);
      try {
        let successCount = 0;
        let errorCount = 0;
        let insufficientCredits = false;
        let openAiError = false;
        
        for (const item of unanalyzedFeedback) {
          try {
            const updatedFeedback = await analyzeFeedbackSentiment(item);
            
            // Update credit count if available in response
            if (updatedFeedback && 'credits' in updatedFeedback) {
              // Fix: Use type assertion to handle the unknown value
              setCredits(updatedFeedback.credits as number);
            }
            
            setFeedback(prev => 
              prev.map(f => f.id === updatedFeedback.id ? updatedFeedback : f)
            );
            successCount++;
          } catch (error) {
            errorCount++;
            console.error('Error analyzing item:', error);
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('INSUFFICIENT_CREDITS')) {
              insufficientCredits = true;
              break;
            } else if (errorMessage.includes('OpenAI API')) {
              openAiError = true;
              setApiErrorMessage(errorMessage);
              break;
            }
          }
        }
        
        // Refresh credits after bulk operation
        await fetchCredits();
        
        if (insufficientCredits) {
          setShowInsufficientCreditsAlert(true);
        } else if (openAiError) {
          setShowApiError(true);
        } else if (errorCount > 0) {
          toast({
            title: "Partial Analysis Complete",
            description: `Successfully analyzed ${successCount} items. ${errorCount} items failed.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Bulk Analysis Complete",
            description: `Successfully analyzed ${successCount} feedback items.`,
          });
        }
      } catch (error) {
        toast({
          title: "Bulk Analysis Failed",
          description: "Some feedback items could not be analyzed. Please try again.",
          variant: "destructive",
        });
      }
      setBulkAnalyzing(false);
    } else {
      toast({
        title: "No Feedback to Analyze",
        description: "All feedback items have already been analyzed.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <div className="flex items-center">
              <Coins className="h-4 w-4 text-amber-500 mr-1" />
              {loadingCredits ? (
                <span className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading credits...
                </span>
              ) : (
                <span className="text-sm">
                  <span className="font-semibold">{credits ?? 0}</span>
                  <span className="text-muted-foreground"> credits available</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {filteredFeedback.filter(item => !item.sentiment).length > 0 && (
              <Button 
                onClick={handleBulkAnalyze} 
                disabled={bulkAnalyzing || (credits !== null && credits <= 0)}
                className="flex items-center gap-2"
              >
                {bulkAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Analyze All
                  </>
                )}
              </Button>
            )}
            
            <Button onClick={handleBuyCredits} variant="outline" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Buy Credits
            </Button>
            
            <Button onClick={handleCreateWidget}>
              Customize Widget
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-6 p-4 border border-border rounded-md bg-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by API Key:</span>
            </div>
            
            <div className="w-full sm:w-60">
              <Select value={selectedApiKeyId} onValueChange={setSelectedApiKeyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select API Key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All API Keys</SelectItem>
                  {apiKeys.map(key => (
                    <SelectItem key={key.id} value={key.id}>{key.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleViewDemo} className="ml-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Demo
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">
            Recent Feedback 
            {selectedApiKeyId !== 'all' && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Filtered by API Key)
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-md">
              <p className="text-muted-foreground mb-4">No feedback yet</p>
              <Button variant="outline" onClick={handleCreateWidget}>
                Create Your First Widget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeedback.map((item) => (
                <FeedbackCard
                  key={item.id}
                  feedback={item}
                  onAnalyze={handleAnalyzeSentiment}
                  isAnalyzing={analyzingId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={showApiError} onOpenChange={setShowApiError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              OpenAI API Error
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                There was an issue with your OpenAI API key: 
                <span className="block mt-2 font-mono text-xs bg-muted p-2 rounded">
                  {apiErrorMessage}
                </span>
              </p>
              <p>
                Please check your OpenAI account billing status. Until this is resolved, 
                the sentiment analysis will use a basic algorithm instead of AI.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showInsufficientCreditsAlert} onOpenChange={setShowInsufficientCreditsAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Insufficient Credits
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                You don't have enough credits to perform sentiment analysis. 
                Each analysis requires 1 credit.
              </p>
              <p>
                Would you like to purchase more credits to continue analyzing feedback?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowInsufficientCreditsAlert(false);
              navigate('/credits');
            }}>
              Buy Credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;

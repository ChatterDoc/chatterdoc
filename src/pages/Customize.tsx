
import React, { useEffect, useState } from 'react';
import AuthNav from '@/components/AuthNav';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetSettings, ApiKey } from '@/utils/types';
import { getWidgetSettings, saveWidgetSettings, getWidgetCode, getUserApiKeys } from '@/services/feedbackService';
import { Copy, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WidgetPreview from '@/components/WidgetPreview';

const Customize = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [widgetCode, setWidgetCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          
          // Load API keys
          const userApiKeys = await getUserApiKeys(user.id);
          setApiKeys(userApiKeys);
          
          // Set the first API key as selected by default
          if (userApiKeys.length > 0 && !selectedApiKeyId) {
            setSelectedApiKeyId(userApiKeys[0].id);
          }
          
        } catch (error) {
          console.error('Error loading API keys:', error);
          toast({
            title: "Error loading API keys",
            description: "There was a problem loading your API keys.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user, toast, selectedApiKeyId]);
  
  // Load widget settings when API key selection changes
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id && selectedApiKeyId) {
        try {
          setLoading(true);
          
          // Load widget settings for the selected API key
          const userSettings = await getWidgetSettings(user.id, selectedApiKeyId);
          setSettings(userSettings);
          
          // Update widget code
          const selectedApiKey = apiKeys.find(key => key.id === selectedApiKeyId);
          if (selectedApiKey && userSettings) {
            setWidgetCode(getWidgetCode(selectedApiKey.apiKey, userSettings));
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          toast({
            title: "Error loading settings",
            description: "There was a problem loading your widget settings.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSettings();
  }, [user, selectedApiKeyId, apiKeys, toast]);
  
  const handleChange = (field: keyof WidgetSettings, value: any) => {
    if (settings) {
      const updatedSettings = { ...settings, [field]: value };
      setSettings(updatedSettings);
    }
  };
  
  const handleSave = async () => {
    if (settings && user && selectedApiKeyId) {
      try {
        // Ensure userId and apiKeyId are set correctly
        const updatedSettings = {
          ...settings,
          userId: user.id,
          apiKeyId: selectedApiKeyId
        };
        
        await saveWidgetSettings(updatedSettings);
        
        toast({
          title: "Settings Saved",
          description: "Your widget settings have been updated.",
        });
        
        // Refresh widget code
        const selectedApiKey = apiKeys.find(key => key.id === selectedApiKeyId);
        if (selectedApiKey) {
          setWidgetCode(getWidgetCode(selectedApiKey.apiKey, updatedSettings));
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error saving settings",
          description: "There was a problem saving your widget settings.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    
    toast({
      title: "Code Copied",
      description: "Widget code has been copied to clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNav />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin">
            <RotateCw className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-8">Customize Your Widget</h1>
        
        <div className="mb-6">
          <Label htmlFor="api-key-select" className="text-base font-medium mb-2 block">
            Select API Key to Customize
          </Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Select
              value={selectedApiKeyId}
              onValueChange={setSelectedApiKeyId}
              disabled={apiKeys.length === 0}
            >
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue placeholder="Select an API Key" />
              </SelectTrigger>
              <SelectContent>
                {apiKeys.map(key => (
                  <SelectItem key={key.id} value={key.id}>
                    {key.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="button">Button</TabsTrigger>
                <TabsTrigger value="form">Form</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearance" className="space-y-4 pt-4">
                {/* Appearance tab content */}
                <div className="space-y-2">
                  <Label htmlFor="title">Widget Title</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter widget title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      value={settings.backgroundColor}
                      onChange={(e) => handleChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-input" 
                      style={{ backgroundColor: settings.backgroundColor }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      value={settings.textColor}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      placeholder="#333333"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-input" 
                      style={{ backgroundColor: settings.textColor }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                    <div 
                      className="h-10 w-10 rounded border border-input" 
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Widget Position</Label>
                  <Select
                    value={settings.position}
                    onValueChange={(value) => handleChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="button" className="space-y-4 pt-4">
                {/* Button tab content */}
                <div className="space-y-2">
                  <Label htmlFor="buttonStyle">Button Style</Label>
                  <Select
                    value={settings.buttonStyle}
                    onValueChange={(value) => handleChange('buttonStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select button style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="chat">Chat Icon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {settings.buttonStyle === 'rectangle' && (
                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={settings.buttonText || 'Feedback'}
                      onChange={(e) => handleChange('buttonText', e.target.value)}
                      placeholder="Enter button text"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLogo"
                    checked={settings.showLogo}
                    onCheckedChange={(checked) => handleChange('showLogo', checked)}
                  />
                  <Label htmlFor="showLogo">Show Logo on Form</Label>
                </div>
                
                {settings.showLogo && (
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="form" className="space-y-4 pt-4">
                {/* Form tab content */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select
                    value={settings.feedbackType}
                    onValueChange={(value) => handleChange('feedbackType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="rating">Rating Only</SelectItem>
                      <SelectItem value="both">Text and Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(settings.feedbackType === 'rating' || settings.feedbackType === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="ratingType">Rating Type</Label>
                    <Select
                      value={settings.ratingType || 'stars'}
                      onValueChange={(value) => handleChange('ratingType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">Stars</SelectItem>
                        <SelectItem value="emoji">Emoji</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(settings.feedbackType === 'rating' || settings.feedbackType === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="ratingScale">Rating Scale</Label>
                    <Select
                      value={settings.ratingScale?.toString() || "5"}
                      onValueChange={(value) => handleChange('ratingScale', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">1-5</SelectItem>
                        <SelectItem value="10">1-10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showPrompt"
                    checked={settings.showPrompt !== undefined ? settings.showPrompt : true}
                    onCheckedChange={(checked) => handleChange('showPrompt', checked)}
                  />
                  <Label htmlFor="showPrompt">Show Custom Prompt</Label>
                </div>
                
                {settings.showPrompt && (
                  <div className="space-y-2">
                    <Label htmlFor="customPrompt">Custom Prompt Text</Label>
                    <Input
                      id="customPrompt"
                      value={settings.customPrompt || 'How was your experience with our product?'}
                      onChange={(e) => handleChange('customPrompt', e.target.value)}
                      placeholder="Enter custom prompt text"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Widget Code</h2>
              <p className="text-sm text-muted-foreground">
                Copy and paste this code just before the closing <code>&lt;/body&gt;</code> tag on your website.
              </p>
              
              <div className="relative">
                <pre className="p-4 rounded-md bg-muted font-mono text-xs overflow-x-auto max-h-60 sm:max-h-96">
                  {widgetCode}
                </pre>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <WidgetPreview settings={settings} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customize;

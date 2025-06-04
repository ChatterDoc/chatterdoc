
import React from 'react';
import { WidgetSettings } from '@/utils/types';
import { Star, MessageCircle, Circle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface WidgetPreviewProps {
  settings: WidgetSettings;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ settings }) => {
  const renderButton = () => {
    switch (settings.buttonStyle) {
      case 'circle':
        return (
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Circle className="h-6 w-6 text-white" />
          </div>
        );
      case 'chat':
        return (
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
        );
      default:
        return (
          <div 
            className="px-4 py-2 rounded shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: settings.primaryColor, color: 'white' }}
          >
            {settings.buttonText || 'Feedback'}
          </div>
        );
    }
  };

  const renderStars = () => {
    const scale = settings.ratingScale || 5;
    return (
      <div className="flex justify-center mb-3">
        {Array.from({ length: scale }).map((_, i) => (
          <Star 
            key={i} 
            className="h-5 w-5 mx-0.5 cursor-pointer" 
            color="#ccc"
            fill={i === 0 ? settings.primaryColor : "none"}
          />
        ))}
      </div>
    );
  };

  const renderEmojis = () => {
    return (
      <div className="flex justify-center space-x-3 mb-3">
        <span className="text-xl cursor-pointer">😞</span>
        <span className="text-xl cursor-pointer">😐</span>
        <span className="text-xl cursor-pointer">🙂</span>
        <span className="text-xl cursor-pointer" style={{ color: settings.primaryColor }}>😀</span>
        <span className="text-xl cursor-pointer">😍</span>
      </div>
    );
  };

  return (
    <div className="p-4 rounded-md border border-border bg-card">
      <h3 className="font-medium mb-4">Preview</h3>
      
      <div className="flex flex-col space-y-4">
        {/* Button Preview */}
        <div className="border rounded p-4 flex justify-end items-center">
          {renderButton()}
        </div>
        
        {/* Form Preview */}
        <div className="border rounded p-4 max-w-full overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h4 className="text-sm sm:text-base break-words" style={{ color: settings.textColor }}>{settings.title}</h4>
            {settings.showLogo && settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-6 sm:h-8" />
            )}
          </div>
          
          {settings.showPrompt && (
            <p className="text-xs sm:text-sm mb-3 break-words" style={{ color: settings.textColor }}>
              {settings.customPrompt || 'How was your experience with our product?'}
            </p>
          )}
          
          {(settings.feedbackType === 'rating' || settings.feedbackType === 'both') && (
            settings.ratingType === 'emoji' ? renderEmojis() : renderStars()
          )}
          
          {(settings.feedbackType === 'text' || settings.feedbackType === 'both') && (
            <div className="w-full mb-3">
              <Textarea 
                placeholder="Tell us what you think..." 
                className="w-full resize-none min-h-[80px]"
                style={{ 
                  borderColor: `${settings.primaryColor}40`,
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
            </div>
          )}
          
          <button
            className="w-full py-2 rounded text-sm sm:text-base"
            style={{ 
              backgroundColor: settings.primaryColor,
              color: 'white',
            }}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;

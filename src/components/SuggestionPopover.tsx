
import React from 'react';
import { Check, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SuggestionPopoverProps = {
  originalText: string;
  suggestedText: string;
  reasoning: string;
  onAccept: () => void;
  onReject: () => void;
  children: React.ReactNode;
  className?: string;
};

export const SuggestionPopover: React.FC<SuggestionPopoverProps> = ({
  originalText,
  suggestedText,
  reasoning,
  onAccept,
  onReject,
  children,
  className
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className={cn("suggestion-highlight group", className)}>
          {children}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-black/75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Click to see AI suggestion
          </span>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 backdrop-blur-sm bg-white/95 shadow-xl border border-border/50 overflow-hidden animate-scale-in">
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-primary">Original Text</h4>
            <p className="text-sm bg-muted/30 p-2 rounded-sm mt-1">{originalText}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-accent">AI Suggestion</h4>
            <p className="text-sm bg-mentor-purple/20 p-2 rounded-sm mt-1">{suggestedText}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Reasoning</h4>
            <p className="text-xs text-muted-foreground mt-1">{reasoning}</p>
          </div>
        </div>
        
        <div className="border-t flex justify-between p-2 bg-muted/30">
          <Button
            size="sm"
            variant="ghost"
            className="w-1/2 text-sm text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <div className="w-px bg-border h-8 my-auto"></div>
          <Button
            size="sm"
            variant="ghost"
            className="w-1/2 text-sm text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

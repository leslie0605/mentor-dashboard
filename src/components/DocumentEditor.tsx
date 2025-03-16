
import React, { useState, useEffect } from 'react';
import { UserAvatar } from './UserAvatar';
import { SuggestionPopover } from './SuggestionPopover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Lock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type Suggestion = {
  id: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
  position: {
    start: number;
    end: number;
  };
  resolved: boolean;
  accepted: boolean;
};

type MentorEdit = {
  id: string;
  text: string;
  position: {
    start: number;
    end: number;
  };
  mentorName: string;
  timestamp: Date;
};

type DocumentEditorProps = {
  title: string;
  content: string;
  suggestions: Suggestion[];
  studentName: string;
  documentType: string;
  onSendFeedback: () => void;
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  title,
  content,
  suggestions: initialSuggestions,
  studentName,
  documentType,
  onSendFeedback
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [mentorEdits, setMentorEdits] = useState<MentorEdit[]>([]);
  const [isEditable, setIsEditable] = useState(true);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  
  // Placeholder for tracking stats
  const [stats, setStats] = useState({
    editsAccepted: 0,
    editsRejected: 0,
    manualEdits: 0
  });

  // Handle accepting a suggestion
  const handleAcceptSuggestion = (suggestionId: string) => {
    const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
    
    if (suggestionIndex === -1) return;
    
    const suggestion = suggestions[suggestionIndex];
    
    // Create a new content by replacing the original text with the suggested text
    const newContent = 
      editorContent.substring(0, suggestion.position.start) + 
      suggestion.suggestedText + 
      editorContent.substring(suggestion.position.end);
    
    // Update the suggestion status
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[suggestionIndex] = {
      ...suggestion,
      resolved: true,
      accepted: true
    };
    
    // Update stats
    setStats(prev => ({
      ...prev,
      editsAccepted: prev.editsAccepted + 1
    }));
    
    // Add to mentor edits
    const newEdit: MentorEdit = {
      id: `edit-${Date.now()}`,
      text: suggestion.suggestedText,
      position: {
        start: suggestion.position.start,
        end: suggestion.position.start + suggestion.suggestedText.length
      },
      mentorName: 'Dr. Jane Smith',
      timestamp: new Date()
    };
    
    // Update state
    setEditorContent(newContent);
    setSuggestions(updatedSuggestions);
    setMentorEdits(prev => [...prev, newEdit]);
    
    toast('Suggestion accepted', {
      description: `Changed "${suggestion.originalText}" to "${suggestion.suggestedText}"`,
      duration: 3000
    });
  };
  
  // Handle rejecting a suggestion
  const handleRejectSuggestion = (suggestionId: string) => {
    const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
    
    if (suggestionIndex === -1) return;
    
    // Update the suggestion status
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[suggestionIndex] = {
      ...updatedSuggestions[suggestionIndex],
      resolved: true,
      accepted: false
    };
    
    // Update stats
    setStats(prev => ({
      ...prev,
      editsRejected: prev.editsRejected + 1
    }));
    
    setSuggestions(updatedSuggestions);
    
    toast('Suggestion rejected', {
      description: 'Original text retained',
      duration: 3000
    });
  };
  
  // Handle sending feedback
  const handleSendFeedback = () => {
    setIsSendingFeedback(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsEditable(false);
      setIsSendingFeedback(false);
      
      toast('Feedback sent successfully', {
        description: `Document sent to ${studentName} with ${stats.editsAccepted} accepted edits and ${mentorEdits.length} comments`,
        duration: 5000
      });
      
      onSendFeedback();
    }, 1500);
  };
  
  // Render the document content with suggestions and edits highlighted
  const renderContent = () => {
    // This is a simplified implementation
    // In a real app, you would need a more sophisticated algorithm 
    // to handle overlapping suggestions and edits
    
    const activeSuggestions = suggestions.filter(s => !s.resolved);
    
    if (activeSuggestions.length === 0) {
      return (
        <div 
          className="prose prose-sm max-w-none"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onInput={(e) => {
            // This is a simplified implementation of content editing
            const newContent = e.currentTarget.innerText;
            setEditorContent(newContent);
            
            // In a real app, you would track changes and add them to mentorEdits
            // For now, we'll just increment the counter
            setStats(prev => ({
              ...prev,
              manualEdits: prev.manualEdits + 1
            }));
          }}
        >
          {editorContent}
        </div>
      );
    }
    
    // Sort suggestions by position.start in descending order to avoid index issues
    const sortedSuggestions = [...activeSuggestions].sort((a, b) => b.position.start - a.position.start);
    
    let result = editorContent;
    
    // Replace each suggestion with a highlighted version
    sortedSuggestions.forEach(suggestion => {
      const before = result.substring(0, suggestion.position.start);
      const after = result.substring(suggestion.position.end);
      
      const suggestionElement = (
        <SuggestionPopover
          key={suggestion.id}
          originalText={suggestion.originalText}
          suggestedText={suggestion.suggestedText}
          reasoning={suggestion.reasoning}
          onAccept={() => handleAcceptSuggestion(suggestion.id)}
          onReject={() => handleRejectSuggestion(suggestion.id)}
        >
          {suggestion.originalText}
        </SuggestionPopover>
      );
      
      result = before + suggestionElement.props.children + after;
    });
    
    return (
      <div 
        className="prose prose-sm max-w-none"
        contentEditable={isEditable}
        suppressContentEditableWarning
      >
        {result}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 mb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>{documentType}</span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <span>From:</span>
              <div className="flex items-center ml-1">
                <UserAvatar name={studentName} size="sm" className="mr-1" />
                <span>{studentName}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button
            size="sm"
            className={cn(
              "flex items-center gap-1",
              isSendingFeedback && "opacity-70"
            )}
            disabled={isSendingFeedback || !isEditable}
            onClick={handleSendFeedback}
          >
            {isEditable ? (
              <>
                <Send className="h-4 w-4" />
                Send Feedback
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Feedback Sent
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white rounded-md p-6 shadow-inner relative">
        {!isEditable && (
          <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="glass-card p-6 rounded-lg max-w-md text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">Document Locked</h3>
              <p className="text-muted-foreground">
                Feedback has been sent to the student. This document is now read-only.
              </p>
              <div className="text-sm bg-muted/50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Edits Accepted:</span>
                  <span className="font-medium">{stats.editsAccepted}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Edits Rejected:</span>
                  <span className="font-medium">{stats.editsRejected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Edits:</span>
                  <span className="font-medium">{stats.manualEdits}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {renderContent()}
      </div>
      
      <div className="flex justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Edit Summary:</span> {stats.editsAccepted} accepted, {stats.editsRejected} rejected, {stats.manualEdits} manual edits
        </div>
        
        {isEditable && (
          <div className="flex items-center gap-2">
            <span className="text-xs">All changes are attributed to Dr. Jane Smith</span>
            <UserAvatar name="Dr. Jane Smith" size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

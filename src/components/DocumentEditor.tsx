import React, { useState, useEffect, useCallback, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { SuggestionPopover } from "./SuggestionPopover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Lock, Download, CheckCircle, XCircle, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth"; // Add this hook for authentication

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
  originalText?: string;
  position: {
    start: number;
    end: number;
  };
  mentorName: string;
  mentorId?: string;
  timestamp: Date | string;
  fromSuggestion?: boolean;
  suggestionId?: string;
};

type DocumentEditorProps = {
  title: string;
  content: string;
  suggestions: Suggestion[];
  studentName: string;
  documentType: string;
  documentId: string;
  onSendFeedback: () => void;
};

// Backend API endpoint
const BACKEND_API = "http://localhost:3000/api";

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  title,
  content,
  suggestions: initialSuggestions,
  studentName,
  documentType,
  documentId,
  onSendFeedback,
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [suggestions, setSuggestions] =
    useState<Suggestion[]>(initialSuggestions);
  const [mentorEdits, setMentorEdits] = useState<MentorEdit[]>([]);
  const [isEditable, setIsEditable] = useState(true);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [selectedText, setSelectedText] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Mock authentication - in a real app, this would come from useAuth()
  const { user } = {
    user: { id: "mentor123", name: "Dr. Jane Smith", role: "mentor" },
  };

  // Placeholder for tracking stats
  const [stats, setStats] = useState({
    editsAccepted: 0,
    editsRejected: 0,
    manualEdits: 0,
  });

  // Fetch document data from the backend
  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // fetchDocument(documentId).then(data => {
    //   if (data.mentorEdits) {
    //     setMentorEdits(data.mentorEdits);
    //   }
    // });
  }, [documentId]);

  // Function to save mentor edits to the backend
  const saveEditsToBackend = async (edits) => {
    try {
      const response = await fetch(
        `${BACKEND_API}/documents/${documentId}/edits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            edits,
            mentorName: user.name,
            mentorId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save edits");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving edits to backend:", error);
      toast(`Error saving edits: ${error.message}`, {
        description: "Your changes couldn't be saved. Please try again.",
        duration: 5000,
      });
      throw error;
    }
  };

  // Update the handleAcceptSuggestion function
  const handleAcceptSuggestion = useCallback(
    async (suggestionId: string) => {
      const suggestionIndex = suggestions.findIndex(
        (s) => s.id === suggestionId
      );

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
        accepted: true,
      };

      // Update stats
      setStats((prev) => ({
        ...prev,
        editsAccepted: prev.editsAccepted + 1,
      }));

      // Add to mentor edits
      const newEdit = {
        id: `edit-${Date.now()}`,
        text: suggestion.suggestedText,
        originalText: suggestion.originalText,
        position: {
          start: suggestion.position.start,
          end: suggestion.position.start + suggestion.suggestedText.length,
        },
        mentorName: user.name,
        mentorId: user.id,
        timestamp: new Date(),
        fromSuggestion: true,
        suggestionId: suggestion.id,
      };

      // Update state
      setEditorContent(newContent);
      setSuggestions(updatedSuggestions);
      setMentorEdits((prev) => [...prev, newEdit]);

      // Save edit to backend
      try {
        // Send response to the suggestion
        await fetch(`${BACKEND_API}/documents/${documentId}/suggestions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            suggestionId,
            accepted: true,
            mentorName: user.name,
            mentorId: user.id,
          }),
        });
      } catch (error) {
        console.error("Error accepting suggestion:", error);
        // Continue anyway - the change is still in local state
      }
    },
    [suggestions, editorContent, documentId, user]
  );

  // Update the handleRejectSuggestion function
  const handleRejectSuggestion = useCallback(
    async (suggestionId: string) => {
      const updatedSuggestions = suggestions.map((s) =>
        s.id === suggestionId ? { ...s, resolved: true, accepted: false } : s
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        editsRejected: prev.editsRejected + 1,
      }));

      // Update state
      setSuggestions(updatedSuggestions);

      // Save rejection to backend
      try {
        await fetch(`${BACKEND_API}/documents/${documentId}/suggestions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            suggestionId,
            accepted: false,
            mentorName: user.name,
            mentorId: user.id,
          }),
        });
      } catch (error) {
        console.error("Error rejecting suggestion:", error);
        // Continue anyway - the change is still in local state
      }
    },
    [suggestions, documentId, user]
  );

  // Update the handleManualEdit function
  const handleManualEdit = useCallback(async () => {
    if (!selectedText || !selectedText.text) {
      toast("No text selected", {
        description: "Please select some text to edit first",
        duration: 3000,
      });
      return;
    }

    // Prompt for the new text (in a real app, you'd use a modal)
    const newText = prompt("Enter your edit:", selectedText.text);

    if (!newText || newText === selectedText.text) return;

    // Create a new content with the edit
    const newContent =
      editorContent.substring(0, selectedText.start) +
      newText +
      editorContent.substring(selectedText.end);

    // Create a new edit
    const newEdit = {
      id: `edit-${Date.now()}`,
      text: newText,
      originalText: selectedText.text,
      position: {
        start: selectedText.start,
        end: selectedText.start + newText.length,
      },
      mentorName: user.name,
      mentorId: user.id,
      timestamp: new Date(),
    };

    // Update state
    setEditorContent(newContent);
    setMentorEdits((prev) => [...prev, newEdit]);
    setStats((prev) => ({
      ...prev,
      manualEdits: prev.manualEdits + 1,
    }));
    setSelectedText(null);

    // Save edit to backend
    try {
      await saveEditsToBackend([
        {
          text: newText,
          position: {
            start: selectedText.start,
            end: selectedText.start + newText.length,
          },
          originalText: selectedText.text,
        },
      ]);
    } catch (error) {
      console.error("Error saving manual edit:", error);
      // Continue anyway - the change is still in local state
    }
  }, [selectedText, editorContent, user, saveEditsToBackend]);

  // Update the handleSendFeedback function
  const handleSendFeedback = async () => {
    setIsSendingFeedback(true);

    try {
      // Collect feedback comments (in a real app, you'd use a modal or form)
      const feedbackComments = prompt(
        "Enter any additional feedback for the student:",
        ""
      );

      // Send the final feedback to the backend
      const response = await fetch(
        `${BACKEND_API}/documents/${documentId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mentorName: user.name,
            mentorId: user.id,
            feedbackComments: feedbackComments || "Feedback complete.",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      setIsEditable(false);
      setIsSendingFeedback(false);

      toast("Feedback sent successfully", {
        description: `Document sent to ${studentName} with ${stats.editsAccepted} accepted edits and ${mentorEdits.length} comments`,
        duration: 5000,
      });

      onSendFeedback();
    } catch (error) {
      console.error("Error sending feedback:", error);
      setIsSendingFeedback(false);

      toast("Failed to send feedback", {
        description: "Please try again later.",
        duration: 5000,
      });
    }
  };

  // Add this text selection handler to detect when user selects text
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) return;

    // Get the selected text and its range
    const range = selection.getRangeAt(0);
    const selectedContent = range.toString();

    if (!selectedContent.trim().length) return;

    // Calculate the relative position in the editor content
    const editorNode = editorRef.current;
    const editorRect = editorNode.getBoundingClientRect();

    // This is a simplified approach - in a real app you'd need to account for more complex scenarios
    // like nested elements, formatting, etc.
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorNode);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    setSelectedText({
      text: selectedContent,
      start,
      end: start + selectedContent.length,
    });
  };

  // Render content with edited regions highlighted
  const renderContent = () => {
    // First handle active suggestions
    const activeSuggestions = suggestions.filter((s) => !s.resolved);

    // If there are no active suggestions, render with mentor edits highlighted
    if (activeSuggestions.length === 0) {
      if (mentorEdits.length === 0) {
        return (
          <div
            ref={editorRef}
            className="prose prose-sm max-w-none"
            contentEditable={isEditable}
            suppressContentEditableWarning
            onInput={(e) => {
              const newContent = e.currentTarget.innerText;
              setEditorContent(newContent);
            }}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
          >
            {editorContent}
          </div>
        );
      }

      // Generate HTML with mentor edits highlighted
      const contentWithEdits = editorContent;
      const htmlParts = [];
      let lastIndex = 0;

      // Sort edits by position to handle them in order
      const sortedEdits = [...mentorEdits].sort(
        (a, b) => a.position.start - b.position.start
      );

      for (const edit of sortedEdits) {
        // Add text before the edit
        htmlParts.push(
          contentWithEdits.substring(lastIndex, edit.position.start)
        );

        // Add the edited text with highlight
        htmlParts.push(
          <span
            key={edit.id}
            className="bg-blue-100 border-b-2 border-blue-400 relative group"
          >
            {edit.text}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-black/75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Edited by {edit.mentorName}
            </span>
          </span>
        );

        lastIndex = edit.position.end;
      }

      // Add any remaining text
      htmlParts.push(contentWithEdits.substring(lastIndex));

      return (
        <div
          ref={editorRef}
          className="prose prose-sm max-w-none"
          contentEditable={isEditable}
          suppressContentEditableWarning
          onInput={(e) => {
            const newContent = e.currentTarget.innerText;
            setEditorContent(newContent);
          }}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
        >
          {htmlParts}
        </div>
      );
    }

    // Sort suggestions by position.start in descending order to avoid index issues
    const sortedSuggestions = [...activeSuggestions].sort(
      (a, b) => b.position.start - a.position.start
    );

    // Create an array of content chunks
    const contentChunks = [editorContent];

    // Replace each suggestion with a highlighted version
    for (const suggestion of sortedSuggestions) {
      const lastChunk = contentChunks.pop() || "";
      const before = lastChunk.substring(0, suggestion.position.start);
      const middle = lastChunk.substring(
        suggestion.position.start,
        suggestion.position.end
      );
      const after = lastChunk.substring(suggestion.position.end);

      contentChunks.push(before);
      contentChunks.push(
        <SuggestionPopover
          key={suggestion.id}
          originalText={suggestion.originalText}
          suggestedText={suggestion.suggestedText}
          reasoning={suggestion.reasoning}
          onAccept={() => handleAcceptSuggestion(suggestion.id)}
          onReject={() => handleRejectSuggestion(suggestion.id)}
        >
          <span className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
            {suggestion.originalText}
          </span>
        </SuggestionPopover>
      );
      contentChunks.push(after);
    }

    return (
      <div
        ref={editorRef}
        className="prose prose-sm max-w-none"
        contentEditable={isEditable}
        suppressContentEditableWarning
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
      >
        {contentChunks}
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualEdit}
                  disabled={!selectedText || !isEditable}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Selected
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit the selected text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" disabled={!isEditable}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          <Button
            variant={isEditable ? "default" : "outline"}
            size="sm"
            onClick={handleSendFeedback}
            disabled={isSendingFeedback || !isEditable}
          >
            {isSendingFeedback ? (
              <>
                <div className="animate-spin h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                {isEditable ? (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Send Feedback
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1" />
                    Feedback Sent
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
            <span className="text-sm">
              {suggestions.filter((s) => !s.resolved).length} Active Suggestions
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-400 mr-2"></div>
            <span className="text-sm">{stats.editsAccepted} Accepted</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
            <span className="text-sm">{stats.editsRejected} Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-400 mr-2"></div>
            <span className="text-sm">{stats.manualEdits} Manual Edits</span>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">Edited by:</span>
          <UserAvatar name={user.name} size="sm" />
          <span className="text-sm ml-1">{user.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-md border p-4 bg-card">
        {renderContent()}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          All changes are tracked and attributed to you
        </div>

        <Button
          variant={isEditable ? "default" : "outline"}
          onClick={handleSendFeedback}
          disabled={isSendingFeedback || !isEditable}
        >
          {isSendingFeedback ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              Sending Feedback...
            </>
          ) : (
            <>
              {isEditable ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Feedback Sent
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

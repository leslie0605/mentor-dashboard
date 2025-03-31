import React, { useState, useEffect, useCallback, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { SuggestionPopover } from "./SuggestionPopover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Send,
  Lock,
  Download,
  CheckCircle,
  XCircle,
  Edit,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  mentorTags?: string[];
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
  fileUrl?: string;
  originalFileName?: string;
  editedFileUrl?: string;
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
  fileUrl,
  originalFileName,
  editedFileUrl,
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
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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
      // Automatically use mentor name as tag - no input needed
      const mentorTag = "Dr. Jane Smith";

      const response = await fetch(
        `${BACKEND_API}/documents/${documentId}/edits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            edits,
            mentorName: "Dr. Jane Smith",
            mentorId: "mentor123",
            mentorTags: [mentorTag], // Auto-set mentor name as tag
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
        mentorName: "Dr. Jane Smith",
        mentorId: "mentor123",
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
            mentorName: "Dr. Jane Smith",
            mentorId: "mentor123",
          }),
        });
      } catch (error) {
        console.error("Error accepting suggestion:", error);
        // Continue anyway - the change is still in local state
      }
    },
    [suggestions, editorContent, documentId]
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
            mentorName: "Dr. Jane Smith",
            mentorId: "mentor123",
          }),
        });
      } catch (error) {
        console.error("Error rejecting suggestion:", error);
        // Continue anyway - the change is still in local state
      }
    },
    [suggestions, documentId]
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
      mentorName: "Dr. Jane Smith",
      mentorId: "mentor123",
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
  }, [selectedText, editorContent, saveEditsToBackend]);

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
            mentorName: "Dr. Jane Smith",
            mentorId: "mentor123",
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

  // Add this function to handle downloading the original file
  const handleDownloadOriginalFile = () => {
    if (!fileUrl) {
      toast("No file available", {
        description: "The original file is not available for download",
        duration: 3000,
      });
      return;
    }

    // Trigger download - fix path to avoid double /api/ prefix
    const fixedUrl = fileUrl.startsWith("/api/")
      ? `${BACKEND_API}${fileUrl.substring(4)}`
      : `${BACKEND_API}${fileUrl}`;

    window.open(fixedUrl, "_blank");
  };

  // Add this function to handle downloading the edited file
  const handleDownloadEditedFile = () => {
    if (!editedFileUrl) {
      toast("No edited file available", {
        description: "No edited file has been uploaded yet",
        duration: 3000,
      });
      return;
    }

    // Trigger download - fix path to avoid double /api/ prefix
    const fixedUrl = editedFileUrl.startsWith("/api/")
      ? `${BACKEND_API}${editedFileUrl.substring(4)}`
      : `${BACKEND_API}${editedFileUrl}`;

    window.open(fixedUrl, "_blank");
  };

  // Add file upload handling
  const handleFileUpload = () => {
    setIsFileUploadOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Restore file upload submit function
  const submitFileUpload = async () => {
    if (!uploadedFile) {
      toast("No file selected", {
        description: "Please select a file to upload",
        duration: 3000,
      });
      return;
    }

    try {
      // Auto-generate summary and tags
      const mentorTag = "Dr. Jane Smith";
      const autoSummary = `Edited by Dr. Jane Smith on ${new Date().toLocaleDateString()}`;

      const formData = new FormData();
      formData.append("editedFile", uploadedFile);
      formData.append("documentId", documentId);
      formData.append("mentorName", "Dr. Jane Smith");
      formData.append("mentorId", "mentor123");
      formData.append("editSummary", autoSummary);
      formData.append("mentorTags[]", mentorTag);

      const response = await fetch(`${BACKEND_API}/documents/edited-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload edited file");
      }

      const result = await response.json();

      toast("File uploaded successfully", {
        description: "Your edited file has been uploaded for the student",
        duration: 3000,
      });

      // Close the dialog and reset state
      setIsFileUploadOpen(false);
      setUploadedFile(null);

      // Handle any UI updates needed after successful upload
      if (result.data && result.data.editedFileUrl) {
        // This would be handled by refreshing the document data in a real implementation
      }
    } catch (error) {
      console.error("Error uploading edited file:", error);
      toast("Failed to upload file", {
        description: error.message || "An error occurred during file upload",
        duration: 5000,
      });
    }
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
      const htmlParts: React.ReactNode[] = [];
      let lastIndex = 0;

      // Sort edits by position to handle them in order
      const sortedEdits = [...mentorEdits].sort(
        (a, b) => a.position.start - b.position.start
      );

      for (const edit of sortedEdits) {
        // Add text before the edit
        if (lastIndex < edit.position.start) {
          htmlParts.push(
            contentWithEdits.substring(lastIndex, edit.position.start)
          );
        }

        // Add the edited text with highlight
        htmlParts.push(
          <span
            key={edit.id}
            className="bg-blue-100 border-b-2 border-blue-400 relative group"
          >
            {edit.text}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-black/75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Edited by Dr. Jane Smith
            </span>
          </span>
        );

        lastIndex = edit.position.end;
      }

      // Add any remaining text
      if (lastIndex < contentWithEdits.length) {
        htmlParts.push(contentWithEdits.substring(lastIndex));
      }

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

    // Create an array of content chunks with proper typing
    const contentChunks: React.ReactNode[] = [];
    contentChunks.push(editorContent);

    // Replace each suggestion with a highlighted version
    for (const suggestion of sortedSuggestions) {
      const lastChunk = contentChunks.pop();
      // Make sure lastChunk is a string before using substring
      if (typeof lastChunk !== "string") continue;

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

          {fileUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadOriginalFile}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Original
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download the original file submitted by student</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {editedFileUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadEditedFile}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Edited
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download the most recent edited file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={!isEditable}
                >
                  <FileUp className="h-4 w-4 mr-1" />
                  Upload Edited File
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload an edited version of the document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
          <UserAvatar name="Dr. Jane Smith" size="sm" />
          <span className="text-sm ml-1">Dr. Jane Smith</span>
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

      {/* File Upload Dialog - simplified */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Edited Document</DialogTitle>
            <DialogDescription>
              Upload your edited version of the document for the student
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.tex"
              />
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadedFile.name} (
                  {Math.round(uploadedFile.size / 1024)} KB)
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Your edits will be automatically tagged with your name and
              timestamp.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFileUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitFileUpload}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

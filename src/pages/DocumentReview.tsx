import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DocumentEditor } from "@/components/DocumentEditor";
import { DocumentList } from "@/components/DocumentList";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// API endpoint
const BACKEND_API = "http://localhost:3000/api";

const DocumentReview = () => {
  const { documentId, id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Get the actual ID from either parameter
  const actualDocumentId = documentId || id;

  useEffect(() => {
    // Fetch documents from the backend
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_API}/documents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data.data || []);

        // If documentId is provided, fetch the specific document
        if (actualDocumentId) {
          console.log(`Fetching document with ID: ${actualDocumentId}`);
          const docResponse = await fetch(
            `${BACKEND_API}/documents/${actualDocumentId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!docResponse.ok) {
            throw new Error("Failed to fetch document details");
          }

          const docData = await docResponse.json();
          setSelectedDocument(docData.data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [documentId, id]);

  const handleBackToList = () => {
    navigate("/document-review");
    setSelectedDocument(null);
  };

  const handleSendFeedback = () => {
    navigate("/document-review");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 bg-muted w-64 rounded"></div>
            <div className="h-4 bg-muted w-40 rounded"></div>
            <div className="h-64 bg-muted w-full max-w-3xl rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 mt-4">
        {actualDocumentId && selectedDocument ? (
          <>
            <Button
              variant="ghost"
              className="mb-6 -ml-2 flex items-center gap-1"
              onClick={handleBackToList}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Documents
            </Button>

            <div className="bg-card rounded-lg border shadow-sm p-6 h-[calc(100vh-180px)]">
              <DocumentEditor
                title={selectedDocument.title}
                content={selectedDocument.content}
                suggestions={selectedDocument.suggestions || []}
                studentName={selectedDocument.studentName}
                documentType={selectedDocument.type}
                documentId={actualDocumentId}
                fileUrl={selectedDocument.fileUrl}
                originalFileName={selectedDocument.originalFileName}
                editedFileUrl={selectedDocument.editedFileUrl}
                onSendFeedback={handleSendFeedback}
              />
            </div>
          </>
        ) : (
          <DocumentList />
        )}
      </main>
    </div>
  );
};

export default DocumentReview;

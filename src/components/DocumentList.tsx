import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  FileCheck,
  FileBadge,
  FileWarning,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Backend API endpoint
const BACKEND_API = "http://localhost:3000/api";

// Document types
type DocumentType = "letter" | "cv" | "statement" | "personal";
type DocumentStatus = "pending" | "in_progress" | "completed";

// Document interface
interface Document {
  id: string;
  title: string;
  studentName: string;
  type: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

// Helper function to map backend document type to UI document type
const mapDocumentType = (type: string): DocumentType => {
  switch (type.toLowerCase()) {
    case "cv":
      return "cv";
    case "sop":
      return "statement";
    case "phs":
      return "personal";
    case "lor":
      return "letter";
    default:
      return "statement";
  }
};

// Helper function to get document icon
const getDocumentIcon = (type: string) => {
  const mappedType = mapDocumentType(type);
  switch (mappedType) {
    case "letter":
      return <FileWarning className="h-5 w-5" />;
    case "cv":
      return <FileCheck className="h-5 w-5" />;
    case "statement":
      return <FileText className="h-5 w-5" />;
    case "personal":
      return <FileBadge className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-600";
      case "in_progress":
        return "bg-amber-100 text-amber-600";
      case "completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "New";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Reviewed";
      default:
        return status;
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs rounded-full font-medium",
        getStatusStyles()
      )}
    >
      {getStatusLabel()}
    </span>
  );
};

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend API
  useEffect(() => {
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

        const result = await response.json();
        setDocuments(result.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents based on search and type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.studentName.toLowerCase().includes(searchQuery.toLowerCase());

    const docType = mapDocumentType(doc.type);
    const matchesType = activeTab === "all" || docType === activeTab;

    return matchesSearch && matchesType;
  });

  const handleDocumentClick = (id: string) => {
    navigate(`/document/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Review</h1>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          className="max-w-sm"
          placeholder="Search documents or students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="letter">Letters of Recommendation</TabsTrigger>
          <TabsTrigger value="cv">CV/Resume</TabsTrigger>
          <TabsTrigger value="statement">Statements of Purpose</TabsTrigger>
          <TabsTrigger value="personal">Personal History</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid gap-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <CardTitle className="text-base">
                            {doc.title}
                          </CardTitle>
                          <CardDescription>
                            Student: {doc.studentName}
                          </CardDescription>
                        </div>
                      </div>
                      <StatusBadge status={doc.status as DocumentStatus} />
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-2 text-xs text-muted-foreground">
                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No documents found. Student documents will appear here when they
                are submitted for review.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

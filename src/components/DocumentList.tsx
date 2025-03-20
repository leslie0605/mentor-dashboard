
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, FileCheck, FileBadge, FileWarning } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

// Document types
type DocumentType = 'letter' | 'cv' | 'statement' | 'personal';
type Document = {
  id: string;
  title: string;
  studentName: string;
  type: DocumentType;
  status: 'new' | 'in-progress' | 'reviewed';
  updatedAt: string;
};

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Dissertation Chapter 1: Introduction',
    studentName: 'Alex Chen',
    type: 'statement',
    status: 'in-progress',
    updatedAt: '2023-06-10'
  },
  {
    id: '2',
    title: 'Research Proposal: Marine Ecosystems',
    studentName: 'Sarah Johnson',
    type: 'statement',
    status: 'new',
    updatedAt: '2023-06-05'
  },
  {
    id: '3',
    title: 'Letter of Recommendation for PhD Application',
    studentName: 'Miguel Lopez',
    type: 'letter',
    status: 'reviewed',
    updatedAt: '2023-05-28'
  },
  {
    id: '4',
    title: 'Curriculum Vitae',
    studentName: 'Emma Wilson',
    type: 'cv',
    status: 'new',
    updatedAt: '2023-06-01'
  },
  {
    id: '5',
    title: 'Personal History Statement',
    studentName: 'Alex Chen',
    type: 'personal',
    status: 'in-progress',
    updatedAt: '2023-05-20'
  }
];

// Helper function to get document icon
const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case 'letter':
      return <FileWarning className="h-5 w-5" />;
    case 'cv':
      return <FileCheck className="h-5 w-5" />;
    case 'statement':
      return <FileText className="h-5 w-5" />;
    case 'personal':
      return <FileBadge className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: Document['status'] }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-600';
      case 'in-progress':
        return 'bg-amber-100 text-amber-600';
      case 'reviewed':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <span className={cn(
      'px-2 py-1 text-xs rounded-full font-medium',
      getStatusStyles()
    )}>
      {status === 'in-progress' ? 'In Progress' : status === 'new' ? 'New' : 'Reviewed'}
    </span>
  );
};

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | DocumentType>('all');
  
  // Filter documents based on search and type
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 'all' || doc.type === activeTab;
    return matchesSearch && matchesType;
  });

  const handleDocumentClick = (id: string) => {
    navigate(`/document-review/${id}`);
  };

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
              filteredDocuments.map(doc => (
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
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription>Student: {doc.studentName}</CardDescription>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-2 text-xs text-muted-foreground">
                    Last updated: {doc.updatedAt}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No documents found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

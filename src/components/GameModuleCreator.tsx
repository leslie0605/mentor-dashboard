
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from './UserAvatar';
import { AlertCircle, BookOpen, FileText, Globe, Loader2, Upload, Upload as UploadIcon, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type GameModuleCreatorProps = {
  onModuleCreated: (moduleName: string) => void;
};

export const GameModuleCreator: React.FC<GameModuleCreatorProps> = ({ 
  onModuleCreated 
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [selectedMentees, setSelectedMentees] = useState<string[]>(['Alex Chen', 'Sarah Johnson']);
  
  const mentees = [
    { id: '1', name: 'Alex Chen', avatar: '/placeholder.svg' },
    { id: '2', name: 'Sarah Johnson', avatar: '/placeholder.svg' },
    { id: '3', name: 'Miguel Lopez', avatar: '/placeholder.svg' },
    { id: '4', name: 'Emma Wilson', avatar: '/placeholder.svg' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Auto-generate a title based on the filename
      setModuleTitle(file.name.replace(/\.[^/.]+$/, '').replace(/-|_/g, ' '));
    }
  };

  const toggleMenteeSelection = (id: string) => {
    setSelectedMentees(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id) 
        : [...prev, id]
    );
  };

  const isFormValid = () => {
    if (!moduleTitle.trim()) return false;
    
    if (activeTab === 'upload' && !uploadedFile) return false;
    if (activeTab === 'url' && !sourceUrl.trim()) return false;
    if (activeTab === 'manual' && !manualContent.trim()) return false;
    
    return selectedMentees.length > 0;
  };

  const handleGenerateModule = () => {
    if (!isFormValid()) {
      toast('Please fill in all required fields', {
        description: 'Module title, content source, and at least one mentee are required',
        duration: 3000
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate the generation process
    const intervalId = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          setIsGenerating(false);
          
          // Notify completion and reset form
          toast('Game module created successfully', {
            description: `"${moduleTitle}" has been created and assigned to ${selectedMentees.length} mentee(s)`,
            duration: 5000
          });
          
          onModuleCreated(moduleTitle);
          
          setUploadedFile(null);
          setSourceUrl('');
          setManualContent('');
          setModuleTitle('');
          
          return 0;
        }
        return prev + 10;
      });
    }, 400);
  };

  return (
    <Card className="border border-border/50 shadow-md w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create New Game Module
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload content to be transformed into interactive learning modules for your mentees
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="module-title">Module Title</Label>
          <Input
            id="module-title"
            placeholder="e.g., Research Methods Fundamentals"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            className="mentor-focus-ring"
          />
        </div>
        
        <Tabs 
          defaultValue="upload" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-1">
              <UploadIcon className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Source URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-md p-6 text-center bg-muted/30">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Uploaded successfully
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="mt-2"
                  >
                    Remove & Upload Another
                  </Button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    Drag and drop a file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOC, DOCX, and TXT up to 10MB
                  </p>
                </label>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="source-url">URL to Academic Resource</Label>
              <Input
                id="source-url"
                placeholder="https://journal.edu/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="mentor-focus-ring"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Make sure the URL is publicly accessible or from a subscribed journal
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="manual-content">Content</Label>
              <Textarea
                id="manual-content"
                placeholder="Paste or type academic content here..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="resize-none h-32 mentor-focus-ring"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label>Assign to Mentees</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {mentees.map(mentee => (
              <div
                key={mentee.id}
                onClick={() => toggleMenteeSelection(mentee.id)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200",
                  selectedMentees.includes(mentee.id)
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/30 border border-transparent hover:border-border"
                )}
              >
                <UserAvatar name={mentee.name} image={mentee.avatar} size="sm" />
                <span className="text-sm">{mentee.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating module...</span>
              <span>{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Analyzing content and creating interactive elements...
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleGenerateModule}
          disabled={isGenerating || !isFormValid()}
          className={cn(
            "flex items-center gap-2",
            isGenerating && "opacity-70"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Module...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Game Module
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

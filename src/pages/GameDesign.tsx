
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Gamepad, 
  Puzzle, 
  BookOpen, 
  MapPin, 
  FileText, 
  Upload, 
  Youtube, 
  Link, 
  Zap,
  FileUp,
  AlertCircle,
  Loader2
} from "lucide-react";

type GameType = 'quiz' | 'matching' | 'flashcard' | 'adventure';
type SourceType = 'text' | 'pdf' | 'youtube';

const gameTypes = [
  { id: 'quiz', name: 'Quiz Game', icon: <BookOpen className="h-5 w-5" />, available: true },
  { id: 'matching', name: 'Matching Game', icon: <Puzzle className="h-5 w-5" />, available: true },
  { id: 'flashcard', name: 'Flashcard Game', icon: <Gamepad className="h-5 w-5" />, available: true },
  { id: 'adventure', name: 'Adventure Game', icon: <MapPin className="h-5 w-5" />, available: false },
];

const GameDesign = () => {
  const navigate = useNavigate();
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('text');
  const [textContent, setTextContent] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast('Invalid file type', {
          description: 'Please upload a PDF file',
          duration: 3000
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const isFormValid = () => {
    if (!selectedGameType || selectedGameType === 'adventure') return false;
    
    if (sourceType === 'text' && !textContent.trim()) return false;
    if (sourceType === 'youtube' && !youtubeLink.trim()) return false;
    if (sourceType === 'pdf' && !uploadedFile) return false;
    
    return true;
  };

  const generateGame = async () => {
    if (!isFormValid()) {
      toast('Please fill all required fields', {
        description: 'Select a game type and provide content source.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Step 1: Process content to get structured data
      const formData = new FormData();
      if (sourceType === 'text') {
        formData.append('content', textContent);
        formData.append('sourceType', 'text');
      } else if (sourceType === 'youtube') {
        formData.append('content', youtubeLink);
        formData.append('sourceType', 'youtube');
      } else if (sourceType === 'pdf' && uploadedFile) {
        formData.append('file', uploadedFile);
        formData.append('sourceType', 'pdf');
      }

      const processResponse = await fetch('http://localhost:3000/api/game/process-content', {
        method: 'POST',
        body: formData,
      });

      if (!processResponse.ok) {
        throw new Error(`Failed to process content: ${processResponse.statusText}`);
      }

      const structuredData = await processResponse.json();
      
      // Step 2: Generate game with the structured data
      const gameResponse = await fetch(`http://localhost:3000/api/game/game-generation/${selectedGameType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structuredData),
      });

      if (!gameResponse.ok) {
        throw new Error(`Failed to generate game: ${gameResponse.statusText}`);
      }

      const gameData = await gameResponse.json();
      setGeneratedContent(gameData);
      
      // Show success message
      toast('Game successfully generated', {
        description: `Your ${selectedGameType} game is now ready!`,
        duration: 5000
      });
      
      // In a real app, you might navigate to a new page to preview the generated game
      // navigate(`/game/${gameData.id}`);
      
    } catch (error) {
      console.error('Error generating game:', error);
      toast('Failed to generate game', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Game Design Studio</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Educational Game</CardTitle>
          <CardDescription>
            Select game type and upload content to generate a custom educational game for your mentees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Game Type Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">Select Game Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameTypes.map((game) => (
                <div
                  key={game.id}
                  className={`
                    flex items-center p-4 rounded-lg border-2 transition-all
                    ${selectedGameType === game.id ? 'border-primary bg-primary/5' : 'border-border'}
                    ${!game.available ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
                  `}
                  onClick={() => game.available && setSelectedGameType(game.id as GameType)}
                >
                  <div className="mr-4">{game.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{game.name}</h3>
                    {!game.available && (
                      <p className="text-sm text-muted-foreground">Coming Soon</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Source */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">Source Information</Label>
            <Tabs 
              defaultValue="text" 
              value={sourceType}
              onValueChange={(value) => setSourceType(value as SourceType)}
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center gap-1">
                  <FileUp className="h-4 w-4" />
                  PDF Upload
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-1">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-3">
                <Textarea
                  placeholder="Enter or paste educational content here..."
                  className="min-h-[200px]"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Provide detailed content to generate a quality game. Include key concepts, facts, and examples.
                </p>
              </TabsContent>
              
              <TabsContent value="pdf" className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-primary" />
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(uploadedFile.size / 1024)} KB
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                      >
                        Remove & Upload Another
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <Label htmlFor="pdf-upload" className="cursor-pointer">
                        <span className="font-medium text-primary hover:underline">
                          Click to upload
                        </span>
                        {" "}
                        or drag and drop
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        PDF (max. 10MB)
                      </p>
                      <Input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="youtube" className="space-y-3">
                <div className="space-y-3">
                  <Label htmlFor="youtube-link">YouTube Video URL</Label>
                  <Input
                    id="youtube-link"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground flex items-start gap-1">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Provide educational videos with clear explanations. The content will be 
                      transcribed and processed.
                    </span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button
            onClick={generateGame}
            disabled={isGenerating || !isFormValid() || selectedGameType === 'adventure'}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Game
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {generatedContent && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generated Game Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary/30 p-4 rounded-md overflow-auto">
              {JSON.stringify(generatedContent, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameDesign;

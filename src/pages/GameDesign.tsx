
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { GameList } from '@/components/GameList';
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
  Link as LinkIcon, 
  Zap,
  FileUp,
  AlertCircle,
  Loader2,
  Users
} from "lucide-react";
import { UserAvatar } from '@/components/UserAvatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type GameType = 'quiz' | 'matching' | 'flashcard' | 'adventure';
type SourceType = 'text' | 'pdf' | 'youtube';

const gameTypes = [
  { id: 'quiz', name: 'Quiz Game', icon: <BookOpen className="h-5 w-5" />, available: true },
  { id: 'matching', name: 'Matching Game', icon: <Puzzle className="h-5 w-5" />, available: true },
  { id: 'flashcard', name: 'Flashcard Game', icon: <Gamepad className="h-5 w-5" />, available: true },
  { id: 'adventure', name: 'Adventure Game', icon: <MapPin className="h-5 w-5" />, available: false },
];

const mentees = [
  { id: '1', name: 'Alex Chen', avatar: '/placeholder.svg' },
  { id: '2', name: 'Sarah Johnson', avatar: '/placeholder.svg' },
  { id: '3', name: 'Miguel Lopez', avatar: '/placeholder.svg' },
  { id: '4', name: 'Emma Wilson', avatar: '/placeholder.svg' },
];

const GameDesign = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('text');
  const [textContent, setTextContent] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  
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

  const toggleMentee = (id: string) => {
    setSelectedMentees(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id) 
        : [...prev, id]
    );
  };

  const isFormValid = () => {
    if (!selectedGameType || selectedGameType === 'adventure') return false;
    
    if (sourceType === 'text' && !textContent.trim()) return false;
    if (sourceType === 'youtube' && !youtubeLink.trim()) return false;
    if (sourceType === 'pdf' && !uploadedFile) return false;
    
    return selectedMentees.length > 0;
  };

  const generateGame = async () => {
    if (!isFormValid()) {
      toast('Please fill all required fields', {
        description: 'Select a game type, provide content source, and assign at least one mentee.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate game generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockGameData = {
        id: Math.random().toString(36).substring(2, 9),
        title: sourceType === 'text' 
          ? textContent.substring(0, 30) + '...' 
          : sourceType === 'youtube' 
          ? 'YouTube Game ' + new Date().toISOString().split('T')[0]
          : uploadedFile?.name || 'New Game',
        type: selectedGameType,
        questions: Math.floor(Math.random() * 10) + 5,
        assignedMentees: selectedMentees.map(id => mentees.find(m => m.id === id)?.name || id)
      };
      
      setGeneratedContent(mockGameData);
      
      // Show success message
      toast('Game successfully generated', {
        description: `Your ${selectedGameType} game has been assigned to ${selectedMentees.length} mentee(s)`,
        duration: 5000
      });
      
      // Reset form and go back to list view
      setTimeout(() => {
        setView('list');
        setSelectedGameType(null);
        setTextContent('');
        setYoutubeLink('');
        setUploadedFile(null);
        setSelectedMentees([]);
        setGeneratedContent(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating game:', error);
      toast('Failed to generate game', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGameSelect = (gameId: string) => {
    // In a real app, you would navigate to a game details page
    toast('Game selected', {
      description: `You selected game ${gameId}`,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-16 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Game Design Studio</h1>
          {view === 'list' ? (
            <Button onClick={() => setView('create')}>Create New Game</Button>
          ) : (
            <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
          )}
        </div>
        
        {view === 'list' ? (
          <GameList onGameSelect={handleGameSelect} games={[]} />
        ) : (
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
                <Label htmlFor="game-type" className="text-lg font-medium">Select Game Type</Label>
                <Select 
                  value={selectedGameType || ""} 
                  onValueChange={(value) => setSelectedGameType(value as GameType || null)}
                >
                  <SelectTrigger id="game-type" className="w-full">
                    <SelectValue placeholder="Select a game type" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameTypes.map((game) => (
                      <SelectItem 
                        key={game.id} 
                        value={game.id}
                        disabled={!game.available}
                      >
                        <div className="flex items-center gap-2">
                          {game.icon}
                          <span>{game.name}</span>
                          {!game.available && <span className="text-xs text-muted-foreground ml-2">(Coming Soon)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              
              {/* Assign to Mentees */}
              <div className="space-y-3">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign to Mentees
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {mentees.map(mentee => (
                    <div
                      key={mentee.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md border transition-all",
                        selectedMentees.includes(mentee.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground cursor-pointer"
                      )}
                      onClick={() => toggleMentee(mentee.id)}
                    >
                      <Checkbox 
                        checked={selectedMentees.includes(mentee.id)}
                        onCheckedChange={() => toggleMentee(mentee.id)}
                        className="pointer-events-none"
                      />
                      <UserAvatar name={mentee.name} image={mentee.avatar} size="sm" />
                      <span>{mentee.name}</span>
                    </div>
                  ))}
                </div>
                {selectedMentees.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Select at least one mentee to assign this game to.
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button
                onClick={generateGame}
                disabled={isGenerating || !isFormValid()}
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
        )}
      </main>
    </div>
  );
};

export default GameDesign;

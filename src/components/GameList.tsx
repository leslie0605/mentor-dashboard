
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { Gamepad2, Clock, Users } from 'lucide-react';

type Game = {
  id: string;
  title: string;
  type: 'quiz' | 'matching' | 'flashcard' | 'adventure';
  createdAt: string;
  mentees: string[];
  questions: number;
};

type GameListProps = {
  games: Game[];
  onGameSelect: (gameId: string) => void;
};

const mockGames: Game[] = [
  {
    id: '1',
    title: 'Research Methods Fundamentals',
    type: 'quiz',
    createdAt: '2023-06-01',
    mentees: ['Alex Chen', 'Sarah Johnson'],
    questions: 10
  },
  {
    id: '2',
    title: 'Marine Biology Key Concepts',
    type: 'matching',
    createdAt: '2023-05-28',
    mentees: ['Miguel Lopez'],
    questions: 8
  },
  {
    id: '3',
    title: 'Statistical Analysis Techniques',
    type: 'flashcard',
    createdAt: '2023-05-15',
    mentees: ['Emma Wilson', 'Sarah Johnson'],
    questions: 15
  }
];

export const GameList: React.FC<GameListProps> = ({ onGameSelect, games = mockGames }) => {
  const getGameTypeLabel = (type: Game['type']) => {
    switch (type) {
      case 'quiz':
        return 'Quiz Game';
      case 'matching':
        return 'Matching Game';
      case 'flashcard':
        return 'Flashcard Game';
      case 'adventure':
        return 'Adventure Game';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Gamepad2 className="h-5 w-5 text-primary" />
        Your Games
      </h2>
      
      {games.length > 0 ? (
        <div className="grid gap-4">
          {games.map(game => (
            <Card 
              key={game.id} 
              className="cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => onGameSelect(game.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{game.title}</CardTitle>
                  <Badge variant="outline">{getGameTypeLabel(game.type)}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Created {game.createdAt}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-1 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mr-1">Assigned to:</span>
                  {game.mentees.map((mentee, index) => (
                    <span key={index} className="text-xs">
                      {mentee}{index < game.mentees.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium">
                  {game.questions} {game.questions === 1 ? 'question' : 'questions'}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          You haven't created any games yet.
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";
import { Gamepad2, Clock, Users, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { getGames } from "@/utils/api";
import { toast } from "sonner";

type Game = {
  id: string | number;
  title: string;
  gameType: "quiz" | "matching" | "flashcard" | "adventure";
  createdAt: string;
  assignedTo: string[];
  data?: any;
};

type GameListProps = {
  onGameSelect: (gameId: string) => void;
  initialGames?: Game[];
};

export const GameList: React.FC<GameListProps> = ({
  onGameSelect,
  initialGames = [],
}) => {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const fetchedGames = await getGames();
      setGames(fetchedGames);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      toast("Failed to load games", {
        description: "Could not retrieve your games from the server.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  const getGameTypeLabel = (type: Game["gameType"]) => {
    switch (type) {
      case "quiz":
        return "Quiz Game";
      case "matching":
        return "Matching Game";
      case "flashcard":
        return "Flashcard Game";
      case "adventure":
        return "Adventure Game";
      default:
        return type;
    }
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate number of questions/items in the game
  const getItemCount = (game: Game) => {
    if (!game.data) return 0;

    if (game.gameType === "quiz" && game.data.questions) {
      return game.data.questions.length;
    } else if (game.gameType === "matching" && game.data.pairs) {
      return game.data.pairs.length;
    } else if (game.gameType === "flashcard" && game.data.cards) {
      return game.data.cards.length;
    }

    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Your Games
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchGames}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
            Loading games...
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-4 pr-4">
            {games.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => onGameSelect(game.id.toString())}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{game.title}</CardTitle>
                    <Badge variant="outline">
                      {getGameTypeLabel(game.gameType)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {formatDate(game.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-1 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mr-1">
                      Assigned to:
                    </span>
                    {game.assignedTo && game.assignedTo.length > 0 ? (
                      game.assignedTo.map((mentee, index) => (
                        <span key={index} className="text-xs">
                          {mentee}
                          {index < game.assignedTo.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic">No one yet</span>
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {getItemCount(game)} items
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
      </ScrollArea>
    </div>
  );
};

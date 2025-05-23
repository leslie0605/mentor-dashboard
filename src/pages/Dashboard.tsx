import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileText, Gamepad2, Search, UsersRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Backend API endpoint
const BACKEND_API = "http://localhost:3000/api";

// Document types and interfaces
interface Document {
  id: string;
  title: string;
  type: string;
  studentName: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

// Mock data for dashboard
const gameModules = [
  {
    id: "1",
    title: "Research Ethics",
    progress: 85,
    completedBy: 3,
    totalAssigned: 4,
    lastUpdate: "3 days ago",
  },
  {
    id: "2",
    title: "Statistical Analysis Fundamentals",
    progress: 62,
    completedBy: 2,
    totalAssigned: 4,
    lastUpdate: "1 week ago",
  },
  {
    id: "3",
    title: "Literature Review Techniques",
    progress: 40,
    completedBy: 1,
    totalAssigned: 3,
    lastUpdate: "2 weeks ago",
  },
];

const activityData = [
  { name: "Mon", documents: 3, modules: 2 },
  { name: "Tue", documents: 5, modules: 1 },
  { name: "Wed", documents: 2, modules: 4 },
  { name: "Thu", documents: 8, modules: 3 },
  { name: "Fri", documents: 4, modules: 2 },
  { name: "Sat", documents: 1, modules: 0 },
  { name: "Sun", documents: 0, modules: 1 },
];

const mentees = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "/placeholder.svg",
    program: "Environmental Science PhD",
    documentsInReview: 2,
    gamesCompleted: 4,
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg",
    program: "Computer Science PhD",
    documentsInReview: 1,
    gamesCompleted: 3,
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Miguel Lopez",
    avatar: "/placeholder.svg",
    program: "Physics PhD",
    documentsInReview: 1,
    gamesCompleted: 2,
    lastActive: "3 days ago",
  },
  {
    id: "4",
    name: "Emma Wilson",
    avatar: "/placeholder.svg",
    program: "Sociology PhD",
    documentsInReview: 0,
    gamesCompleted: 1,
    lastActive: "1 week ago",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch documents from the backend API
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

  // Map status from backend to UI display format
  const mapStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Review";
      case "completed":
        return "Reviewed";
      default:
        return status;
    }
  };

  // Get status badge variant
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-200 bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "border-blue-200 bg-blue-100 text-blue-800";
      case "completed":
        return "border-green-200 bg-green-100 text-green-800";
      default:
        return "border-gray-200 bg-gray-100 text-gray-800";
    }
  };

  // Handle document click
  const handleDocumentClick = (id: string) => {
    navigate(`/document/${id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 mt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome, Dr. Smith</h1>
          <p className="text-muted-foreground">
            You have {documents.filter((d) => d.status === "pending").length}{" "}
            documents pending review and {gameModules.length} active game
            modules
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mentees">Mentees</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documents
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Review</span>
                      <Badge variant="secondary">
                        {documents.filter((d) => d.status === "pending").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <Badge variant="secondary">
                        {
                          documents.filter((d) => d.status === "in_progress")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <Badge variant="secondary">
                        {
                          documents.filter((d) => d.status === "completed")
                            .length
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-accent" />
                    Game Modules
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Modules</span>
                      <Badge variant="secondary">{gameModules.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Completion</span>
                      <Badge variant="secondary">
                        {Math.round(
                          gameModules.reduce(
                            (acc, module) => acc + module.progress,
                            0
                          ) / gameModules.length
                        )}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Assignments</span>
                      <Badge variant="secondary">
                        {gameModules.reduce(
                          (acc, module) => acc + module.totalAssigned,
                          0
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <UsersRound className="h-5 w-5 text-green-500" />
                    Mentees
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Mentees</span>
                      <Badge variant="secondary">{mentees.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Today</span>
                      <Badge variant="secondary">
                        {
                          mentees.filter((m) => m.lastActive.includes("hours"))
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Programs</span>
                      <Badge variant="secondary">
                        {
                          new Set(mentees.map((m) => m.program.split(" ")[0]))
                            .size
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border/50 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-medium">Weekly Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="documents"
                        fill="hsl(var(--primary))"
                        name="Document Reviews"
                      />
                      <Bar
                        dataKey="modules"
                        fill="hsl(var(--accent))"
                        name="Game Modules"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Documents</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/document-review")}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No documents available. Documents will appear here when
                      students submit them.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleDocumentClick(doc.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <UserAvatar name={doc.studentName} size="sm" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(doc.status)}
                          >
                            {mapStatus(doc.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Game Module Status</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = "/game-design")}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gameModules.map((module) => (
                      <div key={module.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {module.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {module.completedBy}/{module.totalAssigned}{" "}
                            completed
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${module.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{module.progress}% average progress</span>
                          <span className="flex items-center">
                            {module.lastUpdate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mentees" className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Mentees</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentees"
                    className="pl-8 w-64 mentor-focus-ring"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentees.map((mentee) => (
                <Card
                  key={mentee.id}
                  className="border border-border/50 shadow-sm hover-scale"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <UserAvatar
                        name={mentee.name}
                        image={mentee.avatar}
                        size="lg"
                        showStatus
                        status={
                          mentee.lastActive.includes("hours")
                            ? "online"
                            : "offline"
                        }
                      />

                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-medium text-lg">{mentee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {mentee.program}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-muted/30 p-2 rounded-md">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                              <FileText className="h-3 w-3" />
                              <span>Documents</span>
                            </div>
                            <p className="font-medium">
                              {mentee.documentsInReview}
                            </p>
                          </div>

                          <div className="bg-muted/30 p-2 rounded-md">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                              <Gamepad2 className="h-3 w-3" />
                              <span>Games Completed</span>
                            </div>
                            <p className="font-medium">
                              {mentee.gamesCompleted}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                          <span>Last active: {mentee.lastActive}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

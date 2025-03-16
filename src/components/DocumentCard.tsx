
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { FileText, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type DocumentStatus = 'pending' | 'in-review' | 'reviewed' | 'revisions';

type DocumentCardProps = {
  id: string;
  title: string;
  type: string;
  status: DocumentStatus;
  lastUpdated: string;
  dueDate?: string;
  student: {
    name: string;
    avatar?: string;
  };
  className?: string;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  title,
  type,
  status,
  lastUpdated,
  dueDate,
  student,
  className
}) => {
  const navigate = useNavigate();
  
  const statusConfig = {
    'pending': {
      label: 'Pending Review',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    'in-review': {
      label: 'In Review',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    'reviewed': {
      label: 'Reviewed',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    'revisions': {
      label: 'Needs Revisions',
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const handleCardClick = () => {
    navigate(`/document-review/${id}`);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover-scale border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{type}</span>
            </div>
            <h3 className="font-medium text-base line-clamp-1">{title}</h3>
          </div>
          <Badge className={cn("font-normal text-xs", statusConfig[status].color)}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center space-x-3">
          <UserAvatar name={student.name} image={student.avatar} size="sm" />
          <span className="text-sm">{student.name}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Updated {lastUpdated}</span>
        </div>
        
        {dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Due {dueDate}</span>
          </div>
        )}
        
        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-primary hover:text-primary">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

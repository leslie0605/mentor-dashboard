
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { DocumentEditor } from '@/components/DocumentEditor';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

// Mock data for document review
const documents = [
  {
    id: '1',
    title: 'Dissertation Chapter 1: Introduction',
    type: 'Dissertation',
    studentName: 'Alex Chen',
    content: `The impact of climate change on marine ecosystems represents one of the most pressing environmental challenges of our time. As global temperatures continue to rise, oceanic systems face unprecedented threats including acidification, sea level rise, and disruption of currents. This dissertation aims to examine the cascading effects of these changes on coral reef ecosystems, with a particular focus on the Great Barrier Reef.

My research did focus on three primary areas: 1) quantifying coral bleaching events in relation to temperature anomalies, 2) analyzing changes in fish population diversity following bleaching events, and 3) evaluating the efficacy of current conservation strategies. Through a combination of field research, satellite data analysis, and computational modeling, I seek to provide a comprehensive assessment of both the current state and future trajectory of these vital ecosystems.

Previous studies have demonstrated correlations between rising sea temperatures and coral mortality, but few have examined the long-term impact on the broader ecosystem functions. My work builds upon these foundations while employing novel methodologies to track cascading effects throughout the food web. By combining historical data with present observations, this research will establish a framework for predicting future outcomes under various climate scenarios.

The significance of this work extends beyond pure ecological interest. Coral reefs support approximately 25% of all marine species while occupying less than 1% of the ocean floor. Furthermore, these ecosystems provide essential services to human communities including coastal protection, food security, and economic opportunities through tourism and fisheries. Understanding the mechanisms of reef degradation and potential recovery is therefore crucial for both conservation efforts and sustainable human development.

Through this dissertation, I hope to contribute meaningful insights that will inform policy decisions and conservation strategies in the face of ongoing climate change.`,
    suggestions: [
      {
        id: 's1',
        originalText: 'My research did focus on three primary areas',
        suggestedText: 'My research focuses on three primary areas',
        reasoning: 'Using present tense for current research is more conventional in academic writing, and removing "did" creates a more direct statement.',
        position: {
          start: 307,
          end: 348
        },
        resolved: false,
        accepted: false
      },
      {
        id: 's2',
        originalText: 'Previous studies have demonstrated correlations between rising sea temperatures and coral mortality, but few have examined the long-term impact',
        suggestedText: 'Previous studies have established clear correlations between rising sea temperatures and coral mortality, but few have thoroughly examined the long-term ecological impact',
        reasoning: 'More precise language strengthens the statement and better positions your research contribution.',
        position: {
          start: 650,
          end: 782
        },
        resolved: false,
        accepted: false
      },
      {
        id: 's3',
        originalText: 'The significance of this work extends beyond pure ecological interest',
        suggestedText: 'The significance of this work extends beyond theoretical ecological interest',
        reasoning: '"Theoretical" is more precise than "pure" in this academic context and better contrasts with the applied implications discussed next.',
        position: {
          start: 1083,
          end: 1146
        },
        resolved: false,
        accepted: false
      }
    ]
  },
  {
    id: '2',
    title: 'Research Proposal: The Effect of Climate Change on Marine Ecosystems',
    type: 'Research Proposal',
    studentName: 'Sarah Johnson',
    content: `This research proposal outlines a comprehensive study on the effects of climate change on coastal marine ecosystems, with particular emphasis on kelp forest dynamics. As key ecosystem engineers, kelp forests provide habitat, food, and shoreline protection, making them vital subjects of study in the context of oceanic warming and acidification.

The proposed research will employ a multi-method approach including field surveys, laboratory experiments, and computational modeling to address three key questions: 1) How are temperature increases affecting kelp reproduction and growth rates? 2) What changes in species composition occur as water temperatures rise? 3) What adaptation strategies might prove effective for kelp forest conservation?

Field work will take place at three sites along the Pacific coast, selected to represent a gradient of existing conditions. At each site, we will establish permanent monitoring plots where we will conduct quarterly assessments of kelp density, canopy height, and associated biodiversity. Water quality parameters including temperature, pH, and nutrient levels will be continuously monitored using deployed sensor arrays.

Laboratory experiments will complement field observations by testing kelp resilience under controlled conditions. Juvenile and adult specimens will be cultured under various temperature and pH scenarios based on climate projections for 2050 and 2100. Growth rates, photosynthetic efficiency, and reproductive output will be measured to assess physiological responses to changing conditions.

The computational component will integrate field and laboratory data into predictive models of ecosystem change. These models will incorporate additional variables including ocean circulation patterns, nutrient availability, and interactions with other species to project potential future states of kelp forest ecosystems under different climate scenarios.

This proposed research addresses a critical gap in our understanding of how foundational marine species respond to climate change, with important implications for biodiversity conservation and ecosystem services management. The results will inform marine protected area planning, restoration efforts, and climate adaptation strategies for coastal communities dependent on healthy marine ecosystems.`,
    suggestions: [
      {
        id: 's1',
        originalText: 'This research proposal outlines a comprehensive study',
        suggestedText: 'This research proposal presents a comprehensive study',
        reasoning: '"Presents" is more direct and professional than "outlines" for a formal research proposal.',
        position: {
          start: 0,
          end: 52
        },
        resolved: false,
        accepted: false
      },
      {
        id: 's2',
        originalText: 'How are temperature increases affecting kelp reproduction and growth rates?',
        suggestedText: 'How do temperature increases affect kelp reproduction and growth rates?',
        reasoning: 'Research questions are typically phrased in present tense rather than present progressive tense in academic writing.',
        position: {
          start: 367,
          end: 436
        },
        resolved: false,
        accepted: false
      }
    ]
  }
];

const DocumentReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setIsLoading(true);
    setTimeout(() => {
      if (id) {
        const foundDoc = documents.find(doc => doc.id === id);
        if (foundDoc) {
          setDocument(foundDoc);
        } else {
          navigate('/dashboard');
        }
      } else {
        // If no ID provided, show first document
        setDocument(documents[0]);
      }
      setIsLoading(false);
    }, 500);
  }, [id, navigate]);
  
  const handleSendFeedback = () => {
    navigate('/dashboard');
  };
  
  if (isLoading) {
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
  
  if (!document) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Document Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-16 mt-4">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2 flex items-center gap-1" 
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="bg-card rounded-lg border shadow-sm p-6 h-[calc(100vh-180px)]">
          <DocumentEditor
            title={document.title}
            content={document.content}
            suggestions={document.suggestions}
            studentName={document.studentName}
            documentType={document.type}
            onSendFeedback={handleSendFeedback}
          />
        </div>
      </main>
    </div>
  );
};

export default DocumentReview;

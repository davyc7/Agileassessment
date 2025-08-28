import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';
import { generateRecommendations, getPriorityRecommendations } from '../lib/recommendations';
import { getAssessments, loadSampleData } from '../lib/storage';
import { SAMPLE_DATA, getScoreBand } from '../lib/data';

const Recommendations = ({ assessment, assessments }) => {
  const [allAssessments, setAllAssessments] = useState(assessments || []);
  const [selectedAssessment, setSelectedAssessment] = useState(assessment);
  const [comparisonAssessment, setComparisonAssessment] = useState(null);

  useEffect(() => {
    // Load assessments from localStorage if not provided
    if (!assessments || assessments.length === 0) {
      const storedAssessments = getAssessments();
      if (storedAssessments.length === 0) {
        // Load sample data if no assessments exist
        loadSampleData(SAMPLE_DATA);
        setAllAssessments(SAMPLE_DATA);
      } else {
        setAllAssessments(storedAssessments);
      }
    } else {
      setAllAssessments(assessments);
    }
  }, [assessments]);

  useEffect(() => {
    if (assessment) {
      setSelectedAssessment(assessment);
    } else if (allAssessments.length > 0) {
      setSelectedAssessment(allAssessments[allAssessments.length - 1]);
    }
  }, [assessment, allAssessments]);

  // Find comparison assessment (baseline or previous)
  useEffect(() => {
    if (selectedAssessment && allAssessments.length > 1) {
      // Try to find baseline first, then most recent previous
      const baseline = allAssessments.find(a => 
        a.meta.assesseeName === selectedAssessment.meta.assesseeName && 
        a.meta.assessmentType === 'Baseline' &&
        a.id !== selectedAssessment.id
      );
      
      if (baseline) {
        setComparisonAssessment(baseline);
      } else {
        // Find most recent previous assessment
        const previous = allAssessments
          .filter(a => 
            a.meta.assesseeName === selectedAssessment.meta.assesseeName &&
            a.id !== selectedAssessment.id &&
            new Date(a.timestamp) < new Date(selectedAssessment.timestamp)
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        setComparisonAssessment(previous || null);
      }
    }
  }, [selectedAssessment, allAssessments]);

  const recommendations = useMemo(() => {
    if (!selectedAssessment) return null;
    return generateRecommendations(selectedAssessment, comparisonAssessment);
  }, [selectedAssessment, comparisonAssessment]);

  const priorityRecommendations = useMemo(() => {
    return getPriorityRecommendations(recommendations);
  }, [recommendations]);

  const loadSampleDataHandler = () => {
    loadSampleData(SAMPLE_DATA);
    setAllAssessments(prev => {
      const existingIds = prev.map(a => a.id);
      const newSamples = SAMPLE_DATA.filter(s => !existingIds.includes(s.id));
      return [...prev, ...newSamples];
    });
  };

  if (!selectedAssessment) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No Assessment Available</CardTitle>
            <CardDescription>
              Please complete an assessment to receive personalized AI recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadSampleDataHandler} variant="outline">
              Load Sample Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generating Recommendations...</CardTitle>
            <CardDescription>
              Please wait while we analyze the assessment data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <span>AI-Powered Recommendations</span>
              </CardTitle>
              <CardDescription>
                Personalized development recommendations based on assessment results
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {recommendations.overall.band}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {recommendations.overall.score.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recommendations.overall.topGaps.length}
              </div>
              <div className="text-sm text-muted-foreground">Priority Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.overall.sequence.weeks0to2.length + recommendations.overall.sequence.weeks2to6.length}
              </div>
              <div className="text-sm text-muted-foreground">Interventions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Assessment Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Assessee:</span>
              <div>{selectedAssessment.meta.assesseeName}</div>
            </div>
            <div>
              <span className="font-medium">Role:</span>
              <div>{selectedAssessment.meta.role}</div>
            </div>
            <div>
              <span className="font-medium">Team:</span>
              <div>{selectedAssessment.meta.squad}, {selectedAssessment.meta.tribe}</div>
            </div>
            <div>
              <span className="font-medium">Assessment:</span>
              <div>{selectedAssessment.meta.assessmentType}</div>
            </div>
          </div>
          
          {comparisonAssessment && (
            <Alert className="mt-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Recommendations include comparison with {comparisonAssessment.meta.assessmentType} assessment 
                from {new Date(comparisonAssessment.meta.date).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>
            AI-generated analysis and strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed mb-4">
            {recommendations.overall.narrative}
          </p>
          
          {recommendations.overall.topGaps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Top Priority Areas:</h4>
              {recommendations.overall.topGaps.map((gap, index) => (
                <div key={gap.competency} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium">{gap.competency}</div>
                      <div className="text-sm text-muted-foreground">{gap.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{gap.score.toFixed(2)}</div>
                    {gap.delta !== null && (
                      <div className={`text-sm flex items-center ${
                        gap.delta < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {gap.delta < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        {gap.delta > 0 ? '+' : ''}{gap.delta.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="action-plan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="competencies">By Competency</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="action-plan">
          <div className="space-y-6">
            {/* Quick Wins (0-2 weeks) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Quick Wins (0-2 weeks)</span>
                </CardTitle>
                <CardDescription>
                  Immediate actions to drive rapid improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.overall.sequence.weeks0to2.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.overall.sequence.weeks0to2.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-medium text-yellow-800">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.intervention}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.competency} • {item.timeframe}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No immediate interventions required. Focus on sustaining current performance.</p>
                )}
              </CardContent>
            </Card>

            {/* Strategic Initiatives (2-6 weeks) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>Strategic Initiatives (2-6 weeks)</span>
                </CardTitle>
                <CardDescription>
                  Medium-term development activities for sustained growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.overall.sequence.weeks2to6.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.overall.sequence.weeks2to6.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-800">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.intervention}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.competency} • {item.timeframe}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No strategic initiatives required at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competencies">
          <div className="space-y-4">
            {Object.entries(recommendations.competencies).map(([competency, rec]) => (
              <Card key={competency} className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competency}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(rec.priority)}
                      <Badge variant="secondary">{rec.band}</Badge>
                      <span className="font-semibold">{rec.score.toFixed(2)}</span>
                    </div>
                  </div>
                  {rec.delta !== null && (
                    <div className={`text-sm flex items-center ${
                      rec.delta < 0 ? 'text-red-600' : rec.delta > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {rec.delta < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                       rec.delta > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                       <Minus className="h-3 w-3 mr-1" />}
                      Change: {rec.delta > 0 ? '+' : ''}{rec.delta.toFixed(2)} from previous assessment
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Recommended Interventions:</h4>
                      <ul className="space-y-1">
                        {rec.interventions.map((intervention, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{intervention}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Success Metrics:</h4>
                      <ul className="space-y-1">
                        {rec.kpis.map((kpi, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <Target className="h-3 w-3 mt-1 text-muted-foreground" />
                            <span>{kpi}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Metrics to track progress and measure success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(recommendations.competencies)
                  .filter(([_, rec]) => rec.priority !== 'low')
                  .map(([competency, rec]) => (
                    <div key={competency} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{competency}</h3>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rec.kpis.map((kpi, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="text-sm font-medium">{kpi}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Review frequency: {rec.timeframe === 'immediate' ? 'Weekly' : 'Bi-weekly'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Load Sample Data */}
      {allAssessments.length < 2 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Want to see comparison-based recommendations? Load sample data to explore advanced features.
              </p>
              <Button onClick={loadSampleDataHandler} variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recommendations;


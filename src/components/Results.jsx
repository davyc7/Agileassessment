import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3, TrendingUp, Users } from 'lucide-react';
import { 
  QUESTIONS, 
  COMPETENCY_MAPPING, 
  getScoreBand, 
  calculateCompetencyScores, 
  calculateOverallScore,
  SAMPLE_DATA 
} from '../lib/data';
import { getAssessments, loadSampleData } from '../lib/storage';
import { generateCSV, generateComparisonCSV, downloadCSV, printToPDF } from '../lib/export';
import HeatmapChart from './charts/HeatmapChart';
import RadarChart from './charts/RadarChart';
import ScoreSummary from './ScoreSummary';
import ComparisonTable from './ComparisonTable';

const Results = ({ assessments, currentAssessment, onAssessmentSelect }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(currentAssessment);
  const [comparisonAssessment, setComparisonAssessment] = useState(null);
  const [allAssessments, setAllAssessments] = useState(assessments || []);

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
    if (currentAssessment) {
      setSelectedAssessment(currentAssessment);
    } else if (allAssessments.length > 0) {
      setSelectedAssessment(allAssessments[allAssessments.length - 1]);
    }
  }, [currentAssessment, allAssessments]);

  const handleAssessmentChange = (assessmentId) => {
    const assessment = allAssessments.find(a => a.id === assessmentId);
    if (assessment) {
      setSelectedAssessment(assessment);
      onAssessmentSelect?.(assessment);
    }
  };

  const handleComparisonChange = (assessmentId) => {
    if (assessmentId === 'none') {
      setComparisonAssessment(null);
    } else {
      const assessment = allAssessments.find(a => a.id === assessmentId);
      setComparisonAssessment(assessment);
    }
  };

  const exportToCSV = () => {
    if (!selectedAssessment) return;

    let csvContent;
    let filename;

    if (comparisonAssessment) {
      // Export comparison CSV
      csvContent = generateComparisonCSV(selectedAssessment, comparisonAssessment);
      filename = `assessment-comparison-${selectedAssessment.meta.assesseeName}-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // Export single assessment CSV
      csvContent = generateCSV(selectedAssessment, true);
      filename = `assessment-${selectedAssessment.meta.assesseeName}-${selectedAssessment.meta.assessmentType}-${new Date().toISOString().split('T')[0]}.csv`;
    }

    downloadCSV(csvContent, filename);
  };

  const printResults = () => {
    if (!selectedAssessment) return;
    printToPDF(selectedAssessment, comparisonAssessment);
  };

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
            <CardTitle>No Assessment Selected</CardTitle>
            <CardDescription>
              Please complete an assessment or select an existing one to view results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={loadSampleDataHandler} variant="outline">
                Load Sample Data
              </Button>
              {allAssessments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Assessment:</label>
                  <Select onValueChange={handleAssessmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAssessments.map(assessment => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.meta.assesseeName} - {assessment.meta.assessmentType} 
                          ({new Date(assessment.timestamp).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Assessment Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" />
                <span>Assessment Results</span>
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of competency scores and performance insights
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={printResults} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Assessment:</label>
              <Select value={selectedAssessment.id} onValueChange={handleAssessmentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allAssessments.map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.meta.assesseeName} - {assessment.meta.assessmentType} 
                      ({new Date(assessment.timestamp).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Compare with:</label>
              <Select value={comparisonAssessment?.id || 'none'} onValueChange={handleComparisonChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select for comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No comparison</SelectItem>
                  {allAssessments
                    .filter(a => a.id !== selectedAssessment.id)
                    .map(assessment => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.meta.assesseeName} - {assessment.meta.assessmentType} 
                        ({new Date(assessment.timestamp).toLocaleDateString()})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Assessment Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {selectedAssessment.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <Badge variant="secondary" className="mt-1">
                {getScoreBand(selectedAssessment.overallScore).label}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedAssessment.meta.assesseeName}</div>
              <div className="text-sm text-muted-foreground">Assessee</div>
              <Badge variant="outline" className="mt-1">
                {selectedAssessment.meta.role}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{selectedAssessment.meta.squad}</div>
              <div className="text-sm text-muted-foreground">Squad</div>
              <div className="text-xs text-muted-foreground mt-1">
                {selectedAssessment.meta.tribe}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{selectedAssessment.meta.assessmentType}</div>
              <div className="text-sm text-muted-foreground">Assessment Type</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(selectedAssessment.meta.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <ScoreSummary assessment={selectedAssessment} />
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Competency Heatmap</CardTitle>
              <CardDescription>
                Visual representation of scores across competencies and questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapChart assessment={selectedAssessment} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle>Competency Radar Chart</CardTitle>
              <CardDescription>
                Spider chart showing competency strengths and development areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadarChart 
                assessment={selectedAssessment} 
                comparisonAssessment={comparisonAssessment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          {comparisonAssessment ? (
            <ComparisonTable 
              assessment1={selectedAssessment}
              assessment2={comparisonAssessment}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Comparison</CardTitle>
                <CardDescription>
                  Select a comparison assessment to view side-by-side analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use the "Compare with" dropdown above to select another assessment for comparison.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Load Sample Data Button */}
      {allAssessments.length < 2 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Want to see comparison features? Load sample data to explore the full functionality.
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

export default Results;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { QUESTIONS, COMPETENCY_MAPPING, getScoreBand } from '../lib/data';

const ComparisonTable = ({ assessment1, assessment2 }) => {
  if (!assessment1 || !assessment2) return null;

  const getDeltaIcon = (delta) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getDeltaColor = (delta) => {
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDelta = (delta) => {
    if (delta > 0) return `+${delta.toFixed(2)}`;
    return delta.toFixed(2);
  };

  const getProgressValue = (score) => (score / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Assessment Overview Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Comparison Overview</CardTitle>
          <CardDescription>
            Side-by-side comparison of key assessment metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assessment 1 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-600">
                {assessment1.meta.assesseeName}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assessment Type:</span>
                  <Badge variant="outline">{assessment1.meta.assessmentType}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span>{new Date(assessment1.meta.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall Score:</span>
                  <span className="font-semibold text-blue-600">
                    {assessment1.overallScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance Band:</span>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: getScoreBand(assessment1.overallScore).bgColor,
                      color: getScoreBand(assessment1.overallScore).color 
                    }}
                  >
                    {getScoreBand(assessment1.overallScore).label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Delta */}
            <div className="space-y-4 text-center">
              <h3 className="font-semibold text-gray-600">Change (Δ)</h3>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className="flex items-center justify-center space-x-2">
                  {getDeltaIcon(assessment1.overallScore - assessment2.overallScore)}
                  <span className={`font-semibold ${getDeltaColor(assessment1.overallScore - assessment2.overallScore)}`}>
                    {formatDelta(assessment1.overallScore - assessment2.overallScore)}
                  </span>
                </div>
                <Progress 
                  value={Math.abs((assessment1.overallScore - assessment2.overallScore) / 5) * 100}
                  className="h-2"
                />
              </div>
            </div>

            {/* Assessment 2 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600">
                {assessment2.meta.assesseeName}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assessment Type:</span>
                  <Badge variant="outline">{assessment2.meta.assessmentType}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span>{new Date(assessment2.meta.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall Score:</span>
                  <span className="font-semibold text-red-600">
                    {assessment2.overallScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance Band:</span>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: getScoreBand(assessment2.overallScore).bgColor,
                      color: getScoreBand(assessment2.overallScore).color 
                    }}
                  >
                    {getScoreBand(assessment2.overallScore).label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Comparison</CardTitle>
          <CardDescription>
            Detailed comparison across all SFIA-aligned competency areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Competency</th>
                  <th className="text-center py-3 text-blue-600">
                    {assessment1.meta.assesseeName}
                  </th>
                  <th className="text-center py-3">Change</th>
                  <th className="text-center py-3 text-red-600">
                    {assessment2.meta.assesseeName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(COMPETENCY_MAPPING).map(competency => {
                  const score1 = assessment1.competencyScores[competency];
                  const score2 = assessment2.competencyScores[competency];
                  const delta = score1 - score2;
                  
                  return (
                    <tr key={competency} className="border-b">
                      <td className="py-3 font-medium">{competency}</td>
                      <td className="text-center py-3">
                        <div className="space-y-1">
                          <span className="font-semibold text-blue-600">
                            {score1.toFixed(2)}
                          </span>
                          <Progress 
                            value={getProgressValue(score1)} 
                            className="h-1 w-16 mx-auto"
                          />
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center space-x-1">
                          {getDeltaIcon(delta)}
                          <span className={`font-semibold ${getDeltaColor(delta)}`}>
                            {formatDelta(delta)}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <div className="space-y-1">
                          <span className="font-semibold text-red-600">
                            {score2.toFixed(2)}
                          </span>
                          <Progress 
                            value={getProgressValue(score2)} 
                            className="h-1 w-16 mx-auto"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Question Comparison</CardTitle>
          <CardDescription>
            Detailed comparison of responses to each assessment question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {QUESTIONS.map((question, index) => {
              const score1 = assessment1.responses[question.id];
              const score2 = assessment2.responses[question.id];
              const delta = score1 - score2;
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Q{index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {question.competency}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{question.text}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{score1}</div>
                      <div className="text-xs text-muted-foreground">
                        {assessment1.meta.assesseeName}
                      </div>
                      <Progress value={getProgressValue(score1)} className="h-1 mt-1" />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        {getDeltaIcon(delta)}
                        <span className={`font-semibold ${getDeltaColor(delta)}`}>
                          {formatDelta(delta)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-lg font-bold text-red-600">{score2}</div>
                      <div className="text-xs text-muted-foreground">
                        {assessment2.meta.assesseeName}
                      </div>
                      <Progress value={getProgressValue(score2)} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
          <CardDescription>
            Key insights from the assessment comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(COMPETENCY_MAPPING).reduce((count, questions) => {
                  const competency = Object.keys(COMPETENCY_MAPPING).find(k => COMPETENCY_MAPPING[k] === questions);
                  const delta = assessment1.competencyScores[competency] - assessment2.competencyScores[competency];
                  return count + (delta > 0 ? 1 : 0);
                }, 0)}
              </div>
              <div className="text-sm text-green-700">Competencies Improved</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(COMPETENCY_MAPPING).reduce((count, questions) => {
                  const competency = Object.keys(COMPETENCY_MAPPING).find(k => COMPETENCY_MAPPING[k] === questions);
                  const delta = assessment1.competencyScores[competency] - assessment2.competencyScores[competency];
                  return count + (delta < 0 ? 1 : 0);
                }, 0)}
              </div>
              <div className="text-sm text-red-700">Competencies Declined</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(COMPETENCY_MAPPING).reduce((count, questions) => {
                  const competency = Object.keys(COMPETENCY_MAPPING).find(k => COMPETENCY_MAPPING[k] === questions);
                  const delta = assessment1.competencyScores[competency] - assessment2.competencyScores[competency];
                  return count + (delta === 0 ? 1 : 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-700">Competencies Unchanged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonTable;


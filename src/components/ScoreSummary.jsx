import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QUESTIONS, COMPETENCY_MAPPING, getScoreBand } from '../lib/data';

const ScoreSummary = ({ assessment }) => {
  if (!assessment) return null;

  const getQuestionsByCompetency = (competency) => {
    return COMPETENCY_MAPPING[competency].map(questionId => 
      QUESTIONS.find(q => q.id === questionId)
    );
  };

  const getScoreColor = (score) => {
    const band = getScoreBand(score);
    return band.color;
  };

  const getScoreProgress = (score) => {
    return (score / 5) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>
            Summary of assessment results across all competencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Score</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold" style={{ color: getScoreColor(assessment.overallScore) }}>
                  {assessment.overallScore.toFixed(2)}
                </span>
                <span className="text-muted-foreground">/ 5.0</span>
                <Badge 
                  variant="secondary" 
                  style={{ 
                    backgroundColor: getScoreBand(assessment.overallScore).bgColor,
                    color: getScoreBand(assessment.overallScore).color 
                  }}
                >
                  {getScoreBand(assessment.overallScore).label}
                </Badge>
              </div>
            </div>
            <Progress 
              value={getScoreProgress(assessment.overallScore)} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Competency Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Breakdown</CardTitle>
          <CardDescription>
            Detailed scores for each SFIA-aligned competency area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(COMPETENCY_MAPPING).map(([competency, questionIds]) => {
              const score = assessment.competencyScores[competency];
              const questions = getQuestionsByCompetency(competency);
              
              return (
                <div key={competency} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">{competency}</h3>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xl font-bold" 
                        style={{ color: getScoreColor(score) }}
                      >
                        {score.toFixed(2)}
                      </span>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: getScoreBand(score).bgColor,
                          color: getScoreBand(score).color 
                        }}
                      >
                        {getScoreBand(score).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={getScoreProgress(score)} 
                    className="h-2"
                  />
                  
                  <div className="space-y-2">
                    {questions.map(question => {
                      const questionScore = assessment.responses[question.id];
                      return (
                        <div key={question.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex-1">
                            {question.id}: {question.text.substring(0, 80)}...
                          </span>
                          <div className="flex items-center space-x-2 ml-4">
                            <span 
                              className="font-medium"
                              style={{ color: getScoreColor(questionScore) }}
                            >
                              {questionScore}
                            </span>
                            <div className="w-16">
                              <Progress 
                                value={getScoreProgress(questionScore)} 
                                className="h-1"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Question Scores</CardTitle>
          <CardDescription>
            Detailed breakdown of responses to each assessment question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {QUESTIONS.map((question, index) => {
              const score = assessment.responses[question.id];
              const band = getScoreBand(score);
              
              return (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
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
                    <div className="ml-4 text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: band.color }}
                      >
                        {score}
                      </div>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: band.bgColor,
                          color: band.color 
                        }}
                      >
                        {band.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Progress 
                      value={getScoreProgress(score)} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {score}/5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreSummary;


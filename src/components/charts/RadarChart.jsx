import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { COMPETENCY_MAPPING } from '../../lib/data';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RadarChart = ({ assessment, comparisonAssessment }) => {
  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No assessment data available
      </div>
    );
  }

  const competencies = Object.keys(COMPETENCY_MAPPING);
  const competencyScores = competencies.map(comp => assessment.competencyScores[comp] || 0);
  
  const datasets = [
    {
      label: `${assessment.meta.assesseeName} (${assessment.meta.assessmentType})`,
      data: competencyScores,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      pointRadius: 6,
      pointHoverRadius: 8,
    }
  ];

  // Add comparison dataset if available
  if (comparisonAssessment) {
    const comparisonScores = competencies.map(comp => comparisonAssessment.competencyScores[comp] || 0);
    datasets.push({
      label: `${comparisonAssessment.meta.assesseeName} (${comparisonAssessment.meta.assessmentType})`,
      data: comparisonScores,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
      pointRadius: 6,
      pointHoverRadius: 8,
    });
  }

  const data = {
    labels: competencies.map(comp => {
      // Shorten labels for better display
      const parts = comp.split('(');
      return parts[0].trim();
    }),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return competencies[context[0].dataIndex];
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(2)}/5.0`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value.toFixed(0);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
          },
          callback: function(label, index) {
            // Wrap long labels
            const maxLength = 15;
            if (label.length > maxLength) {
              const words = label.split(' ');
              const lines = [];
              let currentLine = '';
              
              words.forEach(word => {
                if ((currentLine + word).length > maxLength) {
                  if (currentLine) lines.push(currentLine.trim());
                  currentLine = word + ' ';
                } else {
                  currentLine += word + ' ';
                }
              });
              
              if (currentLine) lines.push(currentLine.trim());
              return lines;
            }
            return label;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative h-96">
        <Radar data={data} options={options} />
      </div>
      
      {/* Score Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Competency</th>
              <th className="text-center py-2">Current Score</th>
              {comparisonAssessment && (
                <>
                  <th className="text-center py-2">Comparison Score</th>
                  <th className="text-center py-2">Δ (Delta)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {competencies.map((competency, index) => {
              const currentScore = assessment.competencyScores[competency];
              const comparisonScore = comparisonAssessment?.competencyScores[competency];
              const delta = comparisonScore ? currentScore - comparisonScore : null;
              
              return (
                <tr key={competency} className="border-b">
                  <td className="py-2 font-medium">{competency}</td>
                  <td className="text-center py-2">
                    <span className="font-semibold text-blue-600">
                      {currentScore.toFixed(2)}
                    </span>
                  </td>
                  {comparisonAssessment && (
                    <>
                      <td className="text-center py-2">
                        <span className="font-semibold text-red-600">
                          {comparisonScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center py-2">
                        <span 
                          className={`font-semibold ${
                            delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Overall Comparison */}
      {comparisonAssessment && (
        <div className="bg-secondary rounded-lg p-4">
          <h3 className="font-medium mb-2">Overall Comparison</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {assessment.overallScore.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Current</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {comparisonAssessment.overallScore.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Comparison</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${
                assessment.overallScore > comparisonAssessment.overallScore 
                  ? 'text-green-600' 
                  : assessment.overallScore < comparisonAssessment.overallScore
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}>
                {assessment.overallScore > comparisonAssessment.overallScore ? '+' : ''}
                {(assessment.overallScore - comparisonAssessment.overallScore).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Delta</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarChart;


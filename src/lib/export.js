// Export utilities for Team Assessment Survey

import { QUESTIONS, COMPETENCY_MAPPING, getScoreBand } from './data';

// Generate CSV data from assessment
export const generateCSV = (assessment, includeMetadata = true) => {
  if (!assessment) return '';

  const rows = [];
  
  // Header row
  const headers = [
    'Question ID',
    'Question Text',
    'Competency',
    'Response Score',
    'Score Band'
  ];
  
  if (includeMetadata) {
    headers.unshift(
      'Assessee Name',
      'Role',
      'Squad',
      'Tribe',
      'Assessment Type',
      'Date'
    );
  }
  
  rows.push(headers);
  
  // Data rows
  QUESTIONS.forEach(question => {
    const score = assessment.responses[question.id];
    const scoreBand = getScoreBand(score);
    
    const row = [
      question.id,
      `"${question.text.replace(/"/g, '""')}"`, // Escape quotes
      question.competency,
      score,
      scoreBand.label
    ];
    
    if (includeMetadata) {
      row.unshift(
        assessment.meta.assesseeName,
        assessment.meta.role,
        assessment.meta.squad,
        assessment.meta.tribe,
        assessment.meta.assessmentType,
        assessment.meta.date
      );
    }
    
    rows.push(row);
  });
  
  // Add competency summary
  rows.push([]); // Empty row
  rows.push(['COMPETENCY SUMMARY']);
  rows.push(['Competency', 'Average Score', 'Score Band']);
  
  Object.entries(assessment.competencyScores).forEach(([competency, score]) => {
    const scoreBand = getScoreBand(score);
    rows.push([competency, score.toFixed(2), scoreBand.label]);
  });
  
  // Add overall summary
  rows.push([]);
  rows.push(['OVERALL SUMMARY']);
  rows.push(['Overall Score', assessment.overallScore.toFixed(2), getScoreBand(assessment.overallScore).label]);
  
  return rows.map(row => row.join(',')).join('\n');
};

// Generate comparison CSV
export const generateComparisonCSV = (assessment1, assessment2) => {
  if (!assessment1 || !assessment2) return '';

  const rows = [];
  
  // Header
  rows.push([
    'Question ID',
    'Question Text',
    'Competency',
    `${assessment1.meta.assesseeName} (${assessment1.meta.assessmentType})`,
    `${assessment2.meta.assesseeName} (${assessment2.meta.assessmentType})`,
    'Delta',
    'Change Direction'
  ]);
  
  // Question-by-question comparison
  QUESTIONS.forEach(question => {
    const score1 = assessment1.responses[question.id];
    const score2 = assessment2.responses[question.id];
    const delta = score1 - score2;
    const direction = delta > 0 ? 'Improved' : delta < 0 ? 'Declined' : 'No Change';
    
    rows.push([
      question.id,
      `"${question.text.replace(/"/g, '""')}"`,
      question.competency,
      score1,
      score2,
      delta.toFixed(2),
      direction
    ]);
  });
  
  // Competency comparison
  rows.push([]);
  rows.push(['COMPETENCY COMPARISON']);
  rows.push([
    'Competency',
    `${assessment1.meta.assesseeName} Score`,
    `${assessment2.meta.assesseeName} Score`,
    'Delta',
    'Change Direction'
  ]);
  
  Object.keys(COMPETENCY_MAPPING).forEach(competency => {
    const score1 = assessment1.competencyScores[competency];
    const score2 = assessment2.competencyScores[competency];
    const delta = score1 - score2;
    const direction = delta > 0.2 ? 'Significant Improvement' : 
                     delta > 0 ? 'Improved' : 
                     delta < -0.2 ? 'Significant Decline' :
                     delta < 0 ? 'Declined' : 'No Change';
    
    rows.push([
      competency,
      score1.toFixed(2),
      score2.toFixed(2),
      delta.toFixed(2),
      direction
    ]);
  });
  
  // Overall comparison
  rows.push([]);
  rows.push(['OVERALL COMPARISON']);
  const overallDelta = assessment1.overallScore - assessment2.overallScore;
  const overallDirection = overallDelta > 0.2 ? 'Significant Improvement' : 
                          overallDelta > 0 ? 'Improved' : 
                          overallDelta < -0.2 ? 'Significant Decline' :
                          overallDelta < 0 ? 'Declined' : 'No Change';
  
  rows.push([
    'Overall Score',
    assessment1.overallScore.toFixed(2),
    assessment2.overallScore.toFixed(2),
    overallDelta.toFixed(2),
    overallDirection
  ]);
  
  return rows.map(row => row.join(',')).join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate print-friendly HTML for PDF export
export const generatePrintHTML = (assessment, comparisonAssessment = null) => {
  if (!assessment) return '';

  const competencyRows = Object.entries(assessment.competencyScores)
    .map(([competency, score]) => {
      const band = getScoreBand(score);
      const comparisonScore = comparisonAssessment?.competencyScores[competency];
      const delta = comparisonScore ? score - comparisonScore : null;
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${competency}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${band.color};">
            ${score.toFixed(2)}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <span style="background-color: ${band.bgColor}; color: ${band.color}; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${band.label}
            </span>
          </td>
          ${comparisonScore ? `
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
              ${comparisonScore.toFixed(2)}
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#6b7280'};">
              ${delta > 0 ? '+' : ''}${delta.toFixed(2)}
            </td>
          ` : ''}
        </tr>
      `;
    }).join('');

  const questionRows = QUESTIONS.map((question, index) => {
    const score = assessment.responses[question.id];
    const band = getScoreBand(score);
    const comparisonScore = comparisonAssessment?.responses[question.id];
    const delta = comparisonScore ? score - comparisonScore : null;
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Q${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${question.text}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${question.competency}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
          ${score}
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
          <span style="background-color: ${band.bgColor}; color: ${band.color}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
            ${band.label}
          </span>
        </td>
        ${comparisonScore ? `
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            ${comparisonScore}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#6b7280'};">
            ${delta > 0 ? '+' : ''}${delta}
          </td>
        ` : ''}
      </tr>
    `;
  }).join('');

  const overallBand = getScoreBand(assessment.overallScore);
  const overallDelta = comparisonAssessment ? assessment.overallScore - comparisonAssessment.overallScore : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Team Assessment Report - ${assessment.meta.assesseeName}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
          line-height: 1.4;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .summary { 
          background-color: #f9fafb; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }
        .summary-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .summary-label {
          font-size: 14px;
          color: #6b7280;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px;
          font-size: 12px;
        }
        th { 
          background-color: #f3f4f6; 
          padding: 12px 8px; 
          border: 1px solid #ddd; 
          font-weight: bold;
          text-align: left;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 15px 0;
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Team Assessment Report</h1>
        <h2>${assessment.meta.assesseeName} - ${assessment.meta.assessmentType}</h2>
        <p>Generated on ${new Date().toLocaleDateString()} | Assessment Date: ${assessment.meta.date}</p>
      </div>

      <div class="summary">
        <h3>Assessment Overview</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value" style="color: ${overallBand.color};">
              ${assessment.overallScore.toFixed(2)}
            </div>
            <div class="summary-label">Overall Score</div>
          </div>
          <div class="summary-item">
            <div class="summary-value" style="color: ${overallBand.color};">
              ${overallBand.label}
            </div>
            <div class="summary-label">Performance Band</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${assessment.meta.role}</div>
            <div class="summary-label">Role</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${assessment.meta.squad}</div>
            <div class="summary-label">Squad</div>
          </div>
          ${overallDelta !== null ? `
          <div class="summary-item">
            <div class="summary-value" style="color: ${overallDelta > 0 ? '#16a34a' : overallDelta < 0 ? '#dc2626' : '#6b7280'};">
              ${overallDelta > 0 ? '+' : ''}${overallDelta.toFixed(2)}
            </div>
            <div class="summary-label">Change from Previous</div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section-title">Competency Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Competency</th>
            <th style="text-align: center;">Score</th>
            <th style="text-align: center;">Band</th>
            ${comparisonAssessment ? `
              <th style="text-align: center;">Previous Score</th>
              <th style="text-align: center;">Change</th>
            ` : ''}
          </tr>
        </thead>
        <tbody>
          ${competencyRows}
        </tbody>
      </table>

      <div class="section-title">Individual Question Responses</div>
      <table>
        <thead>
          <tr>
            <th>Q#</th>
            <th>Question</th>
            <th>Competency</th>
            <th style="text-align: center;">Score</th>
            <th style="text-align: center;">Band</th>
            ${comparisonAssessment ? `
              <th style="text-align: center;">Previous</th>
              <th style="text-align: center;">Change</th>
            ` : ''}
          </tr>
        </thead>
        <tbody>
          ${questionRows}
        </tbody>
      </table>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p><strong>SFIA-Aligned Competency Framework:</strong> This assessment uses the Skills Framework for the Information Age (SFIA) competency model adapted for agile product development roles.</p>
        <p><strong>Scoring:</strong> 1 = Needs Development, 2 = Developing, 3 = Competent, 4 = Strong, 5 = Expert</p>
        ${comparisonAssessment ? `<p><strong>Comparison:</strong> Changes are calculated against ${comparisonAssessment.meta.assessmentType} assessment from ${comparisonAssessment.meta.date}</p>` : ''}
      </div>
    </body>
    </html>
  `;
};

// Print PDF functionality
export const printToPDF = (assessment, comparisonAssessment = null) => {
  const printWindow = window.open('', '_blank');
  const htmlContent = generatePrintHTML(assessment, comparisonAssessment);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};


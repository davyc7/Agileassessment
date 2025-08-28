import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { QUESTIONS, COMPETENCY_MAPPING, getScoreBand } from '../../lib/data';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend);

const HeatmapChart = ({ assessment }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!assessment || !canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // Prepare data for heatmap
    const competencies = Object.keys(COMPETENCY_MAPPING);
    const maxQuestions = Math.max(...Object.values(COMPETENCY_MAPPING).map(q => q.length));
    
    // Create a grid data structure
    const heatmapData = [];
    const labels = [];
    
    competencies.forEach((competency, compIndex) => {
      const questions = COMPETENCY_MAPPING[competency];
      questions.forEach((questionId, qIndex) => {
        const score = assessment.responses[questionId];
        const question = QUESTIONS.find(q => q.id === questionId);
        const band = getScoreBand(score);
        
        heatmapData.push({
          x: qIndex,
          y: compIndex,
          v: score,
          competency,
          questionId,
          questionText: question?.text || '',
          color: band.color,
          label: band.label
        });
      });
    });

    // Custom heatmap implementation using canvas
    const drawHeatmap = () => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const padding = 80;
      const cellWidth = (rect.width - padding * 2) / maxQuestions;
      const cellHeight = (rect.height - padding * 2) / competencies.length;
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw cells
      heatmapData.forEach(item => {
        const x = padding + item.x * cellWidth;
        const y = padding + item.y * cellHeight;
        
        // Draw cell background
        ctx.fillStyle = getScoreBand(item.v).bgColor;
        ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
        
        // Draw cell border
        ctx.strokeStyle = getScoreBand(item.v).color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth - 2, cellHeight - 2);
        
        // Draw score text
        ctx.fillStyle = getScoreBand(item.v).color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          item.v.toString(), 
          x + cellWidth / 2, 
          y + cellHeight / 2
        );
        
        // Draw question ID
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText(
          item.questionId, 
          x + cellWidth / 2, 
          y + cellHeight / 2 + 20
        );
      });
      
      // Draw competency labels
      ctx.fillStyle = '#333';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      competencies.forEach((competency, index) => {
        const y = padding + index * cellHeight + cellHeight / 2;
        const shortName = competency.split('(')[0].trim();
        ctx.fillText(shortName, padding - 10, y);
      });
      
      // Draw question column headers
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      for (let i = 0; i < maxQuestions; i++) {
        const x = padding + i * cellWidth + cellWidth / 2;
        ctx.fillText(`Q${i + 1}`, x, padding - 10);
      }
      
      // Draw title
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Competency Heatmap', rect.width / 2, 10);
    };

    // Initial draw
    drawHeatmap();
    
    // Redraw on resize
    const handleResize = () => {
      setTimeout(drawHeatmap, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [assessment]);

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No assessment data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-96 border rounded-lg"
          style={{ maxHeight: '400px' }}
        />
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-medium">Score Bands:</span>
          {Object.values({
            LOW: { min: 1.0, max: 1.9, color: "#ef4444", label: "Low", bgColor: "#fef2f2" },
            DEVELOPING: { min: 2.0, max: 2.9, color: "#f59e0b", label: "Developing", bgColor: "#fffbeb" },
            COMPETENT: { min: 3.0, max: 3.9, color: "#eab308", label: "Competent", bgColor: "#fefce8" },
            STRONG: { min: 4.0, max: 4.4, color: "#22c55e", label: "Strong", bgColor: "#f0fdf4" },
            EXPERT: { min: 4.5, max: 5.0, color: "#fbbf24", label: "Expert", bgColor: "#fffbeb" }
          }).map(band => (
            <div key={band.label} className="flex items-center space-x-1">
              <div 
                className="w-4 h-4 rounded border"
                style={{ 
                  backgroundColor: band.bgColor,
                  borderColor: band.color 
                }}
              />
              <span>{band.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Competency Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
        {Object.keys(COMPETENCY_MAPPING).map((competency, index) => (
          <div key={competency} className="flex items-center space-x-2">
            <span className="font-medium">Row {index + 1}:</span>
            <span>{competency}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapChart;


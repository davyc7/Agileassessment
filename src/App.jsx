import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Assessment from './components/Assessment';
import Results from './components/Results';
import Recommendations from './components/Recommendations';
import { getAssessments, loadSampleData } from './lib/storage';
import { SAMPLE_DATA } from './lib/data';
import './App.css';

function App() {
  const [assessments, setAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  useEffect(() => {
    // Load existing assessments from localStorage
    const existingAssessments = getAssessments();
    setAssessments(existingAssessments);
    
    // Load sample data if no assessments exist
    if (existingAssessments.length === 0) {
      loadSampleData(SAMPLE_DATA);
      setAssessments(SAMPLE_DATA);
    }
  }, []);

  const handleAssessmentComplete = (assessment) => {
    setCurrentAssessment(assessment);
    setAssessments(prev => [...prev, assessment]);
  };

  const handleAssessmentSelect = (assessment) => {
    setCurrentAssessment(assessment);
  };

  return (
    <Router>
      <div className="min-h-screen" style={{backgroundColor: 'var(--surface)'}}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="boi-card-elevated boi-animate-fade-in p-6">
            <Routes>
              <Route 
                path="/" 
                element={<Navigate to="/assessment" replace />} 
              />
              <Route 
                path="/assessment" 
                element={
                  <Assessment 
                    onComplete={handleAssessmentComplete}
                  />
                } 
              />
              <Route 
                path="/results" 
                element={
                  <Results 
                    assessments={assessments}
                    currentAssessment={currentAssessment}
                    onAssessmentSelect={handleAssessmentSelect}
                  />
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <Recommendations 
                    assessment={currentAssessment}
                    assessments={assessments}
                  />
                } 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;


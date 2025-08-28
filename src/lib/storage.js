// localStorage utilities for the Team Assessment Survey

const STORAGE_KEY = 'team-assessments';
const DRAFT_KEY = 'assessment-draft';

// Get all assessments from localStorage
export const getAssessments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading assessments from localStorage:', error);
    return [];
  }
};

// Save assessment to localStorage
export const saveAssessment = (assessment) => {
  try {
    const assessments = getAssessments();
    assessments.push(assessment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
    return true;
  } catch (error) {
    console.error('Error saving assessment to localStorage:', error);
    return false;
  }
};

// Update existing assessment
export const updateAssessment = (assessmentId, updatedAssessment) => {
  try {
    const assessments = getAssessments();
    const index = assessments.findIndex(a => a.id === assessmentId);
    if (index !== -1) {
      assessments[index] = updatedAssessment;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating assessment in localStorage:', error);
    return false;
  }
};

// Delete assessment from localStorage
export const deleteAssessment = (assessmentId) => {
  try {
    const assessments = getAssessments();
    const filtered = assessments.filter(a => a.id !== assessmentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting assessment from localStorage:', error);
    return false;
  }
};

// Save draft assessment (partial completion)
export const saveDraft = (draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Error saving draft to localStorage:', error);
    return false;
  }
};

// Get draft assessment
export const getDraft = () => {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading draft from localStorage:', error);
    return null;
  }
};

// Clear draft assessment
export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing draft from localStorage:', error);
    return false;
  }
};

// Load sample data into localStorage
export const loadSampleData = (sampleData) => {
  try {
    const existingAssessments = getAssessments();
    // Only add sample data if it doesn't already exist
    const sampleIds = sampleData.map(s => s.id);
    const existingIds = existingAssessments.map(a => a.id);
    const newSamples = sampleData.filter(s => !existingIds.includes(s.id));
    
    if (newSamples.length > 0) {
      const updatedAssessments = [...existingAssessments, ...newSamples];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssessments));
    }
    return true;
  } catch (error) {
    console.error('Error loading sample data to localStorage:', error);
    return false;
  }
};

// Clear all data (for testing)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all data from localStorage:', error);
    return false;
  }
};

// Export data as JSON
export const exportData = () => {
  try {
    const assessments = getAssessments();
    return JSON.stringify(assessments, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

// Import data from JSON
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};


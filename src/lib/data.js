// Data models and utilities for the Team Assessment Survey

// Question definitions with exact mapping to competencies
export const QUESTIONS = [
  {
    id: "Q1",
    competency: "Agile Mindset (AGIL)",
    text: "The individual demonstrates an understanding of agile principles and shows openness to adapting their ways of working.",
    tooltip: "Good looks like: Actively participates in retrospectives, suggests process improvements, adapts to changing priorities"
  },
  {
    id: "Q2", 
    competency: "Product Management (PROD)",
    text: "The individual understands how to manage and prioritise a backlog, and is beginning to link work items to business value.",
    tooltip: "Good looks like: Uses prioritization frameworks (MoSCoW, WSJF), connects stories to business outcomes"
  },
  {
    id: "Q3",
    competency: "Requirements (REQM)", 
    text: "The individual can define user stories or requirements with enough clarity to be actionable.",
    tooltip: "Good looks like: Writes clear acceptance criteria, follows INVEST principles, includes edge cases"
  },
  {
    id: "Q4",
    competency: "Business Analysis & Decisioning (BUAN/DTAN)",
    text: "The individual can analyse data, processes, or stakeholder inputs to inform decisions.",
    tooltip: "Good looks like: Uses data to support recommendations, maps current vs future state, gathers stakeholder input"
  },
  {
    id: "Q5",
    competency: "Stakeholdering & Collaboration (RLMT)",
    text: "The individual shows the ability to engage stakeholders and communicate priorities clearly.",
    tooltip: "Good looks like: Maintains stakeholder maps, runs effective meetings, communicates trade-offs clearly"
  },
  {
    id: "Q6",
    competency: "Product Management (PROD)",
    text: "The individual seeks to connect work items to customer or business outcomes.",
    tooltip: "Good looks like: Regularly references customer feedback, measures business impact, challenges feature requests"
  },
  {
    id: "Q7",
    competency: "Requirements (REQM)",
    text: "The individual brings the customer perspective into backlog discussions and decision-making.",
    tooltip: "Good looks like: Advocates for user experience, references customer research, challenges internal assumptions"
  },
  {
    id: "Q8",
    competency: "Product Management (PROD)",
    text: "The individual is able to consider trade-offs between risk, compliance, value, and effort when discussing priorities.",
    tooltip: "Good looks like: Balances competing priorities, considers technical debt, evaluates regulatory impact"
  },
  {
    id: "Q9",
    competency: "Business Analysis & Decisioning (BUAN/DTAN)",
    text: "The individual is able to make timely, informed decisions with available data and input.",
    tooltip: "Good looks like: Sets decision deadlines, documents rationale, escalates when appropriate"
  },
  {
    id: "Q10",
    competency: "Change & Innovation (CIPM/INOV)",
    text: "The individual is supportive of adopting new tools, processes, or ways of working.",
    tooltip: "Good looks like: Embraces new technologies, supports team experiments, shares learnings"
  },
  {
    id: "Q11",
    competency: "Change & Innovation (CIPM/INOV)",
    text: "The individual shows curiosity and willingness to suggest or test new ideas.",
    tooltip: "Good looks like: Proposes improvements, runs small experiments, learns from failures"
  },
  {
    id: "Q12",
    competency: "Risk & Compliance (GOVN)",
    text: "The individual demonstrates awareness of risk, compliance, and regulatory factors when discussing work.",
    tooltip: "Good looks like: Identifies compliance requirements early, escalates risks appropriately, documents decisions"
  },
  {
    id: "Q13",
    competency: "Stakeholdering & Collaboration (RLMT)",
    text: "The individual actively collaborates with team members and contributes to shared goals.",
    tooltip: "Good looks like: Participates in ceremonies, helps team members, shares knowledge openly"
  },
  {
    id: "Q14",
    competency: "Product Management (PROD)",
    text: "The individual is developing capability in using Agile delivery tools (e.g., Jira, Confluence, Miro) to manage and share work.",
    tooltip: "Good looks like: Maintains up-to-date Jira tickets, creates clear documentation, uses collaboration tools effectively"
  },
  {
    id: "Q15",
    competency: "Product Management (PROD)",
    text: "The individual contributes to achieving sprint goals and demonstrates awareness of progress and outcomes.",
    tooltip: "Good looks like: Tracks sprint progress, identifies blockers early, celebrates team achievements"
  }
];

// Competency mapping for scoring
export const COMPETENCY_MAPPING = {
  "Agile Mindset (AGIL)": ["Q1"],
  "Product Management (PROD)": ["Q2", "Q6", "Q8", "Q14", "Q15"],
  "Requirements (REQM)": ["Q3", "Q7"],
  "Business Analysis & Decisioning (BUAN/DTAN)": ["Q4", "Q9"],
  "Stakeholdering & Collaboration (RLMT)": ["Q5", "Q13"],
  "Change & Innovation (CIPM/INOV)": ["Q10", "Q11"],
  "Risk & Compliance (GOVN)": ["Q12"]
};

// Score bands for color coding
export const SCORE_BANDS = {
  LOW: { min: 1.0, max: 1.9, color: "#ef4444", label: "Low", bgColor: "#fef2f2" },
  DEVELOPING: { min: 2.0, max: 2.9, color: "#f59e0b", label: "Developing", bgColor: "#fffbeb" },
  COMPETENT: { min: 3.0, max: 3.9, color: "#eab308", label: "Competent", bgColor: "#fefce8" },
  STRONG: { min: 4.0, max: 4.4, color: "#22c55e", label: "Strong", bgColor: "#f0fdf4" },
  EXPERT: { min: 4.5, max: 5.0, color: "#fbbf24", label: "Expert", bgColor: "#fffbeb" }
};

// Get score band for a given score
export const getScoreBand = (score) => {
  if (score >= 4.5) return SCORE_BANDS.EXPERT;
  if (score >= 4.0) return SCORE_BANDS.STRONG;
  if (score >= 3.0) return SCORE_BANDS.COMPETENT;
  if (score >= 2.0) return SCORE_BANDS.DEVELOPING;
  return SCORE_BANDS.LOW;
};

// Role options
export const ROLES = [
  "Product Owner",
  "Business Expert", 
  "Other"
];

// Assessment types
export const ASSESSMENT_TYPES = [
  "Baseline",
  "Week 6",
  "Custom"
];

// Calculate competency scores from responses
export const calculateCompetencyScores = (responses) => {
  const competencyScores = {};
  
  Object.entries(COMPETENCY_MAPPING).forEach(([competency, questions]) => {
    const scores = questions.map(q => responses[q]).filter(score => score !== undefined);
    if (scores.length > 0) {
      competencyScores[competency] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  });
  
  return competencyScores;
};

// Calculate overall score
export const calculateOverallScore = (responses) => {
  const scores = Object.values(responses).filter(score => score !== undefined);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Create assessment data structure
export const createAssessment = (meta, responses) => {
  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    meta,
    responses,
    competencyScores: calculateCompetencyScores(responses),
    overallScore: calculateOverallScore(responses)
  };
};

// Sample data for demonstration
export const SAMPLE_DATA = [
  {
    id: "sample-baseline",
    timestamp: "2025-01-15T10:00:00Z",
    meta: {
      assesseeName: "Jane Doe",
      role: "Product Owner",
      squad: "Squad Alpha",
      tribe: "Digital Banking",
      assessmentType: "Baseline",
      date: "2025-01-15"
    },
    responses: {
      Q1: 3, Q2: 2, Q3: 3, Q4: 2, Q5: 3,
      Q6: 2, Q7: 3, Q8: 2, Q9: 3, Q10: 4,
      Q11: 3, Q12: 2, Q13: 4, Q14: 2, Q15: 3
    }
  },
  {
    id: "sample-week6",
    timestamp: "2025-03-01T10:00:00Z",
    meta: {
      assesseeName: "Jane Doe",
      role: "Product Owner", 
      squad: "Squad Alpha",
      tribe: "Digital Banking",
      assessmentType: "Week 6",
      date: "2025-03-01"
    },
    responses: {
      Q1: 4, Q2: 3, Q3: 4, Q4: 3, Q5: 4,
      Q6: 3, Q7: 4, Q8: 3, Q9: 4, Q10: 4,
      Q11: 4, Q12: 3, Q13: 4, Q14: 3, Q15: 4
    }
  }
];

// Add sample data with calculated scores
SAMPLE_DATA.forEach(assessment => {
  assessment.competencyScores = calculateCompetencyScores(assessment.responses);
  assessment.overallScore = calculateOverallScore(assessment.responses);
});


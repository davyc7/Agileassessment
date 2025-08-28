// AI Recommendations System for Team Assessment Survey

import { COMPETENCY_MAPPING, getScoreBand } from './data';

// Intervention library for each competency
export const INTERVENTION_LIBRARY = {
  "Agile Mindset (AGIL)": {
    priority: {
      interventions: [
        "Attend Agile fundamentals training workshop",
        "Shadow experienced Scrum Master during ceremonies",
        "Read 'Agile Manifesto' and discuss with team lead",
        "Participate in retrospective action planning",
        "Practice daily stand-up facilitation"
      ],
      kpis: [
        "Retrospective action closure rate (target: >80%)",
        "Ceremony participation score (target: 4/5)"
      ]
    },
    developing: {
      interventions: [
        "Join Agile community of practice",
        "Complete online Agile certification course",
        "Implement one process improvement per sprint"
      ],
      kpis: [
        "Process improvement suggestions per month (target: 2+)",
        "Agile maturity self-assessment score (target: 4/5)"
      ]
    },
    sustain: {
      interventions: [
        "Mentor junior team members on Agile practices",
        "Lead retrospective facilitation rotation"
      ],
      kpis: [
        "Team Agile maturity score (target: maintain 4+/5)"
      ]
    }
  },

  "Product Management (PROD)": {
    priority: {
      interventions: [
        "Implement backlog template with WSJF/value tags in Jira",
        "Attend Product Owner certification training",
        "Create user story writing workshop with team",
        "Establish regular stakeholder review cadence",
        "Practice story mapping techniques"
      ],
      kpis: [
        "% backlog items with value tags (target: >90%)",
        "Sprint goal attainment rate (target: >80%)",
        "Story acceptance rate (target: >85%)"
      ]
    },
    developing: {
      interventions: [
        "Join Product Management community",
        "Implement OKRs for product metrics",
        "Regular customer feedback sessions"
      ],
      kpis: [
        "Customer satisfaction score (target: 4+/5)",
        "Feature adoption rate (target: >70%)"
      ]
    },
    sustain: {
      interventions: [
        "Coach other Product Owners",
        "Lead product strategy sessions"
      ],
      kpis: [
        "Product delivery velocity (target: maintain trend)"
      ]
    }
  },

  "Requirements (REQM)": {
    priority: {
      interventions: [
        "INVEST story writing clinic with Business Analyst",
        "Create acceptance criteria template library",
        "Practice behavior-driven development (BDD) techniques",
        "Implement definition of ready checklist",
        "Regular story refinement sessions"
      ],
      kpis: [
        "Story rework rate (target: <15%)",
        "Acceptance criteria completeness score (target: >90%)"
      ]
    },
    developing: {
      interventions: [
        "Advanced requirements gathering training",
        "User journey mapping workshops",
        "Stakeholder interview techniques"
      ],
      kpis: [
        "Requirements clarity score (target: 4+/5)",
        "Stakeholder satisfaction with requirements (target: >85%)"
      ]
    },
    sustain: {
      interventions: [
        "Lead requirements review sessions",
        "Mentor team on story writing"
      ],
      kpis: [
        "Team story quality score (target: maintain 4+/5)"
      ]
    }
  },

  "Business Analysis & Decisioning (BUAN/DTAN)": {
    priority: {
      interventions: [
        "Create lightweight data checklist for decisions",
        "Attend data analysis fundamentals training",
        "Implement decision log template",
        "Practice root cause analysis techniques",
        "Regular data review sessions with analysts"
      ],
      kpis: [
        "Decision lead time (target: <5 days)",
        "% decisions with cited data (target: >80%)"
      ]
    },
    developing: {
      interventions: [
        "Advanced analytics training",
        "Process mapping workshops",
        "Stakeholder analysis techniques"
      ],
      kpis: [
        "Decision quality score (target: 4+/5)",
        "Process improvement identification rate (target: 2+/month)"
      ]
    },
    sustain: {
      interventions: [
        "Lead decision-making frameworks",
        "Coach team on analytical thinking"
      ],
      kpis: [
        "Team analytical capability score (target: maintain 4+/5)"
      ]
    }
  },

  "Stakeholdering & Collaboration (RLMT)": {
    priority: {
      interventions: [
        "Create stakeholder map and engagement plan",
        "Establish regular stakeholder communication cadence",
        "Practice difficult conversation techniques",
        "Implement RACI matrix for key decisions",
        "Join communication skills workshop"
      ],
      kpis: [
        "Stakeholder satisfaction pulse (target: >4/5)",
        "Number of escalations (target: <2/month)"
      ]
    },
    developing: {
      interventions: [
        "Advanced facilitation training",
        "Conflict resolution workshops",
        "Presentation skills development"
      ],
      kpis: [
        "Meeting effectiveness score (target: 4+/5)",
        "Stakeholder engagement frequency (target: weekly)"
      ]
    },
    sustain: {
      interventions: [
        "Mentor others on stakeholder management",
        "Lead cross-functional initiatives"
      ],
      kpis: [
        "Team collaboration score (target: maintain 4+/5)"
      ]
    }
  },

  "Change & Innovation (CIPM/INOV)": {
    priority: {
      interventions: [
        "Create change introduction playbook",
        "Implement one experiment per sprint",
        "Join innovation community of practice",
        "Practice change management techniques",
        "Regular 'innovation time' sessions"
      ],
      kpis: [
        "Experiments run per quarter (target: 4+)",
        "Change adoption scores (target: >70%)"
      ]
    },
    developing: {
      interventions: [
        "Design thinking workshops",
        "Innovation methodology training",
        "Cross-industry learning sessions"
      ],
      kpis: [
        "Innovation ideas generated (target: 2+/month)",
        "Successful change implementations (target: >80%)"
      ]
    },
    sustain: {
      interventions: [
        "Lead innovation initiatives",
        "Coach team on experimentation"
      ],
      kpis: [
        "Team innovation score (target: maintain 4+/5)"
      ]
    }
  },

  "Risk & Compliance (GOVN)": {
    priority: {
      interventions: [
        "Create risk/regulatory acceptance criteria template",
        "Attend compliance fundamentals training",
        "Implement risk register for product features",
        "Regular compliance review sessions",
        "Practice risk assessment techniques"
      ],
      kpis: [
        "Compliance rejection rate (target: <10%)",
        "Early risk identification % (target: >90%)"
      ]
    },
    developing: {
      interventions: [
        "Advanced risk management training",
        "Regulatory landscape workshops",
        "Audit preparation techniques"
      ],
      kpis: [
        "Risk mitigation effectiveness (target: >85%)",
        "Compliance score (target: 4+/5)"
      ]
    },
    sustain: {
      interventions: [
        "Lead risk assessment sessions",
        "Mentor team on compliance practices"
      ],
      kpis: [
        "Team compliance awareness (target: maintain 4+/5)"
      ]
    }
  }
};

// Generate recommendations based on assessment scores
export const generateRecommendations = (assessment, comparisonAssessment = null) => {
  if (!assessment) return null;

  const competencyScores = assessment.competencyScores;
  const recommendations = {
    overall: {
      score: assessment.overallScore,
      band: getScoreBand(assessment.overallScore).label,
      narrative: "",
      topGaps: [],
      sequence: {
        weeks0to2: [],
        weeks2to6: []
      }
    },
    competencies: {}
  };

  // Analyze each competency
  const competencyAnalysis = [];
  
  Object.entries(competencyScores).forEach(([competency, score]) => {
    const band = getScoreBand(score);
    const interventions = INTERVENTION_LIBRARY[competency];
    let level = 'sustain';
    
    if (score < 2.5) level = 'priority';
    else if (score < 3.5) level = 'developing';
    
    const comparisonScore = comparisonAssessment?.competencyScores[competency];
    const delta = comparisonScore ? score - comparisonScore : null;
    const isRegressed = delta !== null && delta < -0.2;
    const isImproved = delta !== null && delta > 0.2;
    
    // Adjust priority if regressed
    if (isRegressed && level === 'sustain') {
      level = 'developing';
    }
    
    competencyAnalysis.push({
      competency,
      score,
      level,
      delta,
      isRegressed,
      isImproved,
      priority: score < 3.0 || isRegressed ? 'high' : score < 4.0 ? 'medium' : 'low'
    });
    
    recommendations.competencies[competency] = {
      score: score,
      band: band.label,
      level: level,
      delta: delta,
      interventions: interventions[level].interventions,
      kpis: interventions[level].kpis,
      priority: score < 3.0 || isRegressed ? 'high' : score < 4.0 ? 'medium' : 'low',
      timeframe: level === 'priority' ? 'immediate' : level === 'developing' ? 'short-term' : 'ongoing'
    };
  });

  // Identify top 3 gaps
  const sortedGaps = competencyAnalysis
    .filter(c => c.score < 4.0 || c.isRegressed)
    .sort((a, b) => {
      if (a.isRegressed && !b.isRegressed) return -1;
      if (!a.isRegressed && b.isRegressed) return 1;
      return a.score - b.score;
    })
    .slice(0, 3);

  recommendations.overall.topGaps = sortedGaps.map(gap => ({
    competency: gap.competency,
    score: gap.score,
    reason: gap.isRegressed ? 'Performance regression detected' : 'Below target performance',
    delta: gap.delta
  }));

  // Create intervention sequence
  const priorityInterventions = [];
  const developingInterventions = [];
  
  sortedGaps.forEach(gap => {
    const competencyRecs = recommendations.competencies[gap.competency];
    if (gap.level === 'priority') {
      priorityInterventions.push(...competencyRecs.interventions.slice(0, 2).map(i => ({
        competency: gap.competency,
        intervention: i,
        timeframe: '0-2 weeks'
      })));
      developingInterventions.push(...competencyRecs.interventions.slice(2).map(i => ({
        competency: gap.competency,
        intervention: i,
        timeframe: '2-6 weeks'
      })));
    } else {
      developingInterventions.push(...competencyRecs.interventions.slice(0, 2).map(i => ({
        competency: gap.competency,
        intervention: i,
        timeframe: '2-6 weeks'
      })));
    }
  });

  recommendations.overall.sequence.weeks0to2 = priorityInterventions.slice(0, 5);
  recommendations.overall.sequence.weeks2to6 = developingInterventions.slice(0, 8);

  // Generate overall narrative
  const overallBand = getScoreBand(assessment.overallScore);
  let narrative = `Based on the assessment results, ${assessment.meta.assesseeName} demonstrates ${overallBand.label.toLowerCase()} performance with an overall score of ${assessment.overallScore.toFixed(2)}/5.0. `;
  
  if (comparisonAssessment) {
    const overallDelta = assessment.overallScore - comparisonAssessment.overallScore;
    if (overallDelta > 0.2) {
      narrative += `This represents a significant improvement of +${overallDelta.toFixed(2)} points from the previous assessment. `;
    } else if (overallDelta < -0.2) {
      narrative += `This shows a concerning decline of ${overallDelta.toFixed(2)} points from the previous assessment. `;
    } else {
      narrative += `Performance has remained relatively stable since the previous assessment. `;
    }
  }

  if (sortedGaps.length > 0) {
    narrative += `Priority development areas include ${sortedGaps.map(g => g.competency.split('(')[0].trim()).join(', ')}. `;
    narrative += `Immediate focus should be on ${recommendations.overall.sequence.weeks0to2.length} quick-win interventions over the next 2 weeks, followed by ${recommendations.overall.sequence.weeks2to6.length} strategic initiatives over the following 4 weeks.`;
  } else {
    narrative += `All competency areas are performing well. Focus should be on sustaining current performance and coaching others.`;
  }

  recommendations.overall.narrative = narrative;

  return recommendations;
};

// Get priority recommendations for quick display
export const getPriorityRecommendations = (recommendations) => {
  if (!recommendations) return [];
  
  return recommendations.overall.sequence.weeks0to2.concat(
    recommendations.overall.sequence.weeks2to6.slice(0, 3)
  );
};

// Get competency-specific KPIs
export const getCompetencyKPIs = (competency, level = 'developing') => {
  const interventions = INTERVENTION_LIBRARY[competency];
  return interventions?.[level]?.kpis || [];
};


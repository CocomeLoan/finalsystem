// Enhanced prediction logic with categorized risk analysis
// Categories: Financial, Personal, Academic

export function analyzeFinancialRisk(student) {
  const familyIncome = student.family_income || 0;
  const hasScholarship = student.scholarship === 'yes';
  const scholarshipAmount = student.scholarship_amount || 0;

  const isAtRisk = familyIncome < 20000 && !hasScholarship;
  const riskScore = isAtRisk ? 1 : 0;

  return {
    category: 'Financial',
    isAtRisk,
    riskScore,
    factors: {
      familyIncome,
      hasScholarship,
      scholarshipAmount,
    },
    explanation: isAtRisk
      ? `Student is at financial risk with family income of ₱${familyIncome.toLocaleString()} below the ₱20,000 threshold. No scholarship support detected.`
      : `Student has adequate financial support (₱${familyIncome.toLocaleString()})${hasScholarship ? ' with scholarship assistance' : ''}.`,
  };
}

export function analyzePersonalRisk(student) {
  // Course Experience (3 questions, 1-5 scale)
  // 1 = strongly agree (good), 5 = strongly disagree (bad)
  const courseExperience = [
    student.like_course || 3,
    student.interested_in_subjects || 3,
    student.course_motivates || 3,
  ];
  const courseAvg = courseExperience.reduce((a, b) => a + b, 0) / courseExperience.length;

  // Academic Performance/History (2 questions, 1-5 scale)
  const academicPerf = [
    student.satisfied_with_performance || 3,
    student.previous_grades_affect || 3,
  ];
  const academicPerfAvg = academicPerf.reduce((a, b) => a + b, 0) / academicPerf.length;

  // Learning Behavior (3 questions, 1-5 scale)
  const learningBehavior = [
    student.study_regularly || 3,
    student.submit_on_time || 3,
    student.manage_time_well || 3,
  ];
  const learningAvg = learningBehavior.reduce((a, b) => a + b, 0) / learningBehavior.length;

  // Instructor Interaction (3 questions, 1-5 scale)
  const instructorInteraction = [
    student.instructors_explain_clearly || 3,
    student.approach_instructors || 3,
    student.instructors_encourage || 3,
  ];
  const instructorAvg = instructorInteraction.reduce((a, b) => a + b, 0) / instructorInteraction.length;

  // Classmate/Peer Influence (3 questions, 1-5 scale)
  const peerInfluence = [
    student.classmates_influence_positively || 3,
    student.work_well_with_classmates || 3,
    student.friends_motivate || 3,
  ];
  const peerAvg = peerInfluence.reduce((a, b) => a + b, 0) / peerInfluence.length;

  const allScores = [courseAvg, academicPerfAvg, learningAvg, instructorAvg, peerAvg];
  const overallAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  // Scale: 1 = strongly agree (good), 5 = strongly disagree (bad)
  // Below 3 = agree (good), Over 3 or equal = disagree (bad/at-risk)
  const isAtRisk = overallAvg >= 3;
  const riskScore = isAtRisk ? 1 : 0;

  const subCategories = [
    { name: 'Course Experience', avg: courseAvg, questions: courseExperience },
    { name: 'Academic Self-Perception', avg: academicPerfAvg, questions: academicPerf },
    { name: 'Learning Behavior', avg: learningAvg, questions: learningBehavior },
    { name: 'Instructor Interaction', avg: instructorAvg, questions: instructorInteraction },
    { name: 'Peer Influence', avg: peerAvg, questions: peerInfluence },
  ];

  // Weaknesses: avg >= 3 (disagree/bad)
  // Strengths: avg < 3 (agree/good)
  const weaknesses = subCategories.filter(cat => cat.avg >= 3);
  const strengths = subCategories.filter(cat => cat.avg < 3);

  return {
    category: 'Personal',
    isAtRisk,
    riskScore,
    overallAvg,
    subCategories,
    weaknesses,
    strengths,
    explanation: isAtRisk
      ? `Student shows overall personal risk (average: ${overallAvg.toFixed(1)}/5). Weak areas: ${weaknesses.map(w => w.name).join(', ')}.`
      : `Student shows good personal standing (average: ${overallAvg.toFixed(1)}/5).${weaknesses.length > 0 ? ` Areas for improvement: ${weaknesses.map(w => w.name).join(', ')}.` : ''}`,
  };
}

export function analyzeAcademicRisk(student, studentGrades = []) {
  // Calculate GPA from individual semester columns
  const gpaValues = [
    student.gpa_y1s1,
    student.gpa_y1s2,
    student.gpa_y2s1,
    student.gpa_y2s2,
    student.gpa_y3s1,
  ].filter(gpa => gpa && gpa > 0);

  const avgGpa = gpaValues.length > 0
    ? gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length
    : null;

  // Also check from gpa_history if available
  const gpaHistory = student.gpa_history || [];
  const historyGpa = gpaHistory.length > 0
    ? gpaHistory.reduce((sum, h) => sum + (h.gpa || 0), 0) / gpaHistory.length
    : null;

  const finalGpa = avgGpa || historyGpa;

  // Philippine grading scale: 1.0 = highest, 3.0 = passing, 5.0 = failed
  const isAtRisk = finalGpa !== null && finalGpa > 2.5;
  const riskScore = isAtRisk ? 1 : 0;

  // Check for failing subjects (grade > 3.0)
  const failingSubjects = studentGrades.filter(g => g.grade > 3.0);
  const hasFailingSubjects = failingSubjects.length > 0;

  return {
    category: 'Academic',
    isAtRisk: isAtRisk || hasFailingSubjects,
    riskScore: (isAtRisk ? 1 : 0) + (hasFailingSubjects ? 1 : 0),
    factors: {
      avgGpa: finalGpa,
      gpaValues,
      failingSubjects: failingSubjects.length,
      totalSubjects: studentGrades.length,
    },
    explanation: isAtRisk
      ? `Student is at academic risk with GPA of ${finalGpa?.toFixed(2)} (threshold: 2.5).${hasFailingSubjects ? ` Has ${failingSubjects.length} failing subject(s).` : ''}`
      : `Student has good academic standing with GPA of ${finalGpa?.toFixed(2) || 'N/A'}.${hasFailingSubjects ? ` However, has ${failingSubjects.length} failing subject(s) requiring attention.` : ''}`,
  };
}

export function calculateOverallRisk(financial, personal, academic) {
  const totalRiskScore = financial.riskScore + personal.riskScore + academic.riskScore;
  const maxRiskScore = 4; // Financial (1) + Personal (1) + Academic (2)

  const riskPercentage = (totalRiskScore / maxRiskScore) * 100;

  let overallResult;
  if (riskPercentage >= 60) {
    overallResult = 'At-Risk';
  } else if (riskPercentage >= 30) {
    overallResult = 'At-Risk';
  } else {
    overallResult = 'Good Standing';
  }

  return {
    overallResult,
    riskPercentage,
    totalRiskScore,
    maxRiskScore,
    categories: { financial, personal, academic },
  };
}

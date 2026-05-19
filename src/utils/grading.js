/**
 * Philippine College Grading System
 * 1.00 = Highest (Excellent)
 * 3.00 = Passing
 * 5.00 = Failed
 */

export function getGradeLabel(gpa) {
  if (!gpa || isNaN(gpa)) return 'N/A';
  if (gpa <= 1.25) return 'Excellent';
  if (gpa <= 1.75) return 'Very Good';
  if (gpa <= 2.25) return 'Good';
  if (gpa <= 2.75) return 'Satisfactory';
  if (gpa <= 3.00) return 'Passing';
  if (gpa <= 4.00) return 'Conditional';
  return 'Failed';
}

export function getGradeVariant(gpa) {
  if (!gpa || isNaN(gpa)) return 'outline';
  if (gpa <= 1.75) return 'default'; // green-ish via badge default
  if (gpa <= 3.00) return 'secondary';
  return 'destructive';
}

export function getGradeColor(gpa) {
  if (!gpa || isNaN(gpa)) return 'text-muted-foreground';
  if (gpa <= 1.75) return 'text-emerald-600';
  if (gpa <= 3.00) return 'text-amber-600';
  return 'text-destructive';
}

export function isPassing(gpa) {
  return gpa != null && !isNaN(gpa) && gpa <= 3.00;
}

export function isAtRisk(gpa) {
  // At-risk: GPA trending above 2.75 (close to or above passing threshold)
  return gpa != null && !isNaN(gpa) && gpa > 2.75;
}

export function getLatestGPA(gpaHistory) {
  if (!gpaHistory || gpaHistory.length === 0) return null;
  return gpaHistory[gpaHistory.length - 1]?.gpa ?? null;
}

export function getAverageGPA(gpaHistory) {
  if (!gpaHistory || gpaHistory.length === 0) return null;
  const valid = gpaHistory.filter(h => h.gpa != null && !isNaN(h.gpa));
  if (valid.length === 0) return null;
  return valid.reduce((sum, h) => sum + h.gpa, 0) / valid.length;
}
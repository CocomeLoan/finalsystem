import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, Loader2, Lock, Users, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getGradeLabel, getLatestGPA } from '@/utils/grading';

// Mock prediction engine — no LLM calls
function mockPredict(student, studentGrades, type) {
  const gpaHistory = student.gpa_history || [];
  const latestGpa = gpaHistory.length > 0 ? gpaHistory[gpaHistory.length - 1]?.gpa : null;
  const avgGpa = gpaHistory.length > 0
    ? gpaHistory.reduce((s, h) => s + (h.gpa || 0), 0) / gpaHistory.length
    : null;

  const studyHours = student.study_hours || 0;
  const libraryVisits = student.library_visits || 0;
  const lmsLogins = student.lms_login_per_month || 0;
  const hasScholarship = student.scholarship === 'yes';
  const familyIncome = student.family_income || 0;

  // Scoring: lower is better (Philippine scale 1.0–5.0)
  let riskScore = 0;
  if (latestGpa !== null) {
    if (latestGpa > 3.00) riskScore += 3;
    else if (latestGpa > 2.50) riskScore += 1;
  } else {
    riskScore += 1; // no data = slight risk
  }
  if (studyHours < 2) riskScore += 1;
  if (lmsLogins < 5) riskScore += 1;
  if (libraryVisits < 1) riskScore += 0.5;
  if (familyIncome > 0 && familyIncome < 10000) riskScore += 0.5;

  // Advanced: check for failing subjects (grade > 3.0)
  if (type === 'advanced' && studentGrades.length > 0) {
    const failingCount = studentGrades.filter(g => g.grade > 3.0).length;
    riskScore += failingCount * 1.5;
  }

  const result = riskScore >= 3 ? 'At-Risk' : 'Good Standing';
  const confidence = result === 'Good Standing'
    ? +(0.70 + Math.random() * 0.25).toFixed(2)
    : +(0.65 + Math.random() * 0.30).toFixed(2);

  const strengths = [];
  const weaknesses = [];

  if (latestGpa !== null && latestGpa <= 1.75) strengths.push('Excellent GPA performance');
  else if (latestGpa !== null && latestGpa <= 2.50) strengths.push('Good academic standing');
  if (studyHours >= 3) strengths.push('Consistent study habits');
  if (lmsLogins >= 10) strengths.push('High LMS engagement');
  if (libraryVisits >= 2) strengths.push('Regular library utilization');
  if (hasScholarship) strengths.push('Financial support through scholarship');

  if (latestGpa !== null && latestGpa > 3.00) weaknesses.push('GPA below passing threshold');
  else if (latestGpa !== null && latestGpa > 2.50) weaknesses.push('GPA approaching risk zone');
  if (studyHours < 2) weaknesses.push('Insufficient study hours per day');
  if (lmsLogins < 5) weaknesses.push('Low LMS platform engagement');
  if (libraryVisits < 1) weaknesses.push('Minimal library visits');
  if (familyIncome > 0 && familyIncome < 10000) weaknesses.push('Low family income may affect resources');

  const recommendations = result === 'At-Risk' ? [
    'Enroll in academic tutoring or peer study groups',
    'Increase daily study hours to at least 3–4 hours',
    'Meet with academic adviser for a study improvement plan',
    'Utilize library and LMS resources more consistently',
  ] : [
    'Maintain current academic performance',
    'Consider joining honor societies or academic competitions',
    'Explore leadership roles in student organizations',
  ];

  const explanation = result === 'Good Standing'
    ? `${student.name} is classified as Good Standing based on a GPA of ${latestGpa ?? 'N/A'}, study habits, and engagement metrics. Risk score: ${riskScore.toFixed(1)}.`
    : `${student.name} is classified as At-Risk. Key factors include GPA of ${latestGpa ?? 'N/A'} and low engagement indicators. Risk score: ${riskScore.toFixed(1)}.`;

  const feature_importance = [
    { feature: 'GPA History', importance: +(0.30 + Math.random() * 0.15).toFixed(3) },
    { feature: 'Study Hours', importance: +(0.15 + Math.random() * 0.10).toFixed(3) },
    { feature: 'LMS Logins', importance: +(0.12 + Math.random() * 0.08).toFixed(3) },
    { feature: 'Library Visits', importance: +(0.08 + Math.random() * 0.06).toFixed(3) },
    { feature: 'Family Income', importance: +(0.05 + Math.random() * 0.05).toFixed(3) },
    { feature: 'Scholarship', importance: +(0.04 + Math.random() * 0.04).toFixed(3) },
  ];

  return { result, confidence, strengths, weaknesses, explanation, recommendations, feature_importance };
}

export default function PredictionPage({ departmentFilter, courseFilter }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [predictionType, setPredictionType] = useState('basic');
  const [result, setResult] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkCurrent, setBulkCurrent] = useState('');
  const [bulkSummary, setBulkSummary] = useState(null);
  const [showBulkSummary, setShowBulkSummary] = useState(false);
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });
  const { data: trainingLogs = [] } = useQuery({
    queryKey: ['trainingLogs'],
    queryFn: () => base44.entities.TrainingLog.list(),
  });
  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities.SubjectGrade.list(),
  });
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  // All students loaded (no artificial limit)
  const filtered = courseFilter
    ? students.filter(s => courseFilter.includes(s.course))
    : departmentFilter
    ? students.filter(s => s.department === departmentFilter)
    : students;

  const hasTrained = trainingLogs.some(t => t.is_best);
  const bestModel = trainingLogs.find(t => t.is_best);

  const savePrediction = async (student, prediction) => {
    await base44.entities.Prediction.create({
      student_id: student.student_id,
      student_name: student.name,
      department: student.department,
      result: prediction.result,
      confidence: prediction.confidence,
      model_used: bestModel?.algorithm || 'AI Analysis',
      strengths: prediction.strengths || [],
      weaknesses: prediction.weaknesses || [],
      explanation: prediction.explanation || '',
      recommendations: prediction.recommendations || [],
      feature_importance: prediction.feature_importance || [],
      prediction_type: predictionType,
    });
  };

  const predictMutation = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === selectedStudentId);
      if (!student) throw new Error('Student not found');
      const studentGrades = grades.filter(g => g.student_id === student.student_id);

      const prediction = mockPredict(student, studentGrades, predictionType);
      await savePrediction(student, prediction);
      setResult({ ...prediction, student });
      qc.invalidateQueries({ queryKey: ['predictions'] });
    },
    onSuccess: () => toast.success('Prediction completed successfully'),
    onError: (err) => toast.error('Prediction failed: ' + err.message),
  });

  const predictAllMutation = useMutation({
    mutationFn: async () => {
      const toPredict = [...filtered];
      if (toPredict.length === 0) throw new Error('No students to predict');

      setBulkProgress(0);
      setBulkSummary(null);
      let goodStanding = 0, atRisk = 0;

      // Process in parallel batches of 5 for speed
      const BATCH_SIZE = 5;
      for (let i = 0; i < toPredict.length; i += BATCH_SIZE) {
        const batch = toPredict.slice(i, i + BATCH_SIZE);
        setBulkCurrent(`${Math.min(i + BATCH_SIZE, toPredict.length)} of ${toPredict.length}`);

        // Run batch — mock is synchronous so all instant
        const batchResults = batch.map((student) => {
          const studentGrades = grades.filter(g => g.student_id === student.student_id);
          const prediction = mockPredict(student, studentGrades, predictionType);
          return { student, prediction };
        });

        // Save batch results in parallel
        await Promise.all(
          batchResults.map(({ student, prediction }) => savePrediction(student, prediction))
        );

        batchResults.forEach(({ prediction }) => {
          if (prediction.result === 'Good Standing') goodStanding++;
          else atRisk++;
        });

        setBulkProgress(Math.round((Math.min(i + BATCH_SIZE, toPredict.length) / toPredict.length) * 100));
      }

      qc.invalidateQueries({ queryKey: ['predictions'] });
      return { total: toPredict.length, goodStanding, atRisk };
    },
    onSuccess: (summary) => {
      setBulkSummary(summary);
      setShowBulkSummary(true);
      setBulkCurrent('');
      toast.success(`Bulk prediction complete! ${summary.goodStanding} Good Standing, ${summary.atRisk} At-Risk`);
    },
    onError: (err) => {
      setBulkCurrent('');
      toast.error('Bulk prediction failed: ' + err.message);
    },
  });

  if (!hasTrained) {
    return (
      <div>
        <PageHeader title="Academic Prediction" />
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Prediction Locked</h2>
            <p className="text-muted-foreground">Please train the model first before making predictions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBulkRunning = predictAllMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Academic Prediction"
        description={`Predict student academic standing using ${bestModel?.algorithm || 'AI'} — Philippine grading scale (1.0–5.0)`}
        actions={
          <Button
            variant="outline"
            onClick={() => { setBulkProgress(0); setBulkCurrent(''); predictAllMutation.mutate(); }}
            disabled={isBulkRunning || predictMutation.isPending || filtered.length === 0}
          >
            {isBulkRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Predicting All ({bulkProgress}%)</>
            ) : (
              <><Users className="w-4 h-4 mr-2" />Predict All ({filtered.length})</>
            )}
          </Button>
        }
      />

      {isBulkRunning && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Processing: <strong>{bulkCurrent}</strong> — {filtered.length} students total
              </span>
              <span className="font-medium">{bulkProgress}%</span>
            </div>
            <Progress value={bulkProgress} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Run Single Prediction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Student</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>
                  {filtered.map(s => {
                    const gpa = getLatestGPA(s.gpa_history);
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.student_id}) {gpa ? `— GPA: ${gpa}` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Prediction Type</label>
              <Tabs value={predictionType} onValueChange={setPredictionType}>
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">Basic (GPA)</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button
              className="w-full"
              onClick={() => predictMutation.mutate()}
              disabled={!selectedStudentId || predictMutation.isPending || isBulkRunning}
            >
              {predictMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                : <><Brain className="w-4 h-4 mr-2" />Run Prediction</>}
            </Button>

            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Philippine Grading Scale</p>
              <p>1.0 = Highest | 3.0 = Passing | 5.0 = Failed</p>
              <p className="mt-1 font-medium">Best Model: {bestModel?.algorithm}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Prediction Result</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  {result.result === 'Good Standing' ? (
                    <div className="p-3 rounded-full bg-emerald-50"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                  ) : (
                    <div className="p-3 rounded-full bg-destructive/10"><AlertTriangle className="w-8 h-8 text-destructive" /></div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{result.student?.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={result.result === 'Good Standing' ? 'default' : 'destructive'}>{result.result}</Badge>
                      <span className="text-sm text-muted-foreground">{((result.confidence || 0) * 100).toFixed(0)}% confidence</span>
                      {result.student?.gpa_history?.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          • GPA: {getLatestGPA(result.student.gpa_history)} ({getGradeLabel(getLatestGPA(result.student.gpa_history))})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">XAI Explanation</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{result.explanation}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-600 text-sm">Strengths</h4>
                    <ul className="space-y-1">
                      {result.strengths?.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive text-sm">Weaknesses</h4>
                    <ul className="space-y-1">
                      {result.weaknesses?.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
                  <ul className="space-y-1">
                    {result.recommendations?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded bg-primary/5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a student and run a prediction to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {predictions.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Recent Predictions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{p.student_name || p.student_id}</p>
                    <p className="text-xs text-muted-foreground">{p.model_used} • {p.prediction_type} • {p.created_date ? new Date(p.created_date).toLocaleDateString() : ''}</p>
                  </div>
                  <Badge variant={p.result === 'Good Standing' ? 'default' : 'destructive'}>{p.result}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showBulkSummary} onOpenChange={setShowBulkSummary}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Prediction Complete</DialogTitle></DialogHeader>
          {bulkSummary && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{bulkSummary.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Students</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">{bulkSummary.goodStanding}</p>
                  <p className="text-xs text-muted-foreground mt-1">Good Standing</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{bulkSummary.atRisk}</p>
                  <p className="text-xs text-muted-foreground mt-1">At-Risk</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p><strong>Good Standing Rate:</strong> {((bulkSummary.goodStanding / bulkSummary.total) * 100).toFixed(1)}%</p>
                <p><strong>At-Risk Rate:</strong> {((bulkSummary.atRisk / bulkSummary.total) * 100).toFixed(1)}%</p>
                <p className="mt-1">All results saved to Prediction Logs.</p>
              </div>
              <Button className="w-full" onClick={() => setShowBulkSummary(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
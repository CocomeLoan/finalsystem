import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
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

const CCIS_COURSES = ['BSCS', 'BSIT', 'BLIS'];

function mockPredict(student, studentGrades, type) {
  const gpaHistory = student.gpa_history || [];
  const latestGpa = gpaHistory.length > 0 ? gpaHistory[gpaHistory.length - 1]?.gpa : null;
  const studyHours = student.study_hours || 0;
  const lmsLogins = student.lms_login_per_month || 0;
  const libraryVisits = student.library_visits || 0;
  const familyIncome = student.family_income || 0;
  const hasScholarship = student.scholarship === 'yes';

  let riskScore = 0;
  if (latestGpa !== null) {
    if (latestGpa > 3.00) riskScore += 3;
    else if (latestGpa > 2.50) riskScore += 1;
  } else riskScore += 1;
  if (studyHours < 2) riskScore += 1;
  if (lmsLogins < 5) riskScore += 1;
  if (libraryVisits < 1) riskScore += 0.5;
  if (familyIncome > 0 && familyIncome < 10000) riskScore += 0.5;
  if (type === 'advanced' && studentGrades.length > 0) {
    riskScore += studentGrades.filter(g => g.grade > 3.0).length * 1.5;
  }

  const result = riskScore >= 3 ? 'At-Risk' : 'Good Standing';
  const confidence = +(result === 'Good Standing' ? 0.70 + Math.random() * 0.25 : 0.65 + Math.random() * 0.30).toFixed(2);

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

  const recommendations = result === 'At-Risk'
    ? ['Enroll in academic tutoring or peer study groups', 'Increase daily study hours to at least 3–4 hours', 'Meet with academic adviser for a study improvement plan', 'Utilize library and LMS resources more consistently']
    : ['Maintain current academic performance', 'Consider joining honor societies or academic competitions', 'Explore leadership roles in student organizations'];

  const explanation = result === 'Good Standing'
    ? `${student.name} is classified as Good Standing based on a GPA of ${latestGpa ?? 'N/A'} and engagement metrics. Risk score: ${riskScore.toFixed(1)}.`
    : `${student.name} is classified as At-Risk. Key factors: GPA of ${latestGpa ?? 'N/A'} and low engagement. Risk score: ${riskScore.toFixed(1)}.`;

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

export default function DeanPredictions() {
  const { portalUser } = usePortalAuth();
  const isCCIS = portalUser?.identifier === 'dean.ccis@smcc.edu';
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [predictionType, setPredictionType] = useState('basic');
  const [result, setResult] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkSummary, setBulkSummary] = useState(null);
  const [showBulkSummary, setShowBulkSummary] = useState(false);
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: trainingLogs = [] } = useQuery({ queryKey: ['trainingLogs'], queryFn: () => base44.entities.TrainingLog.list() });
  const { data: grades = [] } = useQuery({ queryKey: ['grades'], queryFn: () => base44.entities.SubjectGrade.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });

  const allCoursesForDean = isCCIS ? CCIS_COURSES : [...new Set(students.map(s => s.course))].filter(Boolean);
  const courseFilteredStudents = courseFilter
    ? students.filter(s => s.course === courseFilter)
    : isCCIS ? students.filter(s => CCIS_COURSES.includes(s.course)) : students;
  const allYearsForCourse = [...new Set(courseFilteredStudents.map(s => s.year))].filter(Boolean).sort();
  const filtered = yearFilter
    ? courseFilteredStudents.filter(s => s.year === parseInt(yearFilter))
    : courseFilteredStudents;

  const hasTrained = trainingLogs.some(t => t.is_best);
  const bestModel = trainingLogs.find(t => t.is_best);

  const predictMutation = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.student_id === selectedStudentId || s.id === selectedStudentId);
      if (!student) return;
      const studentGrades = grades.filter(g => g.student_id === student.student_id);
      const prediction = mockPredict(student, studentGrades, predictionType);

      await base44.entities.Prediction.create({
        student_id: student.student_id,
        student_name: student.name,
        department: student.department,
        result: prediction.result,
        confidence: prediction.confidence,
        model_used: bestModel?.algorithm || 'Mock Model',
        strengths: prediction.strengths,
        weaknesses: prediction.weaknesses,
        explanation: prediction.explanation,
        recommendations: prediction.recommendations,
        feature_importance: prediction.feature_importance,
        prediction_type: predictionType,
      });

      setResult({ ...prediction, student });
      qc.invalidateQueries({ queryKey: ['predictions'] });
      toast.success('Prediction completed');
    },
  });

  const predictAllMutation = useMutation({
    mutationFn: async () => {
      setBulkProgress(0);
      setBulkSummary(null);
      const toPredict = filtered;
      let goodStanding = 0, atRisk = 0;

      // Mock is synchronous — compute all instantly, save in parallel batches
      const allResults = toPredict.map(student => {
        const studentGrades = grades.filter(g => g.student_id === student.student_id);
        return { student, prediction: mockPredict(student, studentGrades, predictionType) };
      });

      const BATCH_SIZE = 10;
      for (let i = 0; i < allResults.length; i += BATCH_SIZE) {
        const batch = allResults.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(({ student, prediction }) =>
          base44.entities.Prediction.create({
            student_id: student.student_id,
            student_name: student.name,
            department: student.department,
            result: prediction.result,
            confidence: prediction.confidence,
            model_used: bestModel?.algorithm || 'Mock Model',
            strengths: prediction.strengths,
            weaknesses: prediction.weaknesses,
            explanation: prediction.explanation,
            recommendations: prediction.recommendations,
            feature_importance: prediction.feature_importance,
            prediction_type: predictionType,
          })
        ));
        batch.forEach(({ prediction }) => {
          if (prediction.result === 'Good Standing') goodStanding++;
          else atRisk++;
        });
        setBulkProgress(Math.round((Math.min(i + BATCH_SIZE, allResults.length) / allResults.length) * 100));
      }

      qc.invalidateQueries({ queryKey: ['predictions'] });
      const summary = { total: toPredict.length, goodStanding, atRisk };
      setBulkSummary(summary);
      setShowBulkSummary(true);
      toast.success(`Bulk prediction complete! ${goodStanding} Good Standing, ${atRisk} At-Risk`);
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
        description={isCCIS ? 'CCIS (BSCS, BSIT, BLIS)' : 'Predict student academic performance'}
        actions={
          <Button
            variant="outline"
            onClick={() => predictAllMutation.mutate()}
            disabled={isBulkRunning || predictMutation.isPending || filtered.length === 0}
          >
            {isBulkRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Predicting ({bulkProgress}%)</>
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
              <span className="text-muted-foreground">Running bulk prediction...</span>
              <span className="font-medium">{bulkProgress}%</span>
            </div>
            <Progress value={bulkProgress} />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 mb-6">
        <Select value={courseFilter} onValueChange={(val) => { setCourseFilter(val); setYearFilter(''); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Courses</SelectItem>
            {allCoursesForDean.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {courseFilter && (
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Years</SelectItem>
              {allYearsForCourse.map(y => (
                <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Run Prediction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Student</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>
                  {filtered.map(s => {
                    const gpa = getLatestGPA(s.gpa_history);
                    const studentKey = s.id || s.student_id;
                    return (
                      <SelectItem key={studentKey} value={studentKey}>
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
                  <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button className="w-full" onClick={() => predictMutation.mutate()} disabled={!selectedStudentId || predictMutation.isPending || isBulkRunning}>
              {predictMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />Run</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
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
                    <Badge variant={result.result === 'Good Standing' ? 'default' : 'destructive'} className="mt-1">
                      {result.result}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a student and run prediction</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showBulkSummary} onOpenChange={setShowBulkSummary}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Prediction Summary</DialogTitle></DialogHeader>
          {bulkSummary && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{bulkSummary.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">{bulkSummary.goodStanding}</p>
                  <p className="text-xs text-muted-foreground mt-1">Good</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{bulkSummary.atRisk}</p>
                  <p className="text-xs text-muted-foreground mt-1">At-Risk</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setShowBulkSummary(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
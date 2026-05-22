import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

const ALGORITHMS = ['Decision Tree', 'Random Forest', 'SVM', 'KNN', 'Naive Bayes'];

const DEPARTMENT_COURSES = {
  'CCIS': ['BSCS', 'BSIT', 'BSIS', 'BLIS'],
  'CAS': ['AB English', 'BA English Language'],
  'CBM': ['BSBA-FM', 'BSBA-HRM', 'BSBA-MR', 'BSBA-OM', 'BPA', 'BSE'],
  'CCJE': ['BS-Criminology'],
  'CTE': ['BEed', 'BSed', 'BECE', 'BPE', 'BTVTE'],
  'CTHM': ['BSHM', 'BSTM', 'DHMT', 'DTMT']
};

export default function DeanTraining() {
  const { portalUser } = usePortalAuth();
  const [courseFilter, setCourseFilter] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentAlgo, setCurrentAlgo] = useState('');
  const [trainResult, setTrainResult] = useState(null);
  const [trainingLog, setTrainingLog] = useState([]);
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });

  // Determine department from portal user identifier
  const getDepartment = () => {
    if (!portalUser?.identifier) return null;
    if (portalUser.identifier.includes('ccis')) return 'CCIS';
    if (portalUser.identifier.includes('cas')) return 'CAS';
    if (portalUser.identifier.includes('cbm')) return 'CBM';
    if (portalUser.identifier.includes('ccje')) return 'CCJE';
    if (portalUser.identifier.includes('cte')) return 'CTE';
    if (portalUser.identifier.includes('cthm')) return 'CTHM';
    return null;
  };

  const department = getDepartment();
  const departmentCourses = department ? DEPARTMENT_COURSES[department] : [];

  const allCourses = department
    ? departmentCourses
    : [...new Set(students.map(s => s.course))].filter(Boolean);

  const filtered = department
    ? students.filter(s => courseFilter ? s.course === courseFilter : departmentCourses.includes(s.course))
    : students.filter(s => courseFilter ? s.course === courseFilter : true);

  const trainMutation = useMutation({
    mutationFn: async () => {
      if (filtered.length === 0) throw new Error('No students available to train on.');
      setTrainResult(null);
      setTrainingLog([]);

      const subjectGrades = await base44.entities.SubjectGrade.list();

      // Use fixed random seed for reproducible results
      const randomSeed = 123;

      const response = await fetch('http://localhost:5000/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: filtered,
          subject_grades: subjectGrades,
          random_seed: randomSeed
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Training failed');
      }

      // Capture training log from backend
      if (data.training_log) {
        setTrainingLog(data.training_log);
      }

      for (let i = 0; i < data.results.length; i++) {
        const algo = data.results[i].algorithm;
        setCurrentAlgo(algo);
        setProgress(Math.round(((i + 1) / data.results.length) * 100));
        await new Promise(r => setTimeout(r, 200));
      }

      setProgress(100);
      setCurrentAlgo('');

      for (const r of data.results) {
        await base44.entities.TrainingLog.create({
          ...r,
          is_best: r.algorithm === data.best.algorithm,
          department: department || (courseFilter ? courseFilter : 'All'),
          training_session_id: data.session_id,
          dataset_size: filtered.length,
          random_seed: data.random_seed || randomSeed,
        });
      }

      qc.invalidateQueries({ queryKey: ['trainingLogs'] });
      return data.best;
    },
    onSuccess: (best) => {
      setTrainResult({ success: true, best });
      toast.success(`Training complete! Best model: ${best.algorithm} (${(best.accuracy * 100).toFixed(1)}%)`);
    },
    onError: (err) => {
      setTrainResult({ success: false, error: err.message });
      setCurrentAlgo('');
      toast.error('Training failed: ' + err.message);
    },
  });

  const handleTrain = () => {
    setProgress(0);
    setTrainResult(null);
    setTrainingLog([]);
    trainMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Model Training"
        description={department ? `Training for ${department} (${departmentCourses.join(', ')})` : 'Train prediction models'}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Train Prediction Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {department && (
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All {department} Courses</SelectItem>
                {departmentCourses.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Algorithms:</p>
            <div className="flex flex-wrap gap-2">
              {ALGORITHMS.map(algo => (
                <span key={algo} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {algo}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-1">
            <p className="text-sm"><span className="font-medium">Dataset size:</span> {filtered.length} students</p>
            <p className="text-sm"><span className="font-medium">Metrics:</span> Accuracy, Precision, Recall, F1, ROC AUC</p>
            <p className="text-sm"><span className="font-medium">Institution:</span> Saint Michael College of Caraga</p>
          </div>

          {trainMutation.isPending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Training: <strong>{currentAlgo}</strong></span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">Please wait, this may take a minute...</p>
            </div>
          )}

          {trainResult?.success && !trainMutation.isPending && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Training completed successfully!</p>
                <p className="text-xs mt-0.5">Best model: {trainResult.best.algorithm} — {(trainResult.best.accuracy * 100).toFixed(1)}% accuracy</p>
              </div>
            </div>
          )}

          {trainResult?.success === false && !trainMutation.isPending && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Training failed: {trainResult.error}</p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleTrain}
            disabled={trainMutation.isPending || filtered.length === 0}
          >
            {trainMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Training in Progress...</>
            ) : trainResult?.success ? (
              <><Play className="w-4 h-4 mr-2" />Retrain Model</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Start Training</>
            )}
          </Button>

          {filtered.length === 0 && (
            <p className="text-sm text-destructive text-center">No students found. Add student records before training.</p>
          )}

          {trainingLog.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Training Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50 p-4">
                  <div className="font-mono text-xs space-y-1">
                    {trainingLog.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                        <span className="text-muted-foreground shrink-0">{log.step}</span>
                        <span className={log.status === '✓' ? 'text-emerald-600' : log.status === '✗' ? 'text-red-600' : 'text-blue-600'}>
                          {log.status}
                        </span>
                        <span className="text-foreground">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
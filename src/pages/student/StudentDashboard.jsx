import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Brain, TrendingUp, AlertTriangle, CheckCircle, BookOpen, User, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getGradeLabel, getLatestGPA, getGradeVariant } from '@/utils/grading';

export default function StudentDashboard() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id || portalUser?.studentData?.student_id;

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: grades = [] } = useQuery({ queryKey: ['grades'], queryFn: () => base44.entities.SubjectGrade.list() });

  const student = students.find(s => s.student_id === studentId) || portalUser?.studentData;
  const myPredictions = predictions.filter(p => p.student_id === studentId);
  const myGrades = grades.filter(g => g.student_id === studentId);
  const latestPrediction = myPredictions[0];

  // Build GPA history from individual GPA columns
  const gpaHistory = student ? [
    { semester: '1st Yr 1st Sem', gpa: student.gpa_y1s1 },
    { semester: '1st Yr 2nd Sem', gpa: student.gpa_y1s2 },
    { semester: '2nd Yr 1st Sem', gpa: student.gpa_y2s1 },
    { semester: '2nd Yr 2nd Sem', gpa: student.gpa_y2s2 },
    { semester: '3rd Yr 1st Sem', gpa: student.gpa_y3s1 },
  ].filter(h => h.gpa !== null && h.gpa !== undefined) : [];
  const currentGPA = getLatestGPA(gpaHistory);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${student?.full_name || portalUser?.displayName || 'Student'}`}
        description="Your personal academic performance dashboard"
      />

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="font-semibold">{student.student_id}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold">{student.full_name}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Course</p>
                <p className="font-semibold">{student.course}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-semibold">{student.department}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Year Level</p>
                <p className="font-semibold">Year {student.year_level}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-sm">{student.email || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Scholarship</p>
                <p className="font-semibold capitalize">{student.scholarship || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={student.status === 'active' ? 'default' : 'outline'} className="capitalize text-xs mt-0.5">{student.status || 'active'}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Student record not found. Contact your administrator.</p>
          )}
        </CardContent>
      </Card>

      {/* GPA Summary + Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Current GPA</p>
            <p className="font-bold text-lg">{currentGPA ? currentGPA.toFixed(2) : 'N/A'}</p>
            {currentGPA && <p className="text-xs text-muted-foreground">{getGradeLabel(currentGPA)}</p>}
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-accent/10"><BookOpen className="w-5 h-5 text-accent" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Subjects Recorded</p>
            <p className="font-bold text-lg">{myGrades.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center gap-4">
          <div className={`p-2.5 rounded-lg ${latestPrediction?.result === 'At-Risk' || latestPrediction?.result === 'Moderate Risk' ? 'bg-destructive/10' : 'bg-emerald-50'}`}>
            {latestPrediction?.result === 'At-Risk' || latestPrediction?.result === 'Moderate Risk'
              ? <AlertTriangle className="w-5 h-5 text-destructive" />
              : <CheckCircle className="w-5 h-5 text-emerald-500" />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Academic Status</p>
            <p className="font-bold text-sm">{latestPrediction?.result === 'Moderate Risk' ? 'At-Risk' : (latestPrediction?.result || 'No prediction yet')}</p>
          </div>
        </div>
      </div>

      {/* GPA History Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> GPA History (Philippine Scale: 1.0 = Best, 3.0 = Passing, 5.0 = Failed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gpaHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={gpaHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semester" fontSize={11} />
                <YAxis domain={[1, 5]} reversed fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(v) => [`${v} (${getGradeLabel(v)})`, 'GPA']} />
                <Line type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No GPA history available</p>
          )}
        </CardContent>
      </Card>

      {/* Subject Grades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Subject Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-left p-3 font-medium">Grade</th>
                    <th className="text-left p-3 font-medium">Remark</th>
                    <th className="text-left p-3 font-medium">Semester</th>
                    <th className="text-left p-3 font-medium">School Year</th>
                  </tr>
                </thead>
                <tbody>
                  {myGrades.map(g => (
                    <tr key={g.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">{g.subject}</td>
                      <td className="p-3 font-mono font-semibold">{g.grade?.toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={getGradeVariant(g.grade)} className="text-xs">{getGradeLabel(g.grade)}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{g.semester}</td>
                      <td className="p-3 text-muted-foreground">{g.school_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No grades recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {latestPrediction && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Prediction Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              {(latestPrediction.result === 'Good Standing')
                ? <CheckCircle className="w-10 h-10 text-emerald-500 flex-shrink-0" />
                : <AlertTriangle className="w-10 h-10 text-destructive flex-shrink-0" />}
              <div>
                <Badge variant={(latestPrediction.result === 'Good Standing') ? 'default' : 'destructive'} className="mb-1">
                  {latestPrediction.result === 'Moderate Risk' ? 'At-Risk' : latestPrediction.result}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Confidence: {((latestPrediction.confidence || 0) * 100).toFixed(0)}% • Model: {latestPrediction.model_used}
                </p>
                {latestPrediction.explanation && (
                  <p className="text-sm mt-1">{latestPrediction.explanation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestPrediction.strengths?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-600 text-sm mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {latestPrediction.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {latestPrediction.weaknesses?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-destructive text-sm mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses
                  </h4>
                  <ul className="space-y-1.5">
                    {latestPrediction.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {latestPrediction.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Recommendations
                </h4>
                <div className="space-y-1.5">
                  {latestPrediction.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
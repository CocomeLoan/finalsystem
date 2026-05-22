import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getGradeLabel, getGradeVariant } from '@/utils/grading';

export default function StudentGrades() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id;

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: grades = [] } = useQuery({ queryKey: ['grades'], queryFn: () => base44.entities.SubjectGrade.list() });

  const student = students.find(s => s.student_id === studentId);
  const myGrades = grades.filter(g => g.student_id === studentId);

  // Build GPA history from individual GPA columns
  const gpaHistory = student ? [
    { semester: '1st Yr 1st Sem', gpa: student.gpa_y1s1 },
    { semester: '1st Yr 2nd Sem', gpa: student.gpa_y1s2 },
    { semester: '2nd Yr 1st Sem', gpa: student.gpa_y2s1 },
    { semester: '2nd Yr 2nd Sem', gpa: student.gpa_y2s2 },
    { semester: '3rd Yr 1st Sem', gpa: student.gpa_y3s1 },
  ].filter(h => h.gpa !== null && h.gpa !== undefined) : [];

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'grade', label: 'Grade', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold">{row.grade?.toFixed(2)}</span>
        <Badge variant={getGradeVariant(row.grade)} className="text-xs">{getGradeLabel(row.grade)}</Badge>
      </div>
    )},
    { key: 'semester', label: 'Semester' },
    { key: 'school_year', label: 'School Year' },
  ];

  const subjectChartData = myGrades.map(g => ({
    subject: g.subject?.length > 12 ? g.subject.substring(0, 12) + '...' : g.subject,
    grade: g.grade,
  }));

  return (
    <div>
      <PageHeader title="My Grades" description="View your GPA history and subject grades" />

      {gpaHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">GPA History (Per Semester)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gpaHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semester" fontSize={10} />
                <YAxis domain={[1, 5]} reversed fontSize={11} label={{ value: 'GPA (1.0=Best, 5.0=Worst)', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => value?.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="GPA" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {subjectChartData.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Subject Grades</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" fontSize={10} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[1, 5]} reversed fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="grade" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {myGrades.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Subject Grades Details</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={columns} data={myGrades} searchField="subject" />
          </CardContent>
        </Card>
      )}

      {gpaHistory.length === 0 && myGrades.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="text-muted-foreground">
            <p>No grades available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { GraduationCap, Brain, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DeanDashboard() {
  const { portalUser } = usePortalAuth();
  const isCCIS = portalUser?.identifier === 'dean.ccis@smcc.edu';
  const dept = isCCIS ? 'CCIS' : (portalUser?.department || '');

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list() });

  const CCIS_COURSES = ['BSCS', 'BSIT', 'BLIS'];
  const deptStudents = isCCIS
    ? students.filter(s => CCIS_COURSES.includes(s.course))
    : students.filter(s => s.department === dept);
  const deptPredictions = predictions.filter(p => {
    const student = students.find(s => s.student_id === p.student_id);
    if (!student) return false;
    if (isCCIS) {
      return CCIS_COURSES.includes(student.course);
    }
    return student.department === dept;
  });
  const deptConcerns = concerns.filter(c => {
    const student = students.find(s => s.student_id === c.student_id);
    if (!student) return false;
    if (isCCIS) {
      return CCIS_COURSES.includes(student.course);
    }
    return student.department === dept;
  });
  const atRisk = deptPredictions.filter(p => {
    const result = p.result?.toLowerCase() || '';
    return result.includes('at-risk') || result.includes('at risk') || result === 'atrisk';
  });

  console.log('Dean Dashboard Debug:', {
    isCCIS,
    dept,
    totalStudents: students.length,
    deptStudents: deptStudents.length,
    totalPredictions: predictions.length,
    deptPredictions: deptPredictions.length,
    atRisk: atRisk.length,
    totalConcerns: concerns.length,
    deptConcerns: deptConcerns.length,
    pendingConcerns: deptConcerns.filter(c => {
      const status = c.status?.toLowerCase() || '';
      return status !== 'resolved';
    }).length,
    allPredictionResults: [...new Set(predictions.map(p => p.result))],
    allConcernStatuses: [...new Set(concerns.map(c => c.status))],
  });

  return (
    <div>
      <PageHeader title="Dean Dashboard" description={`Department: ${dept || 'Not assigned'}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Dept. Students" value={deptStudents.length} icon={GraduationCap} color="primary" />
        <StatsCard title="Predictions" value={deptPredictions.length} icon={Brain} color="accent" />
        <StatsCard title="At-Risk" value={atRisk.length} icon={AlertTriangle} color="destructive" />
        <StatsCard title="Concerns" value={deptConcerns.filter(c => {
          const status = c.status?.toLowerCase() || '';
          return status !== 'resolved';
        }).length} icon={MessageSquare} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent At-Risk Students</CardTitle></CardHeader>
          <CardContent>
            {atRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">No at-risk students</p>
            ) : (
              <div className="space-y-3">
                {atRisk.slice(0, 5).map(p => {
                  const student = students.find(s => s.student_id === p.student_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                      <div>
                        <p className="text-sm font-medium">{student?.full_name || p.student_id}</p>
                        <p className="text-xs text-muted-foreground">{student?.course || ''} • {p.model_used}</p>
                      </div>
                      <Badge variant="destructive">At-Risk</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Concerns</CardTitle></CardHeader>
          <CardContent>
            {deptConcerns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No concerns submitted</p>
            ) : (
              <div className="space-y-3">
                {deptConcerns.slice(0, 5).map(c => {
                  const student = students.find(s => s.student_id === c.student_id);
                  return (
                    <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{student?.full_name || c.student_id}</p>
                        <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
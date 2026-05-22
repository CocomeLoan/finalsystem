import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { GraduationCap, Brain, MessageSquare, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list() });
  const { data: trainingLogs = [] } = useQuery({ queryKey: ['trainingLogs'], queryFn: () => base44.entities.TrainingLog.list() });

  const atRisk = predictions.filter(p => {
    const result = p.result?.toLowerCase() || '';
    return result.includes('at-risk') || result.includes('at risk') || result === 'atrisk';
  }).length;
  const goodStanding = predictions.filter(p => {
    const result = p.result?.toLowerCase() || '';
    return result.includes('good standing');
  }).length;
  const pendingConcerns = concerns.filter(c => {
    const status = c.status?.toLowerCase() || '';
    return status !== 'resolved';
  }).length;

  const deptData = students.reduce((acc, s) => {
    const dept = s.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const deptChartData = Object.entries(deptData).map(([name, value]) => ({ name: name.split(' ').map(w => w[0]).join(''), full: name, value }));

  const predictionPieData = [
    { name: 'Good Standing', value: goodStanding },
    { name: 'At-Risk', value: atRisk },
  ];
  const COLORS = ['hsl(142, 70%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of the academic performance system" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Students" value={students.length} icon={GraduationCap} color="primary" />
        <StatsCard title="Predictions Made" value={predictions.length} icon={Brain} color="accent" />
        <StatsCard title="At-Risk Students" value={atRisk} icon={AlertTriangle} color="destructive" />
        <StatsCard title="Pending Concerns" value={pendingConcerns} icon={MessageSquare} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-card border rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.full}</p>
                          <p className="text-sm text-muted-foreground">{payload[0].value} students</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No student data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prediction Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={predictionPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {predictionPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No predictions yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            {concerns.length === 0 ? (
              <p className="text-muted-foreground text-sm">No concerns submitted</p>
            ) : (
              <div className="space-y-3">
                {concerns.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.name || c.student_id}</p>
                      <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                    </div>
                    <Badge variant={c.status === 'pending' ? 'destructive' : 'secondary'} className="flex-shrink-0 text-xs">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training History</CardTitle>
          </CardHeader>
          <CardContent>
            {trainingLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No training sessions yet</p>
            ) : (
              <div className="space-y-3">
                {trainingLogs.filter(t => t.is_best).slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{t.algorithm}</p>
                      <p className="text-xs text-muted-foreground">{t.department || 'All'}</p>
                    </div>
                    <Badge variant="outline">{(t.accuracy * 100).toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
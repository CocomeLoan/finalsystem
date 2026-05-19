import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/shared/StatsCard';
import { GraduationCap, Brain, AlertTriangle, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportsPage() {
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list() });

  const atRisk = predictions.filter(p => p.result === 'At-Risk');
  const goodStanding = predictions.filter(p => p.result === 'Good Standing');

  const deptPredictions = predictions.reduce((acc, p) => {
    const dept = p.department || 'Unknown';
    if (!acc[dept]) acc[dept] = { name: dept, good: 0, atRisk: 0 };
    if (p.result === 'Good Standing') acc[dept].good++;
    else acc[dept].atRisk++;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Reports" description="Academic performance reports and analytics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Students" value={students.length} icon={GraduationCap} color="primary" />
        <StatsCard title="Good Standing" value={goodStanding.length} icon={CheckCircle} color="success" />
        <StatsCard title="At-Risk" value={atRisk.length} icon={AlertTriangle} color="destructive" />
        <StatsCard title="Concerns" value={concerns.length} icon={MessageSquare} color="accent" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Predictions by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.values(deptPredictions).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.values(deptPredictions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={60} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="good" fill="hsl(160, 60%, 45%)" name="Good Standing" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" fill="hsl(0, 84%, 60%)" name="At-Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No prediction data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
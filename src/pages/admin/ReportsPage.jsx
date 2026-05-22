import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Brain, AlertTriangle, CheckCircle, TrendingUp, MessageSquare, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportsPage() {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list() });

  // Filter predictions by department
  const filteredPredictions = departmentFilter === 'all'
    ? predictions
    : predictions.filter(p => p.department === departmentFilter);

  // Check for different possible result values
  const atRisk = filteredPredictions.filter(p => 
    p.result === 'At-Risk' ||
    p.result === 'At Risk' ||
    p.result === 'at-risk' ||
    p.result === 'High Risk'
  );
  const goodStanding = filteredPredictions.filter(p => 
    p.result === 'Good Standing' || 
    p.result === 'Good standing' ||
    p.result === 'good standing'
  );

  const deptPredictions = filteredPredictions.reduce((acc, p) => {
    const dept = p.department || 'Unknown';
    if (!acc[dept]) acc[dept] = { name: dept, good: 0, atRisk: 0 };
    const isGood = p.result === 'Good Standing' || p.result === 'Good standing' || p.result === 'good standing';
    if (isGood) acc[dept].good++;
    else acc[dept].atRisk++;
    return acc;
  }, {});

  const allDepartments = [...new Set(predictions.map(p => p.department))].filter(Boolean).sort();

  const handlePrint = () => {
    const printContent = filteredPredictions.map(p => ({
      'Student ID': p.student_id,
      'Name': p.student_name || '—',
      'Department': p.department || '—',
      'Result': p.result || '—',
      'Confidence': `${((p.confidence || 0) * 100).toFixed(0)}%`,
      'Model': p.model_used || '—',
      'Date': p.created_date ? new Date(p.created_date).toLocaleDateString() : '—',
    }));

    const csvContent = [
      Object.keys(printContent[0]).join(','),
      ...printContent.map(row => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${departmentFilter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader 
        title="Reports" 
        description="Academic performance reports and analytics"
        actions={
          <div className="flex gap-3">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {allDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} disabled={filteredPredictions.length === 0}>
              <Printer className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

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
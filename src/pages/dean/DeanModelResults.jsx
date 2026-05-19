import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { Trophy, Calendar, Brain, TrendingUp } from 'lucide-react';

export default function DeanModelResults() {
  const { data: logs = [] } = useQuery({
    queryKey: ['trainingLogs'],
    queryFn: () => base44.entities.TrainingLog.list(),
    refetchInterval: 5000
  });
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestSession = sortedLogs.length > 0 ? sortedLogs[0]?.training_session_id : null;
  const sessionLogs = sortedLogs.filter(l => l.training_session_id === latestSession);
  const bestModel = sessionLogs.find(l => l.is_best);
  const latestDate = sortedLogs[0]?.created_at;

  const accuracyData = sessionLogs.map(l => ({
    name: l.algorithm,
    accuracy: +(l.accuracy * 100).toFixed(1),
    precision: +(l.precision * 100).toFixed(1),
    recall: +(l.recall * 100).toFixed(1),
    f1: +(l.f1_score * 100).toFixed(1),
    roc_auc: +(l.roc_auc * 100).toFixed(1),
  }));

  const radarData = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'].map(metric => {
    const point = { metric: metric.toUpperCase().replace('_', ' ') };
    sessionLogs.forEach(l => {
      point[l.algorithm] = +(l[metric === 'f1' ? 'f1_score' : metric] * 100).toFixed(1);
    });
    return point;
  });

  if (sessionLogs.length === 0) {
    return (
      <div>
        <PageHeader title="Model Results" description="View ML model performance metrics" />
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center text-muted-foreground">
            No training results yet. The model has not been trained.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Model Results"
        description={`Latest training session • Saint Michael College of Caraga`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Best Model</p>
            </div>
            <p className="text-lg font-bold">{bestModel?.algorithm}</p>
            <Badge className="bg-emerald-100 text-emerald-700 mt-1">
              {bestModel ? (bestModel.accuracy * 100).toFixed(1) + '% accuracy' : '—'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">F1 Score</p>
            </div>
            <p className="text-lg font-bold">{bestModel ? (bestModel.f1_score * 100).toFixed(1) + '%' : '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Precision: {bestModel ? (bestModel.precision * 100).toFixed(1) + '%' : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Total Predictions</p>
            </div>
            <p className="text-lg font-bold">{predictions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {predictions.filter(p => p.result === 'At-Risk').length} At-Risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Last Trained</p>
            </div>
            <p className="text-sm font-bold">
              {latestDate ? new Date(latestDate).toLocaleDateString() : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {latestDate ? new Date(latestDate).toLocaleTimeString() : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Accuracy Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Metrics Radar</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                {sessionLogs.map((l, i) => (
                  <Radar key={l.algorithm} name={l.algorithm} dataKey={l.algorithm}
                    stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
                    fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                    fillOpacity={0.12} />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* All metrics */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">All Metrics Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis domain={[0, 100]} fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="accuracy" fill="hsl(var(--chart-1))" radius={[2,2,0,0]} />
              <Bar dataKey="precision" fill="hsl(var(--chart-2))" radius={[2,2,0,0]} />
              <Bar dataKey="recall" fill="hsl(var(--chart-3))" radius={[2,2,0,0]} />
              <Bar dataKey="f1" fill="hsl(var(--chart-4))" radius={[2,2,0,0]} name="F1 Score" />
              <Bar dataKey="roc_auc" fill="hsl(var(--chart-5))" radius={[2,2,0,0]} name="ROC AUC" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detailed Metrics Table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Algorithm</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Precision</TableHead>
                <TableHead>Recall</TableHead>
                <TableHead>F1 Score</TableHead>
                <TableHead>ROC AUC</TableHead>
                <TableHead>Dataset Size</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionLogs.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.algorithm}</TableCell>
                  <TableCell>{(l.accuracy * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.precision * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.recall * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.f1_score * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.roc_auc * 100).toFixed(1)}%</TableCell>
                  <TableCell>{l.dataset_size || '—'}</TableCell>
                  <TableCell>
                    {l.is_best
                      ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><Trophy className="w-3 h-3 mr-1" />Best Model</Badge>
                      : <Badge variant="outline">Evaluated</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
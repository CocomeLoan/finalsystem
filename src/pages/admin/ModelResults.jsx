import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line } from 'recharts';

export default function ModelResults() {
  const { data: logs = [] } = useQuery({ 
    queryKey: ['trainingLogs'], 
    queryFn: () => base44.entities.TrainingLog.list(),
    refetchInterval: 5000
  });

  const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestSession = sortedLogs.length > 0 ? sortedLogs[0]?.training_session_id : null;
  const sessionLogs = sortedLogs.filter(l => l.training_session_id === latestSession);
  const bestModel = sessionLogs.find(l => l.is_best);

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
        <PageHeader title="Model Results" />
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center text-muted-foreground">
            No training results yet. Train the model first.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Model Results & Visualization" description={`Latest training session • Best: ${bestModel?.algorithm}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accuracy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metrics Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                {sessionLogs.map((l, i) => (
                  <Radar key={l.algorithm} name={l.algorithm} dataKey={l.algorithm}
                    stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
                    fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                    fillOpacity={0.1} />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metrics Table</CardTitle>
        </CardHeader>
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
                  <TableCell>
                    {l.is_best ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Best Model</Badge>
                    ) : (
                      <Badge variant="outline">Evaluated</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader><CardTitle className="text-base">All Metrics Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

        <Card>
          <CardHeader><CardTitle className="text-base">ROC-AUC & F1 Score Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis domain={[0, 100]} fontSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="roc_auc" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 5 }} name="ROC AUC" />
                <Line type="monotone" dataKey="f1" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 5 }} name="F1 Score" />
                <Line type="monotone" dataKey="precision" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Precision" />
                <Line type="monotone" dataKey="recall" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Recall" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
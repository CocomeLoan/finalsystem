import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { Eye, Trophy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TrainingLogsPage() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const qc = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['trainingLogs'],
    queryFn: () => base44.entities.TrainingLog.list('-created_at'),
  });

  const sessions = logs.reduce((acc, log) => {
    const sid = log.training_session_id || log.id;
    if (!acc[sid]) acc[sid] = { id: sid, logs: [], date: log.created_at };
    acc[sid].logs.push(log);
    return acc;
  }, {});

  const sessionList = Object.values(sessions).sort((a, b) => new Date(b.date) - new Date(a.date));

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      const session = sessions[sessionId];
      for (const log of session.logs) {
        await base44.entities.TrainingLog.delete(log.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainingLogs'] });
      setDeletingSession(null);
      toast.success('Training session deleted');
    },
  });

  const modalLogs = selectedSession ? sessions[selectedSession]?.logs || [] : [];
  const bestModel = modalLogs.find(l => l.is_best);
  const accuracyData = modalLogs.map(l => ({
    name: l.algorithm,
    accuracy: +(l.accuracy * 100).toFixed(1),
    precision: +(l.precision * 100).toFixed(1),
    recall: +(l.recall * 100).toFixed(1),
    f1: +(l.f1_score * 100).toFixed(1),
    roc_auc: +(l.roc_auc * 100).toFixed(1),
  }));
  const radarData = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'].map(metric => {
    const point = { metric: metric.toUpperCase().replace('_', ' ') };
    modalLogs.forEach(l => { point[l.algorithm] = +(l[metric === 'f1' ? 'f1_score' : metric] * 100).toFixed(1); });
    return point;
  });

  return (
    <div>
      <PageHeader title="Training Logs" description="History of all model training sessions" />

      {sessionList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No training sessions recorded yet.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>#</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Algorithms</TableHead>
                  <TableHead>Best Model</TableHead>
                  <TableHead>Best Accuracy</TableHead>
                  <TableHead>Dataset</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionList.map((session, idx) => {
                  const best = session.logs.find(l => l.is_best) || session.logs[0];
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="text-muted-foreground text-xs">{sessionList.length - idx}</TableCell>
                      <TableCell className="text-sm">
                        {session.date ? new Date(session.date).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {session.logs.map(l => (
                            <Badge key={l.id} variant="outline" className="text-xs">{l.algorithm}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-medium text-sm">{best?.algorithm}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {best ? (best.accuracy * 100).toFixed(1) + '%' : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{best?.dataset_size || '—'} students</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setSelectedSession(session.id)}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeletingSession(session.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Session Details — Best: {bestModel?.algorithm}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-semibold mb-2">Accuracy Comparison</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--chart-1))" radius={[3,3,0,0]} />
                    <Bar dataKey="precision" fill="hsl(var(--chart-2))" radius={[3,3,0,0]} />
                    <Bar dataKey="recall" fill="hsl(var(--chart-3))" radius={[3,3,0,0]} />
                    <Bar dataKey="f1" fill="hsl(var(--chart-4))" name="F1" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-semibold mb-2">Metrics Radar</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" fontSize={9} />
                    <PolarRadiusAxis domain={[0, 100]} fontSize={9} />
                    {modalLogs.map((l, i) => (
                      <Radar key={l.algorithm} name={l.algorithm} dataKey={l.algorithm}
                        stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
                        fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                        fillOpacity={0.15} />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

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
              {modalLogs.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.algorithm}</TableCell>
                  <TableCell>{(l.accuracy * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.precision * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.recall * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.f1_score * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(l.roc_auc * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    {l.is_best
                      ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Best Model</Badge>
                      : <Badge variant="outline">Evaluated</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSession} onOpenChange={() => setDeletingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Session</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all logs in this training session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSessionMutation.mutate(deletingSession)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, AlertTriangle, TrendingUp, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function PredictionDetail({ prediction }) {
  if (!prediction) return null;
  const featureData = prediction.feature_importance?.map(f => ({
    name: f.feature?.length > 15 ? f.feature.substring(0, 15) + '...' : f.feature,
    importance: +((f.importance || 0) * 100).toFixed(1),
  })) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {prediction.result === 'Good Standing' ? (
          <div className="p-3 rounded-full bg-emerald-50"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
        ) : (
          <div className="p-3 rounded-full bg-destructive/10"><AlertTriangle className="w-8 h-8 text-destructive" /></div>
        )}
        <div>
          <h3 className="text-lg font-bold">{prediction.student_name || prediction.student_id}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={prediction.result === 'Good Standing' ? 'default' : 'destructive'}>{prediction.result}</Badge>
            <span className="text-sm text-muted-foreground">
              {((prediction.confidence || 0) * 100).toFixed(0)}% confidence • {prediction.model_used} • {prediction.prediction_type}
            </span>
          </div>
        </div>
      </div>
      {prediction.explanation && (
        <div>
          <h4 className="font-semibold mb-1 text-sm">Explanation (XAI)</h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{prediction.explanation}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2 text-emerald-600 text-sm">Strengths</h4>
          <ul className="space-y-1">
            {prediction.strengths?.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-destructive text-sm">Weaknesses</h4>
          <ul className="space-y-1">
            {prediction.weaknesses?.map((w, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {prediction.recommendations?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
          <div className="space-y-1">
            {prediction.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {featureData.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Feature Importance (XAI)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} fontSize={10} />
              <YAxis type="category" dataKey="name" fontSize={10} width={110} />
              <Tooltip />
              <Bar dataKey="importance" fill="hsl(var(--accent))" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function PredictionLogsPage() {
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const qc = useQueryClient();

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Prediction.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] });
      setDeleting(null);
      toast.success('Prediction log deleted');
    },
  });

  return (
    <div>
      <PageHeader title="Prediction Logs" description="All prediction activities and XAI results" />

      {predictions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No predictions recorded yet.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model Used</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground text-xs">{predictions.length - idx}</TableCell>
                    <TableCell className="font-medium text-sm">{p.student_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.student_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{p.prediction_type || 'basic'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.model_used}</TableCell>
                    <TableCell>
                      <Badge variant={p.result === 'Good Standing' ? 'default' : 'destructive'} className="text-xs">
                        {p.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{((p.confidence || 0) * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.created_date ? new Date(p.created_date).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleting(p)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          <PredictionDetail prediction={selected} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prediction Log</AlertDialogTitle>
            <AlertDialogDescription>
              Delete prediction for {deleting?.student_name || deleting?.student_id}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleting.id)}
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
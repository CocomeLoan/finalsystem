import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentPrediction() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id;

  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const myPredictions = predictions.filter(p => p.student_id === studentId);
  const latest = myPredictions[0];

  if (!latest) {
    return (
      <div>
        <PageHeader title="My Prediction" />
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No prediction available yet. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featureData = latest.feature_importance?.map(f => ({
    name: f.feature?.length > 15 ? f.feature.substring(0, 15) + '...' : f.feature,
    importance: +((f.importance || 0) * 100).toFixed(1),
  })) || [];

  return (
    <div>
      <PageHeader title="My Prediction" description="Your academic performance analysis (read-only)" />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {latest.result === 'Good Standing' ? (
              <div className="p-4 rounded-full bg-emerald-50"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
            ) : (
              <div className="p-4 rounded-full bg-destructive/10"><AlertTriangle className="w-10 h-10 text-destructive" /></div>
            )}
            <div>
              <Badge variant={latest.result === 'Good Standing' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                {latest.result}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Confidence: {((latest.confidence || 0) * 100).toFixed(0)}% • Model: {latest.model_used} • Type: {latest.prediction_type}
              </p>
            </div>
          </div>

          {latest.explanation && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Explanation (XAI)</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">{latest.explanation}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3 text-emerald-600">Strengths</h3>
              <ul className="space-y-2">
                {latest.strengths?.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-destructive">Weaknesses</h3>
              <ul className="space-y-2">
                {latest.weaknesses?.map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recommendations</h3>
            <div className="space-y-2">
              {latest.recommendations?.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {featureData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Feature Importance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={11} width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="importance" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
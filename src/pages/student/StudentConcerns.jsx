import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentConcerns() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id;
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list('-created_date') });

  const student = students.find(s => s.student_id === studentId);
  const myConcerns = concerns.filter(c => c.student_id === studentId);

  const submitMutation = useMutation({
    mutationFn: (msg) => base44.entities.Concern.create({
      student_id: studentId,
      student_name: student?.name || portalUser?.displayName,
      department: student?.department || '',
      message: msg,
      status: 'pending',
    }),
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({ queryKey: ['concerns'] });
      toast.success('Concern submitted successfully');
    },
  });

  const statusIcons = {
    pending: <Clock className="w-3.5 h-3.5" />,
    reviewed: <MessageSquare className="w-3.5 h-3.5" />,
    resolved: <CheckCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div>
      <PageHeader title="Submit a Concern" description="Share your academic concerns or problems" />

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">New Concern</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your academic concern or problem..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={() => submitMutation.mutate(message)} disabled={!message.trim() || submitMutation.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit Concern'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">My Previous Concerns</CardTitle></CardHeader>
        <CardContent>
          {myConcerns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No concerns submitted yet</p>
          ) : (
            <div className="space-y-3">
              {myConcerns.map(c => (
                <div key={c.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      {c.created_date ? new Date(c.created_date).toLocaleDateString() : ''}
                    </p>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      {statusIcons[c.status || 'pending']}
                      {c.status || 'pending'}
                    </Badge>
                  </div>
                  <p className="text-sm">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
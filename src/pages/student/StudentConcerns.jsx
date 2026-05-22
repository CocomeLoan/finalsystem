import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Clock, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentConcerns() {
  const { portalUser } = usePortalAuth();
  const studentId = portalUser?.student_id;
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState({});
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: concerns = [], error: concernsError } = useQuery({
    queryKey: ['concerns'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Concern.list('-created_date');
        console.log('Concerns fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching concerns:', err);
        throw err;
      }
    },
  });

  const student = students.find(s => s.student_id === studentId);
  const myConcerns = concerns.filter(c => c.student_id === studentId);

  console.log('Student:', student);
  console.log('Student ID:', studentId);
  console.log('My concerns:', myConcerns);
  if (concernsError) {
    console.error('Concerns query error:', concernsError);
  }

  const submitMutation = useMutation({
    mutationFn: async (msg) => {
      console.log('Submitting concern with data:', {
        student_id: studentId,
        name: student?.full_name || portalUser?.displayName,
        department: student?.department || '',
        message: msg,
        status: 'pending',
      });
      const result = await base44.entities.Concern.create({
        student_id: studentId,
        name: student?.full_name || portalUser?.displayName,
        department: student?.department || '',
        message: msg,
        status: 'pending',
      });
      console.log('Concern created successfully:', result);
      return result;
    },
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({ queryKey: ['concerns'] });
      toast.success('Concern submitted successfully');
    },
    onError: (err) => {
      console.error('Error submitting concern:', err);
      toast.error('Failed to submit concern: ' + (err.message || 'Unknown error'));
    },
  });

  const statusIcons = {
    pending: <Clock className="w-3.5 h-3.5" />,
    reviewed: <MessageSquare className="w-3.5 h-3.5" />,
    resolved: <CheckCircle className="w-3.5 h-3.5" />,
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    reviewed: 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  const roleColors = {
    admin: 'bg-primary/10 text-primary',
    dean: 'bg-accent/10 text-accent',
    student: 'bg-muted text-muted-foreground',
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
              {myConcerns.map(c => {
                const isExpanded = expanded[c.id];
                const replies = c.replies || [];
                return (
                  <div key={c.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">
                        {c.created_date ? new Date(c.created_date).toLocaleDateString() : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusColors[c.status || 'pending']}`}>
                          {statusIcons[c.status || 'pending']}
                          {c.status || 'pending'}
                        </Badge>
                        {replies.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => setExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                            <Eye className="w-3.5 h-3.5 mr-1" />{isExpanded ? 'Hide' : 'View Replies'}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{c.message}</p>
                    {isExpanded && replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {replies.map((r, i) => (
                          <div key={i} className="rounded-lg p-3 bg-primary/5 ml-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs py-0 ${roleColors[r.role] || 'bg-muted text-muted-foreground'}`}>
                                {r.author} ({r.role})
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="text-sm">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
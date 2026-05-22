import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, CheckCircle, Send, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { usePortalAuth } from '@/lib/PortalAuthContext';

export default function ConcernsPage({ departmentFilter }) {
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState({});
  const [expanded, setExpanded] = useState({});
  const { portalUser } = usePortalAuth();
  const qc = useQueryClient();

  const { data: concerns = [], error, isLoading } = useQuery({
    queryKey: ['concerns'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Concern.list('-created_date');
        console.log('Concerns data:', result);
        return result;
      } catch (err) {
        console.error('Error fetching concerns:', err);
        throw err;
      }
    },
  });

  const filtered = concerns
    .filter(c => departmentFilter ? c.department === departmentFilter : true)
    .filter(c => filter === 'all' ? true : c.status === filter);

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply, currentReplies, currentStatus }) => {
      const replies = currentReplies || [];
      const newReply = {
        author: portalUser?.displayName || portalUser?.identifier || 'Admin',
        role: portalUser?.role || 'admin',
        message: reply,
        timestamp: new Date().toISOString(),
      };
      await base44.entities.Concern.update(id, {
        replies: [...replies, newReply],
        status: currentStatus === 'pending' ? 'reviewed' : currentStatus,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['concerns'] });
      setReplyText(prev => ({ ...prev, [vars.id]: '' }));
      toast.success('Reply sent');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Concern.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['concerns'] });
      toast.success('Status updated');
    },
  });

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
      <PageHeader
        title="Student Concerns"
        description={departmentFilter ? `Department: ${departmentFilter}` : 'All student concerns — reply and manage below'}
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No concerns found</p>
            {error && <p className="text-red-500 mt-2 text-sm">Error: {error.message}</p>}
            {isLoading && <p className="mt-2 text-sm">Loading...</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => {
            const isExpanded = expanded[c.id];
            const replies = c.replies || [];
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{c.name || c.student_id}</p>
                        <Badge variant="outline" className="text-xs">{c.department || 'N/A'}</Badge>
                        <Badge className={`text-xs ${statusColors[c.status || 'pending']}`}>
                          {c.status || 'pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.created_date ? new Date(c.created_date).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {c.status !== 'resolved' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: c.id, status: 'resolved' })}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Resolve
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                        <Eye className="w-3.5 h-3.5 mr-1" />{isExpanded ? 'Hide' : 'View Thread'}
                      </Button>
                    </div>
                  </div>

                  {/* Original message */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Student Message</span>
                    </div>
                    <p className="text-sm">{c.message}</p>
                  </div>

                  {/* Thread */}
                  {isExpanded && (
                    <div className="space-y-2 mb-3">
                      {replies.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No replies yet.</p>
                      ) : (
                        replies.map((r, i) => (
                          <div key={i} className={`rounded-lg p-3 ${r.role === 'student' ? 'bg-muted/40 ml-0' : 'bg-primary/5 ml-4'}`}>
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
                        ))
                      )}
                    </div>
                  )}

                  {/* Reply box */}
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Type a reply to this concern..."
                      value={replyText[c.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className="min-h-[70px] text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!replyText[c.id]?.trim()) return;
                        replyMutation.mutate({
                          id: c.id,
                          reply: replyText[c.id].trim(),
                          currentReplies: c.replies,
                          currentStatus: c.status,
                        });
                      }}
                      disabled={!replyText[c.id]?.trim() || replyMutation.isPending}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
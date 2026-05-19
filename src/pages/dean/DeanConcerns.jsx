import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

const CCIS_COURSES = ['BSCS', 'BSIT', 'BLIS'];

export default function DeanConcerns() {
  const { portalUser } = usePortalAuth();
  const isCCIS = portalUser?.identifier === 'dean.ccis@smcc.edu';
  const [statusFilter, setStatusFilter] = useState('');

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list('-created_date') });

  const studentMap = new Map(students.map(s => [s.student_id, s]));
  const filtered = concerns.filter(c => {
    const student = studentMap.get(c.student_id);
    if (!student) return false;
    if (isCCIS && !CCIS_COURSES.includes(student.course)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const statusIcons = {
    pending: <Clock className="w-3.5 h-3.5" />,
    reviewed: <MessageSquare className="w-3.5 h-3.5" />,
    resolved: <CheckCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div>
      <PageHeader title="Student Concerns" description={isCCIS ? 'CCIS (BSCS, BSIT, BLIS)' : 'View student concerns'} />

      <div className="flex gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No concerns</CardContent></Card>
        ) : (
          filtered.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{c.student_name || c.student_id}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.created_date ? new Date(c.created_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {statusIcons[c.status || 'pending']}
                    {c.status || 'pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
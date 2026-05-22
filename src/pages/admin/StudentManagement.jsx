import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StudentFormModal from '@/components/students/StudentFormModal';
import CsvImportModal from '@/components/students/CsvImportModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StudentManagement({ departmentFilter, courseFilter }) {
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deptFilter, setDeptFilter] = useState('');
  const [courseFilter2, setCourseFilter2] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const qc = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const baseFiltered = courseFilter
    ? students.filter(s => courseFilter.includes(s.course))
    : departmentFilter
    ? students.filter(s => s.department === departmentFilter)
    : students;

  const allDepts = [...new Set(baseFiltered.map(s => s.department))].filter(Boolean).sort();
  const allCoursesForDept = deptFilter
    ? [...new Set(baseFiltered.filter(s => s.department === deptFilter).map(s => s.course))].filter(Boolean).sort()
    : [];
  const allYears = courseFilter2
    ? [...new Set(baseFiltered.filter(s => s.course === courseFilter2).map(s => s.year_level))].filter(Boolean).sort()
    : [];

  const filtered = baseFiltered.filter(s => {
    if (deptFilter && s.department !== deptFilter) return false;
    if (courseFilter2 && s.course !== courseFilter2) return false;
    if (yearFilter && s.year_level !== parseInt(yearFilter)) return false;
    return true;
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setFormOpen(false); toast.success('Student added'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setFormOpen(false); setEditing(null); toast.success('Student updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setDeleting(null); toast.success('Student deleted'); },
  });

  const handleSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'student_id', label: 'Student ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'course', label: 'Course' },
    { key: 'department', label: 'Department', render: (row) => (
      <Badge variant="outline" className="text-xs">{row.department}</Badge>
    )},
    { key: 'year_level', label: 'Year' },
    { key: 'concerns', label: 'Concerns', render: (row) => (
      <span className="text-sm text-muted-foreground truncate max-w-[150px]">{row.concerns || '—'}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'active' ? 'default' : 'secondary'} className="text-xs">
        {row.status || 'active'}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditing(row); setFormOpen(true); }}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleting(row); }}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Student Management"
        description={departmentFilter ? `Department: ${departmentFilter}` : courseFilter ? `Courses: ${courseFilter.join(', ')}` : 'Manage all student records'}
        actions={
          <>
            <Button variant="outline" onClick={() => setCsvOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Import CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Student
            </Button>
          </>
        }
      />

      {(!departmentFilter && !courseFilter) && (
        <div className="flex gap-3 mb-6">
          <Select value={deptFilter} onValueChange={(val) => { setDeptFilter(val); setCourseFilter2(''); setYearFilter(''); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Departments</SelectItem>
              {allDepts.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {deptFilter && (
            <Select value={courseFilter2} onValueChange={(val) => { setCourseFilter2(val); setYearFilter(''); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Courses</SelectItem>
                {allCoursesForDept.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {courseFilter2 && (
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Years</SelectItem>
                {allYears.map(y => (
                  <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <DataTable columns={columns} data={filtered} searchField="full_name" onRowClick={() => {}} />

      <StudentFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        student={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onComplete={() => qc.invalidateQueries({ queryKey: ['students'] })}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleting?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleting.id)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
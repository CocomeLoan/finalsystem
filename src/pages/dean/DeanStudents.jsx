import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';
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

const DEAN_CCIS_COURSES = ['BSCS', 'BSIT', 'BLIS'];

export default function DeanStudents() {
  const { portalUser } = usePortalAuth();
  const isCCIS = portalUser?.identifier === 'dean.ccis@smcc.edu';
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const filtered = students.filter(s => {
    if (isCCIS && !DEAN_CCIS_COURSES.includes(s.course)) return false;
    if (courseFilter && s.course !== courseFilter) return false;
    if (yearFilter && s.year_level !== parseInt(yearFilter)) return false;
    return true;
  });

  const availableCourses = isCCIS
    ? DEAN_CCIS_COURSES
    : [...new Set(students.map(s => s.course))].filter(Boolean);
  const availableYears = [...new Set(filtered.map(s => s.year_level))].filter(Boolean).sort();

  const columns = [
    { key: 'student_id', label: 'Student ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'course', label: 'Course' },
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
        description={isCCIS ? 'Department: CCIS (BSCS, BSIT, BLIS)' : 'Manage all student records'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Import CSV
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Student
            </Button>
          </div>
        }
      />

      <div className="flex gap-3 mb-6">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Courses</SelectItem>
            {availableCourses.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Years</SelectItem>
            {availableYears.map(y => (
              <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} searchField="full_name" onRowClick={() => {}} />

      <StudentFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={async (data) => {
          if (editing) {
            await base44.entities.Student.update(editing.id, data);
          } else {
            await base44.entities.Student.create(data);
          }
          setFormOpen(false);
          setEditing(null);
          toast.success(editing ? 'Student updated' : 'Student added');
        }}
        student={editing}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onComplete={() => {
          setCsvOpen(false);
          toast.success('CSV import completed');
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleting?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await base44.entities.Student.delete(deleting.id);
              setDeleting(null);
              toast.success('Student deleted');
            }} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
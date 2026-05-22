import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GraduationCap, BookOpen, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const DEPARTMENTS = ['CAS', 'CBM', 'CCIS', 'CCJE', 'CTE', 'CTHM'];

const COURSE_DEPARTMENT_MAP = {
  // CAS - College of Arts and Sciences
  'AB English Language': 'CAS',
  'AB Political Science': 'CAS',
  'AB Psychology': 'CAS',
  
  // CBM - College of Business Management
  'BS Business Administration (BSBA) - Financial Management': 'CBM',
  'BS Business Administration (BSBA) - Marketing Management': 'CBM',
  'BS Business Administration (BSBA) - Human Resource Management': 'CBM',
  
  // CCIS - College of Computer and Information Sciences
  'BSCS': 'CCIS',
  'BSIT': 'CCIS',
  'BLIS': 'CCIS',
  'BSIS': 'CCIS',
  
  // CCJE - College of Criminal Justice Education
  'BS Criminology': 'CCJE',
  
  // CTE - College of Teacher Education
  'Bachelor of Elementary Education (BEEd)': 'CTE',
  'Bachelor of Secondary Education (BSEd) - English': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Mathematics': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Filipino': 'CTE',
  'Bachelor of Secondary Education (BSEd) - Science': 'CTE',
  
  // CTHM - College of Tourism and Hospitality Management
  'BS Tourism Management': 'CTHM',
  'BS Hospitality Management': 'CTHM',
};

const COURSES = Object.keys(COURSE_DEPARTMENT_MAP);

const getDepartmentByCourse = (course) => {
  return COURSE_DEPARTMENT_MAP[course] || 'CAS';
};
const YEARS = [1, 2, 3, 4, 5, 6];

export default function StudentFormModal({ open, onClose, onSubmit, student, isLoading }) {
  const [form, setForm] = useState({
    student_id: '',
    name: '',
    department: '',
    course: '',
    year: 1,
    current_gpa: '',
    gpa_history: [],
    study_hours: '',
    library_visits: '',
    lms_logins: '',
    scholarship: 'no',
    family_income: '',
    subject_grades: [],
    problem_description: '',
  });

  const handleDepartmentChange = (value) => {
    setForm({ ...form, department: value, course: '' });
  };

  const handleCourseChange = (value) => {
    const department = getDepartmentByCourse(value);
    setForm({ ...form, course: value, department });
  };

  const [gpaEntry, setGpaEntry] = useState({ semester: '', gpa: '' });
  const [subjectGradeEntry, setSubjectGradeEntry] = useState({ subject: '', grade: '' });

  useEffect(() => {
    if (student) {
      setForm({
        student_id: student.student_id || '',
        name: student.name || '',
        department: student.department || '',
        course: student.course || '',
        year: student.year || 1,
        current_gpa: student.current_gpa || '',
        gpa_history: student.gpa_history || [],
        study_hours: student.study_hours || '',
        library_visits: student.library_visits || '',
        lms_logins: student.lms_login_per_month || '',
        scholarship: student.scholarship || 'no',
        family_income: student.family_income || '',
        subject_grades: student.subject_grades || [],
        problem_description: student.problem_description || '',
      });
    } else {
      setForm({
        student_id: '',
        name: '',
        department: '',
        course: '',
        year: 1,
        current_gpa: '',
        gpa_history: [],
        study_hours: '',
        library_visits: '',
        lms_logins: '',
        scholarship: 'no',
        family_income: '',
        subject_grades: [],
        problem_description: '',
      });
    }
  }, [student, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.student_id || !form.name || !form.department || !form.course) {
      toast.error('Please fill in all required fields (Student ID, Name, Department, Course)');
      return;
    }
    
    // Convert form data to match database schema
    const submitData = {
      student_id: form.student_id,
      name: form.name,
      department: form.department,
      course: form.course,
      year: form.year,
      current_gpa: form.current_gpa ? parseFloat(form.current_gpa) : null,
      study_hours: form.study_hours ? parseFloat(form.study_hours) : null,
      library_visits: form.library_visits ? parseFloat(form.library_visits) : null,
      lms_login_per_month: form.lms_logins ? parseFloat(form.lms_logins) : null,
      scholarship: form.scholarship,
      family_income: form.family_income ? parseFloat(form.family_income) : null,
      gpa_history: form.gpa_history,
      subject_grades: form.subject_grades,
      problem_description: form.problem_description,
      status: 'active',
    };
    onSubmit(submitData);
  };

  const addGpaEntry = () => {
    if (gpaEntry.semester && gpaEntry.gpa) {
      setForm({
        ...form,
        gpa_history: [...form.gpa_history, { semester: gpaEntry.semester, gpa: parseFloat(gpaEntry.gpa) }],
      });
      setGpaEntry({ semester: '', gpa: '' });
    }
  };

  const removeGpaEntry = (index) => {
    setForm({
      ...form,
      gpa_history: form.gpa_history.filter((_, i) => i !== index),
    });
  };

  const addSubjectGrade = () => {
    if (subjectGradeEntry.subject && subjectGradeEntry.grade) {
      const grade = parseFloat(subjectGradeEntry.grade);
      const isWeakness = grade >= 2.5;
      const recommendation = isWeakness 
        ? `Consider seeking tutoring for ${subjectGradeEntry.subject} and reviewing study materials.`
        : '';
      
      setForm({
        ...form,
        subject_grades: [...form.subject_grades, { 
          subject: subjectGradeEntry.subject, 
          grade: grade,
          is_weakness: isWeakness,
          recommendation: recommendation
        }],
      });
      setSubjectGradeEntry({ subject: '', grade: '' });
    }
  };

  const removeSubjectGrade = (index) => {
    setForm({
      ...form,
      subject_grades: form.subject_grades.filter((_, i) => i !== index),
    });
  };

  const getFilteredCourses = () => {
    if (!form.department) return COURSES;
    return COURSES.filter(course => COURSE_DEPARTMENT_MAP[course] === form.department);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <p className="text-sm text-muted-foreground">Collect student data for ML prediction and LLM analysis</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={form.student_id}
                    onChange={e => setForm({ ...form, student_id: e.target.value })}
                    placeholder="e.g., 2021-00001"
                    required
                    disabled={!!student}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={form.department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={form.course} onValueChange={handleCourseChange} disabled={!form.department}>
                    <SelectTrigger><SelectValue placeholder={form.department ? "Select" : "Select department first"} /></SelectTrigger>
                    <SelectContent>
                      {getFilteredCourses().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year Level</Label>
                  <Select value={form.year.toString()} onValueChange={val => setForm({ ...form, year: parseInt(val) })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current_gpa">Current GPA (1.0–3.0)</Label>
                <Input
                  id="current_gpa"
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="3.0"
                  value={form.current_gpa}
                  onChange={e => setForm({ ...form, current_gpa: e.target.value })}
                  placeholder="e.g., 1.75"
                />
              </div>
              <div>
                <Label>GPA History (per semester)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Semester (e.g., 1st Sem 2024)"
                    value={gpaEntry.semester}
                    onChange={e => setGpaEntry({ ...gpaEntry, semester: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="3.0"
                    placeholder="GPA"
                    className="w-24"
                    value={gpaEntry.gpa}
                    onChange={e => setGpaEntry({ ...gpaEntry, gpa: e.target.value })}
                  />
                  <Button type="button" onClick={addGpaEntry} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.gpa_history.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.gpa_history.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm">{entry.semester}: <Badge variant="secondary">{entry.gpa}</Badge></span>
                        <Button type="button" onClick={() => removeGpaEntry(index)} size="icon" variant="ghost">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Habits & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study Habits & Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="study_hours">Study Hours/Week</Label>
                  <Input
                    id="study_hours"
                    type="number"
                    min="0"
                    value={form.study_hours}
                    onChange={e => setForm({ ...form, study_hours: e.target.value })}
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <Label htmlFor="library_visits">Library Visits/Week</Label>
                  <Input
                    id="library_visits"
                    type="number"
                    min="0"
                    value={form.library_visits}
                    onChange={e => setForm({ ...form, library_visits: e.target.value })}
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <Label htmlFor="lms_logins">LMS Logins/Month</Label>
                  <Input
                    id="lms_logins"
                    type="number"
                    min="0"
                    value={form.lms_logins}
                    onChange={e => setForm({ ...form, lms_logins: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scholarship">Scholarship</Label>
                  <Select value={form.scholarship} onValueChange={val => setForm({ ...form, scholarship: val })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="family_income">Annual Family Income (₱)</Label>
                  <Input
                    id="family_income"
                    type="number"
                    min="0"
                    value={form.family_income}
                    onChange={e => setForm({ ...form, family_income: e.target.value })}
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject Grades (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Subject name (e.g., Mathematics)"
                  value={subjectGradeEntry.subject}
                  onChange={e => setSubjectGradeEntry({ ...subjectGradeEntry, subject: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="5.0"
                  placeholder="Grade"
                  className="w-24"
                  value={subjectGradeEntry.grade}
                  onChange={e => setSubjectGradeEntry({ ...subjectGradeEntry, grade: e.target.value })}
                />
                <Button type="button" onClick={addSubjectGrade} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.subject_grades.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.subject_grades.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{entry.subject}: </span>
                        <Badge variant={entry.is_weakness ? 'destructive' : 'secondary'}>{entry.grade}</Badge>
                        {entry.is_weakness && <Badge variant="outline" className="text-xs">Weakness</Badge>}
                      </div>
                      <Button type="button" onClick={() => removeSubjectGrade(index)} size="icon" variant="ghost">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {form.subject_grades.some(sg => sg.is_weakness) && (
                <div className="mt-3 p-3 rounded bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">Recommendations for weak subjects:</p>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    {form.subject_grades.filter(sg => sg.is_weakness).map((sg, i) => (
                      <li key={i}>{sg.recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Student Problem Description (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe personal struggles, academic issues, or concerns..."
                value={form.problem_description}
                onChange={e => setForm({ ...form, problem_description: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">Used for LLM explanation and recommendations</p>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
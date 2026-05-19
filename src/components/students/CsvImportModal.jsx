import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

const GPA_COLS = [
  { key: 'gpa_y1s1', label: '1st Yr 1st Sem' },
  { key: 'gpa_y1s2', label: '1st Yr 2nd Sem' },
  { key: 'gpa_y2s1', label: '2nd Yr 1st Sem' },
  { key: 'gpa_y2s2', label: '2nd Yr 2nd Sem' },
  { key: 'gpa_y3s1', label: '3rd Yr 1st Sem' },
];

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

const getDepartmentByCourse = (course) => {
  return COURSE_DEPARTMENT_MAP[course] || 'CAS';
};

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      resolve(rows);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function rowToStudent(row, index) {
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const gpa_history = GPA_COLS
    .map(({ key, label }) => ({ semester: label, gpa: num(row[key]) }))
    .filter(h => h.gpa !== null);

  const rawCourse = (row.course || '').trim();
  const courseUpper = rawCourse.toUpperCase();
  
  const courseMap = {
    'BSCS': 'BSCS',
    'BSIT': 'BSIT',
    'BLIS': 'BLIS',
    'BSIS': 'BSIS',
    'BS CRIMINOLOGY': 'BS Criminology',
    'BS TOURISM MANAGEMENT': 'BS Tourism Management',
    'BS HOSPITALITY MANAGEMENT': 'BS Hospitality Management',
    'AB ENGLISH LANGUAGE': 'AB English Language',
    'AB POLITICAL SCIENCE': 'AB Political Science',
    'AB PSYCHOLOGY': 'AB Psychology',
    'BACHELOR OF ELEMENTARY EDUCATION (BEED)': 'Bachelor of Elementary Education (BEEd)',
    'BACHELOR OF SECONDARY EDUCATION (BSED) - ENGLISH': 'Bachelor of Secondary Education (BSEd) - English',
    'BACHELOR OF SECONDARY EDUCATION (BSED) - MATHEMATICS': 'Bachelor of Secondary Education (BSEd) - Mathematics',
    'BACHELOR OF SECONDARY EDUCATION (BSED) - FILIPINO': 'Bachelor of Secondary Education (BSEd) - Filipino',
    'BACHELOR OF SECONDARY EDUCATION (BSED) - SCIENCE': 'Bachelor of Secondary Education (BSEd) - Science',
    'BS BUSINESS ADMINISTRATION (BSBA) - FINANCIAL MANAGEMENT': 'BS Business Administration (BSBA) - Financial Management',
    'BS BUSINESS ADMINISTRATION (BSBA) - MARKETING MANAGEMENT': 'BS Business Administration (BSBA) - Marketing Management',
    'BS BUSINESS ADMINISTRATION (BSBA) - HUMAN RESOURCE MANAGEMENT': 'BS Business Administration (BSBA) - Human Resource Management',
  };
  
  const course = courseMap[courseUpper] || 'BSCS';
  
  return {
    student_id: (row.student_id || row.id || '').toString().trim() ||
      `STU-${new Date().getFullYear()}-${String(1001 + index).padStart(3, '0')}`,
    name: (row.full_name || row.name || '').trim(),
    course,
    year: num(row.year_level || row.year) || 1,
    study_hours: num(row.study_hours),
    library_visits: num(row.library_visits),
    scholarship: (row.scholarship || 'no').toString().toLowerCase().includes('yes') ? 'yes' : 'no',
    scholarship_amount: num(row.scholarship_amount),
    family_income: num(row.family_income),
    lms_login_per_month: num(row.lms_login_per_month || row.lms_logins),
    status: (row.status || 'active').toString().toLowerCase() === 'inactive' ? 'inactive' : 'active',
    gpa_history,
    department: getDepartmentByCourse(course),
  };
}

export default function CsvImportModal({ open, onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) return;
    setStatus('parsing');
    setError('');

    try {
      const rows = await parseFile(file);
      if (!rows.length) { setStatus('error'); setError('No data rows found in file.'); return; }

      setStatus('importing');
      const prepared = rows.map((row, i) => rowToStudent(row, i)).filter(s => s.name);

      if (!prepared.length) { setStatus('error'); setError('No valid student rows found. Check column names.'); return; }

      await supabase.entities.Student.bulkCreate(prepared);

      setResults({ imported: prepared.length, total: rows.length });
      setStatus('done');
      onComplete?.();
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to import students. Please try again.');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResults(null);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
        </DialogHeader>

        {status === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Upload CSV or Excel file</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Columns: full_name, course, year_level, study_hours, library_visits, scholarship, scholarship_amount, family_income, gpa_y1s1–gpa_y3s1, lms_login_per_month, status
            </p>
          </div>
        )}

        {(status === 'parsing' || status === 'importing') && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {status === 'parsing' && 'Reading file...'}
              {status === 'importing' && 'Importing students...'}
            </p>
          </div>
        )}

        {status === 'done' && results && (
          <div className="py-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <p className="font-medium">Import Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {results.imported} of {results.total} students imported
              </p>
              {results.failed > 0 && (
                <p className="text-sm text-destructive mt-1">{results.failed} failed (may be duplicates)</p>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-sm text-destructive">{error || 'Failed to parse file. Check file format.'}</p>
          </div>
        )}

        <DialogFooter>
          {status === 'idle' && (
            <Button onClick={handleImport} disabled={!file}>Import</Button>
          )}
          {(status === 'done' || status === 'error') && (
            <Button onClick={() => { onClose(); reset(); }}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
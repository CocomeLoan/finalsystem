import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Eye, EyeOff, Lock, User, AlertCircle, Shield } from 'lucide-react';
import { supabase as base44 } from '@/api/supabaseClient';
import { usePortalAuth } from '@/lib/PortalAuthContext';

const PORTAL_USERS = [
  { identifier: 'admin@smcc.edu', password: 'admin123', role: 'admin', displayName: 'Administrator' },
  { identifier: 'dean.ccis@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CCIS' },
  { identifier: 'dean.cas@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CAS' },
  { identifier: 'dean.cbm@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CBM' },
  { identifier: 'dean.ccje@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CCJE' },
  { identifier: 'dean.cte@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CTE' },
  { identifier: 'dean.cthm@smcc.edu', password: 'dean123', role: 'dean', displayName: 'Dean – CTHM' },
  { identifier: 'Dev2026', password: 'Developer2026', role: 'developer', displayName: 'Developer' },
];

const ROLE_ROUTES = { admin: '/admin', dean: '/dean', developer: '/developer', student: '/student' };

export default function PortalLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = usePortalAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check predefined portal users
    const portalUser = PORTAL_USERS.find(u => u.identifier === identifier && u.password === password);
    if (portalUser) {
      login(portalUser);
      setLoading(false);
      navigate(ROLE_ROUTES[portalUser.role]);
      return;
    }

    // Student login: student ID = username = password
    if (identifier && identifier === password) {
      try {
        const students = await base44.entities.Student.filter({ student_id: identifier });
        if (students && students.length > 0) {
          const student = students[0];
          const studentUser = { identifier, password, role: 'student', displayName: student.name, student_id: student.student_id, studentData: student };
          login(studentUser);
          setLoading(false);
          navigate(ROLE_ROUTES.student);
          return;
        } else {
          setError('Student ID not found. Please check your credentials.');
        }
      } catch {
        setError('Unable to verify student credentials. Please try again.');
      }
    } else {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center leading-tight">Predicting Student Academic Standing</h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">Using ML Models with Explainable AI (XAI)</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium text-center">Saint Michael College of Caraga</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Secure Sign In</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="identifier">Email / Username / Student ID</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="identifier" type="text" placeholder="Enter your email or ID" value={identifier} onChange={e => setIdentifier(e.target.value)} className="pl-9" required />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" required />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium">Portal Access</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="font-semibold text-foreground mb-0.5">Admin</p>
                  <p>admin@smcc.edu</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="font-semibold text-foreground mb-0.5">Dean (CCIS)</p>
                  <p>dean.ccis@smcc.edu</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="font-semibold text-foreground mb-0.5">Developer</p>
                  <p>Dev2026</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="font-semibold text-foreground mb-0.5">Student</p>
                  <p>Student ID as username & password</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
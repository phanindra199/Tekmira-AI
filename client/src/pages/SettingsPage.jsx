import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { Settings, User, Mail, Github, GraduationCap, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '../components/common';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: 'Alex Morgan',
    email: 'student@university.edu',
    githubUsername: 'alexm-dev',
    degree: 'B.Tech Computer Science',
    graduationYear: '2026'
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <MainLayout
      withSidebar={true}
      title="Account & Application Settings"
      description="Manage your student profile, academic information, and verification preferences."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Settings</span>
        </>
      }
    >
      <div className="max-w-2xl space-y-6">
        {savedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile settings updated successfully.</span>
          </div>
        )}

        <Card className="p-6">
          <CardTitle className="mb-1">Student Candidate Profile</CardTitle>
          <CardDescription className="mb-6">
            These details are attached to your placement readiness evaluation and exportable reports.
          </CardDescription>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />

              <Input
                label="GitHub Username"
                icon={Github}
                value={profile.githubUsername}
                onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Major"
                icon={GraduationCap}
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                required
              />

              <Input
                label="Graduation Year"
                type="number"
                icon={Calendar}
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" icon={Save}>
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}

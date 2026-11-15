import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { HelpCircle, Sparkles, BookOpen, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState, Button } from '../components/common';

export default function InterviewPrepPage() {
  return (
    <MainLayout
      withSidebar={true}
      title="AI Viva & Interview Preparation"
      description="Practice technical interview and college viva questions grounded specifically in your own GitHub repository code."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Interview Prep</span>
        </>
      }
    >
      <div className="space-y-6">
        {/* Module Scope Banner */}
        <Card className="p-4 bg-navy-50 border-navy-100 text-xs text-navy-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-coral-500 shrink-0" />
            <span>
              <strong>Project-Grounded Viva:</strong> Gemini will generate custom viva questions that reference specific lines of code in your projects (Scheduled for Day 14).
            </span>
          </div>
          <Badge variant="navy">Day 14 Module</Badge>
        </Card>

        {/* Question Practice Session Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <CardTitle>Active Viva Practice Sessions</CardTitle>
              <CardDescription>
                Interactive mock interview question generator based on verified repository artifacts.
              </CardDescription>
            </div>
            <Badge variant="coral">Awaiting Code Ingestion</Badge>
          </div>

          <EmptyState
            icon={MessageSquare}
            title="No Active Practice Session"
            description="Complete your resume and GitHub code ingestion first to generate tailored interview questions."
            actionLabel="Start Verification Pipeline"
            onAction={() => window.location.assign('/resume-analysis')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { Code2, Github, GitCommit, FileCode, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState, Button } from '../components/common';

export default function SkillEvidencePage() {
  return (
    <MainLayout
      withSidebar={true}
      title="Skill Evidence Explorer"
      description="Inspect verifiable code implementations, authentic commit histories, and sampled AST snippets mined from public repositories."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Skill Evidence</span>
        </>
      }
      actionButton={
        <Link to="/github-analysis">
          <Button variant="outline" size="sm" icon={Github}>
            Configure GitHub Profile
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Evidence Mining Protocol Notice */}
        <Card className="p-4 bg-navy-50 border-navy-100 text-xs text-navy-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-coral-500 shrink-0" />
            <span>
              <strong>Evidence Principle:</strong> Tekmira AI requires empirical code proof (commit diffs, language bytes, and dependency manifests) to verify claimed technical skills.
            </span>
          </div>
          <Badge variant="navy">Day 11 Pipeline</Badge>
        </Card>

        {/* Evidence Grid / Feed */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <CardTitle>Mined Code Proofs</CardTitle>
              <CardDescription>
                Verified code snippets proving authentic usage of claimed frameworks and tools.
              </CardDescription>
            </div>
            <Badge variant="outline">0 Code Proofs Available</Badge>
          </div>

          <EmptyState
            icon={Code2}
            title="No Code Proofs Mined Yet"
            description="Link your public GitHub profile and select a repository in Step 2 to mine AST snippets and commit evidence."
            actionLabel="Connect GitHub Profile"
            onAction={() => window.location.assign('/github-analysis')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

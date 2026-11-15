import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import GitHubAnalysisPage from './pages/GitHubAnalysisPage';
import JobMatchPage from './pages/JobMatchPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import SkillEvidencePage from './pages/SkillEvidencePage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main SaaS App Pages */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
      <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
      <Route path="/github-analysis" element={<GitHubAnalysisPage />} />
      <Route path="/job-match" element={<JobMatchPage />} />
      <Route path="/skill-evidence" element={<SkillEvidencePage />} />
      <Route path="/interview-prep" element={<InterviewPrepPage />} />
      <Route path="/analysis-report" element={<AnalysisReportPage />} />
      <Route path="/reports" element={<AnalysisReportPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Catch-all 404 redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

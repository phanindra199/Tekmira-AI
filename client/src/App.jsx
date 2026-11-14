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

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main SaaS App Pages */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
      <Route path="/github-analysis" element={<GitHubAnalysisPage />} />
      <Route path="/job-match" element={<JobMatchPage />} />
      <Route path="/analysis-report" element={<AnalysisReportPage />} />

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button, Input, ErrorMessage } from '../components/common';
import { authService } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      setSuccessNotice('Authentication successful! Redirecting to placement dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-navy-900 mx-auto flex items-center justify-center mb-4 shadow-md">
              <ShieldCheck className="w-6 h-6 text-coral-500" />
            </div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight">Sign In to Tekmira AI</h1>
            <p className="text-xs text-slate-500 mt-1">
              Beyond Claims. Driven by Evidence.
            </p>
          </div>

          {/* Success Alert */}
          {successNotice && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6">
              <ErrorMessage 
                title="Sign In Failed" 
                message={errorMessage} 
                onRetry={() => setErrorMessage('')} 
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="College or Personal Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@university.edu"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2"
              loading={isLoading}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In with Evidence ID'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-coral-600 hover:text-coral-700 transition-colors">
              Create Candidate Account &rarr;
            </Link>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

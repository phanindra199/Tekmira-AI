import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, User, Github, GraduationCap, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, ErrorMessage } from '../components/common';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    githubHandle: '',
    collegeName: 'National Institute of Engineering',
    graduationYr: '2026',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [successNotice, setSuccessNotice] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors([]);
    setSuccessNotice('');
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        graduationYr: formData.graduationYr ? parseInt(formData.graduationYr, 10) : 2026
      };

      await authService.register(payload);
      setSuccessNotice('Account successfully registered! Logging into placement portal...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please review your input.');
      if (err.errors) {
        setValidationErrors(err.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-12 sm:py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-navy-900 mx-auto flex items-center justify-center mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6 text-coral-500" />
            </div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight">Create Candidate Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Beyond Claims. Driven by Evidence.
            </p>
          </div>

          {/* Success Notice */}
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
                title="Registration Failed" 
                message={errorMessage} 
                onRetry={() => setErrorMessage('')} 
              />
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-xs text-coral-600 list-disc list-inside space-y-0.5">
                  {validationErrors.map((v, i) => (
                    <li key={i}>{v.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alex Morgan"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="College Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex.morgan@university.edu"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GitHub Username"
                type="text"
                name="githubHandle"
                value={formData.githubHandle}
                onChange={handleChange}
                placeholder="alexmorgan-dev"
                leftIcon={<Github className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Graduation Year"
                type="number"
                name="graduationYr"
                value={formData.graduationYr}
                onChange={handleChange}
                placeholder="2026"
                leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <Input
              label="College / Institution"
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="National Institute of Technology"
              leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password (min. 8 characters)"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="coral"
              className="w-full justify-center mt-3"
              loading={isLoading}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Creating Account...' : 'Register for Evidence Verification'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-navy-900 hover:text-navy-800 transition-colors">
              Sign In to Placement Portal &rarr;
            </Link>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

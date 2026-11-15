import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, User, Github, GraduationCap, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, ErrorMessage } from '../components/common';
import { authService } from '../services/authService';
import { 
  validateFullName, 
  validateEmail, 
  validatePassword, 
  validateGitHubHandle, 
  sanitizeInput 
} from '../utils/clientValidation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    githubHandle: '',
    collegeName: 'National Institute of Engineering',
    graduationYr: '2026',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [successNotice, setSuccessNotice] = useState('');
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors([]);
    setSuccessNotice('');

    // Guard against accidental double submit
    if (isSubmittingRef.current || isLoading) return;

    // Synchronous client validation
    const errors = {};
    const nameErr = validateFullName(formData.fullName);
    if (nameErr) errors.fullName = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(formData.password, 8);
    if (passErr) errors.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (formData.githubHandle) {
      const gitErr = validateGitHubHandle(formData.githubHandle);
      if (gitErr) errors.githubHandle = gitErr;
    }

    if (formData.graduationYr) {
      const yr = parseInt(formData.graduationYr, 10);
      if (isNaN(yr) || yr < 2020 || yr > 2035) {
        errors.graduationYr = 'Graduation year must be between 2020 and 2035.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      const payload = {
        fullName: sanitizeInput(formData.fullName.trim()),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        githubHandle: formData.githubHandle ? sanitizeInput(formData.githubHandle.trim().replace(/^@/, '')) : null,
        collegeName: formData.collegeName ? sanitizeInput(formData.collegeName.trim()) : null,
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
      isSubmittingRef.current = false;
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-fullName"
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alex Morgan"
              icon={User}
              error={fieldErrors.fullName}
              disabled={isLoading}
              required
            />

            <Input
              id="register-email"
              label="College Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex.morgan@university.edu"
              icon={Mail}
              error={fieldErrors.email}
              disabled={isLoading}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="register-githubHandle"
                label="GitHub Username"
                type="text"
                name="githubHandle"
                value={formData.githubHandle}
                onChange={handleChange}
                placeholder="alexmorgan-dev"
                icon={Github}
                error={fieldErrors.githubHandle}
                disabled={isLoading}
              />

              <Input
                id="register-graduationYr"
                label="Graduation Year"
                type="number"
                name="graduationYr"
                value={formData.graduationYr}
                onChange={handleChange}
                placeholder="2026"
                icon={Calendar}
                error={fieldErrors.graduationYr}
                disabled={isLoading}
              />
            </div>

            <Input
              id="register-collegeName"
              label="College / Institution"
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="National Institute of Technology"
              icon={GraduationCap}
              error={fieldErrors.collegeName}
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="register-password"
                label="Password (min. 8 chars)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                error={fieldErrors.password}
                disabled={isLoading}
                required
              />

              <Input
                id="register-confirmPassword"
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                error={fieldErrors.confirmPassword}
                disabled={isLoading}
                required
              />
            </div>

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

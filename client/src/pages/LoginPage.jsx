import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, ErrorMessage } from '../components/common';
import { authService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/clientValidation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    // Guard against accidental double submit
    if (isSubmittingRef.current || isLoading) return;

    // Client-side synchronous validation
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password, 1); // min 1 for login
    if (emailErr || passErr) {
      setFieldErrors({
        email: emailErr,
        password: passErr
      });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      await authService.login({
        email: email.trim().toLowerCase(),
        password
      });
      setSuccessNotice('Authentication successful! Redirecting to placement dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              name="email"
              label="College or Personal Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="candidate@university.edu"
              icon={Mail}
              error={fieldErrors.email}
              disabled={isLoading}
              required
            />

            <Input
              id="login-password"
              name="password"
              label="Account Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              icon={Lock}
              error={fieldErrors.password}
              disabled={isLoading}
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

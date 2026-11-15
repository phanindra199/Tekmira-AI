import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  Code,
  RotateCw,
  Award,
  AlertCircle,
  FileCode2,
  Send,
  Layers,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Badge, 
  Button, 
  ErrorMessage, 
  LoadingIndicator 
} from '../components/common';
import interviewService from '../services/interviewService';
import { normalizeApiError } from '../utils/apiError';
import { validateVivaAnswer } from '../utils/clientValidation';

export default function InterviewPrepPage() {
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [answerError, setAnswerError] = useState(null);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const isSubmittingRef = React.useRef(false);

  // Auto-start a default practice session on mount if none exists
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      setLoading(true);
      setError(null);
      try {
        const response = await interviewService.createSession({
          difficulty,
          targetRole: 'Junior Full Stack Engineer'
        });
        if (isMounted) {
          setSession(response.data);
          if (response.data?.questions?.[0]) {
            setStudentAnswer(response.data.questions[0].studentAnswer || '');
            if (response.data.questions[0].evaluation) {
              setEvaluationResult(response.data.questions[0].evaluation);
            }
          }
        }
      } catch (err) {
        if (isMounted) setError(normalizeApiError(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();
    return () => { isMounted = false; };
  }, []);

  const handleStartNewSession = async (newDifficulty = difficulty) => {
    setLoading(true);
    setError(null);
    setEvaluationResult(null);
    setStudentAnswer('');
    setCurrentQuestionIndex(0);

    try {
      const response = await interviewService.createSession({
        difficulty: newDifficulty,
        targetRole: 'Junior Full Stack Engineer'
      });
      setSession(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (index) => {
    // Preserve current answer in draft
    setDraftAnswers(prev => ({ ...prev, [currentQuestionIndex]: studentAnswer }));
    
    setCurrentQuestionIndex(index);
    const q = session?.questions?.[index];
    // Restore drafted answer if present, else session stored answer
    const restoredAnswer = draftAnswers[index] !== undefined 
      ? draftAnswers[index] 
      : (q?.studentAnswer || '');
    setStudentAnswer(restoredAnswer);
    setEvaluationResult(q?.evaluation || null);
    setAnswerError(null);
    setError(null);
  };

  const handleSubmitAnswer = async (e) => {
    e?.preventDefault();
    if (!session?._id) return;
    if (isSubmittingRef.current || evaluating) return;

    // Validate viva answer
    const valErr = validateVivaAnswer(studentAnswer);
    if (valErr) {
      setAnswerError(valErr);
      return;
    }

    setAnswerError(null);
    setEvaluating(true);
    isSubmittingRef.current = true;
    setError(null);

    try {
      const response = await interviewService.evaluateAnswer({
        sessionId: session._id,
        questionIndex: currentQuestionIndex,
        studentAnswer: studentAnswer.trim()
      });

      const evalData = response.data.evaluation;
      setEvaluationResult(evalData);

      // Update in-memory session question state and clear draft
      setDraftAnswers(prev => ({ ...prev, [currentQuestionIndex]: studentAnswer.trim() }));
      setSession(prev => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          studentAnswer: studentAnswer.trim(),
          evaluation: evalData
        };
        return {
          ...prev,
          questions: updatedQuestions,
          overallScore: response.data.overallSessionScore,
          status: response.data.sessionStatus
        };
      });
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setEvaluating(false);
      isSubmittingRef.current = false;
    }
  };

  const activeQuestion = session?.questions?.[currentQuestionIndex];

  return (
    <MainLayout
      withSidebar={true}
      title="AI Viva & Technical Interview Preparation"
      description="Practice technical interview questions grounded specifically in your own GitHub repository code and architectural decisions."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Interview Prep</span>
        </>
      }
      actionButton={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartNewSession(difficulty)}
            disabled={loading}
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Questions</span>
          </Button>

          <Link to="/analysis-report">
            <Button variant="primary" size="sm">
              <span>View Readiness Report</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 mb-8">
        {/* Top Session Configuration & Difficulty Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-coral-500" />
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                  Technical Viva Session Configuration
                </h3>
                <Badge variant="navy">{difficulty} Level</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Questions test technical depth, code implementation provenance, and trade-off justification.
              </p>
            </div>

            {/* Difficulty Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    handleStartNewSession(level);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    difficulty === level
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        {/* Loading Indicator */}
        {loading && (
          <Card className="p-12 text-center">
            <LoadingIndicator message="Generating grounded viva voce questions from repository evidence..." />
          </Card>
        )}

        {/* Main Viva Voce Workspace */}
        {session && !loading && activeQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Question & Answer Workspace (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Question Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {session.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                      currentQuestionIndex === idx
                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                        : q.evaluation
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Question {idx + 1}</span>
                    {q.evaluation ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-mono font-bold">
                        {q.evaluation.score}%
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </button>
                ))}
              </div>

              {/* Grounded Question Card */}
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="coral">{activeQuestion.skill}</Badge>
                    <span className="text-xs font-semibold text-slate-700">{activeQuestion.concept}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <FileCode2 className="w-3.5 h-3.5 text-coral-500" />
                    <span>Evidence Citation: {activeQuestion.fileCitation}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-navy-900 leading-relaxed mb-4">
                  {activeQuestion.questionText}
                </h3>

                {/* Expected Topics Hint Strip */}
                {activeQuestion.expectedTopics?.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-6">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Examiner Rubric Focus Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.expectedTopics.map((topic, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Submission Form */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label htmlFor="student-answer" className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                      Your Technical Answer <span className="text-coral-500">*</span>
                    </label>
                    <textarea
                      id="student-answer"
                      rows={6}
                      value={studentAnswer}
                      onChange={(e) => {
                        setStudentAnswer(e.target.value);
                        if (answerError) setAnswerError(null);
                      }}
                      placeholder="Explain your architectural reasoning, code implementation details, and trade-offs..."
                      aria-invalid={!!answerError}
                      aria-describedby={answerError ? 'student-answer-error' : 'student-answer-helper'}
                      className={`w-full p-3.5 rounded-xl border text-xs text-slate-800 focus:outline-none focus:ring-2 transition-all font-sans resize-y ${
                        answerError
                          ? 'border-coral-500 bg-coral-50/20 focus:ring-coral-500/20 focus:border-coral-600'
                          : 'border-slate-200 bg-slate-50/50 focus:ring-navy-900/10 focus:border-navy-900'
                      }`}
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                      <span id="student-answer-helper" className={studentAnswer.length > 4000 ? 'text-coral-600 font-bold' : ''}>
                        {studentAnswer.length.toLocaleString()} / 4,000 characters (min. 15 required)
                      </span>
                      <span>Rubric evaluates Accuracy (40%), Evidence (35%), Clarity (25%)</span>
                    </div>
                    {answerError && (
                      <p id="student-answer-error" className="text-xs text-coral-600 mt-1.5 font-medium">
                        {answerError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => handleSelectQuestion(currentQuestionIndex - 1)}
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentQuestionIndex === session.questions.length - 1}
                        onClick={() => handleSelectQuestion(currentQuestionIndex + 1)}
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={evaluating || studentAnswer.trim().length < 15}
                      className="px-6"
                    >
                      {evaluating ? (
                        <span className="flex items-center gap-2">
                          <RotateCw className="w-4 h-4 animate-spin text-coral-400" />
                          <span>Evaluating Rubrics...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Evaluation</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Rubric Evaluation Feedback Card */}
              {evaluationResult && (
                <Card className="p-6 border-emerald-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg font-mono">
                        {evaluationResult.score}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-900">
                          {evaluationResult.score >= 80 ? 'Mastery Demonstrated' : 
                           evaluationResult.score >= 65 ? 'Satisfactory Explanation' : 'Needs Technical Refinement'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Assessor Rubric Breakdown & Feedback
                        </p>
                      </div>
                    </div>

                    <Badge 
                      variant={evaluationResult.score >= 70 ? 'success' : 'warning'}
                      className="text-xs px-2.5 py-1"
                    >
                      {evaluationResult.score >= 70 ? 'Viva Ready' : 'Review Suggested'}
                    </Badge>
                  </div>

                  {/* 3 Rubric Progress Bars */}
                  {evaluationResult.rubricBreakdown && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Technical Accuracy</span>
                        <div className="flex justify-between items-center mt-1 mb-1.5">
                          <span className="text-sm font-bold text-navy-900">{evaluationResult.rubricBreakdown.technicalAccuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${evaluationResult.rubricBreakdown.technicalAccuracy}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Evidence Awareness</span>
                        <div className="flex justify-between items-center mt-1 mb-1.5">
                          <span className="text-sm font-bold text-navy-900">{evaluationResult.rubricBreakdown.evidenceAwareness}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-navy-900 rounded-full" 
                            style={{ width: `${evaluationResult.rubricBreakdown.evidenceAwareness}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Conceptual Clarity</span>
                        <div className="flex justify-between items-center mt-1 mb-1.5">
                          <span className="text-sm font-bold text-navy-900">{evaluationResult.rubricBreakdown.conceptualClarity}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-coral-500 rounded-full" 
                            style={{ width: `${evaluationResult.rubricBreakdown.conceptualClarity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback Narrative */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 leading-relaxed">
                    <strong className="block text-navy-900 font-semibold mb-1">Academic Examiner Feedback:</strong>
                    <p>{evaluationResult.feedback}</p>
                  </div>

                  {/* Two Columns: Correct Points vs Missed Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {evaluationResult.correctPoints?.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                        <span className="font-bold text-emerald-900 block mb-1.5">✓ Successfully Covered:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                          {evaluationResult.correctPoints.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluationResult.missedGaps?.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                        <span className="font-bold text-amber-900 block mb-1.5">⚠ Omitted / Recommended Review:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                          {evaluationResult.missedGaps.map((gap, gIdx) => (
                            <li key={gIdx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Uncertainty Notice */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>Notice:</strong> {evaluationResult.uncertaintyNotice}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Session Scorecard & Viva Tips (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Cumulative Session Scorecard */}
              <Card className="p-6">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-coral-500" />
                  <span>Session Scorecard</span>
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Cumulative Score</span>
                  <span className="text-3xl font-extrabold text-navy-900 font-mono">
                    {session.overallScore !== undefined ? `${session.overallScore}%` : '—'}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">
                    {session.questions.filter(q => q.evaluation).length} of {session.questions.length} answered
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {session.questions.map((q, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        currentQuestionIndex === idx ? 'bg-navy-50/70 border-navy-300 font-semibold text-navy-900' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{q.skill}</span>
                      {q.evaluation ? (
                        <span className="font-mono text-emerald-600 font-bold">{q.evaluation.score}%</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Viva Defense Guidelines */}
              <Card className="p-6 bg-slate-50/60 border-slate-200 text-xs text-slate-600 space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-navy-900" />
                  <span>Technical Viva Guidelines</span>
                </h4>
                <p className="leading-relaxed">
                  Examiners prioritize <strong>concrete implementation details</strong> over textbook definitions.
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Cite File Names:</strong> Mention exact files (e.g. <code>server/src/app.js</code>) where you made decisions.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Explain Trade-offs:</strong> State why you chose one library or pattern over alternatives.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Detail Error Paths:</strong> Explain how your code behaves when network or databases fail.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

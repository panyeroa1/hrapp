
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApplicantData, InterviewReport, JobPosting } from '../types';

interface AdminPortalProps {
  onLogout: () => void;
}

type ViewMode = 'interviews' | 'jobs';

const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [view, setView] = useState<ViewMode>('interviews');
  
  // Data States
  const [reports, setReports] = useState<(InterviewReport & { applicant: ApplicantData })[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  
  // Selection States
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Job Form State
  const [newJob, setNewJob] = useState<Partial<JobPosting>>({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salaryRange: '',
    description: '',
    requirements: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load Interviews
    const savedReports = localStorage.getItem('interview_reports');
    const savedApplicants = localStorage.getItem('applicants');

    if (savedReports && savedApplicants) {
        const parsedReports: InterviewReport[] = JSON.parse(savedReports);
        const parsedApplicants: ApplicantData[] = JSON.parse(savedApplicants);
        const joined = parsedReports.map(r => {
            const app = parsedApplicants.find(a => a.id === r.applicantId);
            return app ? { ...r, applicant: app } : null;
        }).filter(Boolean) as (InterviewReport & { applicant: ApplicantData })[];
        setReports(joined.reverse());
    }

    // Load Jobs
    const savedJobs = localStorage.getItem('eburon_jobs');
    if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
    } else {
        // Default Mock Jobs
        const defaults: JobPosting[] = [
            {
                id: '1',
                title: 'Senior AI Engineer',
                department: 'Engineering',
                location: 'Brussels (Hybrid)',
                type: 'Full-time',
                salaryRange: '€80k - €120k',
                description: 'We are looking for a visionary AI engineer to lead our Gemini integration projects.',
                requirements: ['5+ years Python', 'Experience with LLMs', 'TypeScript knowledge'],
                status: 'Active',
                postedAt: Date.now()
            }
        ];
        setJobs(defaults);
        localStorage.setItem('eburon_jobs', JSON.stringify(defaults));
    }
  }, []);

  const handleSaveJob = () => {
      if (!newJob.title || !newJob.description) return;

      const job: JobPosting = {
          id: crypto.randomUUID(),
          title: newJob.title!,
          department: newJob.department || 'General',
          location: newJob.location || 'Remote',
          type: (newJob.type as any) || 'Full-time',
          salaryRange: newJob.salaryRange || 'Competitive',
          description: newJob.description!,
          requirements: newJob.requirements || [],
          status: 'Active',
          postedAt: Date.now()
      };

      const updatedJobs = [job, ...jobs];
      setJobs(updatedJobs);
      localStorage.setItem('eburon_jobs', JSON.stringify(updatedJobs));
      setIsCreatingJob(false);
      setNewJob({ title: '', department: '', location: '', description: '', requirements: [] });
      setSelectedJobId(job.id);
  };

  const handleDeleteJob = (id: string) => {
      const updated = jobs.filter(j => j.id !== id);
      setJobs(updated);
      localStorage.setItem('eburon_jobs', JSON.stringify(updated));
      if (selectedJobId === id) setSelectedJobId(null);
  };

  const handleStatusChange = (id: string, newStatus: JobPosting['status']) => {
      const updated = jobs.map(j => j.id === id ? { ...j, status: newStatus } : j);
      setJobs(updated);
      localStorage.setItem('eburon_jobs', JSON.stringify(updated));
  };

  const handleAiGenerateJob = async () => {
    if (!newJob.title) return;
    setIsGenerating(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a professional, exciting job description for a "${newJob.title}" role at Eburon, a cutting-edge AI company. 
        Department: ${newJob.department}. 
        Format: JSON with fields: description (string), requirements (array of strings), recommendedSalaryRange (string).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text || '{}');
        setNewJob(prev => ({
            ...prev,
            description: data.description,
            requirements: data.requirements,
            salaryRange: prev.salaryRange || data.recommendedSalaryRange
        }));
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const getStatusStyles = (status: string) => {
      switch (status) {
          case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          case 'Draft': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          case 'Closed': return 'bg-gray-700/30 text-gray-500 border-gray-600/30';
          default: return 'bg-gray-800 text-gray-400';
      }
  };

  const selectedReport = reports.find(r => r.applicantId === selectedReportId);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-white flex font-sans">
      
      {/* 1. Main Navigation Sidebar (Narrow) */}
      <div className="w-16 md:w-20 bg-black border-r border-gray-800 flex flex-col items-center py-6 z-20 flex-shrink-0">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-8 shadow-lg shadow-emerald-500/20"></div>
        
        <div className="flex flex-col gap-6 w-full">
            <button 
                onClick={() => setView('interviews')}
                className={`w-full py-4 flex justify-center relative group ${view === 'interviews' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                title="Interviews"
            >
                {view === 'interviews' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"></div>}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </button>
            
            <button 
                onClick={() => setView('jobs')}
                className={`w-full py-4 flex justify-center relative group ${view === 'jobs' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                title="Job Board"
            >
                {view === 'jobs' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"></div>}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
        </div>

        <div className="mt-auto">
            <button 
                onClick={onLogout}
                className="p-3 text-gray-500 hover:text-red-400 transition-colors"
                title="Logout"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </div>

      {/* 2. List Sidebar */}
      <div className="w-64 md:w-80 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700 flex flex-col h-full flex-shrink-0 transition-all">
        <div className="p-6 border-b border-gray-700 bg-gray-800/80">
            <h1 className="text-xl font-bold flex items-center justify-between">
                <span>{view === 'interviews' ? 'Candidates' : 'Jobs'}</span>
                {view === 'jobs' && (
                    <button 
                        onClick={() => { setIsCreatingJob(true); setSelectedJobId(null); }}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-black transition-colors shadow-lg shadow-emerald-500/20"
                        title="Create New Job"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                )}
            </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {view === 'interviews' ? (
                reports.length === 0 ? (
                    <div className="p-6 text-gray-500 text-sm italic">No interviews yet.</div>
                ) : (
                    reports.map(report => (
                        <button 
                            key={report.applicantId}
                            onClick={() => setSelectedReportId(report.applicantId)}
                            className={`w-full text-left p-4 border-b border-gray-700/50 hover:bg-gray-700/50 transition-all ${selectedReportId === report.applicantId ? 'bg-gray-700 border-l-4 border-l-emerald-500 pl-3' : ''}`}
                        >
                            <div className="font-semibold text-white truncate">{report.applicant.name}</div>
                            <div className="text-xs text-gray-400 mt-1 truncate">{report.applicant.role}</div>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    report.recommendation === 'HIRE' ? 'bg-emerald-500/20 text-emerald-300' :
                                    report.recommendation === 'PASS' ? 'bg-red-500/20 text-red-300' :
                                    'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                    {report.recommendation}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {new Date(report.applicant.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </button>
                    ))
                )
            ) : (
                jobs.length === 0 ? (
                    <div className="p-6 text-gray-500 text-sm italic">No jobs found.</div>
                ) : (
                    jobs.map(job => (
                        <button 
                            key={job.id}
                            onClick={() => { setSelectedJobId(job.id); setIsCreatingJob(false); }}
                            className={`w-full text-left p-4 border-b border-gray-700/50 hover:bg-gray-700/50 transition-all group ${
                                selectedJobId === job.id && !isCreatingJob ? 'bg-gray-700 border-l-4 border-l-emerald-500 pl-3' : ''
                            } ${job.status === 'Closed' ? 'opacity-60 grayscale' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className={`font-semibold truncate pr-2 ${job.status === 'Closed' ? 'text-gray-400' : 'text-white'}`}>{job.title}</div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${getStatusStyles(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>
                            
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                                {job.location}
                            </div>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/10 px-2 py-0.5 rounded-full">{job.type}</span>
                                {job.department && <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/10 px-2 py-0.5 rounded-full truncate max-w-[100px]">{job.department}</span>}
                            </div>
                        </button>
                    ))
                )
            )}
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-900 to-[#111] overflow-y-auto p-4 md:p-8 relative min-w-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50"></div>
        
        {view === 'interviews' && (
            selectedReport ? (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
                    {/* Interview Report View */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{selectedReport.applicant.name}</h2>
                            <p className="text-lg md:text-xl text-emerald-400 mt-1">{selectedReport.applicant.role}</p>
                            <p className="text-sm text-gray-500">{selectedReport.applicant.email}</p>
                        </div>
                        <div className="text-center bg-gray-800/40 backdrop-blur border border-gray-700 p-4 rounded-2xl shadow-2xl self-start md:self-auto w-full md:w-auto">
                            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Fit Score</div>
                            <div className={`text-5xl font-black ${
                                selectedReport.score >= 80 ? 'text-emerald-400' :
                                selectedReport.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                                {selectedReport.score}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="p-1 bg-blue-500/20 rounded-lg text-blue-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                    AI Summary
                                </h3>
                                <p className="text-gray-300 leading-relaxed font-light">
                                    {selectedReport.summary}
                                </p>
                            </div>
                            
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-4">Transcript</h3>
                                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {selectedReport.transcript.map((t, i) => (
                                        <div key={i} className={`flex ${t.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                                                t.role === 'model' 
                                                ? 'bg-gray-800 text-gray-200 rounded-tl-none' 
                                                : 'bg-indigo-600/80 text-white rounded-tr-none'
                                            }`}>
                                                <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-bold">{t.role === 'model' ? 'Beatrice (AI)' : 'Candidate'}</div>
                                                {t.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Analysis</h3>
                                
                                <div className="mb-6">
                                    <h4 className="text-emerald-400 font-bold mb-2 text-sm">Strengths</h4>
                                    <ul className="space-y-2">
                                        {selectedReport.strengths.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-red-400 font-bold mb-2 text-sm">Weaknesses</h4>
                                    <ul className="space-y-2">
                                        {selectedReport.weaknesses.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <p className="text-lg font-medium">Select a candidate to view their report</p>
                </div>
            )
        )}

        {view === 'jobs' && (
            isCreatingJob ? (
                // --- JOB CREATION FORM ---
                <div className="max-w-3xl mx-auto animate-fade-in pb-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Create New Job</h2>
                        <button onClick={() => setIsCreatingJob(false)} className="text-gray-400 hover:text-white transition-colors">Cancel</button>
                    </div>

                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                        placeholder="e.g. Senior Product Designer"
                                        value={newJob.title}
                                        onChange={e => setNewJob({...newJob, title: e.target.value})}
                                    />
                                    <button 
                                        onClick={handleAiGenerateJob}
                                        disabled={isGenerating || !newJob.title}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 md:px-6 py-2 rounded-xl font-medium shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isGenerating ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        )}
                                        <span className="hidden md:inline">Magic Generate</span>
                                        <span className="md:hidden">AI</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    value={newJob.department}
                                    onChange={e => setNewJob({...newJob, department: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    value={newJob.location}
                                    onChange={e => setNewJob({...newJob, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                                <select 
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    value={newJob.type}
                                    onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Remote</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Salary Range</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    placeholder="e.g. €60k - €80k"
                                    value={newJob.salaryRange}
                                    onChange={e => setNewJob({...newJob, salaryRange: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea 
                                    rows={6}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none"
                                    value={newJob.description}
                                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={handleSaveJob}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 w-full md:w-auto"
                            >
                                Publish Job
                            </button>
                        </div>
                    </div>
                </div>
            ) : selectedJob ? (
                // --- JOB DETAIL VIEW ---
                <div className="max-w-4xl mx-auto animate-fade-in pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusStyles(selectedJob.status)}`}>
                                    {selectedJob.status}
                                </span>
                                <span className="text-gray-500 text-sm">Posted {new Date(selectedJob.postedAt).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{selectedJob.title}</h2>
                            <div className="flex flex-wrap gap-4 text-gray-400 text-sm md:text-base">
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {selectedJob.department}</span>
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {selectedJob.location}</span>
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {selectedJob.salaryRange}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeleteJob(selectedJob.id)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20 flex-shrink-0"
                            title="Delete Job"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-4">About the Role</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>
                            
                            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                                    <h3 className="text-xl font-bold text-white mb-4">Requirements</h3>
                                    <ul className="space-y-3">
                                        {selectedJob.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Status & Actions</h3>
                                
                                <div className="flex bg-gray-950 rounded-lg p-1 mb-6 border border-gray-800">
                                    {['Active', 'Draft', 'Closed'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(selectedJob.id, s as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                                                selectedJob.status === s 
                                                ? (s === 'Active' ? 'bg-emerald-600 text-white' : s === 'Closed' ? 'bg-gray-700 text-white' : 'bg-amber-600 text-black')
                                                : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-300 border-b border-gray-800 pb-2">
                                        <span>Applicants</span>
                                        <span className="font-mono font-bold text-white">0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-300 border-b border-gray-800 pb-2">
                                        <span>Views</span>
                                        <span className="font-mono font-bold text-white">0</span>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                    View Applicants
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                     <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-lg font-medium mb-4">Select a job to manage or create a new one.</p>
                    <button 
                        onClick={() => { setIsCreatingJob(true); setSelectedJobId(null); }}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium shadow-lg hover:bg-emerald-500 transition-all"
                    >
                        Create Job Posting
                    </button>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default AdminPortal;

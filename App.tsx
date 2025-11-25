import React, { useState } from 'react';
import InterviewSession from './components/InterviewSession';
import ApplicantForm from './components/ApplicantForm';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import AdminPortal from './components/AdminPortal';
import { AVATAR_URL } from './constants';
import { ApplicantData, AppStep } from './types';

function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  const handleFormSubmit = (data: ApplicantData) => {
    setApplicantData(data);
    setStep('interview'); // Transition state to interview setup
  };

  const startCall = async () => {
    try {
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
    } catch (e) {
        console.error("API Key flow error:", e);
    }

    try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setHasPermissions(true);
    } catch (e) {
        console.error("Media permission error:", e);
        alert("Camera and Microphone permissions are required. Please reset permissions for this site and try again.");
    }
  };

  const handleEndCall = () => {
    setStep('thank-you');
  };

  const handleStartOver = () => {
    setApplicantData(null);
    setHasPermissions(false);
    setStep('landing');
  };

  // --- ROUTING ---

  if (step === 'landing') {
      return (
          <LandingPage 
            onFindJob={() => setStep('applicant-form')}
            onAdminLogin={() => setStep('login')}
          />
      );
  }

  if (step === 'login') {
      return (
          <AdminLogin 
            onSuccess={() => setStep('admin')}
            onBack={() => setStep('landing')}
          />
      );
  }

  if (step === 'admin') {
      return (
          <AdminPortal 
            onLogout={() => setStep('landing')}
          />
      );
  }

  if (step === 'applicant-form') {
    return <ApplicantForm onSubmit={handleFormSubmit} onBack={() => setStep('landing')} />;
  }

  // Interview Pre-check
  if (step === 'interview' && !hasPermissions) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-6">
                        <img 
                            src={AVATAR_URL}
                            alt="Beatrice" 
                            className="w-full h-full rounded-full object-cover border-4 border-gray-700 shadow-xl"
                        />
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800" title="Online"></div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Hello, {applicantData?.name.split(' ')[0]}
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Ready for your interview for the <strong>{applicantData?.role}</strong> position?
                    </p>
                </div>

                <div className="bg-gray-800 rounded-2xl p-6 text-left shadow-lg border border-gray-700">
                    <div className="flex items-start space-x-4 mb-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Duration</h3>
                            <p className="text-gray-400 text-sm">Approx. 30-45 minutes</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Format</h3>
                            <p className="text-gray-400 text-sm">Live Video Interaction</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <button 
                        onClick={startCall}
                        className="w-full group relative flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        Join Interview Room
                    </button>
                    <button 
                        onClick={handleStartOver}
                        className="text-sm text-gray-500 hover:text-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )
  }

  // Active Interview
  if (step === 'interview' && hasPermissions && applicantData) {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <InterviewSession onEndCall={handleEndCall} applicantData={applicantData} />
        </div>
    );
  }

  if (step === 'thank-you') {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center text-white">
              <div className="max-w-lg space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-3xl font-bold">Interview Complete</h2>
                  <p className="text-gray-400 text-lg">Thank you, {applicantData?.name}. Beatrice has submitted your evaluation to the hiring team.</p>
                  <p className="text-gray-500">You will hear from us within 48 hours.</p>
                  <button onClick={handleStartOver} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-full font-medium transition-colors">
                      Back to Home
                  </button>
              </div>
          </div>
      )
  }

  return null;
}

export default App;

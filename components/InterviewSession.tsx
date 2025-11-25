import React, { useEffect, useRef, useState } from 'react';
import { GeminiLiveClient } from '../services/geminiLive';
import { generateInterviewReport } from '../services/reportGenerator';
import { AVATAR_URL, OFFICE_BACKGROUND_URL } from '../constants';
import { ApplicantData } from '../types';

interface InterviewSessionProps {
  onEndCall: () => void;
  applicantData: ApplicantData;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ onEndCall, applicantData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [client, setClient] = useState<GeminiLiveClient | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'analyzing'>('connecting');

  useEffect(() => {
    const initSession = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 640 } }, 
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }

        const liveClient = new GeminiLiveClient(
            (vol) => setMicVolume(vol),
            () => {
               // On unforeseen disconnect
            }
        );

        if (videoRef.current) {
            console.log("Connecting with applicant data:", applicantData);
            await liveClient.connect(videoRef.current, applicantData);
            setStatus('connected');
            setClient(liveClient);
        }
        
      } catch (error) {
        console.error("Failed to initialize session", error);
        setStatus('disconnected');
      }
    };

    if (applicantData) {
        initSession();
    }

    return () => {
        if (client) {
            client.disconnect();
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantData]);

  const handleEndCall = async () => {
    if (!client) {
        onEndCall();
        return;
    }

    setStatus('analyzing');
    
    // 1. Get transcript
    const transcript = client.getTranscript();
    client.disconnect();
    
    // 2. Generate Report
    console.log("Generating report for:", applicantData.name);
    const report = await generateInterviewReport(applicantData, transcript);

    // 3. Save to localStorage
    const savedReports = JSON.parse(localStorage.getItem('interview_reports') || '[]');
    savedReports.push(report);
    localStorage.setItem('interview_reports', JSON.stringify(savedReports));

    const savedApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    savedApplicants.push(applicantData);
    localStorage.setItem('applicants', JSON.stringify(savedApplicants));

    onEndCall();
  };

  const handleRaiseHand = () => {
      if (client && status === 'connected') {
          client.sendText("[System]: The candidate has a question.");
      }
  };

  if (status === 'analyzing') {
      return (
          <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold">Analyzing Interview...</h2>
              <p className="text-gray-400">Beatrice is compiling your feedback.</p>
          </div>
      )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900">
      
      {/* --- Main Avatar View (Beatrice) --- */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${OFFICE_BACKGROUND_URL})` }}
        >
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className={`relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border-4 border-gray-700 shadow-2xl overflow-hidden transition-all duration-300 ${status === 'connected' ? 'speaking-ring' : ''}`}>
                <img 
                    src={AVATAR_URL} 
                    alt="Beatrice HR" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="mt-6 text-center bg-black/40 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 shadow-xl">
                <h2 className="text-2xl font-semibold text-white drop-shadow-md">Beatrice</h2>
                <p className="text-emerald-300 font-medium drop-shadow-sm">HR Manager • Eburon Jobs Outsource</p>
                {status === 'connecting' && <p className="text-gray-300 text-sm mt-2 animate-pulse">Connecting secure line...</p>}
            </div>
        </div>

        {/* --- Self View (Picture in Picture) --- */}
        <div className="absolute top-4 right-4 w-28 h-40 sm:w-36 sm:h-48 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700 z-20">
            <video 
                ref={videoRef}
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute bottom-1 right-1">
                <div className="flex gap-0.5 items-end h-3">
                    {[1, 2, 3].map(i => (
                        <div 
                            key={i} 
                            className="w-1 bg-green-500 rounded-full transition-all duration-75"
                            style={{ height: `${Math.min(100, Math.max(20, micVolume * 100 * (i * 0.5)))}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- Controls --- */}
      <div className="bg-gray-800/90 backdrop-blur-md p-6 rounded-t-3xl border-t border-gray-700 safe-area-bottom">
        <div className="flex justify-center items-center gap-8">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
                {isMuted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
            </button>

            <button
                onClick={handleRaiseHand}
                className="p-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg transform hover:scale-105 transition-all"
                title="I have a question"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
            </button>

            <button 
                onClick={handleEndCall}
                className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transform hover:scale-105 transition-all"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;

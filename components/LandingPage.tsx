import React from 'react';

interface LandingPageProps {
  onFindJob: () => void;
  onAdminLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onFindJob, onAdminLogin }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto w-full z-20 relative">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500"></div>
          <span className="text-xl font-bold tracking-tight">Match-It</span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={onAdminLogin} className="text-sm text-gray-400 hover:text-white transition-colors">
            Employer Login
          </button>
          <button 
            onClick={onFindJob}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-all text-sm"
          >
            Find a Job
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-left z-10">
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur-sm text-xs font-medium text-emerald-400">
              POWERED BY EBURON
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Unlock Your <br/> Potential with <br/>
              <span className="text-emerald-400">AI-Powered Matching</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Match-It revolutionizes hiring for job seekers and companies with intelligent AI matching, personalized recommendations, and cutting-edge AI interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onFindJob}
                className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Find a Job
              </button>
              <button 
                onClick={onAdminLogin}
                className="px-8 py-4 rounded-full border border-gray-700 hover:bg-gray-800 text-white font-semibold transition-all"
              >
                Find Talent
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-16 md:mt-0 relative">
             {/* Mock UI Card representing AI Matching */}
             <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img 
                    src="https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1200&auto=format&fit=crop" 
                    alt="AI Matching Interface" 
                    className="rounded-lg w-full h-auto opacity-90"
                />
                <div className="absolute -bottom-6 -left-6 bg-gray-800 p-4 rounded-xl border border-gray-600 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xl">98%</div>
                    <div>
                        <div className="text-white font-bold">Match Score</div>
                        <div className="text-xs text-gray-400">Role: Senior Engineer</div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unlock Smarter Connections</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Match-It leverages cutting-edge artificial intelligence to revolutionize your job search or hiring process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Precision Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI analyzes thousands of data points to match candidates with roles that truly fit their skills and aspirations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Personalized Profiles</h3>
              <p className="text-gray-400 leading-relaxed">
                Create rich, detailed profiles that showcase your unique strengths to potential employers or candidates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Effortless Applications</h3>
              <p className="text-gray-400 leading-relaxed">
                Streamlined application process for candidates and intuitive applicant tracking for employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
         {/* Seekers */}
         <div className="flex flex-col md:flex-row items-center gap-12 mb-32">
            <div className="md:w-1/2">
                <img 
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop" 
                    alt="Job Seekers" 
                    className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 border border-gray-800"
                />
            </div>
            <div className="md:w-1/2">
                <h3 className="text-3xl font-bold mb-6 text-white">For Job Seekers: <br/>Find Your Next Opportunity</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">01</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Create Your Profile</h4>
                            <p className="text-gray-400 text-sm">Build a comprehensive profile highlighting your skills, experience, and career aspirations.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">02</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Get AI-Matched Jobs</h4>
                            <p className="text-gray-400 text-sm">Receive personalized job recommendations tailored precisely to your profile.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">03</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Apply with Confidence</h4>
                            <p className="text-gray-400 text-sm">Apply to jobs with a single click, knowing that you're a strong fit for the role.</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Employers */}
         <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2">
                <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" 
                    alt="Employers" 
                    className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 border border-gray-800"
                />
            </div>
            <div className="md:w-1/2">
                <h3 className="text-3xl font-bold mb-6 text-white">For Employers: <br/>Find Your Perfect Hire</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">01</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Post Your Job</h4>
                            <p className="text-gray-400 text-sm">Quickly post job openings. Our AI begins analyzing your needs immediately.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">02</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Receive AI-Curated Matches</h4>
                            <p className="text-gray-400 text-sm">Get a shortlist of highly qualified candidates whose profiles perfectly match.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-2xl font-bold text-gray-700">03</div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Connect & Hire</h4>
                            <p className="text-gray-400 text-sm">Easily review candidate profiles, initiate communication, and make the best hiring decisions.</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-4 md:mb-0">
                <p>Eburon ©2025 | All rights reserved</p>
                <p>Boterstraat 36, Ieper, Belgium</p>
                <p>eburon@gmail.com</p>
            </div>
            <div className="flex space-x-6">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Settings, Search, CheckCircle2, ChevronRight, ArrowLeft, Loader2, UploadCloud, User, LogOut, LogIn, Award, Target, Zap, BookOpen, Clock, FileText, HelpCircle, Activity, Database, BarChart2, Plus } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import { SYLLABUS } from './syllabus';

// --- ANIMATED BACKGROUND COMPONENT ---
const AnimatedBackground = ({ children }) => (
  <div className="relative min-h-screen bg-[#0f172a] overflow-hidden">
    <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-blob"></div>
    <div className="absolute top-1/3 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-4000"></div>
    <div className="relative z-10">{children}</div>
  </div>
);

// --- SHARED NAVBAR ---
const Navbar = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setSettingsOpen(false);
    } catch (error) { console.error("Login failed: ", error); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSettingsOpen(false);
      navigate('/');
    } catch (error) { console.error("Logout failed: ", error); }
  };

  const ADMIN_EMAIL = "adiprak1809@gmail.com"; 
  const isAdmin = user && (user.email === ADMIN_EMAIL);

  return (
    <div className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-2xl font-bold text-white tracking-tight transition-colors group-hover:text-blue-50">
            EduShare <span className="text-blue-400 text-sm align-top bg-blue-500/10 px-2 py-0.5 rounded ml-1 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">Prep</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className={`p-2 rounded-full transition-all duration-300 ${settingsOpen ? 'bg-slate-800 text-white rotate-90' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:rotate-90'}`}>
            <Settings size={20} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-12 w-56 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.displayName || user.email}</p>
                  </div>
                  <button onClick={() => { setSettingsOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"><User size={16} /> Profile</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2"><LogOut size={16} /> Log out</button>
                </>
              ) : (
                <button onClick={handleLogin} className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors flex items-center gap-2">
                  <LogIn size={16} /> Sign in with Google
                </button>
              )}
              {isAdmin && (
                <div className="border-t border-slate-700 bg-slate-800/30">
                  <button onClick={() => { setSettingsOpen(false); navigate('/admin'); }} className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors">Admin Panel</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SCREEN 1: DASHBOARD ---
const ExamCard = ({ title, subtitle, iconBg, textColor, shadowColor, IconComponent }) => {
  const navigate = useNavigate();
  return (
    <div className={`group bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-slate-600 hover:shadow-[0_0_30px_-5px_${shadowColor}]`}>
      <div className="p-6">
        <div className="flex gap-4 items-center mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg} transition-all duration-300 group-hover:scale-110`}>
            <IconComponent size={24} className={textColor} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white transition-colors group-hover:text-blue-50">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => navigate(`/papers/${title}`)} className="py-2.5 text-sm font-medium text-blue-400 bg-slate-800/50 rounded-lg border border-slate-700/50 transition-all hover:bg-slate-700">Paper Wise</button>
          <button onClick={() => navigate(`/chapters/${title}`)} className="py-2.5 text-sm font-medium text-blue-400 bg-slate-800/50 rounded-lg border border-slate-700/50 transition-all hover:bg-slate-700">Chapter Wise</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 mt-4 space-y-12">
        <div className="bg-[#1e293b]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} /> Mission 2028
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">EduShare</span>
              {user ? `, ${user.displayName?.split(' ')[0] || 'Aspirant'}!` : '!'}
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
              Practice chapter-wise previous year questions, simulate full-length CBT mock tests, and track your performance analytics.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg px-5 py-2.5 border border-slate-700 shadow-inner">
                <Database size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-300">Live PYQ Database</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg px-5 py-2.5 border border-slate-700 shadow-inner">
                <BarChart2 size={18} className="text-purple-400" />
                <span className="text-sm font-semibold text-slate-300">Smart Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span> Select Target Examination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExamCard title="JEE Main" subtitle="Previous Years Questions with Solutions" iconBg="bg-orange-500/10" textColor="text-orange-500" shadowColor="rgba(249,115,22,0.2)" IconComponent={Target} />
            <ExamCard title="JEE Advanced" subtitle="Multi-correct & Integer Type PYQs" iconBg="bg-blue-500/10" textColor="text-blue-500" shadowColor="rgba(59,130,246,0.2)" IconComponent={Zap} />
            <ExamCard title="NEET (UG)" subtitle="Biology, Physics & Chemistry Core PYQs" iconBg="bg-emerald-500/10" textColor="text-emerald-500" shadowColor="rgba(16,185,129,0.2)" IconComponent={Activity} />
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 1.5: PAPER WISE LISTING ---
const PaperList = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Back to Dashboard</button>
        <h2 className="text-2xl font-bold text-white mb-1">{examId} Mock Tests</h2>
        <p className="text-sm text-slate-400 mb-8">Practice full previous year question papers under real exam timer conditions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => navigate('/paper-practice')} className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-600 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded">{examId}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={14} /> 3 Hours</span>
            </div>
            <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors mb-2">2026 Morning Shift</h3>
            <p className="text-xs text-slate-400 mb-6">Full syllabus mock exam with instant scoring analytics.</p>
            <div className="flex items-center justify-between text-sm font-semibold text-blue-400 pt-4 border-t border-slate-800">
              <span>Start Mock Test</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 2: DYNAMIC CHAPTER GRID ---
const ChapterGrid = () => {
  const navigate = useNavigate();
  const { examId } = useParams(); 
  
  const examSyllabus = SYLLABUS[examId] || {};
  const subjects = Object.keys(examSyllabus);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
  const chapters = Object.keys(examSyllabus[selectedSubject] || {});

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Back to Dashboard</button>
        <h2 className="text-2xl font-bold text-white">{examId} Syllabus</h2>
        <p className="text-sm text-slate-400 mt-1">Select a chapter to begin practice.</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="space-y-1">
            {subjects.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${selectedSubject === sub ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.length === 0 ? <p className="text-slate-500">No chapters mapped yet.</p> : null}
            {chapters.map(chapter => (
              <div 
                key={chapter}
                onClick={() => navigate(`/practice/${examId}/${selectedSubject}/${chapter}`)} 
                className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-600 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-medium text-sm leading-snug group-hover:text-blue-400">{chapter}</h3>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 3: DYNAMIC PRACTICE ENGINE ---
const PracticeArea = () => {
  const navigate = useNavigate();
  const { examId, subjectId, chapterId } = useParams(); 
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  
  const availableTopics = SYLLABUS[examId]?.[subjectId]?.[chapterId] || [];
  const [activeTopic, setActiveTopic] = useState('All Topics');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { setCurrentUser(user); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, "questions"), 
          where("exam", "==", examId),
          where("subject", "==", subjectId),
          where("chapter", "==", chapterId)
        );
        const snapshot = await getDocs(q);
        const qList = [];
        snapshot.forEach((doc) => qList.push({ id: doc.id, ...doc.data() }));
        setQuestions(qList);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchQuestions();
  }, [examId, subjectId, chapterId]);

  const filteredQuestions = activeTopic === 'All Topics' ? questions : questions.filter(q => q.topic === activeTopic);
  const currentQ = filteredQuestions[currentIndex];

  const handleCheck = async () => {
    if (selectedOption && !isChecked) {
      setIsChecked(true);
      if (currentUser && selectedOption === currentQ.correctOption) {
         await setDoc(doc(db, "user_stats", currentUser.uid), { totalAttempted: increment(1), correctCount: increment(1) }, { merge: true });
      } else if (currentUser) {
         await setDoc(doc(db, "user_stats", currentUser.uid), { totalAttempted: increment(1) }, { merge: true });
      }
    }
  };

  const handleNext = () => { setIsChecked(false); setSelectedOption(null); setShowSolution(false); if (currentIndex < filteredQuestions.length - 1) setCurrentIndex(currentIndex + 1); };

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Back to Chapters</button>
        <h2 className="text-2xl font-bold text-white mb-2">{chapterId}</h2>
        <p className="text-sm text-slate-400">{examId} • {subjectId}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4 pl-1">Filter by Topic</h4>
          <div className="space-y-1">
            <button onClick={() => { setActiveTopic('All Topics'); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeTopic === 'All Topics' ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>All Topics</button>
            {availableTopics.map(topic => (
              <button key={topic} onClick={() => { setActiveTopic(topic); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeTopic === topic ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>{topic}</button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 border border-slate-800 rounded-xl bg-[#1e293b]/90"><Loader2 className="animate-spin text-blue-500 mb-4" size={32} /><p className="text-slate-400">Loading questions...</p></div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-slate-800 rounded-xl bg-[#1e293b]/90 text-center p-6"><Search size={48} className="text-slate-600 mb-4" /><h3 className="text-white font-bold text-lg mb-1">No Questions Found</h3><p className="text-slate-400 text-sm">Upload questions via Admin Panel for this chapter.</p></div>
          ) : (
            <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Question {currentIndex + 1} of {filteredQuestions.length}</span>
                <span className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded">{currentQ.topic}</span>
              </div>
              
              <div className="p-6">
                {currentQ.imageUrl ? <img src={currentQ.imageUrl} alt="Question" className="max-w-full rounded-lg border border-slate-700 mb-8 mx-auto" /> : null}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    let buttonStyle = "bg-[#0f172a] border-slate-700 text-slate-300 hover:border-slate-500";
                    if (isChecked) {
                      if (option === currentQ.correctOption) buttonStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                      else if (option === selectedOption) buttonStyle = "bg-red-500/10 border-red-500 text-red-400";
                    } else if (selectedOption === option) buttonStyle = "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                    return (
                      <button key={option} disabled={isChecked} onClick={() => setSelectedOption(option)} className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left ${buttonStyle}`}>
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold mr-4 ${selectedOption === option || (isChecked && option === currentQ.correctOption) ? 'bg-current text-[#1e293b]' : 'bg-slate-800 text-slate-400'}`}>{option}</div>
                        <span className="text-sm font-medium">Option {option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      {isChecked && selectedOption === currentQ.correctOption && <span className="text-emerald-400">Correct! (+4 marks)</span>}
                      {isChecked && selectedOption !== currentQ.correctOption && <span className="text-red-400">Incorrect! (-1 mark)</span>}
                    </div>
                    <div className="flex gap-3">
                      {isChecked && (
                        <button onClick={() => setShowSolution(!showSolution)} className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium flex items-center gap-2 transition-colors">
                          <HelpCircle size={16} /> {showSolution ? 'Hide Solution' : 'View Solution'}
                        </button>
                      )}
                      <button onClick={isChecked ? handleNext : handleCheck} disabled={!selectedOption && !isChecked} className={`px-8 py-2.5 rounded-lg font-medium text-sm transition-all ${!selectedOption && !isChecked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : isChecked ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                        {isChecked ? (currentIndex === filteredQuestions.length - 1 ? 'Finish' : 'Next Question') : 'Check Answer'}
                      </button>
                    </div>
                  </div>

                  {showSolution && (
                    <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-6 mt-2">
                      <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><Award size={16} /> Step-by-Step Explanation</h4>
                      <p className="text-slate-300 text-sm leading-relaxed mt-2">
                        Correct Option is <span className="font-bold text-emerald-400">{currentQ.correctOption}</span>.<br/><br/>
                        {currentQ.explanationText ? currentQ.explanationText : " Detailed step-by-step solution breakdown will be uploaded soon for this PYQ."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 3.5: CBT EXAM SIMULATOR ---
const PaperPracticeArea = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const q = query(collection(db, "questions"), where("year", "==", 2026));
        const snapshot = await getDocs(q);
        const qList = [];
        snapshot.forEach((doc) => qList.push({ id: doc.id, ...doc.data() }));
        setQuestions(qList);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchPaper();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
  };

  const calculateScore = () => {
    let score = 0, correct = 0, incorrect = 0;
    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen) {
        if (chosen === q.correctOption) { score += 4; correct += 1; } 
        else { score -= 1; incorrect += 1; }
      }
    });
    return { score, correct, incorrect, unattempted: questions.length - (correct + incorrect) };
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]"><Loader2 className="animate-spin text-blue-500 mb-4" size={40} /><p className="text-slate-400">Loading Full Mock Test Paper...</p></div>
      </AnimatedBackground>
    );
  }

  if (questions.length === 0) {
    return (
      <AnimatedBackground>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">No Questions Found</h3>
          <p className="text-slate-400 text-sm mb-6">Upload questions through your Admin panel for Year 2026 to start tests!</p>
          <button onClick={() => navigate('/papers')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">Back to Papers</button>
        </div>
      </AnimatedBackground>
    );
  }

  const currentQ = questions[currentIndex];
  const results = isSubmitted ? calculateScore() : null;

  return (
    <AnimatedBackground>
      <div className="border-b border-slate-800 bg-[#0f172a] sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
        <span className="font-bold text-white text-base">Full Exam Simulation</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-lg border border-slate-700 text-yellow-400 font-mono font-bold text-sm">
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
          {!isSubmitted && (
            <button onClick={() => setIsSubmitted(true)} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-all">Submit Paper</button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {isSubmitted ? (
            <div className="bg-[#1e293b]/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <Award size={48} className="text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Mock Test Submitted!</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-400 font-bold mb-1">Score</p><p className="text-3xl font-extrabold text-blue-400">{results.score}</p></div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-400 font-bold mb-1">Correct</p><p className="text-3xl font-extrabold text-emerald-400">{results.correct}</p></div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-400 font-bold mb-1">Incorrect</p><p className="text-3xl font-extrabold text-red-400">{results.incorrect}</p></div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-400 font-bold mb-1">Unattempted</p><p className="text-3xl font-extrabold text-slate-400">{results.unattempted}</p></div>
              </div>
              <button onClick={() => navigate('/papers')} className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold">Back to Papers</button>
            </div>
          ) : (
            <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded">{currentQ.subject} • {currentQ.chapter}</span>
              </div>
              <div className="p-6">
                {currentQ.imageUrl ? <img src={currentQ.imageUrl} alt="Question" className="max-w-full rounded-lg border border-slate-700 mb-8 mx-auto" /> : <div className="w-full h-48 bg-[#0f172a] rounded-lg border border-slate-700 flex items-center justify-center mb-8"><span className="text-slate-500">No image</span></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const isSelected = selectedAnswers[currentIndex] === option;
                    return (
                      <button key={option} onClick={() => handleOptionSelect(option)} className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#0f172a] border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold mr-4 ${isSelected ? 'bg-blue-500 text-[#1e293b]' : 'bg-slate-800 text-slate-400'}`}>{option}</div>
                        <span className="text-sm font-medium">Option {option}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 text-sm font-medium">Previous</button>
                  <button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white disabled:opacity-50 text-sm font-medium">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6 sticky top-20">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Question Palette</h4>
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;
                let btnColor = "bg-slate-800 text-slate-300 border-slate-700";
                if (isAnswered) btnColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
                if (isCurrent) btnColor += " ring-2 ring-blue-500";
                return (
                  <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-10 h-10 rounded-lg border font-bold text-sm flex items-center justify-center transition-all ${btnColor}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 4: USER PROFILE ---
const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalAttempted: 0, correctCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const statRef = doc(db, "user_stats", currentUser.uid);
          const statSnap = await getDoc(statRef);
          if (statSnap.exists()) setStats(statSnap.data());
        } catch (err) { console.error(err); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const accuracy = stats.totalAttempted > 0 ? Math.round((stats.correctCount / stats.totalAttempted) * 100) : 0;

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
        <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 overflow-hidden shadow-inner">
            {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User size={40} />}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{user?.displayName || "EduShare Student"}</h2>
            <p className="text-sm text-slate-400 mb-3">{user?.email || "Signed in as Guest"}</p>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full"><Award size={14} /> JEE / NEET Aspirant</div>
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap className="text-yellow-400" size={20} /> Live Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6"><span className="text-xs font-bold text-slate-400 uppercase">Total Solved</span><p className="text-3xl font-extrabold text-white mt-2">{stats.totalAttempted}</p></div>
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6"><span className="text-xs font-bold text-slate-400 uppercase">Accuracy Rate</span><p className="text-3xl font-extrabold text-white mt-2">{accuracy}%</p></div>
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6"><span className="text-xs font-bold text-slate-400 uppercase">Status</span><p className="text-3xl font-extrabold text-white mt-2">Active</p></div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 5: ADMIN DASHBOARD (WITH SYLLABUS.JS & CUSTOM MAKERS RESTORED) ---
const AdminUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [explanationText, setExplanationText] = useState('');
  
  // Create a local state version of SYLLABUS so we can add custom chapters temporarily during an upload session
  const [localSyllabus, setLocalSyllabus] = useState(SYLLABUS);

  const availableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const availableShifts = ['Morning Shift', 'Evening Shift', 'Shift 1', 'Shift 2', 'N/A'];

  const [formData, setFormData] = useState({
    exam: 'JEE Main',
    year: '2026',
    shift: 'Morning Shift',
    subject: 'Physics',
    chapter: 'Mechanics',
    topic: '1D & 2D Motion',
    correctOption: 'A'
  });

  const currentSubjects = Object.keys(localSyllabus[formData.exam] || {});
  const currentChapters = Object.keys(localSyllabus[formData.exam]?.[formData.subject] || {});
  const currentTopics = localSyllabus[formData.exam]?.[formData.subject]?.[formData.chapter] || [];

  const handleExamChange = (e) => {
    const newExam = e.target.value;
    const subjects = Object.keys(localSyllabus[newExam] || {});
    const newSub = subjects[0] || '';
    const chapters = Object.keys(localSyllabus[newExam]?.[newSub] || {});
    const newChap = chapters[0] || '';
    const topics = localSyllabus[newExam]?.[newSub]?.[newChap] || [];
    setFormData({ ...formData, exam: newExam, subject: newSub, chapter: newChap, topic: topics[0] || '' });
  };

  const handleSubjectChange = (e) => {
    const newSub = e.target.value;
    const chapters = Object.keys(localSyllabus[formData.exam]?.[newSub] || {});
    const newChap = chapters[0] || '';
    const topics = localSyllabus[formData.exam]?.[newSub]?.[newChap] || [];
    setFormData({ ...formData, subject: newSub, chapter: newChap, topic: topics[0] || '' });
  };

  const handleChapterChange = (e) => {
    const newChap = e.target.value;
    const topics = localSyllabus[formData.exam]?.[formData.subject]?.[newChap] || [];
    setFormData({ ...formData, chapter: newChap, topic: topics[0] || '' });
  };

  const [newChapterName, setNewChapterName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  // RESTORED: Add Chapter Handler
  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || !formData.subject) return;
    
    setLocalSyllabus(prev => ({
      ...prev,
      [formData.exam]: {
        ...prev[formData.exam],
        [formData.subject]: {
          ...(prev[formData.exam]?.[formData.subject] || {}),
          [newChapterName]: []
        }
      }
    }));
    setFormData(prev => ({ ...prev, chapter: newChapterName, topic: '' }));
    setNewChapterName('');
  };

  // RESTORED: Add Topic Handler
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !formData.subject || !formData.chapter) return;
    
    setLocalSyllabus(prev => ({
      ...prev,
      [formData.exam]: {
        ...prev[formData.exam],
        [formData.subject]: {
          ...prev[formData.exam][formData.subject],
          [formData.chapter]: [...(prev[formData.exam][formData.subject][formData.chapter] || []), newTopicName]
        }
      }
    }));
    setFormData(prev => ({ ...prev, topic: newTopicName }));
    setNewTopicName('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a question image file first!");
    
    setUploading(true);
    setStatus('Uploading image to Cloudinary...');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'class_hub_preset'); 

      const res = await fetch('https://api.cloudinary.com/v1_1/aqqngm6u/image/upload', { method: 'POST', body: data });
      const cloudData = await res.json();
      if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");

      setStatus('Saving question to Firebase...');
      await addDoc(collection(db, "questions"), {
        ...formData,
        year: parseInt(formData.year),
        imageUrl: cloudData.secure_url,
        explanationText: explanationText,
        timestamp: new Date()
      });

      setStatus('Success! Question injected into database.');
      setFile(null); 
      setExplanationText('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { setStatus('Error: ' + err.message); } 
    finally { setUploading(false); }
  };

  const inputClass = "w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 text-sm";

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
        <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><UploadCloud size={28} /></div>
            <div><h2 className="text-2xl font-bold text-white">Admin Control Panel</h2><p className="text-slate-400 text-sm">Upload Questions to Live Database</p></div>
          </div>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exam</label>
                <select className={inputClass} value={formData.exam} onChange={handleExamChange}>
                  {Object.keys(localSyllabus).map(exam => <option key={exam} value={exam}>{exam}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                <select className={inputClass} value={formData.subject} onChange={handleSubjectChange}>
                  {currentSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Year & Shift</label>
                <div className="flex gap-2">
                  <select className={`${inputClass} w-1/2`} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  <select className={`${inputClass} w-1/2`} value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>{availableShifts.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chapter</label>
                <select className={inputClass} value={formData.chapter} onChange={handleChapterChange} disabled={currentChapters.length === 0}>
                  {currentChapters.length === 0 ? <option value="">No chapters</option> : currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                <select className={inputClass} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} disabled={currentTopics.length === 0}>
                  {currentTopics.length === 0 ? <option value="">No topics</option> : currentTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Question Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-slate-400 border border-slate-700 rounded-lg p-1.5 bg-[#0f172a]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Option</label>
                <select className={inputClass} value={formData.correctOption} onChange={e => setFormData({...formData, correctOption: e.target.value})}>
                  {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Step-by-Step Explanation</label>
              <textarea rows={3} className={inputClass} value={explanationText} onChange={e => setExplanationText(e.target.value)} />
            </div>
            <button type="submit" disabled={uploading} className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all shadow-lg ${uploading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
              {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Uploading...</span> : 'Upload Question'}
            </button>
            {status && <div className="p-4 rounded-lg text-sm font-medium text-center bg-emerald-500/10 text-emerald-400">{status}</div>}
          </form>
        </div>

        {/* RESTORED DATABASE MANAGERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-emerald-400" size={18} /> Chapter Maker</h3>
            <p className="text-xs text-slate-400 mb-4">Adds temporary chapter to <span className="font-bold text-slate-200">{formData.subject}</span></p>
            <form onSubmit={handleAddChapter} className="flex gap-2">
              <input type="text" placeholder="New Chapter Name..." className={`${inputClass} py-2`} value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} />
              <button type="submit" className="px-4 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">Add</button>
            </form>
          </div>
          
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-purple-400" size={18} /> Topic Maker</h3>
            <p className="text-xs text-slate-400 mb-4">Adds temporary topic to <span className="font-bold text-slate-200">{formData.chapter || 'No chapter'}</span></p>
            <form onSubmit={handleAddTopic} className="flex gap-2">
              <input type="text" placeholder="New Topic Name..." className={`${inputClass} py-2`} value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} disabled={!formData.chapter} />
              <button type="submit" disabled={!formData.chapter} className="px-4 bg-purple-500/10 text-purple-400 rounded-lg disabled:opacity-50 hover:bg-purple-500/20 transition-colors">Add</button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chapters/:examId" element={<ChapterGrid />} />
        <Route path="/practice/:examId/:subjectId/:chapterId" element={<PracticeArea />} />
        <Route path="/papers/:examId" element={<PaperList />} />
        <Route path="/paper-practice" element={<PaperPracticeArea />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminUpload />} />
      </Routes>
    </BrowserRouter>
  );
}
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Settings, Search, CheckCircle2, ChevronRight, ArrowLeft, Loader2, UploadCloud, User, LogOut, LogIn, Award, Target, Zap, BookOpen, Clock, FileText, HelpCircle, Activity, Database, BarChart2, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

const DEFAULT_SYLLABUS = {
  'JEE Main': {
    'Physics': { 'Mechanics': ['1D & 2D Motion', 'Laws of Motion'] },
    'Chemistry': { 'Physical Chemistry': ['Mole Concept', 'Atomic Structure'] },
    'Mathematics': { 'Algebra': ['Quadratic Equations'], 'Coordinate Geometry': ['Straight Lines', 'Circles'] }
  },
  'JEE Advanced': { 'Physics': {}, 'Chemistry': {}, 'Mathematics': {} },
  'NEET (UG)': { 'Physics': {}, 'Chemistry': {}, 'Biology': {} }
};

const useSyllabus = () => {
  const [syllabus, setSyllabus] = useState(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const docRef = doc(db, "metadata", "syllabus");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSyllabus(docSnap.data().tree);
        } else {
          await setDoc(docRef, { tree: DEFAULT_SYLLABUS });
          setSyllabus(DEFAULT_SYLLABUS);
        }
      } catch (error) { console.error("Error fetching syllabus:", error); } 
      finally { setLoadingSyllabus(false); }
    };
    fetchSyllabus();
  }, []);

  const updateSyllabusDb = async (newSyllabus) => {
    setSyllabus(newSyllabus);
    await setDoc(doc(db, "metadata", "syllabus"), { tree: newSyllabus });
  };
  return { syllabus, loadingSyllabus, updateSyllabusDb };
};

const AnimatedBackground = ({ children }) => (
  <div className="relative min-h-screen bg-[#070b14] overflow-hidden selection:bg-blue-500/30">
    <div className="fixed top-0 -left-4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
    <div className="fixed top-1/3 -right-4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-2000"></div>
    <div className="fixed -bottom-8 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-4000"></div>
    <div className="relative z-10">{children}</div>
  </div>
);

// --- CUSTOM MODAL FOR DELETIONS ---
const CustomConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="p-2 bg-red-500/10 rounded-full"><AlertTriangle size={24} /></div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">Delete</button>
        </div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const SkeletonCard = () => (
  <div className="bg-[#1e293b]/50 border border-slate-800 rounded-xl p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 bg-slate-700 rounded w-1/4"></div>
      <div className="h-6 bg-slate-700 rounded w-1/6"></div>
    </div>
    <div className="w-full h-40 bg-slate-700/50 rounded-lg mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-700/50 rounded-lg"></div>)}
    </div>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); setSettingsOpen(false); } 
    catch (error) { console.error("Login failed: ", error); }
  };
  const handleLogout = async () => {
    try { await signOut(auth); setSettingsOpen(false); navigate('/'); } 
    catch (error) { console.error("Logout failed: ", error); }
  };

  const isAdmin = user && (user.email === "adiprak1809@gmail.com");

  return (
    <div className="border-b border-slate-800 bg-[#0f172a]/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <BookOpen size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            EduShare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-sm align-top ml-0.5">Prep</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className={`p-2 rounded-full transition-all duration-300 ${settingsOpen ? 'bg-slate-800 text-white rotate-90' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:rotate-90'}`}>
            <Settings size={20} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 top-12 w-64 bg-[#1e293b]/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-fade-in-up" style={{animationDuration: '0.2s'}}>
              {user ? (
                <>
                  <div className="px-4 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-3">
                    <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-slate-600" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSettingsOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"><User size={16} /> Player Profile</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"><LogOut size={16} /> System Logout</button>
                </>
              ) : (
                <button onClick={handleLogin} className="w-full text-left px-4 py-4 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors flex items-center gap-2">
                  <LogIn size={16} /> Initialize via Google
                </button>
              )}
              {isAdmin && (
                <div className="border-t border-slate-700 bg-slate-800/50">
                  <button onClick={() => { setSettingsOpen(false); navigate('/admin'); }} className="w-full text-left px-4 py-3 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 hover:bg-slate-800 transition-colors flex items-center gap-2"><Database size={16} className="text-emerald-400"/> Core Database Access</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExamCard = ({ title, subtitle, iconBg, textColor, shadowColor, IconComponent, delay }) => {
  const navigate = useNavigate();
  return (
    <div className={`group bg-[#1e293b]/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:border-slate-500 hover:shadow-[0_0_40px_-10px_${shadowColor}] animate-fade-in-up`} style={{animationDelay: delay}}>
      <div className="p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${iconBg} rounded-full blur-[50px] -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100`}></div>
        <div className="flex gap-4 items-center mb-6 relative z-10">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBg} border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <IconComponent size={28} className={textColor} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white transition-colors group-hover:text-blue-50">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-2 relative z-10">
          <button onClick={() => navigate(`/papers/${title}`)} className="py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-xl border border-slate-700/50 transition-all hover:bg-slate-700 hover:text-white hover:border-slate-600">Mock Exams</button>
          <button onClick={() => navigate(`/chapters/${title}`)} className="py-2.5 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20 transition-all hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">Chapter Wise</button>
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
        <div className="bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse-glow">
              <Zap size={14} className="animate-pulse"/> Mission 2028
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
              Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Endgame.</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-medium">
              Welcome back{user ? `, ${user.displayName?.split(' ')[0]}` : ''}. Access chapter-wise PYQs, immersive CBT mock tests, and deep performance analytics.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-700/50 shadow-inner hover:border-emerald-500/30 transition-colors">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Database size={18} className="text-emerald-400" /></div>
                <span className="text-sm font-semibold text-slate-200">Live Server Active</span>
              </div>
              <div className="flex items-center gap-3 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-700/50 shadow-inner hover:border-purple-500/30 transition-colors">
                <div className="p-1.5 bg-purple-500/20 rounded-lg"><Activity size={18} className="text-purple-400" /></div>
                <span className="text-sm font-semibold text-slate-200">Analytics Syncing</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 animate-fade-in-up" style={{animationDelay: '100ms'}}>
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full inline-block"></span> 
            Select Combat Arena
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExamCard title="JEE Main" subtitle="Single Correct & Numerical Value" iconBg="bg-orange-500/10" textColor="text-orange-500" shadowColor="rgba(249,115,22,0.4)" IconComponent={Target} delay="200ms" />
            <ExamCard title="JEE Advanced" subtitle="Multi-correct & Integer Type" iconBg="bg-blue-500/10" textColor="text-blue-500" shadowColor="rgba(59,130,246,0.4)" IconComponent={Zap} delay="300ms" />
            <ExamCard title="NEET (UG)" subtitle="Biology, Physics & Chemistry Core" iconBg="bg-emerald-500/10" textColor="text-emerald-500" shadowColor="rgba(16,185,129,0.4)" IconComponent={Activity} delay="400ms" />
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

const ChapterGrid = () => {
  const navigate = useNavigate();
  const { examId } = useParams(); 
  const { syllabus, loadingSyllabus } = useSyllabus();
  
  const examSyllabus = syllabus?.[examId] || {};
  const subjects = Object.keys(examSyllabus);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  useEffect(() => { if (subjects.length > 0 && !selectedSubject) setSelectedSubject(subjects[0]); }, [subjects, selectedSubject]);

  if (loadingSyllabus) return <AnimatedBackground><Navbar /><div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-blue-500" size={40} /></div></AnimatedBackground>;

  const chapters = Object.keys(examSyllabus[selectedSubject] || {});

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Return to Dashboard</button>
        <h2 className="text-3xl font-black text-white tracking-tight">{examId} Databanks</h2>
        <p className="text-sm text-slate-400 mt-1">Initialize practice module by selecting a chapter.</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-2 space-y-1">
            {subjects.map(sub => (
              <button 
                key={sub} onClick={() => setSelectedSubject(sub)}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedSubject === sub ? 'bg-blue-500/20 text-blue-400 shadow-[inset_4px_0_0_rgba(59,130,246,1)]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.length === 0 ? <div className="col-span-full text-center py-12 border border-slate-800 border-dashed rounded-2xl bg-slate-900/30 text-slate-500 font-medium animate-fade-in-up">No modules loaded yet.</div> : null}
            {chapters.map((chapter, index) => (
              <div 
                key={chapter}
                onClick={() => navigate(`/practice/${examId}/${selectedSubject}/${chapter}`)} 
                className="group relative bg-[#1e293b]/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up"
                style={{animationDelay: `${(index % 10) * 50 + 100}ms`}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                <div className="flex justify-between items-start relative z-10">
                  <h3 className="text-slate-200 font-semibold text-sm leading-snug group-hover:text-blue-300 transition-colors">{chapter}</h3>
                  <div className="p-1 rounded bg-slate-800/50 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

const PracticeArea = () => {
  const navigate = useNavigate();
  const { examId, subjectId, chapterId } = useParams(); 
  const { syllabus } = useSyllabus();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  
  const availableTopics = syllabus?.[examId]?.[subjectId]?.[chapterId] || [];
  const [activeTopic, setActiveTopic] = useState('All Topics');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const ADMIN_EMAIL = "adiprak1809@gmail.com";
  const isAdmin = currentUser && (currentUser.email === ADMIN_EMAIL);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, "questions"), 
          where("exam", "==", examId), where("subject", "==", subjectId), where("chapter", "==", chapterId)
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

  const handleNext = () => { 
    setIsChecked(false); setSelectedOption(null); setShowSolution(false); 
    if (currentIndex < filteredQuestions.length - 1) setCurrentIndex(currentIndex + 1); 
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      try {
        await deleteDoc(doc(db, "questions", questionToDelete));
        const updatedQuestions = questions.filter(q => q.id !== questionToDelete);
        setQuestions(updatedQuestions);
        setIsChecked(false); setSelectedOption(null); setShowSolution(false);
        if (currentIndex >= updatedQuestions.length) setCurrentIndex(Math.max(0, updatedQuestions.length - 1));
        setModalOpen(false);
      } catch (error) { console.error(error); }
    }
  };

  const progressPercentage = filteredQuestions.length > 0 ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;

  return (
    <AnimatedBackground>
      <Navbar />
      <CustomConfirmModal 
        isOpen={modalOpen} 
        title="Delete Record" 
        message="Are you sure you want to permanently erase this question from the database? This action cannot be reversed." 
        onConfirm={confirmDelete} 
        onCancel={() => setModalOpen(false)} 
      />

      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Return</button>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{chapterId}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <span className="bg-slate-800 px-2 py-0.5 rounded">{examId}</span> • <span>{subjectId}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4 pl-1">Topic Filter</h4>
          <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-2 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => { setActiveTopic('All Topics'); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTopic === 'All Topics' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/60'}`}>All Topics</button>
            {availableTopics.map(topic => (
              <button key={topic} onClick={() => { setActiveTopic(topic); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTopic === topic ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/60'}`}>{topic}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 animate-fade-in-up" style={{animationDelay: '200ms'}}>
          {loading ? (
            <SkeletonCard />
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 border border-slate-800 border-dashed rounded-3xl bg-[#1e293b]/30 text-center p-6 backdrop-blur-sm">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-float"><Search size={32} className="text-slate-500" /></div>
              <h3 className="text-white font-bold text-xl mb-2">Database Empty</h3>
              <p className="text-slate-400 text-sm">Upload questions via the Admin Panel for this module.</p>
            </div>
          ) : (
            <div className="bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 h-1 bg-slate-800 w-full">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
              </div>

              <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center mt-1">
                <span className="text-sm font-semibold text-slate-300">Question {currentIndex + 1} <span className="text-slate-500">of {filteredQuestions.length}</span></span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full shadow-inner">{currentQ.topic}</span>
                  {isAdmin && (
                    <button onClick={() => { setQuestionToDelete(currentQ.id); setModalOpen(true); }} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="Delete record"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                {currentQ.imageUrl ? (
                  <div className="bg-slate-900/50 p-2 rounded-2xl border border-slate-800 mb-8 max-w-2xl mx-auto shadow-inner">
                    <img src={currentQ.imageUrl} alt="Question" className="w-full rounded-xl mix-blend-screen" />
                  </div>
                ) : null}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    let btnClass = "bg-[#0f172a]/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80";
                    let iconClass = "bg-slate-800 text-slate-400";
                    if (isChecked) {
                      if (option === currentQ.correctOption) {
                        btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                        iconClass = "bg-emerald-500 text-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
                      } else if (option === selectedOption) {
                        btnClass = "bg-red-500/10 border-red-500/50 text-red-300";
                        iconClass = "bg-red-500 text-white";
                      }
                    } else if (selectedOption === option) {
                      btnClass = "bg-blue-500/10 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.2)]";
                      iconClass = "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]";
                    }
                    return (
                      <button key={option} disabled={isChecked} onClick={() => setSelectedOption(option)} className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left ${btnClass} ${!isChecked && 'active:scale-[0.98]'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 text-lg transition-colors ${iconClass}`}>{option}</div>
                        <span className="text-base font-medium">Option {option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-5 pt-6 border-t border-slate-700/50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-base font-bold animate-fade-in-up" key={isChecked ? 'checked' : 'unchecked'}>
                      {isChecked && selectedOption === currentQ.correctOption && <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 size={20}/> Target Acquired (+4 marks)</span>}
                      {isChecked && selectedOption !== currentQ.correctOption && <span className="text-red-400 flex items-center gap-2"><AlertTriangle size={20}/> Target Missed (-1 mark)</span>}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      {isChecked && (
                        <button onClick={() => setShowSolution(!showSolution)} className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700">
                          <HelpCircle size={18} /> {showSolution ? 'Hide Analysis' : 'View Analysis'}
                        </button>
                      )}
                      <button onClick={isChecked ? handleNext : handleCheck} disabled={!selectedOption && !isChecked} className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${!selectedOption && !isChecked ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : isChecked ? 'bg-slate-200 text-slate-900 hover:bg-white' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-500'}`}>
                        {isChecked ? (currentIndex === filteredQuestions.length - 1 ? 'End Session' : 'Next Target') : 'Lock In Answer'}
                      </button>
                    </div>
                  </div>

                  {showSolution && (
                    <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 mt-2 animate-fade-in-up shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]">
                      <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><Award size={18} /> System Analysis</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Correct Option is <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-1">{currentQ.correctOption}</span>.<br/><br/>
                        {currentQ.explanationText ? currentQ.explanationText : "Detailed step-by-step telemetry will be uploaded soon for this PYQ."}
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

const AdminUpload = () => {
  const navigate = useNavigate();
  const { syllabus, loadingSyllabus, updateSyllabusDb } = useSyllabus();
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [explanationText, setExplanationText] = useState('');
  
  const [formData, setFormData] = useState({ exam: 'JEE Main', year: '2026', shift: 'Morning Shift', subject: 'Physics', chapter: '', topic: '', correctOption: 'A' });
  const [newChapterName, setNewChapterName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  const currentSubjects = syllabus ? Object.keys(syllabus[formData.exam] || {}) : [];
  const currentChapters = syllabus ? Object.keys(syllabus[formData.exam]?.[formData.subject] || {}) : [];
  const currentTopics = syllabus ? (syllabus[formData.exam]?.[formData.subject]?.[formData.chapter] || []) : [];

  const handleExamChange = (e) => {
    const newExam = e.target.value;
    const subjects = Object.keys(syllabus[newExam] || {});
    const newSub = subjects[0] || '';
    const chapters = Object.keys(syllabus[newExam]?.[newSub] || {});
    setFormData({ ...formData, exam: newExam, subject: newSub, chapter: chapters[0] || '', topic: (syllabus[newExam]?.[newSub]?.[chapters[0]] || [])[0] || '' });
  };

  const handleSubjectChange = (e) => {
    const newSub = e.target.value;
    const chapters = Object.keys(syllabus[formData.exam]?.[newSub] || {});
    setFormData({ ...formData, subject: newSub, chapter: chapters[0] || '', topic: (syllabus[formData.exam]?.[newSub]?.[chapters[0]] || [])[0] || '' });
  };

  const handleChapterChange = (e) => {
    const newChap = e.target.value;
    setFormData({ ...formData, chapter: newChap, topic: (syllabus[formData.exam]?.[formData.subject]?.[newChap] || [])[0] || '' });
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || !formData.subject) return;
    const updated = JSON.parse(JSON.stringify(syllabus)); 
    if (!updated[formData.exam][formData.subject]) updated[formData.exam][formData.subject] = {};
    updated[formData.exam][formData.subject][newChapterName] = [];
    await updateSyllabusDb(updated);
    setFormData(prev => ({ ...prev, chapter: newChapterName, topic: '' }));
    setNewChapterName('');
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !formData.chapter) return;
    const updated = JSON.parse(JSON.stringify(syllabus));
    updated[formData.exam][formData.subject][formData.chapter].push(newTopicName);
    await updateSyllabusDb(updated);
    setFormData(prev => ({ ...prev, topic: newTopicName }));
    setNewTopicName('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select an image!");
    setUploading(true); setStatus('Uploading image to Cloudinary...');
    try {
      const data = new FormData(); data.append('file', file); data.append('upload_preset', 'class_hub_preset'); 
      const res = await fetch('https://api.cloudinary.com/v1_1/aqqngm6u/image/upload', { method: 'POST', body: data });
      const cloudData = await res.json();
      if (!cloudData.secure_url) throw new Error("Upload failed.");
      setStatus('Saving to Firebase...');
      await addDoc(collection(db, "questions"), { ...formData, year: parseInt(formData.year), imageUrl: cloudData.secure_url, explanationText, timestamp: new Date() });
      setStatus('Success! Injecting payload...');
      setFile(null); setExplanationText('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { setStatus('Error: ' + err.message); } finally { setUploading(false); }
  };

  if (loadingSyllabus) return <AnimatedBackground><Navbar /><div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-blue-500" size={40} /></div></AnimatedBackground>;
  const inputClass = "w-full bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700/80 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-sm";

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium transition-colors"><ArrowLeft size={16} /> Dashboard</button>
        <div className="bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)]"><UploadCloud size={28} className="text-white" /></div>
            <div><h2 className="text-2xl font-black text-white tracking-tight">System Admin Terminal</h2><p className="text-blue-400 text-sm font-medium">Core Database Injection</p></div>
          </div>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exam</label><select className={inputClass} value={formData.exam} onChange={handleExamChange}>{Object.keys(syllabus).map(e => <option key={e} value={e}>{e}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label><select className={inputClass} value={formData.subject} onChange={handleSubjectChange}>{currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Year & Shift</label><div className="flex gap-2"><select className={`${inputClass} w-1/2`} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>{[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}</select><select className={`${inputClass} w-1/2`} value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>{['Morning', 'Evening'].map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chapter</label><select className={inputClass} value={formData.chapter} onChange={handleChapterChange}>{currentChapters.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label><select className={inputClass} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})}>{currentTopics.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Image</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-400 cursor-pointer border border-slate-700/80 rounded-xl p-1 bg-[#0f172a]/80" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Option</label><select className={inputClass} value={formData.correctOption} onChange={e => setFormData({...formData, correctOption: e.target.value})}>{['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Analysis Notes (Optional)</label><textarea rows={3} className={inputClass} value={explanationText} onChange={e => setExplanationText(e.target.value)} /></div>
            <button type="submit" disabled={uploading} className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${uploading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'}`}>
              {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Transmitting Data...</span> : 'Execute Upload'}
            </button>
            {status && <div className="p-4 rounded-xl text-sm font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{status}</div>}
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div className="bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 border-t-4 border-t-emerald-500"><h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-emerald-400" size={18} /> Map New Chapter</h3><form onSubmit={handleAddChapter} className="flex gap-2 mt-4"><input type="text" placeholder="Name..." className={`${inputClass} py-2.5`} value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} /><button type="submit" className="px-5 font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">Add</button></form></div>
          <div className="bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 border-t-4 border-t-purple-500"><h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-purple-400" size={18} /> Map New Topic</h3><form onSubmit={handleAddTopic} className="flex gap-2 mt-4"><input type="text" placeholder="Name..." className={`${inputClass} py-2.5`} value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} disabled={!formData.chapter} /><button type="submit" disabled={!formData.chapter} className="px-5 font-bold text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50">Add</button></form></div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

const PaperList = () => { const navigate = useNavigate(); const {examId} = useParams(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-32 text-xl font-bold border border-slate-800 border-dashed rounded-3xl bg-slate-900/30">{examId} Databank Loading...</div></div></AnimatedBackground>};
const PaperPracticeArea = () => { const navigate = useNavigate(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-32 text-xl font-bold border border-slate-800 border-dashed rounded-3xl bg-slate-900/30">CBT Engine Initializing...</div></div></AnimatedBackground>};
const UserProfile = () => { const navigate = useNavigate(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-32 text-xl font-bold border border-slate-800 border-dashed rounded-3xl bg-slate-900/30">Player Stats Loading...</div></div></AnimatedBackground>};

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
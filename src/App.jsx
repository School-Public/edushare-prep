import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Settings, Search, CheckCircle2, ChevronRight, ArrowLeft, Loader2, UploadCloud, User, LogOut, LogIn, Award, Target, Zap, BookOpen, Clock, FileText, HelpCircle, Activity, Database, BarChart2, Plus, Trash2, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

// --- DEFAULT SYLLABUS SEEDER ---
const DEFAULT_SYLLABUS = {
  'JEE Main': {
    'Physics': { 'Mechanics': ['1D & 2D Motion', 'Laws of Motion'] },
    'Chemistry': { 'Physical Chemistry': ['Mole Concept', 'Atomic Structure'] },
    'Mathematics': { 'Algebra': ['Quadratic Equations'], 'Coordinate Geometry': ['Straight Lines', 'Circles'] }
  },
  'JEE Advanced': { 'Physics': {}, 'Chemistry': {}, 'Mathematics': {} },
  'NEET (UG)': { 'Physics': {}, 'Chemistry': {}, 'Biology': {} }
};

// --- GLOBAL CUSTOM HOOK: FIREBASE SYLLABUS ---
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
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      } finally {
        setLoadingSyllabus(false);
      }
    };
    fetchSyllabus();
  }, []);

  const updateSyllabusDb = async (newSyllabus) => {
    setSyllabus(newSyllabus);
    await setDoc(doc(db, "metadata", "syllabus"), { tree: newSyllabus });
  };

  return { syllabus, loadingSyllabus, updateSyllabusDb };
};

// --- ANIMATED BACKGROUND COMPONENT ---
const AnimatedBackground = ({ children }) => (
  <div className="relative min-h-screen bg-[#0f172a] overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
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
    <div className="border-b border-slate-800/80 bg-[#0f172a]/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <Zap size={20} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight transition-colors group-hover:text-blue-50">
            EduShare <span className="text-blue-400 font-medium text-sm align-top bg-blue-500/10 px-2 py-0.5 rounded-full ml-1 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300">Prep</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className={`p-2.5 rounded-full transition-all duration-300 ${settingsOpen ? 'bg-slate-800 text-white rotate-90 shadow-lg border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:rotate-90 border border-transparent'}`}>
            <Settings size={20} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-14 w-64 bg-[#1e293b]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
              {user ? (
                <>
                  <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Authenticated As</p>
                    <p className="text-sm font-bold text-white truncate">{user.displayName || user.email}</p>
                  </div>
                  <button onClick={() => { setSettingsOpen(false); navigate('/profile'); }} className="w-full text-left px-5 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-3"><User size={18} /> Performance Profile</button>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-3.5 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-3"><LogOut size={18} /> Disconnect</button>
                </>
              ) : (
                <button onClick={handleLogin} className="w-full text-left px-5 py-4 text-sm font-bold text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors flex items-center gap-3">
                  <LogIn size={18} /> Sign in with Google
                </button>
              )}
              {isAdmin && (
                <div className="border-t border-slate-700/80 bg-slate-900/50">
                  <button onClick={() => { setSettingsOpen(false); navigate('/admin'); }} className="w-full text-left px-5 py-4 text-sm font-bold text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <Database size={16}/> System Admin Panel
                  </button>
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
const ExamCard = ({ title, subtitle, iconBg, textColor, shadowColor, IconComponent, tag }) => {
  const navigate = useNavigate();
  return (
    <div className={`group bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:border-slate-500 hover:shadow-[0_10px_40px_-10px_${shadowColor}]`}>
      <div className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <IconComponent size={28} className={textColor} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 bg-slate-800/50`}>{tag}</span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white transition-colors group-hover:text-blue-50">{title}</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button onClick={() => navigate(`/papers/${title}`)} className="py-2.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-[#0f172a]/80 rounded-xl border border-slate-700/50 transition-all hover:bg-blue-500/10 hover:border-blue-500/30">CBT Mock</button>
          <button onClick={() => navigate(`/chapters/${title}`)} className="py-2.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-[#0f172a]/80 rounded-xl border border-slate-700/50 transition-all hover:bg-blue-500/10 hover:border-blue-500/30">Chapters</button>
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
      <div className="max-w-7xl mx-auto p-4 md:p-8 mt-2 space-y-12">
        <div className="bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 left-10 -mb-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-extrabold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Sparkles size={14} className="animate-pulse text-blue-400" /> NTA Aligned Engine
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
              Master Your Prep with <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">EduShare Prep.</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-medium">
              {user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'Aspirant'}. ` : ''} 
              Unlock chapter-wise PYQs, experience hyper-realistic CBT mock simulations, and review detailed step-by-step visual solutions.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-[#0f172a]/80 backdrop-blur-md rounded-xl px-6 py-3 border border-slate-700/50 shadow-inner">
                <Database size={18} className="text-emerald-400" />
                <span className="text-sm font-bold text-slate-300">Live PYQ Sync</span>
              </div>
              <div className="flex items-center gap-3 bg-[#0f172a]/80 backdrop-blur-md rounded-xl px-6 py-3 border border-slate-700/50 shadow-inner">
                <BarChart2 size={18} className="text-purple-400" />
                <span className="text-sm font-bold text-slate-300">AI Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full inline-block"></span> 
              Select Target Exam
            </h2>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:block">Updated for 2026/2027</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExamCard tag="Most Popular" title="JEE Main" subtitle="Single correct objective PYQs strictly aligned with NTA guidelines." iconBg="bg-orange-500/10" textColor="text-orange-500" shadowColor="rgba(249,115,22,0.25)" IconComponent={Target} />
            <ExamCard tag="Advanced" title="JEE Advanced" subtitle="Multi-correct, integer, and comprehension type question sets." iconBg="bg-blue-500/10" textColor="text-blue-500" shadowColor="rgba(59,130,246,0.25)" IconComponent={Zap} />
            <ExamCard tag="Medical" title="NEET (UG)" subtitle="High-yield Biology, Physics & Chemistry core questions." iconBg="bg-emerald-500/10" textColor="text-emerald-500" shadowColor="rgba(16,185,129,0.25)" IconComponent={Activity} />
          </div>
        </div>

        {/* INVISIBLE TRADEMARK EASTER EGG */}
        <div className="pt-20 pb-4 text-center">
          <p className="text-[10px] text-[#0f172a] hover:text-slate-600 transition-colors duration-1000 cursor-default select-none tracking-widest font-mono">
            crafted with ⚡ by aditya prakash
          </p>
        </div>

      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 2: DYNAMIC CHAPTER GRID ---
const ChapterGrid = () => {
  const navigate = useNavigate();
  const { examId } = useParams(); 
  const { syllabus, loadingSyllabus } = useSyllabus();
  
  const examSyllabus = syllabus?.[examId] || {};
  const subjects = Object.keys(examSyllabus);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) setSelectedSubject(subjects[0]);
  }, [subjects, selectedSubject]);

  if (loadingSyllabus) return <AnimatedBackground><Navbar /><div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-blue-500" size={40} /></div></AnimatedBackground>;

  const chapters = Object.keys(examSyllabus[selectedSubject] || {});

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"><ArrowLeft size={16} /> Back to Dashboard</button>
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-2">{examId} Database</h2>
          <p className="text-sm text-slate-400">Select a subject and chapter to begin isolated practice.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 pl-2">Subjects</h4>
            {subjects.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-300 border ${selectedSubject === sub ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:border-slate-700'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 pl-1">Available Chapters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chapters.length === 0 ? <div className="col-span-2 p-8 border border-dashed border-slate-700 rounded-xl text-center"><p className="text-slate-500 text-sm font-medium">No chapters mapped yet in database.</p></div> : null}
            {chapters.map(chapter => (
              <div 
                key={chapter}
                onClick={() => navigate(`/practice/${examId}/${selectedSubject}/${chapter}`)} 
                className="bg-[#1e293b]/70 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-[#1e293b] hover:border-slate-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer group shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm leading-snug group-hover:text-blue-400 pr-4">{chapter}</h3>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
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

// --- SCREEN 3: DYNAMIC PRACTICE ENGINE ---
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

  const ADMIN_EMAIL = "adiprak1809@gmail.com";
  const isAdmin = currentUser && (currentUser.email === ADMIN_EMAIL);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { setCurrentUser(user); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "questions"), where("exam", "==", examId), where("subject", "==", subjectId), where("chapter", "==", chapterId));
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

  const recordStatsToFirestore = async (isCorrect) => {
    if (!currentUser) return;
    try {
      const userStatRef = doc(db, "user_stats", currentUser.uid);
      const statSnap = await getDoc(userStatRef);
      if (!statSnap.exists()) {
        await setDoc(userStatRef, { totalAttempted: 1, correctCount: isCorrect ? 1 : 0, email: currentUser.email, displayName: currentUser.displayName });
      } else {
        await updateDoc(userStatRef, { totalAttempted: increment(1), correctCount: isCorrect ? increment(1) : increment(0) });
      }
    } catch (err) { console.error(err); }
  };

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

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Permanently delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", questionId));
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        setQuestions(updatedQuestions);
        setIsChecked(false); setSelectedOption(null); setShowSolution(false);
        if (currentIndex >= updatedQuestions.length) setCurrentIndex(Math.max(0, updatedQuestions.length - 1));
      } catch (error) { alert("Failed to delete."); console.error(error); }
    }
  };

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
        <h2 className="text-2xl font-extrabold text-white mb-2">{chapterId}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{examId}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{subjectId}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 pl-1">Topic Filter</h4>
          <div className="space-y-1.5">
            <button onClick={() => { setActiveTopic('All Topics'); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTopic === 'All Topics' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'}`}>All Topics</button>
            {availableTopics.map(topic => (
              <button key={topic} onClick={() => { setActiveTopic(topic); setCurrentIndex(0); setIsChecked(false); setSelectedOption(null); setShowSolution(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTopic === topic ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'}`}>{topic}</button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 border border-slate-800 rounded-2xl bg-[#1e293b]/70 backdrop-blur-md"><Loader2 className="animate-spin text-blue-500 mb-4" size={40} /><p className="text-slate-400 font-medium">Fetching Database...</p></div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 border border-dashed border-slate-700 rounded-2xl bg-[#1e293b]/50 text-center p-6"><Database size={48} className="text-slate-600 mb-4" /><h3 className="text-white font-bold text-lg mb-1">No Questions Found</h3><p className="text-slate-400 text-sm">Upload questions via Admin Panel for this topic.</p></div>
          ) : (
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">{currentIndex + 1}</span>
                  <span className="text-sm font-semibold text-slate-300">of {filteredQuestions.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full">{currentQ.topic}</span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteQuestion(currentQ.id)} className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                {currentQ.imageUrl ? <img src={currentQ.imageUrl} alt="Question" className="max-w-full rounded-xl border border-slate-700 mb-10 mx-auto shadow-lg" /> : null}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    let buttonStyle = "bg-[#0f172a] border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50";
                    if (isChecked) {
                      if (option === currentQ.correctOption) buttonStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                      else if (option === selectedOption) buttonStyle = "bg-red-500/10 border-red-500 text-red-400";
                    } else if (selectedOption === option) buttonStyle = "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                    return (
                      <button key={option} disabled={isChecked} onClick={() => setSelectedOption(option)} className={`flex items-center p-4 rounded-xl border-2 transition-all duration-300 text-left ${buttonStyle}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold mr-4 ${selectedOption === option || (isChecked && option === currentQ.correctOption) ? 'bg-current text-[#1e293b]' : 'bg-slate-800 text-slate-400'}`}>{option}</div>
                        <span className="text-sm font-bold">Option {option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-6 pt-6 border-t border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-extrabold tracking-wide">
                      {isChecked && selectedOption === currentQ.correctOption && <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 size={18}/> Correct (+4)</span>}
                      {isChecked && selectedOption !== currentQ.correctOption && <span className="text-red-400 flex items-center gap-2"><Target size={18}/> Incorrect (-1)</span>}
                    </div>
                    <div className="flex gap-3">
                      {isChecked && (
                        <button onClick={() => setShowSolution(!showSolution)} className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700">
                          <HelpCircle size={18} /> {showSolution ? 'Hide Solution' : 'View Solution'}
                        </button>
                      )}
                      <button onClick={isChecked ? handleNext : handleCheck} disabled={!selectedOption && !isChecked} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${!selectedOption && !isChecked ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : isChecked ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500 border border-blue-500 shadow-blue-500/25'}`}>
                        {isChecked ? (currentIndex === filteredQuestions.length - 1 ? 'Finish Module' : 'Next Question') : 'Verify Answer'}
                      </button>
                    </div>
                  </div>

                  {showSolution && (
                    <div className="bg-gradient-to-br from-[#0f172a] to-slate-900 border border-blue-500/30 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Award size={20} /></div>
                        <h4 className="text-base font-bold text-white tracking-wide">Pro-Tip & Solution</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        The universally correct answer is <span className="font-extrabold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded ml-1 mr-1">Option {currentQ.correctOption}</span>.<br/><br/>
                        <span className="text-slate-400">
                          {currentQ.explanationText ? currentQ.explanationText : "Our faculty is verifying the step-by-step graphical solution for this exact PYQ. Please rely on standard textbook methodology for now."}
                        </span>
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
          if (statSnap.exists()) {
            setStats(statSnap.data());
          }
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
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
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Return to Dashboard
        </button>

        {!user ? (
          <div className="bg-[#1e293b]/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 shadow-2xl text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><User size={40} className="text-slate-500" /></div>
            <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Identity Unverified</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">Securely sign in with Google to synchronize your practice history, unlock accuracy algorithms, and access personalized exam readiness data.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 md:p-10 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="w-28 h-28 rounded-full bg-[#0f172a] border-4 border-blue-500/20 flex items-center justify-center text-blue-400 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)] shrink-0 z-10">
                {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} />}
              </div>
              <div className="text-center md:text-left flex-1 z-10">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">{user?.displayName || "EduShare Student"}</h2>
                <p className="text-sm font-medium text-slate-400 mb-5">{user?.email}</p>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-300 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner">
                  <Award size={16} /> Target 2028 Aspirant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Activity size={24} className="text-purple-400 animate-pulse" />
              <h3 className="text-xl font-extrabold text-white tracking-tight">Live Telemetry</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#1e293b]/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-7 shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen size={100} className="translate-x-4 translate-y-4" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Attempted</span>
                  <div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen size={18} className="text-blue-400" /></div>
                </div>
                <p className="text-4xl font-black text-white relative z-10">{stats.totalAttempted}</p>
              </div>
              
              <div className="bg-[#1e293b]/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-7 shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={100} className="translate-x-4 translate-y-4 text-emerald-400" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Strike Rate</span>
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><Target size={18} className="text-emerald-400" /></div>
                </div>
                <p className="text-4xl font-black text-white relative z-10">{accuracy}<span className="text-2xl text-slate-500">%</span></p>
              </div>
              
              <div className="bg-[#1e293b]/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-7 shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} className="translate-x-4 translate-y-4 text-yellow-400" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Database Sync</span>
                  <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap size={18} className="text-yellow-400" /></div>
                </div>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 relative z-10">Live</p>
              </div>
            </div>
          </>
        )}
      </div>
    </AnimatedBackground>
  );
};

// --- SCREEN 5: ADMIN UPLOAD DASHBOARD ---
const AdminUpload = () => {
  const navigate = useNavigate();
  const { syllabus, loadingSyllabus, updateSyllabusDb } = useSyllabus();
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [explanationText, setExplanationText] = useState('');
  
  const availableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const availableShifts = ['Morning Shift', 'Evening Shift', 'Shift 1', 'Shift 2', 'N/A'];

  const [formData, setFormData] = useState({
    exam: 'JEE Main', year: '2026', shift: 'Morning Shift',
    subject: 'Physics', chapter: '', topic: '', correctOption: 'A'
  });

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
    const newChap = chapters[0] || '';
    const topics = syllabus[newExam]?.[newSub]?.[newChap] || [];
    setFormData({ ...formData, exam: newExam, subject: newSub, chapter: newChap, topic: topics[0] || '' });
  };

  const handleSubjectChange = (e) => {
    const newSub = e.target.value;
    const chapters = Object.keys(syllabus[formData.exam]?.[newSub] || {});
    const newChap = chapters[0] || '';
    const topics = syllabus[formData.exam]?.[newSub]?.[newChap] || [];
    setFormData({ ...formData, subject: newSub, chapter: newChap, topic: topics[0] || '' });
  };

  const handleChapterChange = (e) => {
    const newChap = e.target.value;
    const topics = syllabus[formData.exam]?.[formData.subject]?.[newChap] || [];
    setFormData({ ...formData, chapter: newChap, topic: topics[0] || '' });
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || !formData.subject) return;
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus)); 
    if (!updatedSyllabus[formData.exam][formData.subject]) updatedSyllabus[formData.exam][formData.subject] = {};
    updatedSyllabus[formData.exam][formData.subject][newChapterName] = [];
    
    await updateSyllabusDb(updatedSyllabus);
    setFormData(prev => ({ ...prev, chapter: newChapterName, topic: '' }));
    setNewChapterName('');
  };

  const handleDeleteChapter = async () => {
    if(!window.confirm(`Delete chapter "${formData.chapter}" globally?`)) return;
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus));
    delete updatedSyllabus[formData.exam][formData.subject][formData.chapter];
    await updateSyllabusDb(updatedSyllabus);
    handleSubjectChange({ target: { value: formData.subject }});
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !formData.chapter) return;
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus));
    updatedSyllabus[formData.exam][formData.subject][formData.chapter].push(newTopicName);
    
    await updateSyllabusDb(updatedSyllabus);
    setFormData(prev => ({ ...prev, topic: newTopicName }));
    setNewTopicName('');
  };

  const handleDeleteTopic = async () => {
    if(!window.confirm(`Delete topic "${formData.topic}" globally?`)) return;
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus));
    updatedSyllabus[formData.exam][formData.subject][formData.chapter] = updatedSyllabus[formData.exam][formData.subject][formData.chapter].filter(t => t !== formData.topic);
    await updateSyllabusDb(updatedSyllabus);
    handleChapterChange({ target: { value: formData.chapter }}); 
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

  if (loadingSyllabus) return <AnimatedBackground><Navbar /><div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-blue-500" size={40} /></div></AnimatedBackground>;

  const inputClass = "w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 transition-all";

  return (
    <AnimatedBackground>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 md:p-10 shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-700/80 pb-6">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl shadow-inner border border-blue-500/20"><UploadCloud size={28} /></div>
            <div><h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Control Center</h2><p className="text-slate-400 text-sm font-medium mt-1">Upload encrypted questions to live database</p></div>
          </div>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Exam</label>
                <select className={inputClass} value={formData.exam} onChange={handleExamChange}>
                  {Object.keys(syllabus).map(exam => <option key={exam} value={exam}>{exam}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Subject</label>
                <select className={inputClass} value={formData.subject} onChange={handleSubjectChange}>
                  {currentSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Year & Shift</label>
                <div className="flex gap-2">
                  <select className={`${inputClass} w-1/2`} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  <select className={`${inputClass} w-1/2`} value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>{availableShifts.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
                  <span>Chapter</span>
                  {formData.chapter && <button type="button" onClick={handleDeleteChapter} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"><Trash2 size={12}/> Purge</button>}
                </label>
                <select className={inputClass} value={formData.chapter} onChange={handleChapterChange} disabled={currentChapters.length === 0}>
                  {currentChapters.length === 0 ? <option value="">No chapters</option> : currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
                  <span>Topic</span>
                  {formData.topic && <button type="button" onClick={handleDeleteTopic} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"><Trash2 size={12}/> Purge</button>}
                </label>
                <select className={inputClass} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} disabled={currentTopics.length === 0}>
                  {currentTopics.length === 0 ? <option value="">No topics</option> : currentTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Upload Question Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-slate-400 border border-slate-700/80 rounded-xl p-2 bg-[#0f172a] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 file:transition-colors cursor-pointer" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Correct Option</label>
                <select className={inputClass} value={formData.correctOption} onChange={e => setFormData({...formData, correctOption: e.target.value})}>
                  {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Faculty Explanation / Notes</label>
              <textarea rows={3} className={inputClass} value={explanationText} onChange={e => setExplanationText(e.target.value)} placeholder="Type detailed step-by-step solution..." />
            </div>
            <button type="submit" disabled={uploading} className={`w-full py-4 rounded-xl font-extrabold text-sm transition-all shadow-xl ${uploading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 border border-blue-500'}`}>
              {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Syncing to Database...</span> : 'Upload to Live Server'}
            </button>
            {status && <div className="p-4 rounded-xl text-sm font-bold text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">{status}</div>}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e293b]/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-8 border-t-4 border-t-emerald-500 shadow-lg">
            <h3 className="text-white font-extrabold mb-1 flex items-center gap-2 text-lg"><Plus className="text-emerald-400" size={20} /> Chapter Override</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Adds node to <span className="font-bold text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">{formData.subject}</span></p>
            <form onSubmit={handleAddChapter} className="flex gap-3">
              <input type="text" placeholder="New Chapter..." className={`${inputClass} py-2.5`} value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} />
              <button type="submit" className="px-5 font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all shadow-inner">Add</button>
            </form>
          </div>
          
          <div className="bg-[#1e293b]/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-8 border-t-4 border-t-purple-500 shadow-lg">
            <h3 className="text-white font-extrabold mb-1 flex items-center gap-2 text-lg"><Plus className="text-purple-400" size={20} /> Topic Override</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Adds node to <span className="font-bold text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[150px] inline-block align-bottom">{formData.chapter || 'None'}</span></p>
            <form onSubmit={handleAddTopic} className="flex gap-3">
              <input type="text" placeholder="New Topic..." className={`${inputClass} py-2.5`} value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} disabled={!formData.chapter} />
              <button type="submit" disabled={!formData.chapter} className="px-5 font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl disabled:opacity-50 hover:bg-purple-500/20 transition-all shadow-inner">Add</button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

const PaperList = () => { const navigate = useNavigate(); const {examId} = useParams(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-20 text-xl font-bold">{examId} Past Papers Coming Soon</div></div></AnimatedBackground>};
const PaperPracticeArea = () => { const navigate = useNavigate(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-20 text-xl font-bold">Mock CBT Engine Coming Soon</div></div></AnimatedBackground>};

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
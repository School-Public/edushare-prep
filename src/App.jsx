import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Settings, Search, CheckCircle2, ChevronRight, ArrowLeft, Loader2, UploadCloud, User, LogOut, LogIn, Award, Target, Zap, BookOpen, Clock, FileText, HelpCircle, Activity, Database, BarChart2, Plus, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

// --- DEFAULT SYLLABUS SEEDER (Only runs once to populate database) ---
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
          // If no syllabus exists in DB, create it using the default template
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

// --- SCREEN 2: DYNAMIC CHAPTER GRID (Reads from Firebase Database) ---
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
            {chapters.length === 0 ? <p className="text-slate-500">No chapters mapped yet in database.</p> : null}
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

// --- SCREEN 4: TRUE DATABASE-DRIVEN ADMIN DASHBOARD ---
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

  // Fallback arrays to prevent breaking while loading
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

  // --- DATABASE WRITE: Add/Delete Chapter ---
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || !formData.subject) return;
    const updatedSyllabus = JSON.parse(JSON.stringify(syllabus)); // Deep clone
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
    handleSubjectChange({ target: { value: formData.subject }}); // Reset dropdowns
  };

  // --- DATABASE WRITE: Add/Delete Topic ---
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
    handleChapterChange({ target: { value: formData.chapter }}); // Reset dropdown
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
                  {Object.keys(syllabus).map(exam => <option key={exam} value={exam}>{exam}</option>)}
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
                <label className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase mb-2">
                  <span>Chapter</span>
                  {formData.chapter && <button type="button" onClick={handleDeleteChapter} className="text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={12}/> Delete</button>}
                </label>
                <select className={inputClass} value={formData.chapter} onChange={handleChapterChange} disabled={currentChapters.length === 0}>
                  {currentChapters.length === 0 ? <option value="">No chapters</option> : currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase mb-2">
                  <span>Topic</span>
                  {formData.topic && <button type="button" onClick={handleDeleteTopic} className="text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={12}/> Delete</button>}
                </label>
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

        {/* DATABASE MANAGERS (Writes to Firebase!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6 border-t-4 border-t-emerald-500">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-emerald-400" size={18} /> Add Chapter to Database</h3>
            <p className="text-xs text-slate-400 mb-4">Adds permanently to <span className="font-bold text-slate-200">{formData.subject}</span></p>
            <form onSubmit={handleAddChapter} className="flex gap-2">
              <input type="text" placeholder="New Chapter Name..." className={`${inputClass} py-2`} value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} />
              <button type="submit" className="px-4 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">Add</button>
            </form>
          </div>
          
          <div className="bg-[#1e293b]/90 backdrop-blur-sm border border-slate-800 rounded-xl p-6 border-t-4 border-t-purple-500">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Plus className="text-purple-400" size={18} /> Add Topic to Database</h3>
            <p className="text-xs text-slate-400 mb-4">Adds permanently to <span className="font-bold text-slate-200">{formData.chapter || 'No chapter'}</span></p>
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

// ... Profile & Mock Test components ...
const UserProfile = () => { const navigate = useNavigate(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-20 text-xl font-bold">Profile Dashboard Coming Soon</div></div></AnimatedBackground>};
const PaperPracticeArea = () => { const navigate = useNavigate(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-20 text-xl font-bold">Mock CBT Engine Coming Soon</div></div></AnimatedBackground>};
const PaperList = () => { const navigate = useNavigate(); const {examId} = useParams(); return <AnimatedBackground><Navbar/><div className="max-w-4xl mx-auto px-4 py-8"><button onClick={() => navigate(-1)} className="text-slate-400 mb-6 flex"><ArrowLeft size={16}/> Back</button><div className="text-white text-center py-20 text-xl font-bold">{examId} Past Papers Coming Soon</div></div></AnimatedBackground>};

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
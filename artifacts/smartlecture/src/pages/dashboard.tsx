import { motion } from "framer-motion";
import { BookOpen, Layers, Target, Clock, BrainCircuit, Play, ChevronRight, PlusCircle, Trophy } from "lucide-react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  // Keep the dashboard renderable even when the optional data API is not deployed.
  const profile = undefined;
  const stats = undefined;
  const recentLectures = undefined;

  // Mock data for fallbacks
  const mockLectures = [
    { id: 1, title: "Introduction to Cellular Biology", subject: "Biology", subjectColor: "hsl(152 68% 45%)", duration: 45, status: "ready", tags: ["cells", "mitosis"] },
    { id: 2, title: "Newton's Laws of Motion", subject: "Physics", subjectColor: "hsl(245 70% 55%)", duration: 32, status: "ready", tags: ["mechanics", "forces"] },
    { id: 3, title: "The French Revolution", subject: "History", subjectColor: "hsl(45 93% 47%)", duration: 50, status: "ready", tags: ["europe", "revolution"] }
  ];

  const lecturesToDisplay = recentLectures?.length ? recentLectures : mockLectures;
  const userStats = stats || {
    xp: 2450,
    level: 5,
    xpToNextLevel: 550,
    streak: 12,
    totalStudyMinutes: 480,
    lecturesCount: 14,
    flashcardsReviewed: 342,
    quizzesCompleted: 8,
    weeklyActivity: []
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with greeting and quick stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Welcome back, <span className="font-handwriting text-4xl text-primary align-bottom">{profile?.name?.split(' ')[0] || "Student"}</span>
          </h1>
          <p className="text-muted-foreground">Ready to tackle your study goals today?</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level {userStats.level}</span>
              <span className="text-xs font-bold text-primary">{userStats.xp} / {userStats.xp + userStats.xpToNextLevel} XP</span>
            </div>
            <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNextLevel)) * 100} className="h-2 w-48" />
          </div>
          <div className="h-10 w-px bg-border"></div>
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-2xl leading-none mb-1">🔥</span>
            <span className="text-xs font-bold text-muted-foreground">{userStats.streak} Days</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Quick actions row */}
        <motion.div variants={item} className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/lectures" className="bg-card hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer">
            <div className="bg-primary/10 text-primary p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <span className="font-semibold text-sm">Upload Lecture</span>
          </Link>
          <Link href="/flashcards" className="bg-card hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer">
            <div className="bg-chart-2/10 text-chart-2 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <span className="font-semibold text-sm">Study Flashcards</span>
          </Link>
          <Link href="/quizzes" className="bg-card hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer">
            <div className="bg-chart-3/10 text-chart-3 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <span className="font-semibold text-sm">Take Quiz</span>
          </Link>
          <Link href="/assistant" className="bg-card hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer">
            <div className="bg-chart-4/10 text-chart-4 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <BrainCircuit size={24} />
            </div>
            <span className="font-semibold text-sm">Ask AI Assistant</span>
          </Link>
        </motion.div>

        {/* Main content - Recent Lectures */}
        <motion.div variants={item} className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Lectures</h2>
            <Link href="/lectures" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lecturesToDisplay.slice(0, 4).map((lecture) => (
              <Link key={lecture.id} href={`/lectures/${lecture.id}`}>
                <div className="group bg-card hover:bg-accent/5 transition-all p-4 rounded-2xl border border-border shadow-sm cursor-pointer h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: lecture.subjectColor }}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: `${lecture.subjectColor}20`, color: lecture.subjectColor }}>
                      {lecture.subject}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock size={12} className="mr-1" /> {lecture.duration}m
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">{lecture.title}</h3>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {lecture.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Add new card */}
            <Link href="/lectures">
              <div className="bg-transparent border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer h-full min-h-[140px]">
                <PlusCircle size={32} className="text-muted-foreground mb-2" />
                <span className="font-medium text-muted-foreground">Process New Lecture</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Right sidebar - Goals and sticky notes */}
        <motion.div variants={item} className="space-y-6">
          {/* Daily Goal Ring */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Trophy size={64} />
            </div>
            <h3 className="font-bold mb-4">Daily Study Goal</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * 45 / 60)} 
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">45</span>
                  <span className="text-[10px] text-muted-foreground uppercase">min</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">You're doing great!</p>
                <p className="text-xs text-muted-foreground mt-1">15 mins left to reach your daily goal.</p>
              </div>
            </div>
          </div>

          {/* Sticky Notes */}
          <div className="sticky-note-yellow p-5 rounded-md transform rotate-1 transition-transform hover:rotate-0 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-handwriting text-xl font-bold">Up Next</h4>
              <Layers size={16} />
            </div>
            <p className="text-sm font-medium mb-3">Review Biology Flashcards</p>
            <div className="flex justify-between items-center text-xs">
              <span>24 cards due</span>
              <Button size="sm" variant="secondary" className="h-7 text-xs bg-white/50 hover:bg-white/80 text-black">Start</Button>
            </div>
          </div>

          <div className="sticky-note-mint p-5 rounded-md transform -rotate-1 transition-transform hover:rotate-0 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-handwriting text-xl font-bold">Reminder</h4>
            </div>
            <p className="text-sm font-medium">Physics quiz on Friday!</p>
            <p className="text-xs mt-2 opacity-80">Make sure to review Newton's laws.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { HelpCircle, Play, CheckCircle2, Medal } from "lucide-react";
import { Link } from "wouter";

export default function Quizzes() {


  const mockQuizzes = [
    { id: 1, title: "Cellular Biology Mastery", subject: "Biology", subjectColor: "hsl(152 68% 45%)", questionCount: 15, bestScore: 85, attempts: 2 },
    { id: 2, title: "Newton's Laws & Kinematics", subject: "Physics", subjectColor: "hsl(245 70% 55%)", questionCount: 10, bestScore: 100, attempts: 1 },
    { id: 3, title: "French Revolution Timeline", subject: "History", subjectColor: "hsl(45 93% 47%)", questionCount: 20, bestScore: 65, attempts: 3 },
    { id: 4, title: "Intro to Calculus", subject: "Math", subjectColor: "hsl(260 60% 65%)", questionCount: 12, bestScore: null, attempts: 0 },
  ];

  const displayQuizzes = mockQuizzes;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge and earn XP.</p>
      </div>

      {(
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {displayQuizzes.map((quiz) => (
            <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
              <motion.div 
                variants={item} 
                className="group bg-card hover:bg-muted/30 transition-colors rounded-2xl border border-border overflow-hidden cursor-pointer flex h-full"
              >
                <div className="w-3 h-full shrink-0" style={{ backgroundColor: quiz.subjectColor }}></div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider" style={{ backgroundColor: `${quiz.subjectColor}20`, color: quiz.subjectColor }}>
                        {quiz.subject}
                      </span>
                      
                      {quiz.bestScore !== null ? (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-bold">
                          <Medal size={14} className={quiz.bestScore >= 80 ? "text-chart-2" : "text-muted-foreground"} />
                          <span className={quiz.bestScore >= 80 ? "text-chart-2" : ""}>{quiz.bestScore}%</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">New</span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{quiz.questionCount} questions</p>
                  </div>
                  
                  <div className="flex items-center text-sm font-bold mt-auto text-primary">
                    {quiz.attempts > 0 ? "Retake Quiz" : "Start Quiz"}
                    <Play size={16} fill="currentColor" className="ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}

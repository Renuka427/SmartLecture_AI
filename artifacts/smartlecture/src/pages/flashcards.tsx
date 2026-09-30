import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layers, Plus, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Flashcards() {
  const [, setLocation] = useLocation();

  const mockDecks = [
    { id: 1, title: "Cellular Biology Core Concepts", subject: "Biology", subjectColor: "hsl(152 68% 45%)", cardCount: 45, masteredCount: 12, dueCount: 15, lastStudied: "2023-10-15" },
    { id: 2, title: "Physics Formulas", subject: "Physics", subjectColor: "hsl(245 70% 55%)", cardCount: 30, masteredCount: 30, dueCount: 0, lastStudied: "2023-10-14" },
    { id: 3, title: "French Revolution Dates", subject: "History", subjectColor: "hsl(45 93% 47%)", cardCount: 20, masteredCount: 5, dueCount: 10, lastStudied: "2023-10-10" },
    { id: 4, title: "Organic Chem Structures", subject: "Chemistry", subjectColor: "hsl(356 100% 71%)", cardCount: 60, masteredCount: 10, dueCount: 25, lastStudied: "2023-10-16" },
  ];

  const displayDecks = mockDecks;

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Flashcard Decks</h1>
          <p className="text-muted-foreground">Master concepts with spaced repetition.</p>
        </div>
        <Button onClick={() => setLocation("/input-center")} className="shrink-0 gap-2 bg-chart-2 hover:bg-chart-2/90 text-white">
          <Plus size={18} />
          Create Custom Deck
        </Button>
      </div>

      {(
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {displayDecks.map((deck) => (
            <Link key={deck.id} href={`/flashcards/${deck.id}`}>
              <motion.div 
                variants={item} 
                className="bg-card hover:-translate-y-1 transition-transform duration-300 rounded-2xl border border-border overflow-hidden cursor-pointer flex flex-col h-full hover:shadow-xl relative"
                style={{ '--tw-shadow-color': `${deck.subjectColor}20`, boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)' } as React.CSSProperties}
              >
                {/* Stack effect */}
                <div className="absolute top-0 right-2 w-[90%] h-3 bg-muted border-t border-x border-border rounded-t-lg -z-10 -translate-y-2 opacity-50"></div>
                <div className="absolute top-0 right-4 w-[80%] h-3 bg-muted border-t border-x border-border rounded-t-lg -z-20 -translate-y-4 opacity-25"></div>

                <div className="h-2 w-full" style={{ backgroundColor: deck.subjectColor }}></div>
                
                <div className="p-5 flex flex-col flex-1 bg-card z-10 relative">
                  {deck.dueCount > 0 && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      {deck.dueCount} DUE
                    </div>
                  )}
                  
                  <span className="text-xs font-semibold px-2 py-1 rounded-md self-start mb-3 uppercase tracking-wider" style={{ backgroundColor: `${deck.subjectColor}20`, color: deck.subjectColor }}>
                    {deck.subject}
                  </span>
                  
                  <h3 className="font-bold text-lg leading-tight mb-6">{deck.title}</h3>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold font-handwriting leading-none">{deck.cardCount}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Cards</span>
                      </div>
                    </div>
                    
                    {/* Mastery Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                        <circle 
                          cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * (deck.masteredCount / deck.cardCount))} 
                          style={{ color: deck.subjectColor }}
                          className="transition-all duration-1000 ease-out" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {deck.masteredCount === deck.cardCount ? (
                          <CheckCircle size={16} style={{ color: deck.subjectColor }} />
                        ) : (
                          <span className="text-[10px] font-bold">{Math.round((deck.masteredCount / deck.cardCount) * 100)}%</span>
                        )}
                      </div>
                    </div>
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

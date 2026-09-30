import { motion } from "framer-motion";
import { BookOpen, Search, Filter, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Lectures() {
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Mock data fallbacks
  const mockLectures = [
    { id: 1, title: "Introduction to Cellular Biology", subject: "Biology", subjectColor: "hsl(152 68% 45%)", duration: 45, status: "ready", tags: ["cells", "mitosis"] },
    { id: 2, title: "Newton's Laws of Motion", subject: "Physics", subjectColor: "hsl(245 70% 55%)", duration: 32, status: "ready", tags: ["mechanics", "forces"] },
    { id: 3, title: "The French Revolution", subject: "History", subjectColor: "hsl(45 93% 47%)", duration: 50, status: "ready", tags: ["europe", "revolution"] },
    { id: 4, title: "Organic Chemistry 101", subject: "Chemistry", subjectColor: "hsl(356 100% 71%)", duration: 60, status: "ready", tags: ["carbon", "bonds"] },
    { id: 5, title: "Calculus: Limits", subject: "Math", subjectColor: "hsl(260 60% 65%)", duration: 40, status: "ready", tags: ["calculus", "limits"] },
    { id: 6, title: "Data Structures", subject: "CS", subjectColor: "hsl(200 80% 60%)", duration: 55, status: "ready", tags: ["arrays", "trees"] }
  ];

  const mockSubjects = [
    { name: "Biology", color: "hsl(152 68% 45%)", icon: "microscope", lectureCount: 12 },
    { name: "Physics", color: "hsl(245 70% 55%)", icon: "atom", lectureCount: 8 },
    { name: "History", color: "hsl(45 93% 47%)", icon: "landmark", lectureCount: 15 },
    { name: "Chemistry", color: "hsl(356 100% 71%)", icon: "flask-conical", lectureCount: 5 },
    { name: "Math", color: "hsl(260 60% 65%)", icon: "sigma", lectureCount: 20 },
    { name: "CS", color: "hsl(200 80% 60%)", icon: "code", lectureCount: 10 },
  ];

  const displayLectures = mockLectures.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = activeSubject ? l.subject === activeSubject : true;
    return matchesSearch && matchesSubject;
  });

  const displaySubjects = mockSubjects;

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Lectures</h1>
          <p className="text-muted-foreground">Browse your processed lectures and study materials.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={() => setLocation("/input-center")}>
          <BookOpen size={18} />
          Upload New Lecture
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search lectures, topics..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-card shrink-0">
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {/* Subject shelf */}
      <div>
        <h3 className="font-semibold mb-3">Subjects</h3>
        <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <button 
            onClick={() => setActiveSubject(null)}
            className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
              activeSubject === null 
                ? "bg-foreground text-background shadow-md" 
                : "bg-card hover:bg-muted border border-border"
            }`}
          >
            All Subjects
          </button>
          
          {displaySubjects.map((subject) => (
              <button 
                key={subject.name}
                onClick={() => setActiveSubject(activeSubject === subject.name ? null : subject.name)}
                className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 border ${
                  activeSubject === subject.name 
                    ? "shadow-md" 
                    : "bg-card hover:bg-muted border-border"
                }`}
                style={{ 
                  backgroundColor: activeSubject === subject.name ? `${subject.color}15` : '',
                  borderColor: activeSubject === subject.name ? subject.color : '',
                  color: activeSubject === subject.name ? subject.color : ''
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>
                {subject.name}
              </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {displayLectures.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-muted-foreground" size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">No lectures found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {search || activeSubject 
              ? "Try adjusting your search or filters." 
              : "You haven't uploaded any lectures yet. Upload your first lecture to get started."}
          </p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayLectures.map((lecture) => (
            <Link key={lecture.id} href={`/lectures/${lecture.id}`}>
              <motion.div variants={item} className="group bg-card hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-border overflow-hidden cursor-pointer flex flex-col h-full hover:shadow-xl" style={{ '--tw-shadow-color': `${lecture.subjectColor}20`, boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)' } as React.CSSProperties}>
                <div className="h-2 w-full" style={{ backgroundColor: lecture.subjectColor }}></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: `${lecture.subjectColor}20`, color: lecture.subjectColor }}>
                      {lecture.subject}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center bg-muted px-2 py-1 rounded-md">
                      <Clock size={12} className="mr-1" /> {lecture.duration}m
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{lecture.title}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-4 mt-auto pt-4">
                    {lecture.tags?.map(tag => (
                      <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-sm text-secondary-foreground">#{tag}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-primary mt-2">
                    Study material ready
                    <ArrowRight size={14} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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

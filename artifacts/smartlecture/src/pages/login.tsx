import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { signIn, signUp, sendPasswordReset } from "@/lib/supabase-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "Signed in", description: "Welcome back to SmartLecture." });
        setLocation("/");
      } else {
        const result = await signUp(name, email, password);
        if (result.session) {
          toast({ title: "Account created", description: "Welcome to SmartLecture!" });
          setLocation("/");
        } else {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Confirm your email, then sign in.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: isLogin ? "Sign in failed" : "Sign up failed",
        description: error instanceof Error ? error.message : "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter your email", description: "Type your email above, then select Forgot password." });
      return;
    }
    try {
      await sendPasswordReset(email);
      toast({ title: "Check your email", description: "If an account exists for this email, a password reset link will arrive shortly." });
    } catch (error) {
      toast({
        title: "Could not send reset link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - visual backdrop */}
      <div className="hidden lg:flex flex-1 bg-primary/5 relative overflow-hidden items-center justify-center">
        {/* Notebook ruled lines overlay */}
        <div className="absolute inset-0 bg-notebook opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 p-12 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-border sticky-note-yellow -rotate-2 mb-8 inline-block">
              <h2 className="font-handwriting text-3xl font-bold text-foreground">
                Study smarter, not harder.
              </h2>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight mb-6 text-foreground">
              Your AI-powered <br/>
              <span className="text-primary">learning companion</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Transform lectures into interactive flashcards, quizzes, and mind maps in seconds.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <div className="bg-chart-2/20 text-chart-2 p-2 rounded-lg inline-block mb-3">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-semibold mb-1">AI Summaries</h3>
                <p className="text-sm text-muted-foreground">Instantly distill hours of content.</p>
              </div>
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <div className="bg-chart-3/20 text-chart-3 p-2 rounded-lg inline-block mb-3">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-semibold mb-1">Smart Practice</h3>
                <p className="text-sm text-muted-foreground">Adaptive flashcards and quizzes.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative z-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <BookOpen size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-handwriting text-3xl font-bold leading-none tracking-tight">SmartLecture</h1>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isLogin 
                ? "Enter your details to access your study materials." 
                : "Join thousands of students learning smarter."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Alex Student" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="alex@university.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full mt-6" size="lg">
                {submitting ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)} 
                className="font-semibold"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

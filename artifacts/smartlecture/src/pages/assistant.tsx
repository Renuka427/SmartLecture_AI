import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Message = { id: number; role: "user" | "assistant"; content: string };

export default function Assistant() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hi! I'm your AI study assistant. Ask me a question about a topic, and I'll help explain it." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summarize",
          text: "Answer this student's question directly and clearly. Use simple language, explain step by step when useful, and do not claim to have seen lecture notes that were not provided.\n\nQuestion: " + question
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant could not respond.");
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: data.text || "I couldn't generate an answer. Please try again." }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: error instanceof Error ? error.message : "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = ["Explain mitosis simply", "What is photosynthesis?", "Give me 5 revision tips"];

  return (
    <div className="h-[calc(100vh-140px)] min-h-[480px] flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-sm relative">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
        <div className="bg-primary/20 text-primary p-2 rounded-lg"><Sparkles size={20} /></div>
        <div><h2 className="font-bold leading-tight">AI Study Assistant</h2><p className="text-xs text-muted-foreground">Powered by Gemini</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-white" : "bg-chart-2/20 text-chart-2"}`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl whitespace-pre-wrap break-words ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && <div className="text-sm text-muted-foreground animate-pulse">Thinking…</div>}
        <div ref={messagesEndRef} />
      </div>
      {messages.length < 3 && <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
        {prompts.map(p => <button key={p} onClick={() => setInput(p)} className="text-xs bg-background border border-border px-3 py-1.5 rounded-full hover:bg-muted transition-colors font-medium">{p}</button>)}
      </div>}
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSend} className="relative flex items-center">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything…" className="pr-12 py-6 rounded-xl bg-muted/50 border-border text-base" disabled={loading} />
          <Button type="submit" size="icon" className="absolute right-2 h-10 w-10 rounded-lg" disabled={!input.trim() || loading}><Send size={18} /></Button>
        </form>
      </div>
    </div>
  );
}

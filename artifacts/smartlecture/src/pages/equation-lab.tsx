import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sigma, Copy, CheckCheck, BookOpen, Plus, Trash2,
  ChevronRight, Sparkles, Download, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Equation {
  id: number;
  name: string;
  latex: string;
  rendered: string;
  subject: string;
  subjectColor: string;
  description: string;
}

const LIBRARY: Equation[] = [
  { id: 1, name: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", rendered: "x = (−b ± √(b²−4ac)) / 2a", subject: "Mathematics", subjectColor: "#8b5cf6", description: "Solves ax² + bx + c = 0" },
  { id: 2, name: "Euler's Identity", latex: "e^{i\\pi} + 1 = 0", rendered: "eⁱᵖ + 1 = 0", subject: "Mathematics", subjectColor: "#8b5cf6", description: "The most beautiful equation" },
  { id: 3, name: "Newton's Second Law", latex: "F = ma", rendered: "F = ma", subject: "Physics", subjectColor: "#6366f1", description: "Force equals mass times acceleration" },
  { id: 4, name: "Einstein Mass-Energy", latex: "E = mc^2", rendered: "E = mc²", subject: "Physics", subjectColor: "#6366f1", description: "Mass-energy equivalence" },
  { id: 5, name: "Schrödinger Equation", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", rendered: "iℏ ∂Ψ/∂t = ĤΨ", subject: "Physics", subjectColor: "#6366f1", description: "Quantum wave function evolution" },
  { id: 6, name: "Gibbs Free Energy", latex: "\\Delta G = \\Delta H - T\\Delta S", rendered: "ΔG = ΔH − TΔS", subject: "Chemistry", subjectColor: "#f43f5e", description: "Determines reaction spontaneity" },
  { id: 7, name: "Integration by Parts", latex: "\\int u\\,dv = uv - \\int v\\,du", rendered: "∫u dv = uv − ∫v du", subject: "Mathematics", subjectColor: "#8b5cf6", description: "Key integration technique" },
  { id: 8, name: "Ideal Gas Law", latex: "PV = nRT", rendered: "PV = nRT", subject: "Chemistry", subjectColor: "#f43f5e", description: "P = pressure, V = volume, T = temp" },
  { id: 9, name: "Nernst Equation", latex: "E = E^0 - \\frac{RT}{nF}\\ln Q", rendered: "E = E⁰ − (RT/nF) ln Q", subject: "Chemistry", subjectColor: "#f43f5e", description: "Electrochemical cell potential" },
  { id: 10, name: "Gradient Descent", latex: "\\theta_{t+1} = \\theta_t - \\alpha \\nabla_{\\theta} L", rendered: "θₜ₊₁ = θₜ − α∇L(θ)", subject: "Computer Science", subjectColor: "#06b6d4", description: "Parameter update rule in ML" },
  { id: 11, name: "Bayes' Theorem", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}", rendered: "P(A|B) = P(B|A)P(A) / P(B)", subject: "Mathematics", subjectColor: "#8b5cf6", description: "Conditional probability" },
  { id: 12, name: "Wave Equation", latex: "\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u", rendered: "∂²u/∂t² = c²∇²u", subject: "Physics", subjectColor: "#6366f1", description: "Describes wave propagation" },
];

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Computer Science"];

function EquationCard({ eq, onCopy }: { eq: Equation; onCopy: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className="border-border/50 hover:shadow-md transition-all cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`equation-card-${eq.id}`}
        style={{ borderLeftWidth: 3, borderLeftColor: eq.subjectColor }}
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-semibold text-sm">{eq.name}</p>
                <Badge variant="secondary" className="text-xs px-1.5 py-0" style={{ color: eq.subjectColor, backgroundColor: eq.subjectColor + "15" }}>
                  {eq.subject}
                </Badge>
              </div>
              <div className="font-mono text-lg font-medium tracking-tight text-foreground/90 my-2 px-2 py-1.5 bg-muted/50 rounded-lg">
                {eq.rendered}
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-muted-foreground mt-2 mb-2">{eq.description}</p>
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1.5 mt-1">
                      <span className="text-xs text-muted-foreground font-mono flex-1 truncate">{eq.latex}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => { e.stopPropagation(); onCopy(eq.latex); }}
                        data-testid={`copy-latex-${eq.id}`}
                      >
                        <Copy size={10} />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <ChevronRight
                size={16}
                className={`text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
              />
              {expanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); onCopy(eq.rendered); }}
                  data-testid={`copy-rendered-${eq.id}`}
                >
                  <Copy size={13} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EquationLab() {
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [customEq, setCustomEq] = useState("");
  const [savedEquations, setSavedEquations] = useState<Equation[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const filtered = LIBRARY.filter(
    (eq) =>
      (activeSubject === "All" || eq.subject === activeSubject) &&
      (search === "" ||
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        eq.subject.toLowerCase().includes(search.toLowerCase()) ||
        eq.rendered.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Equation copied to clipboard." });
  };

  const handleSaveCustom = () => {
    if (!customEq.trim()) return;
    const newEq: Equation = {
      id: Date.now(),
      name: "Custom Equation",
      latex: customEq,
      rendered: customEq,
      subject: "Custom",
      subjectColor: "#6366f1",
      description: "User-defined equation",
    };
    setSavedEquations((prev) => [newEq, ...prev]);
    setCustomEq("");
    toast({ title: "Saved!", description: "Equation added to your collection." });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Sigma className="text-violet-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">Equation Lab</h1>
        </div>
        <p className="text-muted-foreground ml-11">Browse, copy, and save equations across all your subjects</p>
      </motion.div>

      <Tabs defaultValue="library">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="library" data-testid="tab-equation-library">
            <BookOpen size={14} className="mr-1.5" /> Equation Library
          </TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-equation-custom">
            <Plus size={14} className="mr-1.5" /> My Equations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search equations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
              data-testid="input-equation-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                data-testid={`filter-${s}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeSubject === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s} {s !== "All" && <span className="opacity-60">({LIBRARY.filter((e) => e.subject === s).length})</span>}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            {filtered.length} equation{filtered.length !== 1 ? "s" : ""} — click any to expand and copy LaTeX
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.map((eq) => (
                <EquationCard key={eq.id} eq={eq} onCopy={handleCopy} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6 space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus size={16} /> Add Custom Equation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Type equation (e.g. E = mc², PV = nRT, F = ma)..."
                  value={customEq}
                  onChange={(e) => setCustomEq(e.target.value)}
                  className="font-mono"
                  data-testid="input-custom-equation"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveCustom(); }}
                />
                {customEq && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 bg-muted/50 rounded-xl font-mono text-lg text-center"
                  >
                    {customEq}
                  </motion.div>
                )}
              </div>
              <Button
                className="w-full"
                onClick={handleSaveCustom}
                disabled={!customEq.trim()}
                data-testid="button-save-equation"
              >
                <Plus size={16} className="mr-2" /> Save Equation
              </Button>
            </CardContent>
          </Card>

          {savedEquations.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Saved Equations ({savedEquations.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedEquations.map((eq) => (
                  <Card key={eq.id} className="border-border/50" data-testid={`saved-eq-${eq.id}`}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-sm bg-muted/40 rounded-lg px-3 py-2 truncate">
                          {eq.rendered}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleCopy(eq.rendered)} data-testid={`copy-saved-${eq.id}`}>
                          <Copy size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setSavedEquations((p) => p.filter((e) => e.id !== eq.id))} data-testid={`delete-saved-${eq.id}`}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sigma size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Your saved equations will appear here</p>
              <p className="text-xs mt-1">Type an equation above and click Save</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

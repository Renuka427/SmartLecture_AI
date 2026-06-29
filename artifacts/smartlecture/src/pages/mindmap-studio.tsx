import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Plus, Trash2, Edit3, Save, Download,
  RotateCcw, Sparkles, ChevronDown, Loader2,
  FileText, Wand2, CheckCircle2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapNode {
  id: string;
  label: string;
  color: string;
  level: number;
  parentId: string | null;
  x: number;
  y: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

const STOP_WORDS = new Set([
  "the","and","for","are","but","not","you","all","can","had","her","was","one","our","out",
  "day","get","has","him","his","how","man","new","now","old","see","two","way","who","did",
  "its","let","put","say","she","too","use","that","this","with","have","from","they","will",
  "been","into","more","also","some","than","then","when","there","where","which","their","what",
  "each","most","such","even","well","just","over","only","about","after","before","between",
  "through","during","while","because","these","those","being","would","could","should","upon",
  "very","both","made","same","does","make","like","time","know","take","long","other","your",
  "called","known","used","using","often","many","much","here","form","forms","found","called",
  "called","however","therefore","thus","hence","since","though","although","further","example",
  "first","second","third","finally","another","different","several","various","important","main",
  "process","system","function","structure","type","types","cell","cells","show","shows","include",
  "includes","result","results","occur","occurs","move","moves","allow","allows","help","helps",
  "require","requires","need","needs","provide","provides","create","creates","play","plays",
  "role","roles","part","parts","large","small","high","low","rate","rates","level","levels",
]);

// ─── Concept extraction algorithm ────────────────────────────────────────────
function extractConcepts(text: string): { root: string; branches: { label: string; children: string[] }[] } {
  if (!text.trim()) return { root: "My Topic", branches: [] };

  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 8);

  // Word frequency (multi-word phrases get boosted)
  const wordFreq: Record<string, number> = {};
  const allWords = text.split(/\s+/);
  allWords.forEach((raw) => {
    const w = raw.replace(/[^a-zA-Z-]/g, "").toLowerCase();
    if (w.length >= 4 && !STOP_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });

  // Boost capitalized words (likely proper nouns / concepts)
  allWords.forEach((raw) => {
    const w = raw.replace(/[^a-zA-Z-]/g, "");
    if (w.length >= 4 && /^[A-Z]/.test(w) && !STOP_WORDS.has(w.toLowerCase())) {
      const key = w.toLowerCase();
      wordFreq[key] = (wordFreq[key] || 0) + 1.5;
    }
  });

  // Also extract words preceded by colon or dash (likely headings/definitions)
  const headingPattern = /(?::|—|-)\s+([A-Za-z][a-z]+(?:\s+[a-z]+)?)/g;
  let match;
  while ((match = headingPattern.exec(text)) !== null) {
    const w = match[1]!.toLowerCase().trim();
    if (w.length >= 4 && !STOP_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 3;
    }
  }

  // Detect root topic: first non-stop significant noun phrase from text
  const firstSentenceWords = (sentences[0] || "").split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase()).filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

  // Try to find a 2-word root phrase from title/first line
  const firstLine = text.split("\n")[0]!.trim().replace(/[#*]/g, "").trim();
  let root = "Key Concepts";
  if (firstLine.length > 3 && firstLine.length < 50) {
    root = firstLine;
  } else if (firstSentenceWords.length > 0) {
    root = toTitleCase(firstSentenceWords[0]!);
  }

  // Top concepts for branches (exclude root words)
  const rootWords = new Set(root.toLowerCase().split(/\s+/));
  const topWords = Object.entries(wordFreq)
    .filter(([w]) => !rootWords.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  if (topWords.length === 0) return { root, branches: [] };

  // For each branch word, find the 2–3 most co-occurring distinct words in sentences containing it
  const branches = topWords.map((branchWord) => {
    const relevantSentences = sentences.filter((s) => s.toLowerCase().includes(branchWord));
    const coFreq: Record<string, number> = {};
    relevantSentences.forEach((s) => {
      s.split(/\s+/).forEach((raw) => {
        const w = raw.replace(/[^a-zA-Z-]/g, "").toLowerCase();
        if (w.length >= 4 && !STOP_WORDS.has(w) && w !== branchWord && !rootWords.has(w) && !topWords.includes(w)) {
          coFreq[w] = (coFreq[w] || 0) + 1;
        }
      });
    });
    const children = Object.entries(coFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => toTitleCase(w));

    return { label: toTitleCase(branchWord), children };
  });

  return { root, branches };
}

function toTitleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Radial layout ────────────────────────────────────────────────────────────
function buildNodes(root: string, branches: { label: string; children: string[] }[]): MapNode[] {
  const CX = 400, CY = 230;
  const R1 = 170, R2 = 100;
  const nodes: MapNode[] = [];

  nodes.push({ id: "root", label: root, color: NODE_COLORS[0]!, level: 0, parentId: null, x: CX, y: CY });

  const n = branches.length;
  branches.forEach((branch, bi) => {
    const angle1 = (2 * Math.PI * bi) / n - Math.PI / 2;
    const x1 = CX + R1 * Math.cos(angle1);
    const y1 = CY + R1 * Math.sin(angle1);
    const branchColor = NODE_COLORS[(bi + 1) % NODE_COLORS.length]!;
    const branchId = `b${bi}`;

    nodes.push({ id: branchId, label: branch.label, color: branchColor, level: 1, parentId: "root", x: x1, y: y1 });

    branch.children.forEach((child, ci) => {
      const spread = Math.PI / 4;
      const baseAngle = angle1 - spread + (spread * 2 * ci) / Math.max(branch.children.length - 1, 1);
      const angle2 = branch.children.length === 1 ? angle1 : baseAngle;
      const cx2 = x1 + R2 * Math.cos(angle2);
      const cy2 = y1 + R2 * Math.sin(angle2);
      const childColor = shadeColor(branchColor, 30);
      nodes.push({ id: `b${bi}c${ci}`, label: child, color: childColor, level: 2, parentId: branchId, x: cx2, y: cy2 });
    });
  });

  return nodes;
}

function shadeColor(hex: string, pct: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + pct);
  const g = Math.min(255, ((num >> 8) & 0xff) + pct);
  const b = Math.min(255, (num & 0xff) + pct);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ─── Default map ──────────────────────────────────────────────────────────────
const DEFAULT_NODES: MapNode[] = buildNodes("Machine Learning", [
  { label: "Supervised Learning", children: ["Classification", "Regression", "Training Data"] },
  { label: "Neural Networks", children: ["Deep Learning", "CNN", "RNN"] },
  { label: "Unsupervised Learning", children: ["Clustering", "Dimensionality Reduction"] },
  { label: "Evaluation", children: ["Precision", "Recall", "Cross-Validation"] },
  { label: "Optimisation", children: ["Gradient Descent", "Loss Function"] },
]);

const PRESET_TEXTS: Record<string, string> = {
  "Cell Biology": "Cell Biology: The cell is the basic unit of life. Prokaryotic cells lack a nucleus and membrane-bound organelles. Eukaryotic cells have a nucleus, mitochondria, and endoplasmic reticulum. The cell membrane controls what enters and exits the cell through transport mechanisms including diffusion, osmosis, and active transport. Mitosis is the process of cell division resulting in two identical daughter cells. The cell cycle includes interphase, prophase, metaphase, anaphase, and telophase.",
  "French Revolution": "The French Revolution began in 1789. Causes included financial crisis, food shortages, and Enlightenment philosophy. Key events included the storming of the Bastille, the Declaration of the Rights of Man, and the execution of King Louis XVI and Marie Antoinette. The revolution produced the Reign of Terror under Robespierre. Napoleon Bonaparte eventually rose to power, establishing the Consulate and later the First French Empire.",
  "Quantum Mechanics": "Quantum mechanics describes the behaviour of particles at the subatomic scale. Wave-particle duality means particles like electrons exhibit both wave and particle properties. The Heisenberg uncertainty principle states that position and momentum cannot be known simultaneously. The Schrödinger equation describes how quantum states evolve. Quantum entanglement and superposition are fundamental phenomena. Particles exist in multiple states until observed — this is wavefunction collapse.",
};

// ─── SVG Canvas ───────────────────────────────────────────────────────────────
function MindMapSVG({ nodes, selectedId, onSelect }: { nodes: MapNode[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const edges = nodes.filter((n) => n.parentId !== null).map((n) => {
    const parent = nodes.find((p) => p.id === n.parentId);
    return parent ? { from: parent, to: n } : null;
  }).filter(Boolean) as { from: MapNode; to: MapNode }[];

  return (
    <svg viewBox="0 0 800 460" className="w-full" style={{ minHeight: 320 }} data-testid="mindmap-svg">
      {edges.map((e, i) => (
        <motion.line key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
          x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
          stroke={e.to.color} strokeWidth={e.to.level === 1 ? 2 : 1.5} strokeOpacity={0.45}
          strokeDasharray={e.to.level === 2 ? "5 3" : "0"} />
      ))}
      {nodes.map((node, i) => {
        const isRoot = node.level === 0;
        const isSelected = node.id === selectedId;
        const lines = node.label.split(/\s(?=\S+$)/); // wrap last word if long
        const rx = isRoot ? 54 : node.level === 1 ? 46 : 40;
        const ry = isRoot ? 22 : node.level === 1 ? 18 : 15;
        return (
          <motion.g key={node.id} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 240, damping: 20 }}
            onClick={() => onSelect(node.id)} style={{ cursor: "pointer" }} data-testid={`mindmap-node-${node.id}`}>
            <ellipse cx={node.x} cy={node.y} rx={isSelected ? rx + 4 : rx} ry={isSelected ? ry + 3 : ry}
              fill={node.color} fillOpacity={isRoot ? 1 : 0.88}
              stroke={isSelected ? "white" : "white"} strokeWidth={isSelected ? 3 : isRoot ? 2.5 : 1.5} strokeOpacity={0.7} />
            {lines.length > 1 ? (
              lines.map((line, li) => (
                <text key={li} x={node.x} y={node.y + (li - (lines.length - 1) / 2) * 12}
                  textAnchor="middle" dominantBaseline="middle" fill="white"
                  fontSize={isRoot ? 11 : node.level === 1 ? 10 : 9}
                  fontWeight={isRoot ? "700" : "600"} fontFamily="system-ui,sans-serif">
                  {line}
                </text>
              ))
            ) : (
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fill="white"
                fontSize={isRoot ? 11 : node.level === 1 ? 10 : 9}
                fontWeight={isRoot ? "700" : "600"} fontFamily="system-ui,sans-serif">
                {node.label}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MindmapStudio() {
  const [nodes, setNodes] = useState<MapNode[]>(DEFAULT_NODES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatedRoot, setGeneratedRoot] = useState<string | null>(null);

  // Manual add node
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(NODE_COLORS[1]!);
  const [newParent, setNewParent] = useState("root");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const { toast } = useToast();

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const l1Nodes = nodes.filter((n) => n.level === 1);
  const l2Nodes = nodes.filter((n) => n.level === 2);

  // ── Auto-generation ──
  const GEN_STEPS = ["Parsing content…", "Extracting key concepts…", "Building relationships…", "Calculating layout…", "Rendering map…"];

  const handleGenerate = () => {
    if (!inputText.trim()) { toast({ title: "Please paste some text first", variant: "destructive" }); return; }
    setGenerating(true);
    setGeneratingStep(0);
    let step = 0;
    const tick = () => {
      step++;
      setGeneratingStep(step);
      if (step < GEN_STEPS.length) setTimeout(tick, 500);
      else {
        const { root, branches } = extractConcepts(inputText);
        const newNodes = buildNodes(root, branches);
        setNodes(newNodes);
        setGeneratedRoot(root);
        setGenerating(false);
        setSelectedId(null);
        toast({ title: "Mind map generated!", description: `Found ${branches.length} main concepts from your text.` });
      }
    };
    setTimeout(tick, 500);
  };

  const handleLoadPreset = (name: string) => {
    const text = PRESET_TEXTS[name];
    if (!text) return;
    setInputText(text);
    const { root, branches } = extractConcepts(text);
    setNodes(buildNodes(root, branches));
    setGeneratedRoot(root);
    toast({ title: `Loaded: ${name}`, description: "Mind map generated from preset content." });
  };

  // ── Manual add ──
  const addNode = () => {
    if (!newLabel.trim()) return;
    const parent = nodes.find((n) => n.id === newParent);
    const level = parent ? parent.level + 1 : 1;
    const angle = Math.random() * 2 * Math.PI;
    const dist = level === 1 ? 170 : 100;
    const px = parent ? parent.x : 400;
    const py = parent ? parent.y : 230;
    const newNode: MapNode = { id: `custom-${Date.now()}`, label: newLabel.trim(), color: newColor, level, parentId: newParent, x: px + dist * Math.cos(angle), y: py + dist * Math.sin(angle) };
    setNodes((prev) => [...prev, newNode]);
    setNewLabel("");
    toast({ title: `"${newNode.label}" added` });
  };

  const deleteNode = (id: string) => {
    if (id === "root") { toast({ title: "Cannot delete root", variant: "destructive" }); return; }
    const collectIds = (nodeId: string): string[] => {
      const children = nodes.filter((n) => n.parentId === nodeId).map((n) => n.id);
      return [nodeId, ...children.flatMap(collectIds)];
    };
    const toDelete = new Set(collectIds(id));
    setNodes((prev) => prev.filter((n) => !toDelete.has(n.id)));
    if (selectedId && toDelete.has(selectedId)) setSelectedId(null);
    toast({ title: "Node deleted" });
  };

  const saveEdit = () => {
    if (!editLabel.trim() || !editingId) return;
    setNodes((prev) => prev.map((n) => n.id === editingId ? { ...n, label: editLabel.trim() } : n));
    setEditingId(null);
    toast({ title: "Node updated" });
  };

  const handleDownload = () => {
    const svg = document.querySelector("[data-testid='mindmap-svg']");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mindmap.svg"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Saved as mindmap.svg" });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Network className="text-indigo-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">Mind Map Studio</h1>
        </div>
        <p className="text-muted-foreground ml-11">Paste notes, transcripts, or any text — AI extracts concepts and builds a map</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── Canvas ── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }} className="xl:col-span-3">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <Network size={15} /> Canvas
                <Badge variant="secondary" className="text-xs ml-1">{nodes.length} nodes</Badge>
                {generatedRoot && <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300">{generatedRoot}</Badge>}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setNodes(DEFAULT_NODES); setGeneratedRoot(null); setSelectedId(null); }} data-testid="button-reset-map">
                  <RotateCcw size={12} className="mr-1" /> Reset
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownload} data-testid="button-export-map">
                  <Download size={12} className="mr-1" /> Export SVG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-border/50 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/20 flex items-center justify-center" style={{ minHeight: 340 }}>
                    <div className="text-center space-y-5 max-w-xs mx-auto px-4">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400 mx-auto" />
                      <div className="space-y-2">
                        {GEN_STEPS.map((s, i) => (
                          <div key={s} className={`flex items-center gap-2 text-sm transition-all ${i < generatingStep ? "text-emerald-600" : i === generatingStep ? "text-indigo-600 font-medium" : "text-muted-foreground/40"}`}>
                            {i < generatingStep ? <CheckCircle2 size={13} /> : i === generatingStep ? <Loader2 size={13} className="animate-spin" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-slate-50/80 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/10 overflow-hidden p-2">
                      <MindMapSVG nodes={nodes} selectedId={selectedId} onSelect={setSelectedId} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Root topic</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Main concept</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-300" /> Sub-topic</div>
                <span className="ml-auto">Click a node to select</span>
              </div>

              {/* Selected node panel */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="mt-4 p-3 rounded-xl border border-border/50 bg-muted/30 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedNode.color }} />
                    {editingId === selectedNode.id ? (
                      <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                        className="h-7 text-sm flex-1" autoFocus data-testid="edit-selected-input" />
                    ) : (
                      <span className="text-sm font-medium flex-1">{selectedNode.label}</span>
                    )}
                    <Badge variant="secondary" className="text-xs shrink-0">Level {selectedNode.level}</Badge>
                    {editingId === selectedNode.id ? (
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={saveEdit} data-testid="save-node-edit"><Save size={11} /></Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => { setEditingId(selectedNode.id); setEditLabel(selectedNode.label); }} data-testid="edit-selected-button"><Edit3 size={11} /></Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteNode(selectedNode.id)} data-testid="delete-selected-button"><Trash2 size={11} /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setSelectedId(null)} data-testid="deselect-button"><X size={11} /></Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Sidebar ── */}
        <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }} className="space-y-4">
          <Tabs defaultValue="generate">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="generate" data-testid="tab-auto-generate"><Wand2 size={13} className="mr-1" /> Auto</TabsTrigger>
              <TabsTrigger value="manual" data-testid="tab-manual"><Plus size={13} className="mr-1" /> Manual</TabsTrigger>
            </TabsList>

            {/* ── Auto generate ── */}
            <TabsContent value="generate" className="mt-3 space-y-3">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Wand2 size={13} className="text-indigo-600" /> Generate from Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Paste lecture notes, a transcript, a paragraph — anything. AI will extract concepts and build the map automatically."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[130px] text-sm resize-none"
                    data-testid="textarea-generate-input"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText size={11} /> {inputText.split(/\s+/).filter(Boolean).length} words
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleGenerate} disabled={generating || !inputText.trim()} data-testid="button-generate-map">
                    {generating ? <><Loader2 size={14} className="mr-2 animate-spin" /> Generating…</> : <><Sparkles size={14} className="mr-2" /> Generate Mind Map</>}
                  </Button>
                  {inputText && !generating && (
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setInputText("")} data-testid="button-clear-text">
                      <X size={12} className="mr-1" /> Clear text
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Presets */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { name: "Machine Learning", icon: "🤖" },
                    { name: "Cell Biology", icon: "🧬" },
                    { name: "French Revolution", icon: "🏛️" },
                    { name: "Quantum Mechanics", icon: "⚛️" },
                  ].map((p) => (
                    <button key={p.name} onClick={() => handleLoadPreset(p.name)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-left cursor-pointer"
                      data-testid={`preset-${p.name.replace(/\s+/g, "-").toLowerCase()}`}>
                      <span className="text-base">{p.icon}</span>
                      <span className="text-xs font-medium">{p.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Manual add ── */}
            <TabsContent value="manual" className="mt-3 space-y-3">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Plus size={13} /> Add Node</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Node label…" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addNode(); }} data-testid="input-node-label" className="text-sm" />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Color</p>
                    <div className="flex flex-wrap gap-1.5">
                      {NODE_COLORS.map((c) => (
                        <button key={c} onClick={() => setNewColor(c)} data-testid={`color-pick-${c}`}
                          className={`w-6 h-6 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-1 ring-foreground/40" : "hover:scale-110"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Parent</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between text-sm h-8" data-testid="dropdown-parent">
                          {nodes.find((n) => n.id === newParent)?.label.substring(0, 20) ?? "Select"}
                          <ChevronDown size={12} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-44 max-h-44 overflow-y-auto">
                        {nodes.filter((n) => n.level < 2).map((n) => (
                          <DropdownMenuItem key={n.id} onClick={() => setNewParent(n.id)} data-testid={`parent-option-${n.id}`}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: n.color }} />
                            <span className="truncate text-xs">{n.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button className="w-full" size="sm" onClick={addNode} disabled={!newLabel.trim()} data-testid="button-add-node">
                    <Plus size={13} className="mr-1.5" /> Add Node
                  </Button>
                </CardContent>
              </Card>

              {/* Node list */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Nodes ({nodes.length})</CardTitle>
                </CardHeader>
                <CardContent className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                  {nodes.map((node) => (
                    <div key={node.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 group cursor-pointer ${selectedId === node.id ? "bg-muted/60" : ""}`}
                      onClick={() => setSelectedId(node.id)} data-testid={`node-list-${node.id}`}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
                      <span className="text-xs flex-1 truncate" style={{ paddingLeft: node.level * 8 }}>{node.label}</span>
                      {node.id !== "root" && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} data-testid={`delete-node-${node.id}`}>
                          <Trash2 size={9} />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanText, Upload, Copy, CheckCheck, Layers, Loader2, Image,
  Download, RefreshCcw, FileText, Sparkles, ZoomIn, ZoomOut, RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MOCK_OCR_RESULT = `Cell Membrane Transport Mechanisms

1. Passive Transport (No energy required)
   • Simple Diffusion: Movement of small nonpolar molecules
   • Facilitated Diffusion: Uses protein channels/carriers
   • Osmosis: Water movement across semipermeable membrane

2. Active Transport (Requires ATP energy)
   • Sodium-Potassium Pump (Na+/K+ ATPase)
     - Moves 3 Na+ out, 2 K+ in per cycle
     - Maintains electrochemical gradient
   • Proton Pump: Creates pH gradient

3. Vesicular Transport
   • Endocytosis: Cell engulfs materials
     - Phagocytosis ("cell eating")
     - Pinocytosis ("cell drinking")
     - Receptor-mediated endocytosis
   • Exocytosis: Cell expels materials

Key Equation: ΔG = RT ln(C₂/C₁) + zFΔΨ

Note: Membrane fluidity affected by cholesterol and
fatty acid saturation level.`;

const CONFIDENCE_REGIONS = [
  { text: "Cell Membrane Transport Mechanisms", confidence: 98, color: "#10b981" },
  { text: "Passive Transport (No energy required)", confidence: 96, color: "#10b981" },
  { text: "Active Transport (Requires ATP energy)", confidence: 94, color: "#10b981" },
  { text: "Sodium-Potassium Pump (Na+/K+ ATPase)", confidence: 91, color: "#10b981" },
  { text: "Key Equation: ΔG = RT ln(C₂/C₁)...", confidence: 78, color: "#f59e0b" },
  { text: "Membrane fluidity note", confidence: 88, color: "#10b981" },
];

type ProcessState = "idle" | "processing" | "done";

export default function OcrStudio() {
  const [state, setState] = useState<ProcessState>("idle");
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(100);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImage = () => {
    setState("processing");
    setTimeout(() => {
      setState("done");
      setExtractedText(MOCK_OCR_RESULT);
      toast({ title: "OCR Complete", description: "Text extracted with 93% average confidence." });
    }, 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processImage();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const avgConfidence = Math.round(CONFIDENCE_REGIONS.reduce((a, r) => a + r.confidence, 0) / CONFIDENCE_REGIONS.length);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <ScanText className="text-cyan-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">OCR Studio</h1>
        </div>
        <p className="text-muted-foreground ml-11">Extract and edit text from images with AI-powered recognition</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Image panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Image size={16} /> Source Image
              </CardTitle>
              {state === "done" && (
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(50, zoom - 25))} data-testid="button-zoom-out"><ZoomOut size={14} /></Button>
                  <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, zoom + 25))} data-testid="button-zoom-in"><ZoomIn size={14} /></Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {state === "idle" ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  data-testid="dropzone-ocr"
                  className={`aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                    dragOver ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 scale-[1.01]" : "border-border hover:border-cyan-400/60 hover:bg-muted/40"
                  }`}
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processImage(); }} />
                  <div className="text-center space-y-3 p-6">
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto">
                      <ScanText className="text-cyan-600" size={28} />
                    </div>
                    <div>
                      <p className="font-semibold">Drop image or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, HEIC, PDF (first page)</p>
                    </div>
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-upload-ocr">
                      <Upload size={14} className="mr-1.5" /> Browse Files
                    </Button>
                  </div>
                </div>
              ) : state === "processing" ? (
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-cyan-50 to-indigo-50 dark:from-cyan-950/20 dark:to-indigo-950/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-600 dark:border-cyan-800 dark:border-t-cyan-400"
                      />
                      <ScanText size={20} className="absolute inset-0 m-auto text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Analyzing image...</p>
                      <p className="text-sm text-muted-foreground">Detecting text regions</p>
                    </div>
                    <div className="w-48 mx-auto">
                      {["Detecting layout", "Recognizing text", "Post-processing"].map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.7 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground mb-1"
                        >
                          <Loader2 size={10} className="animate-spin" />
                          {step}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-border/50 overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%` }}>
                    <div className="p-6 w-full font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {MOCK_OCR_RESULT.substring(0, 300)}...
                      <div className="mt-2 space-y-1">
                        {CONFIDENCE_REGIONS.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-3 rounded-sm flex-1 opacity-30" style={{ backgroundColor: r.color }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-muted-foreground">Avg confidence: <strong className="text-foreground">{avgConfidence}%</strong></span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setState("idle"); setExtractedText(""); }} data-testid="button-rescan">
                      <RefreshCcw size={12} className="mr-1" /> Rescan
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence Map</p>
                    {CONFIDENCE_REGIONS.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground truncate flex-1">{r.text.substring(0, 30)}...</span>
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                          <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, backgroundColor: r.color }}></div>
                        </div>
                        <span className="text-muted-foreground w-8 text-right">{r.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Text output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={16} /> Extracted Text
              </CardTitle>
              {state === "done" && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{extractedText.length} chars</Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopy} data-testid="button-copy-text">
                    {copied ? <CheckCheck size={13} className="mr-1 text-emerald-600" /> : <Copy size={13} className="mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {state === "idle" ? (
                <div className="aspect-[4/3] rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center">
                  <div className="text-center text-muted-foreground space-y-2">
                    <FileText size={32} className="mx-auto opacity-30" />
                    <p className="text-sm">Extracted text will appear here</p>
                  </div>
                </div>
              ) : state === "processing" ? (
                <div className="aspect-[4/3] rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : (
                <>
                  <Textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="min-h-[280px] font-mono text-sm resize-none border-border/50"
                    data-testid="textarea-extracted-text"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="text-sm" data-testid="button-create-flashcards">
                      <Layers size={15} className="mr-2 text-violet-600" /> Create Flashcards
                    </Button>
                    <Button variant="outline" className="text-sm" data-testid="button-ai-summary">
                      <Sparkles size={15} className="mr-2 text-amber-500" /> AI Summary
                    </Button>
                    <Button variant="outline" className="text-sm" data-testid="button-download-text">
                      <Download size={15} className="mr-2" /> Download .txt
                    </Button>
                    <Button variant="outline" className="text-sm" data-testid="button-add-to-lecture">
                      <FileText size={15} className="mr-2 text-cyan-600" /> Add to Lecture
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

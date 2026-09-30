import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Mic, Image as ImageIcon, FileAudio, CheckCircle2,
  RotateCcw, Zap, Square, Loader2, ArrowRight, X, Upload,
  Copy, CheckCheck, Download, FileText, Network, Clock,
  User, Volume2, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UploadState = "idle" | "uploading" | "processing" | "done";
type SpeechRecognitionLike = { continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: any) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
declare global { interface Window { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike } }

// ─── Mock transcript generator ───────────────────────────────────────────────
interface TranscriptLine {
  ts: string;
  speaker: string;
  text: string;
  confidence: number;
}

const TRANSCRIPT_LINES: TranscriptLine[] = [
  { ts: "00:00", speaker: "Lecturer", text: "Welcome to today's lecture on cellular biology and membrane transport mechanisms.", confidence: 98 },
  { ts: "00:06", speaker: "Lecturer", text: "We'll be covering three main areas: passive transport, active transport, and vesicular transport.", confidence: 97 },
  { ts: "00:14", speaker: "Lecturer", text: "Passive transport requires no energy. It relies entirely on concentration gradients.", confidence: 95 },
  { ts: "00:21", speaker: "Lecturer", text: "The simplest form is simple diffusion — small nonpolar molecules move freely across the membrane.", confidence: 94 },
  { ts: "00:29", speaker: "Lecturer", text: "Facilitated diffusion uses protein channels or carrier proteins to move larger or polar molecules.", confidence: 96 },
  { ts: "00:38", speaker: "Lecturer", text: "Osmosis is the movement of water across a semipermeable membrane, always from low to high solute concentration.", confidence: 93 },
  { ts: "00:47", speaker: "Student", text: "Does osmosis require aquaporin channels?", confidence: 91 },
  { ts: "00:51", speaker: "Lecturer", text: "Great question. In most cells yes — aquaporins dramatically increase the rate of water transport.", confidence: 97 },
  { ts: "01:00", speaker: "Lecturer", text: "Now, active transport is fundamentally different. It moves molecules against their concentration gradient.", confidence: 96 },
  { ts: "01:08", speaker: "Lecturer", text: "The most important example is the Sodium-Potassium pump, or Na+/K+ ATPase.", confidence: 94 },
  { ts: "01:16", speaker: "Lecturer", text: "For every ATP molecule consumed, it moves 3 sodium ions out and 2 potassium ions in.", confidence: 98 },
  { ts: "01:25", speaker: "Lecturer", text: "This electrochemical gradient is essential for nerve impulse transmission and muscle contraction.", confidence: 95 },
  { ts: "01:34", speaker: "Lecturer", text: "Finally, vesicular transport — the cell actually engulfs or expels materials using membrane-bound vesicles.", confidence: 93 },
  { ts: "01:43", speaker: "Lecturer", text: "Endocytosis brings material in. Phagocytosis for solids, pinocytosis for liquids.", confidence: 96 },
  { ts: "01:51", speaker: "Lecturer", text: "Exocytosis is the reverse — vesicles fuse with the plasma membrane and release contents outside the cell.", confidence: 94 },
  { ts: "02:00", speaker: "Lecturer", text: "For next class, review the Gibbs free energy equation and how it applies to membrane transport.", confidence: 92 },
];

const PROCESSING_STEPS = [
  { label: "Detecting audio format", duration: 600 },
  { label: "Separating speakers", duration: 900 },
  { label: "Transcribing speech", duration: 1400 },
  { label: "Identifying timestamps", duration: 700 },
  { label: "Calculating confidence scores", duration: 500 },
  { label: "Formatting transcript", duration: 400 },
];

// ─── Confidence badge ─────────────────────────────────────────────────────────
function ConfidenceDot({ score }: { score: number }) {
  const color = score >= 95 ? "#10b981" : score >= 88 ? "#f59e0b" : "#f43f5e";
  return <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: color, display: "inline-block" }} />;
}

// ─── Processing animation ─────────────────────────────────────────────────────
function ProcessingSteps({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const advance = (i: number) => {
    if (i >= PROCESSING_STEPS.length) { onDone(); return; }
    setTimeout(() => { setStep(i + 1); advance(i + 1); }, PROCESSING_STEPS[i]!.duration);
  };

  useState(() => { advance(0); });

  return (
    <div className="space-y-2 py-2">
      {PROCESSING_STEPS.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          {i < step ? (
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          ) : i === step ? (
            <Loader2 size={14} className="animate-spin text-primary shrink-0" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-border/60 shrink-0" />
          )}
          <span className={`text-sm transition-colors ${i < step ? "text-foreground" : i === step ? "text-primary font-medium" : "text-muted-foreground"}`}>
            {s.label}
          </span>
          {i < step && <span className="text-xs text-emerald-600 ml-auto">Done</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Transcript viewer ────────────────────────────────────────────────────────
function TranscriptResult({ lines, duration, onReset }: { lines: TranscriptLine[]; duration: number; onReset: () => void }) {
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const fullText = lines.map((l) => `[${l.ts}] ${l.speaker}: ${l.text}`).join("\n");
  const avgConf = Math.round(lines.reduce((a, l) => a + l.confidence, 0) / lines.length);
  const speakers = [...new Set(lines.map((l) => l.speaker))];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = () => {
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcript.txt"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded transcript.txt" });
  };

  const handleSummary = async () => {
    setSummarizing(true); setSummaryError("");
    try {
      const response = await fetch("/api/study", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "summarize", text: lines.map((line) => line.text).join("\n") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate study notes.");
      setSummary(data.text || "No notes returned.");
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Please try again.");
    } finally { setSummarizing(false); }
  };

  const handleMindMap = () => {
    setLocation("/mindmap-studio");
    toast({ title: "Opening Mind Map Studio", description: "Paste the transcript to auto-generate a mind map." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex gap-3 flex-wrap"><Button onClick={handleSummary} disabled={summarizing} className="bg-violet-600 hover:bg-violet-700"><Zap size={14} className="mr-2" />{summarizing ? "Generating study notes..." : "Generate AI Study Notes"}</Button></div>
      {summaryError && <p className="text-sm text-destructive">{summaryError}</p>}
      {summary && <Card><CardHeader><CardTitle className="text-base">AI Study Notes</CardTitle></CardHeader><CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</div></CardContent></Card>}
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="secondary" className="gap-1.5 text-xs">
          <Clock size={11} /> {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} audio
        </Badge>
        <Badge variant="secondary" className="gap-1.5 text-xs">
          <Volume2 size={11} /> {lines.length} segments
        </Badge>
        <Badge variant="secondary" className="gap-1.5 text-xs">
          <User size={11} /> {speakers.join(" · ")}
        </Badge>
        <Badge className="text-xs ml-auto" style={{ backgroundColor: avgConf >= 95 ? "#10b98120" : "#f59e0b20", color: avgConf >= 95 ? "#10b981" : "#f59e0b", border: "none" }}>
          {avgConf}% avg confidence
        </Badge>
      </div>

      {/* Transcript lines */}
      <div className="rounded-xl border border-border/50 bg-muted/20 divide-y divide-border/30 max-h-72 overflow-y-auto">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
          >
            <span className="text-xs font-mono text-muted-foreground w-10 shrink-0 mt-0.5">{line.ts}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-semibold" style={{ color: line.speaker === "Lecturer" ? "#6366f1" : "#f59e0b" }}>
                  {line.speaker}
                </span>
                <ConfidenceDot score={line.confidence} />
              </div>
              <p className="text-sm leading-relaxed">{line.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="outline" size="sm" className="text-xs" onClick={handleCopy} data-testid="button-copy-transcript">
          {copied ? <CheckCheck size={13} className="mr-1 text-emerald-600" /> : <Copy size={13} className="mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleDownload} data-testid="button-download-transcript">
          <Download size={13} className="mr-1" /> Download
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Adding to lecture notes..." })} data-testid="button-add-to-notes">
          <FileText size={13} className="mr-1" /> Add to Notes
        </Button>
        <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700" onClick={handleMindMap} data-testid="button-open-mindmap">
          <Network size={13} className="mr-1" /> Mind Map
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onReset} data-testid="button-reset-transcript">
        <RotateCcw size={12} className="mr-1" /> New recording
      </Button>
    </motion.div>
  );
}

// ─── Camera scan tab ──────────────────────────────────────────────────────────
function CameraScanTab() {
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCapture = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setCaptured(true); }, 2000);
  };

  const handleProcessOcr = () => {
    toast({ title: "Opening OCR Studio", description: "Your image is ready for text extraction." });
    setLocation("/ocr-studio");
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border aspect-video flex items-center justify-center">
        {captured ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>
              <p className="font-semibold">Image Captured</p>
              <p className="text-sm text-muted-foreground">Ready for OCR text extraction</p>
            </div>
          </motion.div>
        ) : scanning ? (
          <div className="text-center space-y-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Camera className="text-primary" size={28} />
            </motion.div>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <motion.div animate={{ top: ["10%", "90%", "10%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute left-4 right-4 h-0.5 bg-primary/50 rounded" style={{ position: "absolute" }} />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border">
              <Camera className="text-muted-foreground" size={28} />
            </div>
            <p className="font-medium">Camera Preview Area</p>
            <p className="text-sm text-muted-foreground">Point at notes, whiteboards, or textbook pages</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {captured ? (
          <>
            <Button className="flex-1" variant="outline" onClick={() => setCaptured(false)} data-testid="button-retake"><RotateCcw size={15} className="mr-2" /> Retake</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleProcessOcr} data-testid="button-process-ocr">
              <Zap size={15} className="mr-2" /> Extract Text with OCR <ArrowRight size={14} className="ml-2" />
            </Button>
          </>
        ) : (
          <Button className="flex-1" onClick={handleCapture} disabled={scanning} data-testid="button-capture">
            {scanning ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Camera size={15} className="mr-2" />}
            {scanning ? "Scanning..." : "Capture Image"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Image upload tab ─────────────────────────────────────────────────────────
function ImageUploadTab() {
  const [state, setState] = useState<"idle" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Please upload an image file", variant: "destructive" }); return; }
    setPreview(URL.createObjectURL(file));
    setState("done");
  };

  const handleExtract = () => {
    toast({ title: "Opening OCR Studio", description: "Your image is queued for text extraction." });
    setLocation("/ocr-studio");
  };

  return (
    <div className="space-y-5">
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        data-testid="dropzone-image"
        className={`rounded-2xl border-2 border-dashed aspect-video flex items-center justify-center cursor-pointer transition-all overflow-hidden ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {state === "done" && preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="text-white text-center"><CheckCircle2 size={36} className="mx-auto mb-2" /><p className="font-semibold">Image Ready</p></div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 p-8">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border"><ImageIcon className="text-muted-foreground" size={26} /></div>
            <div><p className="font-medium">Drop image or click to browse</p><p className="text-sm text-muted-foreground mt-1">PNG, JPG, JPEG, HEIC, WebP · up to 20MB</p></div>
          </div>
        )}
      </div>
      {state === "done" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { setState("idle"); setPreview(null); }} data-testid="button-clear-image"><X size={14} className="mr-1.5" /> Clear</Button>
          <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleExtract} data-testid="button-extract-text"><Zap size={14} className="mr-1.5" /> Extract Text <ArrowRight size={14} className="ml-1.5" /></Button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Audio upload / record tab ────────────────────────────────────────────────
function AudioUploadTab() {
  const [stage, setStage] = useState<"idle" | "recording" | "recorded" | "processing" | "done">("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [processingDone, setProcessingDone] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Live transcription is not supported", description: "Try the latest Chrome or Edge browser.", variant: "destructive" });
      return;
    }
    setLiveTranscript("");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + (event.results[i].isFinal ? " " : "");
      setLiveTranscript(text.trim());
    };
    recognition.onerror = () => toast({ title: "Microphone transcription issue", description: "Check microphone permission and try again.", variant: "destructive" });
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setStage("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast({ title: "Could not start microphone", description: "Please check microphone permission.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    setAudioDuration(recordingTime);
    setStage("recorded");
    toast({ title: "Live transcript captured", description: "Review the recognized words, then generate AI study notes." });
  };

  const startProcessing = () => {
    setStage("processing");
    setProcessingDone(false);
  };

  const handleProcessingDone = () => {
    setStage("done");
  };

  const handleFileUpload = (file: File) => {
    setAudioDuration(120); // mock 2min
    setStage("recorded");
    toast({ title: `${file.name} uploaded`, description: "Ready to transcribe." });
  };

  if (stage === "done") {
    return <TranscriptResult lines={liveTranscript ? [{ ts: "Live", speaker: "You", text: liveTranscript, confidence: 100 }] : []} duration={audioDuration} onReset={() => { setStage("idle"); setRecordingTime(0); setLiveTranscript(""); }} />;
  }

  return (
    <div className="space-y-5">
      {/* Recorder */}
      <div className="rounded-2xl border-2 border-border bg-gradient-to-br from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 p-8">
        <div className="text-center space-y-5">
          {stage === "recording" ? (
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto relative">
                <Mic className="text-red-600" size={32} />
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full bg-red-400/30" />
              </div>
              <p className="text-2xl font-mono font-bold text-red-600 mt-3">{fmt(recordingTime)}</p>
              <p className="text-sm text-muted-foreground">Listening and transcribing live…</p>
              <div className="max-h-40 overflow-auto rounded-lg bg-background/70 p-3 text-left text-sm whitespace-pre-wrap">{liveTranscript || "Your speech will appear here as you speak."}</div>
            </motion.div>
          ) : stage === "recorded" ? (
            <div>
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>
              <p className="font-semibold mt-3">Audio Ready — {fmt(audioDuration)}</p>
              <p className="text-sm text-muted-foreground">Live transcript captured. Generate AI notes after reviewing.</p>
            </div>
          ) : stage === "processing" ? (
            <div className="text-left max-w-xs mx-auto">
              <p className="font-semibold text-center mb-4">Transcribing audio…</p>
              <ProcessingSteps onDone={handleProcessingDone} />
            </div>
          ) : (
            <div>
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                <Mic className="text-amber-600" size={32} />
              </div>
              <p className="font-medium mt-3 text-muted-foreground">Ready to record</p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            {stage === "recording" ? (
              <Button variant="destructive" onClick={stopRecording} data-testid="button-stop-recording">
                <Square size={14} className="mr-2" /> Stop Recording
              </Button>
            ) : stage === "recorded" ? (
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={startProcessing} data-testid="button-transcribe-audio">
                <Zap size={14} className="mr-2" /> Transcribe Audio
              </Button>
            ) : stage === "idle" ? (
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={startRecording} data-testid="button-start-recording">
                <Mic size={14} className="mr-2" /> Start Recording
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* File upload */}
      {(stage === "idle" || stage === "recorded") && (
        <div>
          <p className="text-sm text-muted-foreground text-center mb-3">Or upload an audio file</p>
          <div
            onClick={() => fileRef.current?.click()}
            data-testid="dropzone-audio"
            className="border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-all text-center"
          >
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            <FileAudio size={22} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">MP3, WAV, M4A, OGG · up to 100MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recent captures sidebar ──────────────────────────────────────────────────
const RECENT_CAPTURES = [
  { id: 1, name: "Lecture Notes — Biology", type: "image", date: "2 hours ago", color: "#10b981" },
  { id: 2, name: "Physics Whiteboard", type: "camera", date: "Yesterday", color: "#6366f1" },
  { id: 3, name: "Study Session Audio", type: "audio", date: "2 days ago", color: "#f59e0b" },
  { id: 4, name: "Chemistry Diagram", type: "image", date: "3 days ago", color: "#f43f5e" },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AiInputCenter() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Camera className="text-violet-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">AI Input Center</h1>
        </div>
        <p className="text-muted-foreground ml-11">Capture notes, images, and audio — get instant transcripts and mind maps</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Input Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="audio">
                <TabsList className="grid grid-cols-3 mb-6 w-full">
                  <TabsTrigger value="camera" data-testid="tab-camera"><Camera size={14} className="mr-1.5" /> Camera</TabsTrigger>
                  <TabsTrigger value="image" data-testid="tab-image"><ImageIcon size={14} className="mr-1.5" /> Image</TabsTrigger>
                  <TabsTrigger value="audio" data-testid="tab-audio"><Mic size={14} className="mr-1.5" /> Audio</TabsTrigger>
                </TabsList>
                <TabsContent value="camera"><CameraScanTab /></TabsContent>
                <TabsContent value="image"><ImageUploadTab /></TabsContent>
                <TabsContent value="audio"><AudioUploadTab /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Captures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECENT_CAPTURES.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group" data-testid={`capture-item-${item.id}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "20" }}>
                    {item.type === "audio" ? <Mic size={15} style={{ color: item.color }} /> : item.type === "camera" ? <Camera size={15} style={{ color: item.color }} /> : <ImageIcon size={15} style={{ color: item.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <ChevronRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-5 pb-5 text-center space-y-2">
              <div className="w-9 h-9 bg-violet-500/15 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="text-violet-600" size={18} />
              </div>
              <p className="text-sm font-semibold">Workflow tip</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Record lecture audio → Transcribe → auto-generate a mind map in one flow.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

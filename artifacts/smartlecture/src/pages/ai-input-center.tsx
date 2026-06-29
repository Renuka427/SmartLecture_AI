import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Mic, Image, FileAudio, CheckCircle2,
  RotateCcw, Zap, MicOff, Square, Play, Loader2, ArrowRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type UploadState = "idle" | "uploading" | "done";

const RECENT_CAPTURES = [
  { id: 1, name: "Lecture Notes - Biology", type: "image", date: "2 hours ago", preview: "#10b981" },
  { id: 2, name: "Physics Whiteboard", type: "camera", date: "Yesterday", preview: "#6366f1" },
  { id: 3, name: "Study Session Audio", type: "audio", date: "2 days ago", preview: "#f59e0b" },
  { id: 4, name: "Chemistry Diagram", type: "image", date: "3 days ago", preview: "#f43f5e" },
];

function CameraScanTab() {
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const { toast } = useToast();

  const handleCapture = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCaptured(true);
      toast({ title: "Captured!", description: "Image ready for OCR processing." });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border aspect-video flex items-center justify-center">
        {captured ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>
              <p className="font-semibold text-foreground">Image Captured Successfully</p>
              <p className="text-sm text-muted-foreground">Ready to process with OCR</p>
            </div>
          </motion.div>
        ) : scanning ? (
          <motion.div className="text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
            >
              <Camera className="text-primary" size={28} />
            </motion.div>
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Scanning...</p>
            </div>
            <div className="absolute inset-0 border-2 border-primary/40 rounded-2xl">
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-primary/60"
                style={{ position: "absolute" }}
              />
            </div>
          </motion.div>
        ) : (
          <div className="text-center space-y-3 p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border">
              <Camera className="text-muted-foreground" size={28} />
            </div>
            <div>
              <p className="font-medium text-foreground">Camera Preview</p>
              <p className="text-sm text-muted-foreground mt-1">Camera access required for live scanning</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {captured ? (
          <>
            <Button className="flex-1" onClick={() => setCaptured(false)} variant="outline" data-testid="button-retake">
              <RotateCcw size={16} className="mr-2" /> Retake
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="button-process-ocr">
              <Zap size={16} className="mr-2" /> Process with OCR
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </>
        ) : (
          <Button className="flex-1" onClick={handleCapture} disabled={scanning} data-testid="button-capture">
            {scanning ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Camera size={16} className="mr-2" />}
            {scanning ? "Scanning..." : "Capture Image"}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Point your camera at lecture notes, whiteboards, or textbook pages
      </p>
    </div>
  );
}

function ImageUploadTab() {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setState("uploading");
    setTimeout(() => {
      setState("done");
      toast({ title: "Uploaded!", description: `${file.name} is ready for processing.` });
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        data-testid="dropzone-image"
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer aspect-video flex items-center justify-center overflow-hidden ${
          dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {state === "done" && preview ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
            <img src={preview} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center">
                <CheckCircle2 size={40} className="mx-auto mb-2" />
                <p className="font-semibold">Image Uploaded</p>
              </div>
            </div>
          </motion.div>
        ) : state === "uploading" ? (
          <div className="text-center space-y-3">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 size={32} className="text-primary mx-auto" />
            </motion.div>
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="text-center space-y-3 p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border">
              <Image className="text-muted-foreground" size={28} />
            </div>
            <div>
              <p className="font-medium">Drop image here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, JPEG, HEIC, WebP</p>
            </div>
            <Badge variant="secondary" className="text-xs">Up to 20MB</Badge>
          </div>
        )}
      </div>

      {state === "done" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { setState("idle"); setPreview(null); }} data-testid="button-clear-image">
            <X size={16} className="mr-2" /> Clear
          </Button>
          <Button className="flex-1 bg-violet-600 hover:bg-violet-700" data-testid="button-extract-text">
            <Zap size={16} className="mr-2" /> Extract Text
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function AudioUploadTab() {
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    toast({ title: "Recording started", description: "Speak clearly into your microphone." });
  };

  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setUploadState("done");
    toast({ title: "Recording saved!", description: `${recordingTime}s audio captured.` });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-8">
        <div className="text-center space-y-6">
          {recording ? (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="relative">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto relative">
                <Mic className="text-red-600" size={32} />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-red-400/30"
                />
              </div>
              <p className="text-2xl font-mono font-bold text-red-600 mt-3">{formatTime(recordingTime)}</p>
              <p className="text-sm text-muted-foreground">Recording in progress...</p>
            </motion.div>
          ) : uploadState === "done" ? (
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-emerald-600" size={32} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
              <Mic className="text-amber-600" size={32} />
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {recording ? (
              <Button variant="destructive" onClick={stopRecording} data-testid="button-stop-recording">
                <Square size={16} className="mr-2" /> Stop Recording
              </Button>
            ) : (
              <Button onClick={startRecording} disabled={uploadState === "done"} className="bg-amber-600 hover:bg-amber-700" data-testid="button-start-recording">
                <Mic size={16} className="mr-2" /> Start Recording
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Or upload an audio file</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
          data-testid="dropzone-audio"
        >
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setUploadState("uploading"); setTimeout(() => { setUploadState("done"); toast({ title: "Audio uploaded!" }); }, 1500); }
          }} />
          <FileAudio size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload MP3, WAV, M4A, OGG</p>
          <Badge variant="secondary" className="text-xs mt-2">Up to 100MB</Badge>
        </div>
      </div>

      {uploadState === "done" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { setUploadState("idle"); setRecordingTime(0); }} data-testid="button-clear-audio">
            <X size={16} className="mr-2" /> Clear
          </Button>
          <Button className="flex-1" data-testid="button-transcribe">
            <Play size={16} className="mr-2" /> Transcribe Audio
          </Button>
        </motion.div>
      )}
    </div>
  );
}

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
        <p className="text-muted-foreground ml-11">Capture notes, images, and audio to process with AI</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Input Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="camera">
                <TabsList className="grid grid-cols-3 mb-6 w-full">
                  <TabsTrigger value="camera" data-testid="tab-camera">
                    <Camera size={15} className="mr-1.5" /> Camera
                  </TabsTrigger>
                  <TabsTrigger value="image" data-testid="tab-image">
                    <Image size={15} className="mr-1.5" /> Image
                  </TabsTrigger>
                  <TabsTrigger value="audio" data-testid="tab-audio">
                    <Mic size={15} className="mr-1.5" /> Audio
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="camera"><CameraScanTab /></TabsContent>
                <TabsContent value="image"><ImageUploadTab /></TabsContent>
                <TabsContent value="audio"><AudioUploadTab /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Captures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECENT_CAPTURES.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                  data-testid={`capture-item-${item.id}`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.preview + "25" }}>
                    {item.type === "audio" ? <Mic size={16} style={{ color: item.preview }} /> :
                     item.type === "camera" ? <Camera size={16} style={{ color: item.preview }} /> :
                     <Image size={16} style={{ color: item.preview }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="text-violet-600" size={20} />
                </div>
                <p className="text-sm font-semibold">Pro Tip</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Use camera scan for whiteboards, image upload for printed notes, and audio for lecture recordings.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

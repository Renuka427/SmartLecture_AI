import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Files, Upload, FileText, File, Presentation, Loader2,
  Download, Trash2, Eye, BookOpen, Layers, MoreHorizontal,
  CheckCircle2, Clock, ArrowRight, Plus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type DocType = "pdf" | "docx" | "pptx";
type DocStatus = "ready" | "processing";

interface Doc {
  id: number;
  name: string;
  type: DocType;
  size: string;
  pages: number;
  subject: string;
  subjectColor: string;
  status: DocStatus;
  uploadedAt: string;
}

const MOCK_DOCS: Doc[] = [
  { id: 1, name: "Cell Biology - Chapter 4.pdf", type: "pdf", size: "2.4 MB", pages: 24, subject: "Biology", subjectColor: "#10b981", status: "ready", uploadedAt: "Today, 9:15 AM" },
  { id: 2, name: "Quantum Mechanics Notes.docx", type: "docx", size: "1.1 MB", pages: 18, subject: "Physics", subjectColor: "#6366f1", status: "ready", uploadedAt: "Yesterday" },
  { id: 3, name: "French Revolution Slides.pptx", type: "pptx", size: "8.7 MB", pages: 42, subject: "History", subjectColor: "#f59e0b", status: "ready", uploadedAt: "2 days ago" },
  { id: 4, name: "Organic Chemistry Reactions.pdf", type: "pdf", size: "5.2 MB", pages: 31, subject: "Chemistry", subjectColor: "#f43f5e", status: "processing", uploadedAt: "Just now" },
  { id: 5, name: "Calculus Integration Methods.pdf", type: "pdf", size: "3.3 MB", pages: 28, subject: "Mathematics", subjectColor: "#8b5cf6", status: "ready", uploadedAt: "3 days ago" },
  { id: 6, name: "ML Fundamentals Slides.pptx", type: "pptx", size: "12.1 MB", pages: 67, subject: "Computer Science", subjectColor: "#06b6d4", status: "ready", uploadedAt: "4 days ago" },
];

const TYPE_CONFIG: Record<DocType, { color: string; bg: string; label: string; Icon: typeof FileText }> = {
  pdf: { color: "#ef4444", bg: "#fef2f2", label: "PDF", Icon: FileText },
  docx: { color: "#3b82f6", bg: "#eff6ff", label: "DOCX", Icon: File },
  pptx: { color: "#f97316", bg: "#fff7ed", label: "PPTX", Icon: Presentation },
};

function DocIcon({ type, size = 20 }: { type: DocType; size?: number }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.Icon;
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
      <Icon size={size} style={{ color: cfg.color }} />
    </div>
  );
}

function UploadZone({ onUpload }: { onUpload: (name: string, type: DocType) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getType = (name: string): DocType => {
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
    return "pptx";
  };

  return (
    <div
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onUpload(f.name, getType(f.name)); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => fileRef.current?.click()}
      data-testid="dropzone-documents"
      className={`rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 text-center ${
        dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/40"
      }`}
    >
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onUpload(f.name, getType(f.name));
      }} />
      <div className="space-y-3">
        <div className="flex justify-center gap-3">
          {(["pdf", "docx", "pptx"] as DocType[]).map((t) => {
            const cfg = TYPE_CONFIG[t];
            const Icon = cfg.Icon;
            return (
              <div key={t} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                <Icon size={18} style={{ color: cfg.color }} />
              </div>
            );
          })}
        </div>
        <div>
          <p className="font-semibold">Drop documents here or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">Supports PDF, DOCX, DOC, PPT, PPTX</p>
        </div>
        <Button size="sm" variant="outline" className="pointer-events-none" data-testid="button-browse-docs">
          <Upload size={14} className="mr-1.5" /> Browse Files
        </Button>
        <p className="text-xs text-muted-foreground">Maximum file size: 50MB</p>
      </div>
    </div>
  );
}

function DocCard({ doc, onDelete }: { doc: Doc; onDelete: (id: number) => void }) {
  const { toast } = useToast();
  const cfg = TYPE_CONFIG[doc.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`doc-card-${doc.id}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            {doc.status === "processing" ? (
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DocIcon type={doc.type} />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm leading-tight line-clamp-2">{doc.name}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" data-testid={`menu-doc-${doc.id}`}>
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem data-testid={`action-preview-${doc.id}`} onClick={() => toast({ title: "Preview", description: "Document preview coming soon." })}>
                      <Eye size={14} className="mr-2" /> Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`action-lecture-${doc.id}`} onClick={() => toast({ title: "Added to lectures!" })}>
                      <BookOpen size={14} className="mr-2" /> Add to Lecture
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`action-flashcards-${doc.id}`} onClick={() => toast({ title: "Creating flashcards..." })}>
                      <Layers size={14} className="mr-2" /> Create Flashcards
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`action-download-${doc.id}`} onClick={() => toast({ title: "Download started" })}>
                      <Download size={14} className="mr-2" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" data-testid={`action-delete-${doc.id}`} onClick={() => onDelete(doc.id)}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs px-1.5 py-0" style={{ borderColor: cfg.color + "40", color: cfg.color }}>
                  {cfg.label}
                </Badge>
                <Badge variant="secondary" className="text-xs px-1.5 py-0" style={{ backgroundColor: doc.subjectColor + "15", color: doc.subjectColor }}>
                  {doc.subject}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                <span>{doc.size}</span>
                <span>•</span>
                <span>{doc.pages} pages</span>
                <span>•</span>
                {doc.status === "processing" ? (
                  <span className="text-amber-600 flex items-center gap-1"><Clock size={10} /> Processing...</span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> Ready</span>
                )}
              </div>
            </div>
          </div>

          {doc.status === "ready" && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" className="text-xs h-7" data-testid={`button-view-${doc.id}`} onClick={() => toast({ title: "Opening preview..." })}>
                <Eye size={12} className="mr-1" /> Preview
              </Button>
              <Button size="sm" className="text-xs h-7" data-testid={`button-process-${doc.id}`} onClick={() => toast({ title: "Processing document..." })}>
                <BookOpen size={12} className="mr-1" /> Use in App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DocumentCenter() {
  const [docs, setDocs] = useState<Doc[]>(MOCK_DOCS);
  const { toast } = useToast();

  const handleUpload = (name: string, type: DocType) => {
    const newDoc: Doc = {
      id: Date.now(),
      name,
      type,
      size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      pages: Math.floor(Math.random() * 40 + 5),
      subject: "General",
      subjectColor: "#6366f1",
      status: "processing",
      uploadedAt: "Just now",
    };
    setDocs((prev) => [newDoc, ...prev]);
    toast({ title: "Document uploaded", description: `${name} is being processed.` });
    setTimeout(() => {
      setDocs((prev) => prev.map((d) => d.id === newDoc.id ? { ...d, status: "ready" } : d));
      toast({ title: "Ready!", description: `${name} has been processed.` });
    }, 3000);
  };

  const handleDelete = (id: number) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "Document deleted" });
  };

  const pdfCount = docs.filter((d) => d.type === "pdf").length;
  const docxCount = docs.filter((d) => d.type === "docx").length;
  const pptxCount = docs.filter((d) => d.type === "pptx").length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <Files className="text-orange-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">Document Center</h1>
        </div>
        <p className="text-muted-foreground ml-11">Upload and manage PDF, DOCX, and PowerPoint files</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "PDFs", count: pdfCount, color: "#ef4444", bg: "#fef2f2" },
          { label: "Documents", count: docxCount, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Presentations", count: pptxCount, color: "#f97316", bg: "#fff7ed" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <UploadZone onUpload={handleUpload} />
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{docs.length} Documents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, ArrowLeftRight, Copy, CheckCheck, Volume2,
  Sparkles, BookOpen, RefreshCcw, ChevronDown, Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", script: "Latin", color: "#3b82f6" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Tamil", color: "#10b981" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telugu", color: "#f59e0b" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Devanagari", color: "#f43f5e" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", script: "Malayalam", color: "#8b5cf6" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Kannada", color: "#06b6d4" },
];

const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    ta: "செல் சுவர் போக்குவரத்து என்பது செல் சவ்வு குறுக்கே பொருட்கள் நகர்வதை குறிக்கிறது. செயலில் போக்குவரத்திற்கு ஆற்றல் தேவை, அதே சமயம் செயலற்ற போக்குவரத்து செறிவு சாய்வைப் பின்பற்றுகிறது.",
    te: "సెల్ మెంబ్రేన్ రవాణా అనేది సెల్ మెంబ్రేన్ అంతటా పదార్థాల కదలికను సూచిస్తుంది. క్రియాశీల రవాణాకు శక్తి అవసరం, అయితే నిష్క్రియ రవాణా సాంద్రత ప్రవణతను అనుసరిస్తుంది.",
    hi: "कोशिका झिल्ली परिवहन कोशिका झिल्ली के पार पदार्थों की गति को संदर्भित करता है। सक्रिय परिवहन को ऊर्जा की आवश्यकता होती है, जबकि निष्क्रिय परिवहन सांद्रता प्रवणता का अनुसरण करता है।",
    ml: "സെൽ മെംബ്രൺ ഗതാഗതം സെൽ മെംബ്രണിലൂടെ വസ്തുക്കളുടെ ചലനത്തെ സൂചിപ്പിക്കുന്നു. സജീവ ഗതാഗതത്തിന് ഊർജ്ജം ആവശ്യമാണ്, അതേ സമയം നിഷ്ക്രിയ ഗതാഗതം സാന്ദ്രതാ ഗ്രേഡിയൻ്റ് പിന്തുടരുന്നു.",
    kn: "ಕೋಶ ಪೊರೆ ಸಾರಿಗೆ ಎಂದರೆ ಕೋಶ ಪೊರೆಯ ಮೂಲಕ ವಸ್ತುಗಳ ಚಲನೆ. ಸಕ್ರಿಯ ಸಾರಿಗೆಗೆ ಶಕ್ತಿ ಅಗತ್ಯ, ಆದರೆ ನಿಷ್ಕ್ರಿಯ ಸಾರಿಗೆ ಸಾಂದ್ರತೆ ಇಳಿಮುಖವನ್ನು ಅನುಸರಿಸುತ್ತದೆ.",
  },
};

const SAMPLE_PHRASES: Record<string, string[]> = {
  en: ["Cell membrane transport", "Quantum superposition", "Gradient descent algorithm", "French Revolution causes", "Integration by parts"],
  ta: ["செல் சவ்வு போக்குவரத்து", "குவாண்டம் சூப்பர்பொசிஷன்", "செவ்வகத் பொருத்தம்"],
  te: ["సెల్ మెంబ్రేన్ రవాణా", "క్వాంటం సూపర్ పొజిషన్", "గ్రేడియంట్ అల్గోరిథం"],
  hi: ["कोशिका झिल्ली परिवहन", "क्वांटम सुपरपोजिशन", "ढाल वंश एल्गोरिदम"],
  ml: ["സെൽ മെംബ്രൺ ഗതാഗതം", "ക്വാണ്ടം സൂപ്പർ പൊസിഷൻ"],
  kn: ["ಕೋಶ ಪೊರೆ ಸಾರಿಗೆ", "ಕ್ವಾಂಟಮ್ ಸೂಪರ್ ಪೊಸಿಷನ್"],
};

function LangSelector({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const lang = LANGUAGES.find((l) => l.code === value)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 min-w-[160px] justify-between" data-testid={`lang-selector-${label}`}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
            <span className="font-medium">{lang.name}</span>
            <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => onChange(l.code)} data-testid={`lang-option-${l.code}`} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="font-medium">{l.name}</span>
            <span className="text-muted-foreground ml-auto text-sm">{l.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function LanguageHub() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ta");
  const [sourceText, setSourceText] = useState("Cell membrane transport refers to the movement of substances across the cell membrane. Active transport requires energy, while passive transport follows the concentration gradient.");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const translatedText = MOCK_TRANSLATIONS[sourceLang]?.[targetLang] ?? MOCK_TRANSLATIONS["en"]?.[targetLang] ?? "Translation not available for this language pair in demo mode.";

  const handleTranslate = () => {
    if (sourceLang === targetLang) { toast({ title: "Same language selected", variant: "destructive" }); return; }
    setTranslating(true);
    setTranslated(false);
    setTimeout(() => { setTranslating(false); setTranslated(true); }, 1400);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslated(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!" });
  };

  const targetLangData = LANGUAGES.find((l) => l.code === targetLang)!;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Languages className="text-emerald-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">Language Hub</h1>
        </div>
        <p className="text-muted-foreground ml-11">Study in your native language — English, Tamil, Telugu, Hindi, Malayalam, Kannada</p>
      </motion.div>

      {/* Language cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {LANGUAGES.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setTargetLang(lang.code); setTranslated(false); }}
            data-testid={`lang-card-${lang.code}`}
            className={`rounded-xl p-3 border-2 text-center transition-all cursor-pointer ${
              targetLang === lang.code ? "border-current shadow-md" : "border-border hover:border-border/80 hover:shadow-sm"
            }`}
            style={targetLang === lang.code ? { borderColor: lang.color, backgroundColor: lang.color + "10" } : {}}
          >
            <p className="text-lg font-bold leading-tight" style={{ color: lang.color }}>{lang.nativeName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lang.name}</p>
          </motion.button>
        ))}
      </div>

      <Tabs defaultValue="translate">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="phrases">Study Phrases</TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="mt-6 space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <LangSelector value={sourceLang} onChange={setSourceLang} label="source" />
            <Button variant="ghost" size="icon" onClick={handleSwap} className="rounded-full" data-testid="button-swap-lang">
              <ArrowLeftRight size={16} />
            </Button>
            <LangSelector value={targetLang} onChange={setTargetLang} label="target" />
            <Button onClick={handleTranslate} disabled={translating} className="ml-auto" data-testid="button-translate">
              {translating ? <><RefreshCcw size={15} className="mr-2 animate-spin" /> Translating...</> : <><Languages size={15} className="mr-2" /> Translate</>}
            </Button>
          </div>

          {/* Text panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <CardTitle className="text-sm">{LANGUAGES.find((l) => l.code === sourceLang)?.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(sourceText)} data-testid="button-copy-source">
                  <Copy size={13} />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={sourceText}
                  onChange={(e) => { setSourceText(e.target.value); setTranslated(false); }}
                  className="min-h-[160px] resize-none text-sm"
                  placeholder="Type or paste text to translate..."
                  data-testid="textarea-source"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50" style={{ borderColor: translated ? targetLangData.color + "30" : undefined }}>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: targetLangData.color }} />
                  <CardTitle className="text-sm">{targetLangData.name} ({targetLangData.nativeName})</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({ title: "Audio playback coming soon" })} data-testid="button-tts">
                    <Volume2 size={13} />
                  </Button>
                  {translated && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(translatedText)} data-testid="button-copy-translated">
                      {copied ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {translating ? (
                  <div className="min-h-[160px] flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <RefreshCcw size={20} className="animate-spin text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Translating...</p>
                    </div>
                  </div>
                ) : translated ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[160px] rounded-md border border-border/50 bg-muted/30 p-3 text-sm leading-relaxed" dir={["ar", "he"].includes(targetLang) ? "rtl" : "ltr"}>
                    {translatedText}
                  </motion.div>
                ) : (
                  <div className="min-h-[160px] rounded-md border border-dashed border-border flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Translation will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {translated && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Adding to flashcards..." })} data-testid="button-add-flashcard-translation">
                <Sparkles size={14} className="mr-1.5" /> Save as Flashcard
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Saved to notes!" })} data-testid="button-save-note">
                <BookOpen size={14} className="mr-1.5" /> Add to Notes
              </Button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="phrases" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LANGUAGES.map((lang) => (
              <Card key={lang.code} className="border-border/50" data-testid={`phrases-card-${lang.code}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                    <CardTitle className="text-sm">{lang.name} — {lang.nativeName}</CardTitle>
                    <Badge variant="secondary" className="ml-auto text-xs">{lang.script}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(SAMPLE_PHRASES[lang.code] ?? SAMPLE_PHRASES.en!).map((phrase, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer" data-testid={`phrase-${lang.code}-${i}`}>
                      <span className="text-sm">{phrase}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(phrase)}>
                        <Copy size={11} />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { 
  BookOpen, 
  LayoutDashboard, 
  Library, 
  Layers, 
  HelpCircle, 
  MessageSquare, 
  Search, 
  BarChart, 
  Award, 
  User, 
  Settings,
  LogOut,
  Menu,
  Camera,
  ScanText,
  Files,
  Languages,
  Sigma,
  Network,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetProfile } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";\nimport { signOut } from "@/lib/supabase-auth";

const CORE_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lectures", label: "Lectures", icon: Library },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
  { href: "/progress", label: "Progress", icon: BarChart },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const TOOL_LINKS = [
  { href: "/input-center", label: "AI Input Center", icon: Camera, color: "#8b5cf6" },
  { href: "/ocr-studio", label: "OCR Studio", icon: ScanText, color: "#06b6d4" },
  { href: "/documents", label: "Document Center", icon: Files, color: "#f97316" },
  { href: "/language-hub", label: "Language Hub", icon: Languages, color: "#10b981" },
  { href: "/equation-lab", label: "Equation Lab", icon: Sigma, color: "#8b5cf6" },
  { href: "/mindmap-studio", label: "Mind Map Studio", icon: Network, color: "#6366f1" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background bg-notebook text-foreground flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, color, active, onClick }: {
  href: string; label: string; icon: React.ElementType;
  color?: string; active: boolean; onClick?: () => void;
}) {
  const content = (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
      active
        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}>
      <Icon size={18} style={!active && color ? { color } : undefined} />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );

  if (onClick) {
    return (
      <SheetTrigger asChild key={href}>
        <Link href={href}>{content}</Link>
      </SheetTrigger>
    );
  }
  return <Link href={href}>{content}</Link>;
}

function Sidebar() {
  const [location] = useLocation();
  const [toolsOpen, setToolsOpen] = useState(
    TOOL_LINKS.some((l) => location.startsWith(l.href))
  );

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen z-10 sticky top-0 shrink-0">
      <div className="p-6 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-handwriting text-2xl font-bold leading-none tracking-tight">SmartLecture</h1>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">AI Assistant</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {/* Core navigation */}
        {CORE_LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={isActive(link.href)}
          />
        ))}

        {/* AI Tools section */}
        <div className="pt-2">
          <button
            onClick={() => setToolsOpen((o) => !o)}
            data-testid="toggle-ai-tools"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <div className="w-4.5 h-4.5 rounded-md flex items-center justify-center">
              <Sparkles size={15} className="text-violet-500" />
            </div>
            <span className="font-semibold text-xs uppercase tracking-wider flex-1 text-left">AI Tools</span>
            {toolsOpen
              ? <ChevronDown size={13} className="shrink-0" />
              : <ChevronRight size={13} className="shrink-0" />}
          </button>

          {toolsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {TOOL_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  color={link.color}
                  active={isActive(link.href)}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-border/50 shrink-0">
        <div className="bg-muted/50 rounded-xl p-4 text-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
            <BookOpen size={64} className="rotate-12 transform translate-x-4 -translate-y-4" />
          </div>
          <p className="font-medium mb-1">Study Goal</p>
          <p className="text-muted-foreground text-xs mb-3">Keep up your 5-day streak!</p>
          <div className="w-full bg-border h-2 rounded-full overflow-hidden">
            <div className="bg-chart-2 h-full w-[70%] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const [location, setLocation] = useLocation();
  const { data: profile } = useGetProfile();
  
  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location.startsWith("/lectures")) return "Lectures";
    if (location.startsWith("/flashcards")) return "Flashcards";
    if (location.startsWith("/quizzes")) return "Quizzes";
    if (location.startsWith("/assistant")) return "Study Assistant";
    if (location.startsWith("/search")) return "Search";
    if (location.startsWith("/progress")) return "Progress";
    if (location.startsWith("/achievements")) return "Achievements";
    if (location.startsWith("/profile")) return "Profile";
    if (location.startsWith("/settings")) return "Settings";
    if (location.startsWith("/input-center")) return "AI Input Center";
    if (location.startsWith("/ocr-studio")) return "OCR Studio";
    if (location.startsWith("/documents")) return "Document Center";
    if (location.startsWith("/language-hub")) return "Language Hub";
    if (location.startsWith("/equation-lab")) return "Equation Lab";
    if (location.startsWith("/mindmap-studio")) return "Mind Map Studio";
    return "";
  };

  const handleLogout = () => {
    localStorage.removeItem("sl_auth");
    setLocation("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <MobileNav />
        </div>
        <h2 className="text-lg font-semibold tracking-tight hidden sm:block">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-full pl-3 pr-1 py-1 border border-border/50">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-xl leading-none">🔥</span>
              <span className="font-bold text-sm">{profile.streak}</span>
            </div>
            <div className="h-4 w-px bg-border mx-1"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">LVL {profile.level}</span>
              <div className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {profile.xp} XP
              </div>
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={profile?.avatar || ""} alt={profile?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {profile?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name || "Student"}</p>
                <p className="text-xs text-muted-foreground leading-none">
                  {profile?.email || "student@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer flex w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer flex w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileNav() {
  const [location] = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-0">
        <div className="p-6 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-handwriting text-2xl font-bold leading-none tracking-tight">SmartLecture</h1>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 overflow-y-auto h-[calc(100vh-88px)] space-y-1">
          {CORE_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isActive(link.href)}
              onClick={() => {}}
            />
          ))}

          {/* AI Tools in mobile */}
          <div className="pt-1">
            <button
              onClick={() => setToolsOpen((o) => !o)}
              data-testid="toggle-ai-tools-mobile"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Sparkles size={18} className="text-violet-500" />
              <span className="font-semibold text-sm flex-1 text-left">AI Tools</span>
              {toolsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {toolsOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {TOOL_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    color={link.color}
                    active={isActive(link.href)}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

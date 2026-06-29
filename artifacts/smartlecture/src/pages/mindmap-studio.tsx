import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Plus, Trash2, Edit3, Save, Download,
  ZoomIn, ZoomOut, RotateCcw, Sparkles, Copy, ChevronDown, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface MapNode {
  id: string;
  label: string;
  color: string;
  level: number;
  parentId: string | null;
  x: number;
  y: number;
}

const NODE_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#f43f5e",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
];

const DEFAULT_NODES: MapNode[] = [
  { id: "root", label: "Machine Learning", color: "#6366f1", level: 0, parentId: null, x: 400, y: 220 },
  { id: "n1", label: "Supervised Learning", color: "#10b981", level: 1, parentId: "root", x: 160, y: 120 },
  { id: "n2", label: "Unsupervised Learning", color: "#f59e0b", level: 1, parentId: "root", x: 640, y: 120 },
  { id: "n3", label: "Neural Networks", color: "#f43f5e", level: 1, parentId: "root", x: 160, y: 320 },
  { id: "n4", label: "Evaluation", color: "#8b5cf6", level: 1, parentId: "root", x: 640, y: 320 },
  { id: "n1a", label: "Classification", color: "#34d399", level: 2, parentId: "n1", x: 55, y: 60 },
  { id: "n1b", label: "Regression", color: "#34d399", level: 2, parentId: "n1", x: 55, y: 180 },
  { id: "n2a", label: "Clustering", color: "#fcd34d", level: 2, parentId: "n2", x: 745, y: 60 },
  { id: "n2b", label: "Dimensionality\nReduction", color: "#fcd34d", level: 2, parentId: "n2", x: 745, y: 180 },
  { id: "n3a", label: "Deep Learning", color: "#fca5a5", level: 2, parentId: "n3", x: 55, y: 300 },
  { id: "n3b", label: "CNN / RNN", color: "#fca5a5", level: 2, parentId: "n3", x: 55, y: 380 },
  { id: "n4a", label: "Precision / Recall", color: "#c4b5fd", level: 2, parentId: "n4", x: 745, y: 300 },
  { id: "n4b", label: "Cross-Validation", color: "#c4b5fd", level: 2, parentId: "n4", x: 745, y: 380 },
];

const PRESET_MAPS = [
  { name: "Machine Learning", icon: "🤖", nodes: DEFAULT_NODES.length },
  { name: "Cell Biology", icon: "🧬", nodes: 11 },
  { name: "French Revolution", icon: "🏛️", nodes: 9 },
  { name: "Quantum Mechanics", icon: "⚛️", nodes: 13 },
];

function MindMapSVG({ nodes }: { nodes: MapNode[] }) {
  const edges = nodes.filter((n) => n.parentId !== null).map((n) => {
    const parent = nodes.find((p) => p.id === n.parentId);
    return parent ? { from: parent, to: n } : null;
  }).filter(Boolean) as { from: MapNode; to: MapNode }[];

  return (
    <svg
      viewBox="0 0 820 460"
      className="w-full h-full"
      style={{ minHeight: 340 }}
      data-testid="mindmap-svg"
    >
      <defs>
        {NODE_COLORS.map((c) => (
          <filter key={c} id={`glow-${c.replace("#", "")}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {edges.map((e, i) => (
        <motion.line
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03 }}
          x1={e.from.x} y1={e.from.y}
          x2={e.to.x} y2={e.to.y}
          stroke={e.to.color}
          strokeWidth={e.to.level === 1 ? 2 : 1.5}
          strokeOpacity={0.5}
          strokeDasharray={e.to.level === 2 ? "4 3" : "0"}
        />
      ))}

      {nodes.map((node, i) => {
        const isRoot = node.level === 0;
        const rx = isRoot ? 52 : node.level === 1 ? 44 : 38;
        const ry = isRoot ? 22 : node.level === 1 ? 18 : 15;
        const lines = node.label.split("\n");

        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
            data-testid={`mindmap-node-${node.id}`}
          >
            <ellipse
              cx={node.x} cy={node.y}
              rx={rx} ry={ry}
              fill={node.color}
              fillOpacity={isRoot ? 1 : 0.85}
              stroke="white"
              strokeWidth={isRoot ? 2.5 : 1.5}
              strokeOpacity={0.6}
            />
            {lines.map((line, li) => (
              <text
                key={li}
                x={node.x}
                y={node.y + (li - (lines.length - 1) / 2) * 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={isRoot ? 11 : node.level === 1 ? 10 : 9}
                fontWeight={isRoot ? "700" : "600"}
                fontFamily="system-ui, sans-serif"
              >
                {line}
              </text>
            ))}
          </motion.g>
        );
      })}
    </svg>
  );
}

export default function MindmapStudio() {
  const [nodes, setNodes] = useState<MapNode[]>(DEFAULT_NODES);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeColor, setNewNodeColor] = useState("#10b981");
  const [newNodeParent, setNewNodeParent] = useState("root");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const { toast } = useToast();

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const parent = nodes.find((n) => n.id === newNodeParent);
    const newLevel = parent ? parent.level + 1 : 1;
    const newNode: MapNode = {
      id: `custom-${Date.now()}`,
      label: newNodeLabel.trim(),
      color: newNodeColor,
      level: newLevel,
      parentId: newNodeParent,
      x: 300 + Math.random() * 200,
      y: 100 + Math.random() * 250,
    };
    setNodes((prev) => [...prev, newNode]);
    setNewNodeLabel("");
    toast({ title: "Node added", description: `"${newNode.label}" added to the map.` });
  };

  const deleteNode = (id: string) => {
    if (id === "root") { toast({ title: "Cannot delete root node", variant: "destructive" }); return; }
    setNodes((prev) => prev.filter((n) => n.id !== id && n.parentId !== id));
    toast({ title: "Node deleted" });
  };

  const startEdit = (node: MapNode) => { setEditingNodeId(node.id); setEditLabel(node.label); };
  const saveEdit = () => {
    if (!editLabel.trim()) return;
    setNodes((prev) => prev.map((n) => n.id === editingNodeId ? { ...n, label: editLabel.trim() } : n));
    setEditingNodeId(null);
    toast({ title: "Node updated" });
  };

  const resetToDefault = () => { setNodes(DEFAULT_NODES); toast({ title: "Map reset" }); };
  const loadPreset = (name: string) => { setNodes(DEFAULT_NODES); toast({ title: `Loaded: ${name}`, description: "Demo map loaded (full content coming soon)." }); };

  const rootNode = nodes.find((n) => n.level === 0);
  const l1Nodes = nodes.filter((n) => n.level === 1);
  const l2Nodes = nodes.filter((n) => n.level === 2);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Network className="text-indigo-600" size={18} />
          </div>
          <h1 className="text-2xl font-bold">Mind Map Studio</h1>
        </div>
        <p className="text-muted-foreground ml-11">Visualize concepts and create interactive mind maps</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-3"
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Network size={16} /> Canvas
                <Badge variant="secondary" className="text-xs ml-1">{nodes.length} nodes</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetToDefault} data-testid="button-reset-map">
                  <RotateCcw size={13} className="mr-1" /> Reset
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Export coming soon" })} data-testid="button-export-map">
                  <Download size={13} className="mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-slate-50/80 to-indigo-50/40 dark:from-slate-900/50 dark:to-indigo-950/20 overflow-hidden p-2">
                <MindMapSVG nodes={nodes} />
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Root topic</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Main branch</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-300" /> Sub-topic</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          {/* Add Node */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Plus size={14} /> Add Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Node label..."
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addNode(); }}
                data-testid="input-node-label"
                className="text-sm"
              />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {NODE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewNodeColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${newNodeColor === c ? "scale-125 ring-2 ring-offset-1 ring-foreground/30" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                      data-testid={`color-pick-${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Parent node</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between text-sm h-8" data-testid="dropdown-parent-node">
                      {nodes.find((n) => n.id === newNodeParent)?.label.split("\n")[0] ?? "Select parent"}
                      <ChevronDown size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 max-h-48 overflow-y-auto">
                    {nodes.filter((n) => n.level < 2).map((n) => (
                      <DropdownMenuItem key={n.id} onClick={() => setNewNodeParent(n.id)} data-testid={`parent-option-${n.id}`}>
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: n.color }} />
                        <span className="truncate">{n.label.split("\n")[0]}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={addNode}
                disabled={!newNodeLabel.trim()}
                data-testid="button-add-node"
              >
                <Plus size={14} className="mr-1.5" /> Add Node
              </Button>
            </CardContent>
          </Card>

          {/* Node List */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 group" data-testid={`node-list-item-${node.id}`}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
                  {editingNodeId === node.id ? (
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingNodeId(null); }}
                      className="h-6 text-xs flex-1 px-1.5 py-0"
                      autoFocus
                      data-testid={`edit-input-${node.id}`}
                    />
                  ) : (
                    <span className="text-xs flex-1 truncate" style={{ paddingLeft: node.level * 6 }}>{node.label.split("\n")[0]}</span>
                  )}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingNodeId === node.id ? (
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={saveEdit} data-testid={`save-edit-${node.id}`}>
                        <Save size={10} />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEdit(node)} data-testid={`edit-node-${node.id}`}>
                        <Edit3 size={10} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => deleteNode(node.id)} data-testid={`delete-node-${node.id}`}>
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Presets */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles size={13} /> Preset Maps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRESET_MAPS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p.name)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                  data-testid={`preset-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <span className="text-base">{p.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.nodes} nodes</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

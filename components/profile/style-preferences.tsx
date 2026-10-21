"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseStylePrefs } from "@/lib/security/storage";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useProducts } from "@/lib/hooks/use-products";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOES = ["38", "39", "40", "41", "42", "43", "44", "45"];
const COLORS = [
  { name: "Black", css: "#111827" }, { name: "White", css: "#f9fafb" }, { name: "Navy", css: "#1e3a8a" },
  { name: "Sand", css: "#d9c6a0" }, { name: "Olive", css: "#6b7035" }, { name: "Burgundy", css: "#7f1d3a" },
  { name: "Rose", css: "#ec4899" }, { name: "Violet", css: "#9333ea" },
];

interface Board { id: string; name: string; productIds: string[] }
interface Prefs { top: string; shoe: string; colors: string[]; boards: Board[] }
const KEY = "luxe-style-prefs";
const DEFAULTS: Prefs = { top: "", shoe: "", colors: [], boards: [] };

function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { setPrefs(parseStylePrefs(localStorage.getItem(KEY))); } catch { /* empty */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* empty */ }
  }, [prefs, loaded]);
  return [prefs, setPrefs] as const;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "h-9 min-w-[2.5rem] px-3 rounded-xl text-sm border transition-colors",
        active ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/10"
      )}
    >
      {children}
    </motion.button>
  );
}

export function StylePreferences() {
  const [prefs, setPrefs] = usePrefs();
  const [newBoard, setNewBoard] = useState("");
  const { wishlist } = useWishlistContext();
  const { products } = useProducts();
  const saved = products.filter((p) => wishlist.includes(p.id));

  const addBoard = () => {
    const name = newBoard.trim();
    if (!name) return;
    setPrefs((p) => ({ ...p, boards: [...p.boards, { id: `b${Date.now()}`, name, productIds: [] }] }));
    setNewBoard("");
  };
  const toggleInBoard = (boardId: string, productId: string) =>
    setPrefs((p) => ({
      ...p,
      boards: p.boards.map((b) =>
        b.id !== boardId ? b : { ...b, productIds: b.productIds.includes(productId) ? b.productIds.filter((x) => x !== productId) : [...b.productIds, productId] }
      ),
    }));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-white">
      <h3 className="font-semibold mb-6">Style preferences</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Clothing size</div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => <Chip key={s} active={prefs.top === s} onClick={() => setPrefs((p) => ({ ...p, top: p.top === s ? "" : s }))}>{s}</Chip>)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Shoe size (EU)</div>
            <div className="flex flex-wrap gap-2">
              {SHOES.map((s) => <Chip key={s} active={prefs.shoe === s} onClick={() => setPrefs((p) => ({ ...p, shoe: p.shoe === s ? "" : s }))}>{s}</Chip>)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Favourite colours</div>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => {
              const on = prefs.colors.includes(c.name);
              return (
                <motion.button
                  key={c.name}
                  whileTap={{ scale: 0.9 }}
                  aria-label={c.name}
                  aria-pressed={on}
                  title={c.name}
                  onClick={() => setPrefs((p) => ({ ...p, colors: on ? p.colors.filter((x) => x !== c.name) : [...p.colors, c.name] }))}
                  className={cn("h-10 w-10 rounded-full border-2 transition-all", on ? "border-white ring-2 ring-fuchsia-400/60 scale-110" : "border-white/20")}
                  style={{ backgroundColor: c.css }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm font-medium">Style boards</div>
          <div className="flex gap-2">
            <input
              value={newBoard}
              onChange={(e) => setNewBoard(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBoard()}
              placeholder="New board name"
              maxLength={60}
              className="h-9 rounded-xl bg-white/5 border border-white/15 px-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-fuchsia-400/60"
            />
            <button onClick={addBoard} className="h-9 px-3 rounded-xl bg-white text-black text-sm font-medium flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {prefs.boards.length === 0 ? (
          <p className="text-sm text-white/40">Create a board (e.g. “Summer wardrobe”) and pin items from your wishlist.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {prefs.boards.map((b) => (
                <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{b.name} <span className="text-white/40 text-xs">· {b.productIds.length}</span></div>
                    <button aria-label="Delete board" onClick={() => setPrefs((p) => ({ ...p, boards: p.boards.filter((x) => x.id !== b.id) }))} className="text-white/40 hover:text-rose-400"><Trash2 size={15} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem]">
                    {b.productIds.map((id) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="relative">
                          <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                          <button aria-label="Remove" onClick={() => toggleInBoard(b.id, id)} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-black border border-white/30 flex items-center justify-center"><X size={9} /></button>
                        </div>
                      );
                    })}
                  </div>
                  {saved.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {saved.filter((p) => !b.productIds.includes(p.id)).slice(0, 6).map((p) => (
                        <button key={p.id} onClick={() => toggleInBoard(b.id, p.id)} className="text-xs px-2 py-1 rounded-lg border border-white/15 text-white/60 hover:bg-white/10 max-w-[9rem] truncate">+ {p.name}</button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Heart some products first to pin them here.</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

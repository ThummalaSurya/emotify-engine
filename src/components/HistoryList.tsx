import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EMOTIONS, type EmotionKey } from "@/lib/emotions";
import { History as HistoryIcon, Loader2 } from "lucide-react";

interface Entry {
  id: string;
  text: string;
  dominant: EmotionKey;
  insight: string;
  compliment: string;
  analyzed_date: string;
  created_at: string;
}

interface Props {
  refreshKey: number;
  onSelect: (entry: Entry) => void;
}

const formatDay = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

export const HistoryList = ({ refreshKey, onSelect }: Props) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("emotion_analyses")
        .select("id, text, dominant, insight, compliment, analyzed_date, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        if (!error && data) setEntries(data as Entry[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        <p>No history yet — analyze a text to start your moodprint journal.</p>
      </div>
    );
  }

  // Group by analyzed_date
  const groups: Record<string, Entry[]> = {};
  for (const e of entries) {
    (groups[e.analyzed_date] ||= []).push(e);
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <HistoryIcon className="w-4 h-4 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black">Your moodprint history</h2>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-baseline justify-between mb-2 px-1">
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">
                {formatDay(date)}
              </p>
              <p className="text-xs text-muted-foreground">{items.length} entry{items.length > 1 ? "ies" : ""}</p>
            </div>
            <div className="space-y-2">
              {items.map((entry) => {
                const e = EMOTIONS[entry.dominant] ?? EMOTIONS.neutral;
                return (
                  <button
                    key={entry.id}
                    onClick={() => onSelect(entry)}
                    className="w-full text-left bg-gradient-card rounded-2xl p-4 shadow-soft border border-border/50 hover:shadow-pop transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="text-3xl flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: `${e.color}22` }}
                      >
                        {e.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: e.color }}>
                            {e.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2">{entry.text}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

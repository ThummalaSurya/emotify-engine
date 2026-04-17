import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { EmotionResults } from "@/components/EmotionResults";
import { HistoryList } from "@/components/HistoryList";
import type { EmotionResult } from "@/lib/emotions";

const SAMPLES = [
  "I just got the job I've been dreaming about for years! I can't stop smiling 🎉",
  "It's been raining all week and I haven't heard from anyone. The house feels so empty.",
  "How dare they cancel the project after all the late nights we put in?!",
  "I love the way you make ordinary mornings feel like little celebrations.",
];

const Index = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const analyze = async () => {
    if (!text.trim()) {
      toast.error("Please write something first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("detect-emotion", {
        body: { text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data as EmotionResult;
      setResult(r);

      const { error: insertError } = await supabase.from("emotion_analyses").insert({
        text,
        dominant: r.dominant,
        insight: r.insight,
        compliment: r.compliment,
        emotions: r.emotions,
      });
      if (insertError) console.error("Failed to save history:", insertError);
      else setHistoryKey((k) => k + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry: { text: string }) => {
    setText(entry.text);
    toast.success("Loaded entry — tap Detect to re-analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-border/50 shadow-soft mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">NLP Emotion AI</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-[0.95]">
            What does your <br />
            text <span className="text-gradient">really feel</span>?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Paste a message, tweet, journal entry, or review. Our AI breaks down the emotional fingerprint instantly.
          </p>
        </header>

        <section className="bg-gradient-card rounded-3xl p-5 sm:p-7 shadow-pop border border-border/50 mb-8">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text here…"
            className="min-h-[140px] resize-none text-base border-0 bg-white/70 focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl"
            maxLength={2000}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <Button
              onClick={analyze}
              disabled={loading}
              size="lg"
              className="bg-gradient-hero hover:opacity-90 text-white font-bold rounded-full px-8 shadow-pop border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" /> Detect emotions
                </>
              )}
            </Button>
          </div>

          <div className="mt-5 pt-5 border-t border-border/50">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Try a sample
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setText(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-border/60 transition-colors text-foreground/80 hover:text-foreground max-w-full truncate"
                  style={{ maxWidth: "100%" }}
                >
                  {s.length > 60 ? s.slice(0, 58) + "…" : s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {result && <EmotionResults result={result} />}

        {!result && !loading && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <div className="text-4xl mb-2 opacity-60">😄 😢 😡 😨 😲 🥰</div>
            <p>Seven emotions detected with NLP precision.</p>
          </div>
        )}

        <HistoryList refreshKey={historyKey} onSelect={handleSelectHistory} />


        <footer className="text-center text-xs text-muted-foreground mt-12">
          Powered by Lovable AI · Built with NLP
        </footer>
      </div>
    </main>
  );
};

export default Index;

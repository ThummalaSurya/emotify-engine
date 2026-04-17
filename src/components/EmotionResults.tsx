import { EMOTIONS, EMOTION_ORDER, type EmotionResult } from "@/lib/emotions";

interface Props {
  result: EmotionResult;
}

export const EmotionResults = ({ result }: Props) => {
  const dominant = EMOTIONS[result.dominant];
  const sorted = EMOTION_ORDER.map((k) => ({ key: k, value: result.emotions[k] ?? 0 })).sort(
    (a, b) => b.value - a.value
  );

  return (
    <div className="bg-gradient-card rounded-3xl p-6 sm:p-10 shadow-pop border border-border/50">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ background: dominant.color, opacity: 0.4 }}
          />
          <div
            className="relative text-7xl sm:text-8xl animate-float shadow-emoji rounded-full w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 30% 30%, white, ${dominant.color}33)` }}
          >
            {dominant.emoji}
          </div>
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1">Dominant emotion</p>
        <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: dominant.color }}>
          {dominant.label}
        </h2>
        <p className="text-foreground/80 max-w-md text-base sm:text-lg italic mb-5">"{result.insight}"</p>

        <div
          className="max-w-md rounded-2xl px-5 py-4 border-2 text-left"
          style={{
            background: `linear-gradient(135deg, ${dominant.color}15, ${dominant.color}05)`,
            borderColor: `${dominant.color}40`,
          }}
        >
          <p className="text-xs uppercase tracking-[0.18em] font-bold mb-1.5" style={{ color: dominant.color }}>
            ✨ A note for you
          </p>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{result.compliment}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* bars below */}
      </div>
      <div className="space-y-3">

        {sorted.map(({ key, value }) => {
          const e = EMOTIONS[key];
          const pct = Math.round(value);
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                  <span className="text-xl">{e.emoji}</span>
                  {e.label}
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: e.color }}>
                  {pct}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full animate-bar transition-all"
                  style={{ width: `${pct}%`, background: e.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

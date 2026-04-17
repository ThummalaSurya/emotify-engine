CREATE TABLE public.emotion_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  dominant TEXT NOT NULL,
  insight TEXT NOT NULL,
  compliment TEXT NOT NULL,
  emotions JSONB NOT NULL,
  analyzed_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emotion_analyses ENABLE ROW LEVEL SECURITY;

-- Public app, no auth: allow anyone to read and create entries
CREATE POLICY "Anyone can view analyses"
ON public.emotion_analyses
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create analyses"
ON public.emotion_analyses
FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_emotion_analyses_date ON public.emotion_analyses(analyzed_date DESC, created_at DESC);
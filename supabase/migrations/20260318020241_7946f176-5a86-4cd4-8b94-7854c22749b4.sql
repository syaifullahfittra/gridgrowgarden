
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Zones table
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own zones" ON public.zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own zones" ON public.zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own zones" ON public.zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own zones" ON public.zones FOR DELETE USING (auth.uid() = user_id);

-- Plots table
CREATE TABLE public.plots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌱',
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  entry_type TEXT NOT NULL DEFAULT 'boolean' CHECK (entry_type IN ('boolean', 'quantitative')),
  unit TEXT,
  target_per_period INTEGER,
  color_theme TEXT NOT NULL DEFAULT 'forest',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_shareable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plots" ON public.plots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plots" ON public.plots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plots" ON public.plots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plots" ON public.plots FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_plots_updated_at BEFORE UPDATE ON public.plots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Entries table
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 1,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  note TEXT,
  is_backdated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (plot_id, date)
);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" ON public.entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.entries FOR DELETE USING (auth.uid() = user_id);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_name TEXT NOT NULL DEFAULT 'My Garden',
  week_start TEXT NOT NULL DEFAULT 'monday' CHECK (week_start IN ('monday', 'sunday')),
  compact_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

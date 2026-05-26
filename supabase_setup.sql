-- Create the portfolio_data table
CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to SELECT (read) the content
CREATE POLICY "Allow public read-only access" 
ON public.portfolio_data 
FOR SELECT 
USING (true);

-- Policy: Allow only authenticated owners to UPDATE their content
CREATE POLICY "Allow users to update their own portfolio" 
ON public.portfolio_data 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Optional: Create a function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at when a row is modified
CREATE TRIGGER on_update_portfolio
    BEFORE UPDATE ON public.portfolio_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Note: You'll need to insert your initial data once you log in:
-- INSERT INTO public.portfolio_data (user_id, content) VALUES ('YOUR_USER_ID', '{...your initialData...}');

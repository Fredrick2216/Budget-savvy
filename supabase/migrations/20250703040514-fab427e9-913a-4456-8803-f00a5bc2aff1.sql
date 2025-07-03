
-- Create debts table to store user debt information
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 0,
  minimum_payment NUMERIC DEFAULT 0,
  due_date DATE,
  debt_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt_payments table to track payment history
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create policies for debts
CREATE POLICY "Users can view their own debts" 
  ON public.debts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" 
  ON public.debts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
  ON public.debts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
  ON public.debts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for debt_payments
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for debt_payments
CREATE POLICY "Users can view their own debt payments" 
  ON public.debt_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debt payments" 
  ON public.debt_payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt payments" 
  ON public.debt_payments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments" 
  ON public.debt_payments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for debts table to update updated_at
CREATE TRIGGER update_debts_updated_at 
    BEFORE UPDATE ON public.debts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

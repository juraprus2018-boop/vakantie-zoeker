-- Change default value of is_approved to true (auto-approve new accounts)
ALTER TABLE public.profiles 
ALTER COLUMN is_approved SET DEFAULT true;

-- Also approve any existing unapproved accounts
UPDATE public.profiles 
SET is_approved = true 
WHERE is_approved = false;
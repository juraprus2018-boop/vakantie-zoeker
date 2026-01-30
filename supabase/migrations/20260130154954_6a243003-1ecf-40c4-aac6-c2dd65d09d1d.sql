-- Add is_approved to profiles for account approval workflow
ALTER TABLE public.profiles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Add owner_id to parks for linking parks to owners
ALTER TABLE public.parks 
ADD COLUMN owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add is_pending for parks awaiting admin approval (owner-submitted)
ALTER TABLE public.parks 
ADD COLUMN is_pending boolean NOT NULL DEFAULT false;

-- Create index for faster owner lookups
CREATE INDEX idx_parks_owner_id ON public.parks(owner_id);

-- Update RLS policies for parks to allow approved owners to manage their own park

-- Policy: Approved owners can view their own park (even if not visible)
CREATE POLICY "Owners can view their own park"
ON public.parks
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  AND public.has_role(auth.uid(), 'user')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_approved = true
  )
);

-- Policy: Approved owners can update their own park (only if approved/visible)
CREATE POLICY "Owners can update their own park"
ON public.parks
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND is_visible = true
  AND public.has_role(auth.uid(), 'user')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_approved = true
  )
);

-- Policy: Approved owners can insert a park (limit enforced in code)
CREATE POLICY "Approved owners can insert parks"
ON public.parks
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND public.has_role(auth.uid(), 'user')
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_approved = true
  )
);

-- Allow admins to view all profiles for approval
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update profiles (for approval)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add user role automatically on signup (update trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;
-- Update RLS policy to hide incomplete subscriptions from non-admin users
-- This prevents the mobile app from treating 'incomplete' subscriptions as active premium access

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can read own subscriptions" ON public.subscriptions 
FOR SELECT USING (
    (auth.uid() = user_id AND status != 'incomplete') 
    OR public.is_admin()
);

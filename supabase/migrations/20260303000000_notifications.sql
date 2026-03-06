CREATE TYPE notification_channel_enum AS ENUM ('app', 'push', 'email', 'sms');
CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent', 'read', 'failed');

CREATE TABLE public.user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.user_group_members (
    group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE public.notification_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    action_type TEXT UNIQUE NOT NULL, -- The programmatic event name, e.g., 'meal_created'
    channels notification_channel_enum[] NOT NULL DEFAULT '{app}',
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL, -- Can be HTML
    channel notification_channel_enum NOT NULL DEFAULT 'app',
    status notification_status_enum NOT NULL DEFAULT 'pending',
    media_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage groups and triggers
CREATE POLICY "Admins can manage user groups" ON public.user_groups FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage group members" ON public.user_group_members FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage triggers" ON public.notification_triggers FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (public.is_admin());

-- Users can read their own notifications and group memberships
CREATE POLICY "Users can read own group memberships" ON public.user_group_members FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Enable realtime for notifications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

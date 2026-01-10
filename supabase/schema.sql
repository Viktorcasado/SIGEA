-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CAMPUSES
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public campuses are viewable by everyone." ON campuses FOR SELECT USING (true);

-- 2. PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    campus_id UUID REFERENCES campuses(id),
    role TEXT CHECK (role IN ('student', 'professor', 'admin', 'external')) DEFAULT 'student',
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    campus_id UUID REFERENCES campuses(id),
    organizer_id UUID REFERENCES profiles(id),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone." ON events FOR SELECT USING (true);   
-- Only admins/organizers insert (Needs specific Logic, simplified here)

-- 4. REGISTRATIONS
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations." ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register themselves." ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. CERTIFICATES
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL, -- Validation code
    pdf_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates." ON certificates FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM registrations WHERE id = registration_id));

-- 6. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);

-- TRIGGER: Auto-create profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

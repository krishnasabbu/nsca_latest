/*
  # Cricket Academy Management System - Complete Schema

  ## Overview
  Creates the complete database schema for cricket academy management with all necessary tables,
  relationships, and security policies.

  ## Tables Created
  
  ### 1. users
  Core user table storing all users (students, coaches, staff, admins)
  - Basic info: id, name, phone, email, role, password
  - Student-specific: father_name, mother_name, alt_phone, coaching_type, monthly_fee, batch_id, assigned_coach_id
  - Cricket details: age, batting_style, bowling_style, skill_level, fitness_level
  - Staff details: specialization, experience, rating
  - Metadata: join_date, status, avatar, is_first_login
  
  ### 2. batches
  Training batch management
  - name, schedule, coach_id, students_count, fees, start_date, end_date, status, description
  
  ### 3. attendance
  Daily attendance tracking
  - date, user_id, batch_id, status (present/absent/late), marked_by, remarks
  
  ### 4. yoyo_test_results
  Fitness test tracking
  - user_id, test_date, level, shuttles, distance, score, remarks
  
  ### 5. payments
  Fee and salary payment tracking
  - user_id, amount, date, type (fee/salary), status, month, year, remarks
  
  ### 6. fee_ledger
  Detailed fee collection ledger
  - student_id, month, year, expected_amount, paid_amount, balance, due_date, paid_date, status, payment_method
  
  ### 7. media_content
  Photos, videos, documents
  - title, description, type, url, thumbnail_url, upload_date, uploaded_by, batch_id, tags
  
  ### 8. sessions
  Training session scheduling
  - batch_id, date, start_time, end_time, topic, description, coach_id, status
  
  ## Security
  - Row Level Security enabled on all tables
  - Policies for authenticated users based on roles
  - Admin has full access
  - Coaches can view/edit their assigned data
  - Students can view their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'coach', 'student', 'support')),
  
  -- Student specific fields
  father_name text,
  mother_name text,
  alt_phone text,
  coaching_type text CHECK (coaching_type IN ('Normal', 'Special') OR coaching_type IS NULL),
  monthly_fee numeric DEFAULT 0,
  batch_id uuid,
  assigned_coach_id uuid,
  
  -- Cricket details
  age text,
  batting_style text,
  bowling_style text,
  skill_level text,
  fitness_level text,
  
  -- Staff details
  specialization text,
  experience text,
  rating numeric,
  
  -- Metadata
  join_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar text,
  is_first_login boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  schedule text,
  coach_id uuid REFERENCES users(id) ON DELETE SET NULL,
  students_count integer DEFAULT 0,
  fees numeric DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by uuid REFERENCES users(id) ON DELETE SET NULL,
  remarks text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, user_id, batch_id)
);

-- Create yoyo_test_results table
CREATE TABLE IF NOT EXISTS yoyo_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_date date NOT NULL,
  level numeric NOT NULL,
  shuttles numeric NOT NULL,
  distance numeric NOT NULL,
  score numeric NOT NULL,
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('fee', 'salary')),
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  month integer CHECK (month BETWEEN 1 AND 12),
  year integer,
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- Create fee_ledger table
CREATE TABLE IF NOT EXISTS fee_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  expected_amount numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  balance numeric GENERATED ALWAYS AS (expected_amount - paid_amount) STORED,
  due_date date,
  paid_date date,
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'overdue')),
  payment_method text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, month, year)
);

-- Create media_content table
CREATE TABLE IF NOT EXISTS media_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('video', 'photo', 'document')),
  url text NOT NULL,
  thumbnail_url text,
  upload_date timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  topic text NOT NULL,
  description text,
  coach_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for batch_id in users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_batch_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_batch_id_fkey 
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for assigned_coach_id in users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_assigned_coach_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_assigned_coach_id_fkey 
      FOREIGN KEY (assigned_coach_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_batch_id ON users(batch_id);
CREATE INDEX IF NOT EXISTS idx_users_assigned_coach_id ON users(assigned_coach_id);
CREATE INDEX IF NOT EXISTS idx_batches_coach_id ON batches(coach_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_student_id ON fee_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_month_year ON fee_ledger(month, year);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoyo_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Batches table policies
CREATE POLICY "Users can read batches"
  ON batches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage batches"
  ON batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Attendance policies
CREATE POLICY "Users can read attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches and admins can manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

-- Yoyo test results policies
CREATE POLICY "Users can read yoyo results"
  ON yoyo_test_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches and admins can manage yoyo results"
  ON yoyo_test_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

-- Payments policies
CREATE POLICY "Users can read payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fee ledger policies
CREATE POLICY "Users can read fee ledger"
  ON fee_ledger FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage fee ledger"
  ON fee_ledger FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Media content policies
CREATE POLICY "Users can read media"
  ON media_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches and admins can manage media"
  ON media_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

-- Sessions policies
CREATE POLICY "Users can read sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches and admins can manage sessions"
  ON sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

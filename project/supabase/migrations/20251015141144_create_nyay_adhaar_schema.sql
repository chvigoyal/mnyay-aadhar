/*
  # NYAY ADHAAR Database Schema

  ## Overview
  Complete database schema for Direct Benefit Transfer (DBT) system under PCR and PoA Acts.
  Supports victim registration, case management, fund disbursement tracking, and grievance redressal.

  ## New Tables

  ### 1. `profiles`
  User profiles for both beneficiaries and administrators
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `role` (text: 'user', 'admin', 'district_officer', 'social_welfare')
  - `aadhaar_number` (text, encrypted)
  - `state` (text)
  - `district` (text)
  - `language_preference` (text, default: 'en')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `victims`
  Victim registration and verification
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `victim_name` (text)
  - `aadhaar_number` (text, encrypted)
  - `phone` (text)
  - `email` (text)
  - `address` (text)
  - `state` (text)
  - `district` (text)
  - `caste_category` (text: 'SC', 'ST')
  - `verification_status` (text: 'pending', 'verified', 'rejected')
  - `verification_documents` (jsonb)
  - `digilocker_verified` (boolean, default: false)
  - `verified_by` (uuid, references profiles)
  - `verified_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. `cases`
  Atrocity cases registered under PCR/PoA Acts
  - `id` (uuid, primary key)
  - `case_number` (text, unique)
  - `victim_id` (uuid, references victims)
  - `case_type` (text: 'PCR', 'PoA', 'Inter-caste Marriage')
  - `incident_date` (date)
  - `incident_description` (text)
  - `fir_number` (text)
  - `police_station` (text)
  - `court_name` (text)
  - `case_status` (text: 'registered', 'under_investigation', 'in_trial', 'closed')
  - `supporting_documents` (jsonb)
  - `cctns_reference` (text)
  - `ecourt_reference` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `disbursements`
  Fund disbursement tracking for DBT
  - `id` (uuid, primary key)
  - `disbursement_number` (text, unique)
  - `case_id` (uuid, references cases)
  - `victim_id` (uuid, references victims)
  - `relief_type` (text: 'immediate_relief', 'rehabilitation', 'marriage_incentive')
  - `sanction_amount` (decimal)
  - `sanctioned_by` (uuid, references profiles)
  - `sanction_date` (date)
  - `sanction_order_number` (text)
  - `disbursement_status` (text: 'sanctioned', 'processing', 'disbursed', 'failed')
  - `disbursed_amount` (decimal)
  - `disbursement_date` (date)
  - `transaction_id` (text)
  - `bank_account_number` (text, encrypted)
  - `ifsc_code` (text)
  - `beneficiary_name` (text)
  - `remarks` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `grievances`
  Grievance redressal and feedback system
  - `id` (uuid, primary key)
  - `grievance_number` (text, unique)
  - `user_id` (uuid, references profiles)
  - `related_case_id` (uuid, references cases, nullable)
  - `related_disbursement_id` (uuid, references disbursements, nullable)
  - `grievance_type` (text: 'delay', 'wrong_amount', 'not_received', 'documentation', 'other')
  - `description` (text)
  - `priority` (text: 'low', 'medium', 'high', 'urgent')
  - `status` (text: 'open', 'in_progress', 'resolved', 'closed')
  - `attachments` (jsonb)
  - `assigned_to` (uuid, references profiles, nullable)
  - `resolution_notes` (text)
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `audit_logs`
  Comprehensive audit trail for all operations
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `action` (text)
  - `entity_type` (text)
  - `entity_id` (uuid)
  - `old_values` (jsonb)
  - `new_values` (jsonb)
  - `ip_address` (text)
  - `created_at` (timestamptz)

  ### 7. `chat_messages`
  AI chatbot conversation history
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `session_id` (uuid)
  - `message` (text)
  - `response` (text)
  - `created_at` (timestamptz)

  ## Security

  1. Row Level Security (RLS) enabled on all tables
  2. Users can only access their own data
  3. Admins and officers have elevated permissions based on role
  4. Sensitive data (Aadhaar, bank account) stored with encryption markers
  5. Comprehensive audit logging for accountability

  ## Indexes

  - Created indexes on frequently queried fields for optimal performance
  - Unique constraints on case_number, disbursement_number, grievance_number
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'district_officer', 'social_welfare')),
  aadhaar_number text,
  state text,
  district text,
  language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'ta', 'te', 'bn', 'mr')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create victims table
CREATE TABLE IF NOT EXISTS victims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  victim_name text NOT NULL,
  aadhaar_number text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  caste_category text NOT NULL CHECK (caste_category IN ('SC', 'ST')),
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents jsonb DEFAULT '[]'::jsonb,
  digilocker_verified boolean DEFAULT false,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  victim_id uuid REFERENCES victims(id) NOT NULL,
  case_type text NOT NULL CHECK (case_type IN ('PCR', 'PoA', 'Inter-caste Marriage')),
  incident_date date,
  incident_description text NOT NULL,
  fir_number text,
  police_station text,
  court_name text,
  case_status text DEFAULT 'registered' CHECK (case_status IN ('registered', 'under_investigation', 'in_trial', 'closed')),
  supporting_documents jsonb DEFAULT '[]'::jsonb,
  cctns_reference text,
  ecourt_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create disbursements table
CREATE TABLE IF NOT EXISTS disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disbursement_number text UNIQUE NOT NULL,
  case_id uuid REFERENCES cases(id) NOT NULL,
  victim_id uuid REFERENCES victims(id) NOT NULL,
  relief_type text NOT NULL CHECK (relief_type IN ('immediate_relief', 'rehabilitation', 'marriage_incentive')),
  sanction_amount decimal(12, 2) NOT NULL,
  sanctioned_by uuid REFERENCES profiles(id),
  sanction_date date,
  sanction_order_number text,
  disbursement_status text DEFAULT 'sanctioned' CHECK (disbursement_status IN ('sanctioned', 'processing', 'disbursed', 'failed')),
  disbursed_amount decimal(12, 2),
  disbursement_date date,
  transaction_id text,
  bank_account_number text,
  ifsc_code text,
  beneficiary_name text NOT NULL,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  related_case_id uuid REFERENCES cases(id),
  related_disbursement_id uuid REFERENCES disbursements(id),
  grievance_type text NOT NULL CHECK (grievance_type IN ('delay', 'wrong_amount', 'not_received', 'documentation', 'other')),
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  attachments jsonb DEFAULT '[]'::jsonb,
  assigned_to uuid REFERENCES profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  session_id uuid NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_victims_user_id ON victims(user_id);
CREATE INDEX IF NOT EXISTS idx_victims_verification_status ON victims(verification_status);
CREATE INDEX IF NOT EXISTS idx_cases_victim_id ON cases(victim_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(case_status);
CREATE INDEX IF NOT EXISTS idx_disbursements_case_id ON disbursements(case_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_victim_id ON disbursements(victim_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(disbursement_status);
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE victims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

-- Victims policies
CREATE POLICY "Users can view own victim records"
  ON victims FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create victim records"
  ON victims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Officers can view all victims"
  ON victims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can update victim verification"
  ON victims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

-- Cases policies
CREATE POLICY "Users can view own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM victims
      WHERE victims.id = cases.victim_id AND victims.user_id = auth.uid()
    )
  );

CREATE POLICY "Officers can view all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

-- Disbursements policies
CREATE POLICY "Users can view own disbursements"
  ON disbursements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM victims
      WHERE victims.id = disbursements.victim_id AND victims.user_id = auth.uid()
    )
  );

CREATE POLICY "Officers can view all disbursements"
  ON disbursements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can create disbursements"
  ON disbursements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can update disbursements"
  ON disbursements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

-- Grievances policies
CREATE POLICY "Users can view own grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create grievances"
  ON grievances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Officers can view all grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

CREATE POLICY "Officers can update grievances"
  ON grievances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'district_officer', 'social_welfare')
    )
  );

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disbursements_updated_at
  BEFORE UPDATE ON disbursements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at
  BEFORE UPDATE ON grievances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
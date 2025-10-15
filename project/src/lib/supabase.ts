import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'user' | 'admin' | 'district_officer' | 'social_welfare';
  aadhaar_number: string | null;
  state: string | null;
  district: string | null;
  language_preference: string;
  created_at: string;
  updated_at: string;
};

export type Victim = {
  id: string;
  user_id: string;
  victim_name: string;
  aadhaar_number: string;
  phone: string;
  email: string | null;
  address: string;
  state: string;
  district: string;
  caste_category: 'SC' | 'ST';
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_documents: any[];
  digilocker_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

export type Case = {
  id: string;
  case_number: string;
  victim_id: string;
  case_type: 'PCR' | 'PoA' | 'Inter-caste Marriage';
  incident_date: string | null;
  incident_description: string;
  fir_number: string | null;
  police_station: string | null;
  court_name: string | null;
  case_status: 'registered' | 'under_investigation' | 'in_trial' | 'closed';
  supporting_documents: any[];
  cctns_reference: string | null;
  ecourt_reference: string | null;
  created_at: string;
  updated_at: string;
};

export type Disbursement = {
  id: string;
  disbursement_number: string;
  case_id: string;
  victim_id: string;
  relief_type: 'immediate_relief' | 'rehabilitation' | 'marriage_incentive';
  sanction_amount: number;
  sanctioned_by: string | null;
  sanction_date: string | null;
  sanction_order_number: string | null;
  disbursement_status: 'sanctioned' | 'processing' | 'disbursed' | 'failed';
  disbursed_amount: number | null;
  disbursement_date: string | null;
  transaction_id: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  beneficiary_name: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type Grievance = {
  id: string;
  grievance_number: string;
  user_id: string;
  related_case_id: string | null;
  related_disbursement_id: string | null;
  grievance_type: 'delay' | 'wrong_amount' | 'not_received' | 'documentation' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments: any[];
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

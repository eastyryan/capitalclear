// database.types.ts — Hand-written Supabase `Database` type for Capital Clear.
//
// This mirrors supabase/migrations/0001_init.sql EXACTLY. Postgres -> TS mapping:
//   bigint / int / smallint / numeric / double precision -> number
//   uuid / text / timestamptz                            -> string
//   boolean                                              -> boolean
//   enums                                                -> string unions
//   service_type[]                                       -> ServiceType[]
//
// Row     = shape returned by SELECT (all columns present).
// Insert   = shape accepted by INSERT (columns with defaults / nullable are optional).
// Update   = shape accepted by UPDATE (all columns optional).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          full_name: string | null;
          email: string | null;
          phone: string | null;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pros: {
        Row: {
          user_id: string;
          services: Database['public']['Enums']['service_type'][];
          base_price_cents: number;
          service_radius_km: number | null;
          bio: string | null;
          city: string | null;
          verified: boolean;
          rating_avg: number | null;
          total_jobs_completed: number;
          stripe_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          services?: Database['public']['Enums']['service_type'][];
          base_price_cents?: number;
          service_radius_km?: number | null;
          bio?: string | null;
          city?: string | null;
          verified?: boolean;
          rating_avg?: number | null;
          total_jobs_completed?: number;
          stripe_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          services?: Database['public']['Enums']['service_type'][];
          base_price_cents?: number;
          service_radius_km?: number | null;
          bio?: string | null;
          city?: string | null;
          verified?: boolean;
          rating_avg?: number | null;
          total_jobs_completed?: number;
          stripe_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          homeowner_id: string;
          pro_id: string | null;
          service_type: Database['public']['Enums']['service_type'];
          status: Database['public']['Enums']['job_status'];
          address: string | null;
          postal_code: string;
          lat: number | null;
          lng: number | null;
          scheduled_for: string | null;
          notes: string | null;
          quoted_price_cents: number | null;
          final_price_cents: number | null;
          currency: string;
          payment_status: Database['public']['Enums']['payment_status'];
          payment_intent_id: string | null;
          platform_fee_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          homeowner_id: string;
          pro_id?: string | null;
          service_type: Database['public']['Enums']['service_type'];
          status?: Database['public']['Enums']['job_status'];
          address?: string | null;
          postal_code: string;
          lat?: number | null;
          lng?: number | null;
          scheduled_for?: string | null;
          notes?: string | null;
          quoted_price_cents?: number | null;
          final_price_cents?: number | null;
          currency?: string;
          payment_status?: Database['public']['Enums']['payment_status'];
          payment_intent_id?: string | null;
          platform_fee_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          homeowner_id?: string;
          pro_id?: string | null;
          service_type?: Database['public']['Enums']['service_type'];
          status?: Database['public']['Enums']['job_status'];
          address?: string | null;
          postal_code?: string;
          lat?: number | null;
          lng?: number | null;
          scheduled_for?: string | null;
          notes?: string | null;
          quoted_price_cents?: number | null;
          final_price_cents?: number | null;
          currency?: string;
          payment_status?: Database['public']['Enums']['payment_status'];
          payment_intent_id?: string | null;
          platform_fee_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          storage_path: string;
          type: Database['public']['Enums']['photo_type'];
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          storage_path: string;
          type: Database['public']['Enums']['photo_type'];
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          storage_path?: string;
          type?: Database['public']['Enums']['photo_type'];
          uploaded_by?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          job_id: string;
          reviewer_id: string;
          pro_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          reviewer_id: string;
          pro_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          reviewer_id?: string;
          pro_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          job_id: string;
          provider: string;
          intent_id: string | null;
          amount_cents: number;
          platform_fee_cents: number | null;
          currency: string;
          status: Database['public']['Enums']['payment_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          provider: string;
          intent_id?: string | null;
          amount_cents: number;
          platform_fee_cents?: number | null;
          currency?: string;
          status?: Database['public']['Enums']['payment_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          provider?: string;
          intent_id?: string | null;
          amount_cents?: number;
          platform_fee_cents?: number | null;
          currency?: string;
          status?: Database['public']['Enums']['payment_status'];
          created_at?: string;
          updated_at?: string;
        };
      };
      ottawa_fsa: {
        Row: {
          fsa: string;
          area_name: string | null;
        };
        Insert: {
          fsa: string;
          area_name?: string | null;
        };
        Update: {
          fsa?: string;
          area_name?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_ottawa_postal: {
        Args: { p_postal: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'homeowner' | 'pro' | 'admin';
      service_type: 'snow_removal' | 'lawn_mowing' | 'seasonal_maintenance';
      job_status:
        | 'draft'
        | 'posted'
        | 'accepted'
        | 'en_route'
        | 'in_progress'
        | 'awaiting_approval'
        | 'completed'
        | 'cancelled';
      photo_type: 'before' | 'after';
      payment_status:
        | 'none'
        | 'authorized'
        | 'released'
        | 'cancelled'
        | 'refunded'
        | 'failed';
    };
    CompositeTypes: Record<string, never>;
  };
};

// Convenience Row aliases ---------------------------------------------------
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Pro = Database['public']['Tables']['pros']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobPhoto = Database['public']['Tables']['job_photos']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type OttawaFsa = Database['public']['Tables']['ottawa_fsa']['Row'];

// Enum aliases --------------------------------------------------------------
export type UserRole = Database['public']['Enums']['user_role'];
export type ServiceType = Database['public']['Enums']['service_type'];
export type JobStatus = Database['public']['Enums']['job_status'];
export type PhotoType = Database['public']['Enums']['photo_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

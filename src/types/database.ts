// Supabase generated types
// This file defines the database schema for TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      csrf_tokens: {
        Row: {
          id: string
          token: string
          expires_at: string
          created_at: string | null
          ip_address: string | null
          user_id: string | null
          used_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          token: string
          expires_at: string
          created_at?: string | null
          ip_address?: string | null
          user_id?: string | null
          used_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          token?: string
          expires_at?: string
          created_at?: string | null
          ip_address?: string | null
          user_id?: string | null
          used_at?: string | null
          created_by?: string | null
        }
      }
      booking_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_name: string
          client_email: string
          client_phone: string | null
          event_type: string | null
          booking_type: string | null
          desired_date: string
          desired_time: string | null
          num_guests: number | null
          special_requests: string | null
          menu: string | null
          menu_selection: Json | null
          menu_total_per_person: number | null
          menu_total_booking: number | null
          preset_menu: string | null
          dietary_restrictions: Json | null
          status: string
          confirmed_start: string | null
          confirmed_end: string | null
          rejection_reason: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          placement: string | null
          booking_source: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_name: string
          client_email: string
          client_phone?: string | null
          event_type?: string | null
          booking_type?: string | null
          desired_date: string
          desired_time?: string | null
          num_guests?: number | null
          special_requests?: string | null
          menu?: string | null
          menu_selection?: Json | null
          menu_total_per_person?: number | null
          menu_total_booking?: number | null
          dietary_restrictions?: Json | null
          status?: string
          confirmed_start?: string | null
          confirmed_end?: string | null
          rejection_reason?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          placement?: string | null
          booking_source?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_name?: string
          client_email?: string
          client_phone?: string | null
          event_type?: string | null
          booking_type?: string | null
          desired_date?: string
          desired_time?: string | null
          num_guests?: number | null
          special_requests?: string | null
          menu?: string | null
          menu_selection?: Json | null
          menu_total_per_person?: number | null
          menu_total_booking?: number | null
          dietary_restrictions?: Json | null
          status?: string
          confirmed_start?: string | null
          confirmed_end?: string | null
          rejection_reason?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          placement?: string | null
          booking_source?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          category: string
          price: number
          description: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          category: string
          price: number
          description?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          category?: string
          price?: number
          description?: string | null
          sort_order?: number
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          booking_id: string | null
          email_type: string
          recipient_email: string
          sent_at: string
          status: string
          provider_response: Json | null
          error_message: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          email_type: string
          recipient_email: string
          sent_at?: string
          status?: string
          provider_response?: Json | null
          error_message?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          email_type?: string
          recipient_email?: string
          sent_at?: string
          status?: string
          provider_response?: Json | null
          error_message?: string | null
        }
      }
      restaurant_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

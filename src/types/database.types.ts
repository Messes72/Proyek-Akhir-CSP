export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "user" | "owner" | "admin";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: "user" | "owner" | "admin";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "user" | "owner" | "admin";
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      fields: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          price_per_hour: number;
          address: string;
          lat: number | null;
          lng: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description: string;
          price_per_hour: number;
          address: string;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          price_per_hour?: number;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      field_images: {
        Row: {
          id: string;
          field_id: string;
          file_path: string;
          caption: string | null;
        };
        Insert: {
          id?: string;
          field_id: string;
          file_path: string;
          caption?: string | null;
        };
        Update: {
          id?: string;
          field_id?: string;
          file_path?: string;
          caption?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          field_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          total_price: number;
          proof_of_payment_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          field_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          total_price: number;
          proof_of_payment_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          field_id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          total_price?: number;
          proof_of_payment_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

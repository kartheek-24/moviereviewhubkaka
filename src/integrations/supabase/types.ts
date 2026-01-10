export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          admin_email: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          admin_email?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          device_id: string | null
          display_name: string
          id: string
          is_anonymous: boolean
          reported: boolean
          reported_reason: string | null
          review_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          display_name: string
          id?: string
          is_anonymous?: boolean
          reported?: boolean
          reported_reason?: string | null
          review_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          display_name?: string
          id?: string
          is_anonymous?: boolean
          reported?: boolean
          reported_reason?: string | null
          review_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          id: string
          last_seen_at: string
          platform: string | null
          push_enabled: boolean
          push_token: string | null
        }
        Insert: {
          id: string
          last_seen_at?: string
          platform?: string | null
          push_enabled?: boolean
          push_token?: string | null
        }
        Update: {
          id?: string
          last_seen_at?: string
          platform?: string | null
          push_enabled?: boolean
          push_token?: string | null
        }
        Relationships: []
      }
      helpful_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          voter_device_id: string | null
          voter_user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          review_id: string
          voter_device_id?: string | null
          voter_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          voter_device_id?: string | null
          voter_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          platform: string | null
          push_enabled: boolean | null
          push_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          platform?: string | null
          push_enabled?: boolean | null
          push_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          platform?: string | null
          push_enabled?: boolean | null
          push_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          created_by: string
          helpful_count: number
          id: string
          language: string
          poster_url: string | null
          rating: number
          release_date: string | null
          snippet: string
          tags: string[] | null
          title: string
          title_lower: string
          updated_at: string
        }
        Insert: {
          comment_count?: number
          content: string
          created_at?: string
          created_by: string
          helpful_count?: number
          id?: string
          language: string
          poster_url?: string | null
          rating: number
          release_date?: string | null
          snippet: string
          tags?: string[] | null
          title: string
          title_lower: string
          updated_at?: string
        }
        Update: {
          comment_count?: number
          content?: string
          created_at?: string
          created_by?: string
          helpful_count?: number
          id?: string
          language?: string
          poster_url?: string | null
          rating?: number
          release_date?: string | null
          snippet?: string
          tags?: string[] | null
          title?: string
          title_lower?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

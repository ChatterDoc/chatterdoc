export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          name?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      external_feedback: {
        Row: {
          analyzed: boolean | null
          api_key_id: string | null
          api_key_name: string | null
          created_at: string | null
          created_at_internal: string | null
          external_id: string
          id: string
          rating: number | null
          reply_created_at: string | null
          reply_text: string | null
          reviewer_name: string | null
          reviewer_photo: string | null
          sentiment: string | null
          source: string
          source_url: string | null
          text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analyzed?: boolean | null
          api_key_id?: string | null
          api_key_name?: string | null
          created_at?: string | null
          created_at_internal?: string | null
          external_id: string
          id?: string
          rating?: number | null
          reply_created_at?: string | null
          reply_text?: string | null
          reviewer_name?: string | null
          reviewer_photo?: string | null
          sentiment?: string | null
          source: string
          source_url?: string | null
          text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analyzed?: boolean | null
          api_key_id?: string | null
          api_key_name?: string | null
          created_at?: string | null
          created_at_internal?: string | null
          external_id?: string
          id?: string
          rating?: number | null
          reply_created_at?: string | null
          reply_text?: string | null
          reviewer_name?: string | null
          reviewer_photo?: string | null
          sentiment?: string | null
          source?: string
          source_url?: string | null
          text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_external_feedback_api_key"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          analyzed: boolean | null
          api_key_id: string | null
          created_at: string
          id: string
          rating: number | null
          sentiment: string | null
          source: string | null
          text: string
          user_id: string
        }
        Insert: {
          analyzed?: boolean | null
          api_key_id?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          sentiment?: string | null
          source?: string | null
          text: string
          user_id: string
        }
        Update: {
          analyzed?: boolean | null
          api_key_id?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          sentiment?: string | null
          source?: string | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          credit_amount: number
          currency: string | null
          id: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credit_amount: number
          currency?: string | null
          id?: string
          status: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credit_amount?: number
          currency?: string | null
          id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopify_auth_states: {
        Row: {
          created_at: string | null
          id: string
          shop: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shop: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shop?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_user_email: string | null
          provider_user_id: string | null
          refresh_token: string | null
          token_data: Json | null
          updated_at: string | null
          user_data: Json | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_user_email?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          token_data?: Json | null
          updated_at?: string | null
          user_data?: Json | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_user_email?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          token_data?: Json | null
          updated_at?: string | null
          user_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      widget_settings: {
        Row: {
          api_key_id: string | null
          background_color: string
          button_icon: string | null
          button_style: string | null
          button_text: string | null
          created_at: string
          custom_prompt: string | null
          feedback_type: string
          id: string
          logo_url: string | null
          position: string | null
          primary_color: string
          rating_scale: number | null
          rating_type: string | null
          show_logo: boolean
          show_prompt: boolean | null
          show_rating: boolean | null
          text_color: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          background_color?: string
          button_icon?: string | null
          button_style?: string | null
          button_text?: string | null
          created_at?: string
          custom_prompt?: string | null
          feedback_type?: string
          id?: string
          logo_url?: string | null
          position?: string | null
          primary_color?: string
          rating_scale?: number | null
          rating_type?: string | null
          show_logo?: boolean
          show_prompt?: boolean | null
          show_rating?: boolean | null
          text_color?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          background_color?: string
          button_icon?: string | null
          button_style?: string | null
          button_text?: string | null
          created_at?: string
          custom_prompt?: string | null
          feedback_type?: string
          id?: string
          logo_url?: string | null
          position?: string | null
          primary_color?: string
          rating_scale?: number | null
          rating_type?: string | null
          show_logo?: boolean
          show_prompt?: boolean | null
          show_rating?: boolean | null
          text_color?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_settings_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_feedback_sentiment: {
        Args: { feedback_id: string; sentiment_value: string }
        Returns: boolean
      }
      update_user_credits: {
        Args: { user_id_param: string; credit_amount_param: number }
        Returns: boolean
      }
      use_analysis_credit: {
        Args: { user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

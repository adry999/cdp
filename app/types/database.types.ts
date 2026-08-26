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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_en: string | null
          answer_ro: string
          id: string
          published_at: string | null
          question_en: string | null
          question_ro: string
          sort_order: number
        }
        Insert: {
          answer_en?: string | null
          answer_ro: string
          id?: string
          published_at?: string | null
          question_en?: string | null
          question_ro: string
          sort_order?: number
        }
        Update: {
          answer_en?: string | null
          answer_ro?: string
          id?: string
          published_at?: string | null
          question_en?: string | null
          question_ro?: string
          sort_order?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          archived_at: string | null
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          lang: string
          message: string
          name: string
          notes: string | null
          page: string | null
          referrer: string | null
          source: string | null
          status: string
          utm: Json | null
        }
        Insert: {
          archived_at?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          lang?: string
          message: string
          name: string
          notes?: string | null
          page?: string | null
          referrer?: string | null
          source?: string | null
          status?: string
          utm?: Json | null
        }
        Update: {
          archived_at?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          lang?: string
          message?: string
          name?: string
          notes?: string | null
          page?: string | null
          referrer?: string | null
          source?: string | null
          status?: string
          utm?: Json | null
        }
        Relationships: []
      }
      process_steps: {
        Row: {
          body_en: string | null
          body_ro: string
          id: string
          sort_order: number
          title_en: string | null
          title_ro: string
        }
        Insert: {
          body_en?: string | null
          body_ro: string
          id?: string
          sort_order?: number
          title_en?: string | null
          title_ro: string
        }
        Update: {
          body_en?: string | null
          body_ro?: string
          id?: string
          sort_order?: number
          title_en?: string | null
          title_ro?: string
        }
        Relationships: []
      }
      project_facts: {
        Row: {
          id: string
          label_en: string | null
          label_ro: string
          project_id: string
          sort_order: number
          value_en: string | null
          value_ro: string
        }
        Insert: {
          id?: string
          label_en?: string | null
          label_ro: string
          project_id: string
          sort_order?: number
          value_en?: string | null
          value_ro: string
        }
        Update: {
          id?: string
          label_en?: string | null
          label_ro?: string
          project_id?: string
          sort_order?: number
          value_en?: string | null
          value_ro?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_facts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          alt_en: string | null
          alt_ro: string
          aspect: string
          id: string
          path: string
          project_id: string
          sort_order: number
        }
        Insert: {
          alt_en?: string | null
          alt_ro: string
          aspect?: string
          id?: string
          path: string
          project_id: string
          sort_order?: number
        }
        Update: {
          alt_en?: string | null
          alt_ro?: string
          aspect?: string
          id?: string
          path?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stats: {
        Row: {
          id: string
          label_en: string | null
          label_ro: string
          project_id: string
          sort_order: number
          value: string
        }
        Insert: {
          id?: string
          label_en?: string | null
          label_ro: string
          project_id: string
          sort_order?: number
          value: string
        }
        Update: {
          id?: string
          label_en?: string | null
          label_ro?: string
          project_id?: string
          sort_order?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_steps: {
        Row: {
          body_en: string | null
          body_ro: string
          id: string
          project_id: string
          sort_order: number
          title_en: string | null
          title_ro: string
        }
        Insert: {
          body_en?: string | null
          body_ro: string
          id?: string
          project_id: string
          sort_order?: number
          title_en?: string | null
          title_ro: string
        }
        Update: {
          body_en?: string | null
          body_ro?: string
          id?: string
          project_id?: string
          sort_order?: number
          title_en?: string | null
          title_ro?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          card_title_en: string | null
          card_title_ro: string
          context_body_en: string | null
          context_body_ro: string | null
          context_heading_en: string | null
          context_heading_ro: string | null
          cover_alt_en: string | null
          cover_alt_ro: string | null
          cover_path: string | null
          created_at: string
          hero_alt_en: string | null
          hero_alt_ro: string | null
          hero_path: string | null
          id: string
          lead_en: string | null
          lead_ro: string
          next_title_en: string | null
          next_title_ro: string | null
          preview_token: string
          published_at: string | null
          quote_author: string | null
          quote_company: string | null
          quote_en: string | null
          quote_ro: string | null
          quote_role_en: string | null
          quote_role_ro: string | null
          slug_en: string | null
          slug_ro: string
          solution_heading_en: string | null
          solution_heading_ro: string | null
          sort_order: number
          summary_en: string | null
          summary_ro: string
          tech: string[]
          title_en: string | null
          title_ro: string
          updated_at: string
          updated_by: string | null
          year: number | null
        }
        Insert: {
          card_title_en?: string | null
          card_title_ro: string
          context_body_en?: string | null
          context_body_ro?: string | null
          context_heading_en?: string | null
          context_heading_ro?: string | null
          cover_alt_en?: string | null
          cover_alt_ro?: string | null
          cover_path?: string | null
          created_at?: string
          hero_alt_en?: string | null
          hero_alt_ro?: string | null
          hero_path?: string | null
          id?: string
          lead_en?: string | null
          lead_ro: string
          next_title_en?: string | null
          next_title_ro?: string | null
          preview_token?: string
          published_at?: string | null
          quote_author?: string | null
          quote_company?: string | null
          quote_en?: string | null
          quote_ro?: string | null
          quote_role_en?: string | null
          quote_role_ro?: string | null
          slug_en?: string | null
          slug_ro: string
          solution_heading_en?: string | null
          solution_heading_ro?: string | null
          sort_order?: number
          summary_en?: string | null
          summary_ro: string
          tech?: string[]
          title_en?: string | null
          title_ro: string
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          card_title_en?: string | null
          card_title_ro?: string
          context_body_en?: string | null
          context_body_ro?: string | null
          context_heading_en?: string | null
          context_heading_ro?: string | null
          cover_alt_en?: string | null
          cover_alt_ro?: string | null
          cover_path?: string | null
          created_at?: string
          hero_alt_en?: string | null
          hero_alt_ro?: string | null
          hero_path?: string | null
          id?: string
          lead_en?: string | null
          lead_ro?: string
          next_title_en?: string | null
          next_title_ro?: string | null
          preview_token?: string
          published_at?: string | null
          quote_author?: string | null
          quote_company?: string | null
          quote_en?: string | null
          quote_ro?: string | null
          quote_role_en?: string | null
          quote_role_ro?: string | null
          slug_en?: string | null
          slug_ro?: string
          solution_heading_en?: string | null
          solution_heading_ro?: string | null
          sort_order?: number
          summary_en?: string | null
          summary_ro?: string
          tech?: string[]
          title_en?: string | null
          title_ro?: string
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          status: number
          to_path: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          status?: number
          to_path: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          status?: number
          to_path?: string
        }
        Relationships: []
      }
      service_items: {
        Row: {
          body_en: string | null
          body_ro: string
          id: string
          label_en: string | null
          label_ro: string
          service_id: string
          sort_order: number
        }
        Insert: {
          body_en?: string | null
          body_ro: string
          id?: string
          label_en?: string | null
          label_ro: string
          service_id: string
          sort_order?: number
        }
        Update: {
          body_en?: string | null
          body_ro?: string
          id?: string
          label_en?: string | null
          label_ro?: string
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          body_en: string | null
          body_ro: string
          currency: string
          duration_en: string | null
          duration_ro: string | null
          heading_en: string | null
          heading_ro: string
          id: string
          key: string
          layout: string
          level_label_en: string | null
          level_label_ro: string
          name_en: string | null
          name_ro: string
          price_from: number | null
          sort_order: number
        }
        Insert: {
          body_en?: string | null
          body_ro: string
          currency?: string
          duration_en?: string | null
          duration_ro?: string | null
          heading_en?: string | null
          heading_ro: string
          id?: string
          key: string
          layout?: string
          level_label_en?: string | null
          level_label_ro: string
          name_en?: string | null
          name_ro: string
          price_from?: number | null
          sort_order?: number
        }
        Update: {
          body_en?: string | null
          body_ro?: string
          currency?: string
          duration_en?: string | null
          duration_ro?: string | null
          heading_en?: string | null
          heading_ro?: string
          id?: string
          key?: string
          layout?: string
          level_label_en?: string | null
          level_label_ro?: string
          name_en?: string | null
          name_ro?: string
          price_from?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          concurrent_projects: string | null
          contact_email: string
          contact_phone: string | null
          copyright_year: number | null
          footer_line_en: string | null
          footer_line_ro: string | null
          hours: string | null
          id: number
          meta_description_en: string | null
          meta_description_ro: string | null
          meta_title_en: string | null
          meta_title_ro: string | null
          nda_note_en: string | null
          nda_note_ro: string | null
          next_opening_en: string | null
          next_opening_ro: string | null
          og_image_path: string | null
          response_time_en: string | null
          response_time_ro: string | null
          updated_at: string
        }
        Insert: {
          concurrent_projects?: string | null
          contact_email: string
          contact_phone?: string | null
          copyright_year?: number | null
          footer_line_en?: string | null
          footer_line_ro?: string | null
          hours?: string | null
          id?: number
          meta_description_en?: string | null
          meta_description_ro?: string | null
          meta_title_en?: string | null
          meta_title_ro?: string | null
          nda_note_en?: string | null
          nda_note_ro?: string | null
          next_opening_en?: string | null
          next_opening_ro?: string | null
          og_image_path?: string | null
          response_time_en?: string | null
          response_time_ro?: string | null
          updated_at?: string
        }
        Update: {
          concurrent_projects?: string | null
          contact_email?: string
          contact_phone?: string | null
          copyright_year?: number | null
          footer_line_en?: string | null
          footer_line_ro?: string | null
          hours?: string | null
          id?: number
          meta_description_en?: string | null
          meta_description_ro?: string | null
          meta_title_en?: string | null
          meta_title_ro?: string | null
          nda_note_en?: string | null
          nda_note_ro?: string | null
          next_opening_en?: string | null
          next_opening_ro?: string | null
          og_image_path?: string | null
          response_time_en?: string | null
          response_time_ro?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stack_groups: {
        Row: {
          id: string
          items: string[]
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          items?: string[]
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          items?: string[]
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      save_project: { Args: { payload: Json }; Returns: Json }
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
    ? DefaultSchema["CompositeTypes"][CompositeTypeName]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

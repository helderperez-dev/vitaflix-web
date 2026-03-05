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
      brands: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      dietary_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: Json
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: Json
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: Json
          updated_at?: string
        }
        Relationships: []
      }
      meal_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: Json
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: Json
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: Json
          updated_at?: string
        }
        Relationships: []
      }
      meal_category_links: {
        Row: {
          category_id: string
          meal_id: string
        }
        Insert: {
          category_id: string
          meal_id: string
        }
        Update: {
          category_id?: string
          meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_category_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_category_links_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_dietary_tags: {
        Row: {
          dietary_tag_id: string
          meal_id: string
        }
        Insert: {
          dietary_tag_id: string
          meal_id: string
        }
        Update: {
          dietary_tag_id?: string
          meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_dietary_tags_dietary_tag_id_fkey"
            columns: ["dietary_tag_id"]
            isOneToOne: false
            referencedRelation: "dietary_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_dietary_tags_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_options: {
        Row: {
          associated_meal_id: string
          created_at: string
          id: string
          images: Json | null
          ingredients: Json
          is_default: boolean | null
          kcal: number
          macros: Json | null
          substitution_notes: Json | null
          updated_at: string
        }
        Insert: {
          associated_meal_id: string
          created_at?: string
          id?: string
          images?: Json | null
          ingredients: Json
          is_default?: boolean | null
          kcal: number
          macros?: Json | null
          substitution_notes?: Json | null
          updated_at?: string
        }
        Update: {
          associated_meal_id?: string
          created_at?: string
          id?: string
          images?: Json | null
          ingredients?: Json
          is_default?: boolean | null
          kcal?: number
          macros?: Json | null
          substitution_notes?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_options_associated_meal_id_fkey"
            columns: ["associated_meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          selected_meals: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          selected_meals: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          selected_meals?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          cook_time: number | null
          created_at: string
          id: string
          images: Json | null
          is_public: boolean | null
          meal_types: string[]
          name: Json
          preparation_mode: Json
          publish_on: string | null
          restrictions: string[] | null
          satiety: number | null
          updated_at: string
        }
        Insert: {
          cook_time?: number | null
          created_at?: string
          id?: string
          images?: Json | null
          is_public?: boolean | null
          meal_types: string[]
          name: Json
          preparation_mode: Json
          publish_on?: string | null
          restrictions?: string[] | null
          satiety?: number | null
          updated_at?: string
        }
        Update: {
          cook_time?: number | null
          created_at?: string
          id?: string
          images?: Json | null
          is_public?: boolean | null
          meal_types?: string[]
          name?: Json
          preparation_mode?: Json
          publish_on?: string | null
          restrictions?: string[] | null
          satiety?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string | null
          channel: string
          created_at: string | null
          css: string | null
          html: string | null
          id: string
          name: string
          subject: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string | null
          css?: string | null
          html?: string | null
          id?: string
          name: string
          subject?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string | null
          css?: string | null
          html?: string | null
          id?: string
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_triggers: {
        Row: {
          action_type: string
          body_template: string
          channels: Database["public"]["Enums"]["notification_channel_enum"][]
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          title_template: string
          updated_at: string
        }
        Insert: {
          action_type: string
          body_template: string
          channels?: Database["public"]["Enums"]["notification_channel_enum"][]
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          title_template: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          body_template?: string
          channels?: Database["public"]["Enums"]["notification_channel_enum"][]
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          attachments: string[] | null
          body: string
          channel: Database["public"]["Enums"]["notification_channel_enum"]
          created_at: string
          error_message: string | null
          html: string | null
          id: string
          media_url: string | null
          metadata: Json | null
          read_at: string | null
          status: Database["public"]["Enums"]["notification_status_enum"]
          target: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          body: string
          channel?: Database["public"]["Enums"]["notification_channel_enum"]
          created_at?: string
          error_message?: string | null
          html?: string | null
          id?: string
          media_url?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status_enum"]
          target?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel_enum"]
          created_at?: string
          error_message?: string | null
          html?: string | null
          id?: string
          media_url?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status_enum"]
          target?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          brand_id: string
          product_id: string
        }
        Insert: {
          brand_id: string
          product_id: string
        }
        Update: {
          brand_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_brands_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_default: boolean | null
          product_id: string | null
          storage_path: string
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          product_id?: string | null
          storage_path: string
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          product_id?: string | null
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          brand_picture: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          id: string
          images: Json | null
          is_public: boolean | null
          kcal: number
          name: Json
          picture: number | null
          protein: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          brand_picture?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          id?: string
          images?: Json | null
          is_public?: boolean | null
          kcal: number
          name: Json
          picture?: number | null
          protein?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          brand_picture?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          id?: string
          images?: Json | null
          is_public?: boolean | null
          kcal?: number
          name?: Json
          picture?: number | null
          protein?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          checked: boolean | null
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          shopping_list_id: string
          unit: string
        }
        Insert: {
          checked?: boolean | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity: number
          shopping_list_id: string
          unit: string
        }
        Update: {
          checked?: boolean | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          shopping_list_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paypal_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id?: string | null
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: Json
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: Json
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: Json
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          provider_transaction_id: string
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          provider_transaction_id: string
          status: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          provider_transaction_id?: string
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_group_members: {
        Row: {
          created_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          birthday: string | null
          created_at: string
          display_name: string | null
          email: string
          extra_data_complete: boolean | null
          genre: Database["public"]["Enums"]["gender_enum"] | null
          height: number | null
          id: string
          locale: string | null
          objective: Database["public"]["Enums"]["objective_enum"] | null
          phone: string | null
          preferences: Json | null
          push_token: string | null
          recommended_kcal_intake: number | null
          role: string | null
          tmb: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          extra_data_complete?: boolean | null
          genre?: Database["public"]["Enums"]["gender_enum"] | null
          height?: number | null
          id: string
          locale?: string | null
          objective?: Database["public"]["Enums"]["objective_enum"] | null
          phone?: string | null
          preferences?: Json | null
          push_token?: string | null
          recommended_kcal_intake?: number | null
          role?: string | null
          tmb?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          extra_data_complete?: boolean | null
          genre?: Database["public"]["Enums"]["gender_enum"] | null
          height?: number | null
          id?: string
          locale?: string | null
          objective?: Database["public"]["Enums"]["objective_enum"] | null
          phone?: string | null
          preferences?: Json | null
          push_token?: string | null
          recommended_kcal_intake?: number | null
          role?: string | null
          tmb?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      gender_enum: "male" | "female" | "other"
      notification_channel_enum: "app" | "push" | "email" | "sms"
      notification_status_enum: "pending" | "sent" | "read" | "failed"
      objective_enum: "lose_weight" | "gain_muscle" | "maintain"
      subscription_status_enum:
        | "active"
        | "canceled"
        | "incomplete"
        | "past_due"
        | "trialing"
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
    Enums: {
      gender_enum: ["male", "female", "other"],
      notification_channel_enum: ["app", "push", "email", "sms"],
      notification_status_enum: ["pending", "sent", "read", "failed"],
      objective_enum: ["lose_weight", "gain_muscle", "maintain"],
      subscription_status_enum: [
        "active",
        "canceled",
        "incomplete",
        "past_due",
        "trialing",
      ],
    },
  },
} as const

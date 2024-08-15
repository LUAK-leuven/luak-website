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
      Memberships: {
        Row: {
          created_at: string
          id: string
          kbf_uiaa_member: Database["public"]["Enums"]["kbf_uiaa"]
          sportscard: boolean
          student: Database["public"]["Enums"]["student"]
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          kbf_uiaa_member: Database["public"]["Enums"]["kbf_uiaa"]
          sportscard: boolean
          student: Database["public"]["Enums"]["student"]
          user_id?: string
          year?: number
        }
        Update: {
          created_at?: string
          id?: string
          kbf_uiaa_member?: Database["public"]["Enums"]["kbf_uiaa"]
          sportscard?: boolean
          student?: Database["public"]["Enums"]["student"]
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "Memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Payments: {
        Row: {
          amount: number | null
          approved: boolean
          created_at: string
          id: string
          membership_id: string | null
        }
        Insert: {
          amount?: number | null
          approved: boolean
          created_at?: string
          id: string
          membership_id?: string | null
        }
        Update: {
          amount?: number | null
          approved?: boolean
          created_at?: string
          id?: string
          membership_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "Memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      Users: {
        Row: {
          created_at: string
          first_name: string
          has_newsletter: boolean
          has_whatsapp: boolean
          id: string
          is_board_member: boolean
          last_name: string
          phone_number: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          has_newsletter?: boolean
          has_whatsapp?: boolean
          id?: string
          is_board_member?: boolean
          last_name: string
          phone_number?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          has_newsletter?: boolean
          has_whatsapp?: boolean
          id?: string
          is_board_member?: boolean
          last_name?: string
          phone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_luak_year: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_membership: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      kbf_uiaa: "not" | "kbf_luak" | "kbf_other" | "uiaa"
      student: "student_kul" | "phd_kul" | "student_other" | "not_student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

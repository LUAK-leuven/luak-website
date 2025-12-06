export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      BoardMembers: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'BoardMembers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'Users';
            referencedColumns: ['id'];
          },
        ];
      };
      GearCategories: {
        Row: {
          deposit_fee: number;
          id: string;
          lifespan: number;
          name: string;
        };
        Insert: {
          deposit_fee: number;
          id?: string;
          lifespan: number;
          name: string;
        };
        Update: {
          deposit_fee?: number;
          id?: string;
          lifespan?: number;
          name?: string;
        };
        Relationships: [];
      };
      GearInventory: {
        Row: {
          amount: number;
          created_at: string;
          details: string;
          gear_item_id: string;
          id: string;
          production_date: string | null;
          purchase_date: string | null;
          status: Database['public']['Enums']['gear_status'];
        };
        Insert: {
          amount: number;
          created_at?: string;
          details?: string;
          gear_item_id: string;
          id?: string;
          production_date?: string | null;
          purchase_date?: string | null;
          status: Database['public']['Enums']['gear_status'];
        };
        Update: {
          amount?: number;
          created_at?: string;
          details?: string;
          gear_item_id?: string;
          id?: string;
          production_date?: string | null;
          purchase_date?: string | null;
          status?: Database['public']['Enums']['gear_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'GearInventory_gear_item_id_fkey';
            columns: ['gear_item_id'];
            isOneToOne: false;
            referencedRelation: 'GearItems';
            referencedColumns: ['id'];
          },
        ];
      };
      GearItems: {
        Row: {
          gear_category_id: string;
          id: string;
          name: string;
        };
        Insert: {
          gear_category_id: string;
          id?: string;
          name: string;
        };
        Update: {
          gear_category_id?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'GearItems_gear_category_id_fkey';
            columns: ['gear_category_id'];
            isOneToOne: false;
            referencedRelation: 'GearCategories';
            referencedColumns: ['id'];
          },
        ];
      };
      GearLogs: {
        Row: {
          comment: string;
          created_at: string;
          gear_inventory_id: string;
          id: string;
        };
        Insert: {
          comment?: string;
          created_at?: string;
          gear_inventory_id: string;
          id?: string;
        };
        Update: {
          comment?: string;
          created_at?: string;
          gear_inventory_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'GearLogs_gear_inventory_id_fkey';
            columns: ['gear_inventory_id'];
            isOneToOne: false;
            referencedRelation: 'GearInventory';
            referencedColumns: ['id'];
          },
        ];
      };
      Memberships: {
        Row: {
          created_at: string;
          id: string;
          kbf_uiaa_member: Database['public']['Enums']['kbf_uiaa'];
          sportscard: boolean;
          student: Database['public']['Enums']['student'];
          user_id: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kbf_uiaa_member: Database['public']['Enums']['kbf_uiaa'];
          sportscard: boolean;
          student: Database['public']['Enums']['student'];
          user_id?: string;
          year?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          kbf_uiaa_member?: Database['public']['Enums']['kbf_uiaa'];
          sportscard?: boolean;
          student?: Database['public']['Enums']['student'];
          user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'Memberships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'Users';
            referencedColumns: ['id'];
          },
        ];
      };
      Payments: {
        Row: {
          amount: number | null;
          approved: boolean;
          created_at: string;
          id: string;
          membership_id: string;
        };
        Insert: {
          amount?: number | null;
          approved: boolean;
          created_at?: string;
          id: string;
          membership_id: string;
        };
        Update: {
          amount?: number | null;
          approved?: boolean;
          created_at?: string;
          id?: string;
          membership_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'Payments_membership_id_fkey';
            columns: ['membership_id'];
            isOneToOne: false;
            referencedRelation: 'Memberships';
            referencedColumns: ['id'];
          },
        ];
      };
      Rentals: {
        Row: {
          board_member_id: string;
          contact_info: string | null;
          created_at: string;
          date_borrow: string;
          date_return: string;
          deposit: number;
          id: string;
          member_id: string | null;
          payment_method: Database['public']['Enums']['payment_method'];
          status: Database['public']['Enums']['rental_status'];
        };
        Insert: {
          board_member_id?: string;
          contact_info?: string | null;
          created_at?: string;
          date_borrow: string;
          date_return: string;
          deposit: number;
          id?: string;
          member_id?: string | null;
          payment_method: Database['public']['Enums']['payment_method'];
          status?: Database['public']['Enums']['rental_status'];
        };
        Update: {
          board_member_id?: string;
          contact_info?: string | null;
          created_at?: string;
          date_borrow?: string;
          date_return?: string;
          deposit?: number;
          id?: string;
          member_id?: string | null;
          payment_method?: Database['public']['Enums']['payment_method'];
          status?: Database['public']['Enums']['rental_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'Rentals_board_member_id_fkey';
            columns: ['board_member_id'];
            isOneToOne: false;
            referencedRelation: 'Users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'Rentals_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'Users';
            referencedColumns: ['id'];
          },
        ];
      };
      RentedGear: {
        Row: {
          actual_amount: number;
          gear_item_id: string;
          id: string;
          last_edited_date: string;
          rental_id: string;
          rented_amount: number;
        };
        Insert: {
          actual_amount: number;
          gear_item_id: string;
          id?: string;
          last_edited_date?: string;
          rental_id: string;
          rented_amount: number;
        };
        Update: {
          actual_amount?: number;
          gear_item_id?: string;
          id?: string;
          last_edited_date?: string;
          rental_id?: string;
          rented_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'RentedGear_gear_item_id_fkey';
            columns: ['gear_item_id'];
            isOneToOne: false;
            referencedRelation: 'GearItems';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'RentedGear_rental_id_fkey';
            columns: ['rental_id'];
            isOneToOne: false;
            referencedRelation: 'Rentals';
            referencedColumns: ['id'];
          },
        ];
      };
      RentedTopos: {
        Row: {
          actual_amount: number;
          id: string;
          last_edited_date: string;
          rental_id: string;
          rented_amount: number;
          topo_id: string;
        };
        Insert: {
          actual_amount: number;
          id?: string;
          last_edited_date?: string;
          rental_id: string;
          rented_amount: number;
          topo_id: string;
        };
        Update: {
          actual_amount?: number;
          id?: string;
          last_edited_date?: string;
          rental_id?: string;
          rented_amount?: number;
          topo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'RentedTopos_rental_id_fkey';
            columns: ['rental_id'];
            isOneToOne: false;
            referencedRelation: 'Rentals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'RentedTopos_topo_id_fkey';
            columns: ['topo_id'];
            isOneToOne: false;
            referencedRelation: 'Topos';
            referencedColumns: ['id'];
          },
        ];
      };
      Topos: {
        Row: {
          amount: number;
          authors: string[] | null;
          condition: Database['public']['Enums']['topo_condition'];
          countries: string[] | null;
          details: string | null;
          id: string;
          languages: string[] | null;
          place_in_library: string;
          tags: string[] | null;
          title: string;
          type_of_climbing: string[] | null;
          year_published: number | null;
        };
        Insert: {
          amount: number;
          authors?: string[] | null;
          condition: Database['public']['Enums']['topo_condition'];
          countries?: string[] | null;
          details?: string | null;
          id?: string;
          languages?: string[] | null;
          place_in_library: string;
          tags?: string[] | null;
          title: string;
          type_of_climbing?: string[] | null;
          year_published?: number | null;
        };
        Update: {
          amount?: number;
          authors?: string[] | null;
          condition?: Database['public']['Enums']['topo_condition'];
          countries?: string[] | null;
          details?: string | null;
          id?: string;
          languages?: string[] | null;
          place_in_library?: string;
          tags?: string[] | null;
          title?: string;
          type_of_climbing?: string[] | null;
          year_published?: number | null;
        };
        Relationships: [];
      };
      Users: {
        Row: {
          created_at: string;
          email: string;
          first_name: string;
          has_newsletter: boolean;
          has_whatsapp: boolean;
          id: string;
          last_name: string;
          phone_number: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          first_name: string;
          has_newsletter?: boolean;
          has_whatsapp?: boolean;
          id?: string;
          last_name: string;
          phone_number?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          first_name?: string;
          has_newsletter?: boolean;
          has_whatsapp?: boolean;
          id?: string;
          last_name?: string;
          phone_number?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_rental: {
        Args: {
          p_board_member_id: string;
          p_contact_info: Json;
          p_date_borrow: string;
          p_date_return: string;
          p_deposit: number;
          p_gear: Json;
          p_member_id: string;
          p_payment_method: Database['public']['Enums']['payment_method'];
          p_status: Database['public']['Enums']['rental_status'];
          p_topos: Json;
        };
        Returns: string;
      };
      get_luak_year: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      has_membership: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_rental: {
        Args: {
          p_date_return: string;
          p_deposit_fee: number;
          p_gear: Json;
          p_rental_id: string;
          p_status: Database['public']['Enums']['rental_status'];
          p_topos: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      gear_status: 'available' | 'archived';
      kbf_uiaa: 'not' | 'kbf_luak' | 'kbf_other' | 'uiaa';
      payment_method: 'cash' | 'transfer';
      rental_status: 'returned' | 'partially_returned' | 'not_returned';
      student: 'student_kul' | 'phd_kul' | 'student_other' | 'not_student';
      topo_condition: 'as_good_as_new' | 'good' | 'used' | 'damaged';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      iceberg_namespaces: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_namespaces_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
        ];
      };
      iceberg_tables: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          location?: string;
          name?: string;
          namespace_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_tables_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'iceberg_tables_namespace_id_fkey';
            columns: ['namespace_id'];
            isOneToOne: false;
            referencedRelation: 'iceberg_namespaces';
            referencedColumns: ['id'];
          },
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prefixes_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: {
        Args: { name: string };
        Returns: string;
      };
      filename: {
        Args: { name: string };
        Returns: string;
      };
      foldername: {
        Args: { name: string };
        Returns: string[];
      };
      get_level: {
        Args: { name: string };
        Returns: number;
      };
      get_prefix: {
        Args: { name: string };
        Returns: string;
      };
      get_prefixes: {
        Args: { name: string };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      gear_status: ['available', 'archived'],
      kbf_uiaa: ['not', 'kbf_luak', 'kbf_other', 'uiaa'],
      payment_method: ['cash', 'transfer'],
      rental_status: ['returned', 'partially_returned', 'not_returned'],
      student: ['student_kul', 'phd_kul', 'student_other', 'not_student'],
      topo_condition: ['as_good_as_new', 'good', 'used', 'damaged'],
    },
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS'],
    },
  },
} as const;

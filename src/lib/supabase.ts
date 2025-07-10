import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your-supabase-project-url' || !supabaseUrl.startsWith('https://')) {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_URL environment variable. ' +
    'Please set it to your actual Supabase project URL in the .env file. ' +
    'Example: https://your-project.supabase.co'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please set it to your actual Supabase anonymous key in the .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      academic_years: {
        Row: {
          id: string;
          year: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          year?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          settings?: any;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'teacher' | 'viewer';
          registration_number?: string;
          phone?: string;
          subjects?: string[];
          password_hash?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'teacher' | 'viewer';
          registration_number?: string;
          phone?: string;
          subjects?: string[];
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'teacher' | 'viewer';
          registration_number?: string;
          phone?: string;
          subjects?: string[];
          password_hash?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          weekly_hours: number;
          color: string;
          description?: string;
          requires_special_room: boolean;
          special_room_type?: string;
          allows_double_classes: boolean;
          cognitive_load: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          weekly_hours: number;
          color: string;
          description?: string;
          requires_special_room?: boolean;
          special_room_type?: string;
          allows_double_classes?: boolean;
          cognitive_load?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          weekly_hours?: number;
          color?: string;
          description?: string;
          requires_special_room?: boolean;
          special_room_type?: string;
          allows_double_classes?: boolean;
          cognitive_load?: 'low' | 'medium' | 'high';
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          grade: string;
          grade_id: string;
          segment_id: string;
          identifier: string;
          shift: 'morning' | 'afternoon' | 'full';
          students_count: number;
          academic_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          grade: string;
          grade_id: string;
          segment_id: string;
          identifier: string;
          shift: 'morning' | 'afternoon' | 'full';
          students_count: number;
          academic_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          grade?: string;
          grade_id?: string;
          segment_id?: string;
          identifier?: string;
          shift?: 'morning' | 'afternoon' | 'full';
          students_count?: number;
          academic_year?: string;
          updated_at?: string;
        };
      };
      classrooms: {
        Row: {
          id: string;
          name: string;
          capacity: number;
          resources: string[];
          floor?: string;
          building?: string;
          type: string;
          is_special_room: boolean;
          equipments: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          capacity: number;
          resources?: string[];
          floor?: string;
          building?: string;
          type?: string;
          is_special_room?: boolean;
          equipments?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          capacity?: number;
          resources?: string[];
          floor?: string;
          building?: string;
          type?: string;
          is_special_room?: boolean;
          equipments?: string[];
          updated_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          shift: 'morning' | 'afternoon' | 'full';
          order: number;
          label: string;
          is_break: boolean;
          academic_year: string;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          shift: 'morning' | 'afternoon' | 'full';
          order: number;
          label: string;
          is_break?: boolean;
          academic_year: string;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          shift?: 'morning' | 'afternoon' | 'full';
          order?: number;
          label?: string;
          is_break?: boolean;
          academic_year?: string;
          duration?: number;
          updated_at?: string;
        };
      };
      class_subjects: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id?: string;
          weekly_hours: number;
          weekly_classes: number;
          academic_year: string;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id?: string;
          weekly_hours: number;
          weekly_classes: number;
          academic_year: string;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          weekly_hours?: number;
          weekly_classes?: number;
          academic_year?: string;
          priority?: number;
          updated_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          classroom_id: string;
          time_slot_id: string;
          day_of_week: number;
          academic_year: string;
          status: 'active' | 'pending' | 'conflict' | 'locked';
          is_double_class: boolean;
          priority: number;
          generated_by: 'automatic' | 'manual';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          classroom_id: string;
          time_slot_id: string;
          day_of_week: number;
          academic_year: string;
          status?: 'active' | 'pending' | 'conflict' | 'locked';
          is_double_class?: boolean;
          priority?: number;
          generated_by?: 'automatic' | 'manual';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          subject_id?: string;
          class_id?: string;
          classroom_id?: string;
          time_slot_id?: string;
          day_of_week?: number;
          academic_year?: string;
          status?: 'active' | 'pending' | 'conflict' | 'locked';
          is_double_class?: boolean;
          priority?: number;
          generated_by?: 'automatic' | 'manual';
          notes?: string;
          updated_at?: string;
        };
      };
      segments: {
        Row: {
          id: string;
          name: string;
          description?: string;
          grades: string[];
          default_shift: 'morning' | 'afternoon' | 'full';
          academic_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          grades: string[];
          default_shift: 'morning' | 'afternoon' | 'full';
          academic_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          grades?: string[];
          default_shift?: 'morning' | 'afternoon' | 'full';
          academic_year?: string;
          updated_at?: string;
        };
      };
      teacher_restrictions: {
        Row: {
          id: string;
          teacher_id: string;
          type: 'unavailable_day' | 'unavailable_time' | 'unavailable_period';
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          reason?: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          type: 'unavailable_day' | 'unavailable_time' | 'unavailable_period';
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          reason?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          type?: 'unavailable_day' | 'unavailable_time' | 'unavailable_period';
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          reason?: string;
          is_active?: boolean;
        };
      };
      teacher_preferences: {
        Row: {
          id: string;
          teacher_id: string;
          type: 'avoid_first_period' | 'avoid_last_period' | 'prefer_grouped_classes' | 'prefer_specific_days';
          priority: 'low' | 'medium' | 'high';
          value?: string;
          description?: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          type: 'avoid_first_period' | 'avoid_last_period' | 'prefer_grouped_classes' | 'prefer_specific_days';
          priority: 'low' | 'medium' | 'high';
          value?: string;
          description?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          type?: 'avoid_first_period' | 'avoid_last_period' | 'prefer_grouped_classes' | 'prefer_specific_days';
          priority?: 'low' | 'medium' | 'high';
          value?: string;
          description?: string;
        };
      };
    };
  };
}
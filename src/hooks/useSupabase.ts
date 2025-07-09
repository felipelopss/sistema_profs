import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  AcademicYear, 
  User, 
  Subject, 
  Class, 
  Classroom, 
  TimeSlot, 
  ClassSubject, 
  Schedule, 
  Segment,
  TeacherRestriction,
  TeacherPreference
} from '../types';

// Hook para gerenciar dados com Supabase
export function useSupabaseData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para cada entidade
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [teacherRestrictions, setTeacherRestrictions] = useState<TeacherRestriction[]>([]);
  const [teacherPreferences, setTeacherPreferences] = useState<TeacherPreference[]>([]);

  // Função para converter dados do Supabase para o formato da aplicação
  const convertFromSupabase = {
    academicYear: (row: any): AcademicYear => ({
      id: row.id,
      year: row.year,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      isActive: row.is_active,
      settings: row.settings || {
        maxConsecutiveClasses: 3,
        preferGroupedClasses: true,
        avoidGaps: true,
        balanceWorkload: true,
        distributeCognitiveLoad: true,
        allowDoubleClasses: true,
        breakDuration: 20,
        maxDailyHours: 8
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    user: (row: any): User => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      registrationNumber: row.registration_number,
      phone: row.phone,
      subjects: row.subjects || [],
      password: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    subject: (row: any): Subject => ({
      id: row.id,
      name: row.name,
      code: row.code,
      weeklyHours: row.weekly_hours,
      color: row.color,
      description: row.description,
      requiresSpecialRoom: row.requires_special_room,
      specialRoomType: row.special_room_type,
      allowsDoubleClasses: row.allows_double_classes,
      cognitiveLoad: row.cognitive_load || 'medium',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    class: (row: any): Class => ({
      id: row.id,
      name: row.name,
      grade: row.grade,
      gradeId: row.grade_id,
      segmentId: row.segment_id,
      identifier: row.identifier,
      shift: row.shift,
      studentsCount: row.students_count,
      academicYear: row.academic_year,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    classroom: (row: any): Classroom => ({
      id: row.id,
      name: row.name,
      capacity: row.capacity,
      resources: row.resources || [],
      floor: row.floor,
      building: row.building,
      type: row.type || 'regular',
      isSpecialRoom: row.is_special_room,
      equipments: row.equipments || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    timeSlot: (row: any): TimeSlot => ({
      id: row.id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      shift: row.shift,
      order: row.order,
      label: row.label,
      isBreak: row.is_break,
      academicYear: row.academic_year,
      duration: row.duration || 50,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    classSubject: (row: any): ClassSubject => ({
      id: row.id,
      classId: row.class_id,
      subjectId: row.subject_id,
      teacherId: row.teacher_id,
      weeklyHours: row.weekly_hours,
      weeklyClasses: row.weekly_classes,
      academicYear: row.academic_year,
      priority: row.priority || 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    schedule: (row: any): Schedule => ({
      id: row.id,
      teacherId: row.teacher_id,
      subjectId: row.subject_id,
      classId: row.class_id,
      classroomId: row.classroom_id,
      timeSlotId: row.time_slot_id,
      dayOfWeek: row.day_of_week,
      academicYear: row.academic_year,
      status: row.status,
      isDoubleClass: row.is_double_class,
      priority: row.priority || 1,
      generatedBy: row.generated_by,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    segment: (row: any): Segment => ({
      id: row.id,
      name: row.name,
      description: row.description,
      grades: row.grades || [],
      defaultShift: row.default_shift,
      academicYear: row.academic_year,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }),

    teacherRestriction: (row: any): TeacherRestriction => ({
      id: row.id,
      teacherId: row.teacher_id,
      type: row.type,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      reason: row.reason,
      isActive: row.is_active
    }),

    teacherPreference: (row: any): TeacherPreference => ({
      id: row.id,
      teacherId: row.teacher_id,
      type: row.type,
      priority: row.priority,
      value: row.value,
      description: row.description
    })
  };

  // Função para converter dados da aplicação para o formato do Supabase
  const convertToSupabase = {
    academicYear: (data: Partial<AcademicYear>) => ({
      year: data.year,
      start_date: data.startDate?.toISOString(),
      end_date: data.endDate?.toISOString(),
      is_active: data.isActive,
      settings: data.settings,
      updated_at: new Date().toISOString()
    }),

    user: (data: Partial<User>) => ({
      name: data.name,
      email: data.email,
      role: data.role,
      registration_number: data.registrationNumber,
      phone: data.phone,
      subjects: data.subjects,
      password_hash: data.password,
      updated_at: new Date().toISOString()
    }),

    subject: (data: Partial<Subject>) => ({
      name: data.name,
      code: data.code,
      weekly_hours: data.weeklyHours,
      color: data.color,
      description: data.description,
      requires_special_room: data.requiresSpecialRoom,
      special_room_type: data.specialRoomType,
      allows_double_classes: data.allowsDoubleClasses,
      cognitive_load: data.cognitiveLoad,
      updated_at: new Date().toISOString()
    }),

    class: (data: Partial<Class>) => ({
      name: data.name,
      grade: data.grade,
      grade_id: data.gradeId || '',
      segment_id: data.segmentId || '',
      identifier: data.identifier,
      shift: data.shift,
      students_count: data.studentsCount,
      academic_year: data.academicYear,
      updated_at: new Date().toISOString()
    }),

    classroom: (data: Partial<Classroom>) => ({
      name: data.name,
      capacity: data.capacity,
      resources: data.resources,
      floor: data.floor,
      building: data.building,
      type: data.type,
      is_special_room: data.isSpecialRoom,
      equipments: data.equipments,
      updated_at: new Date().toISOString()
    }),

    timeSlot: (data: Partial<TimeSlot>) => ({
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
      shift: data.shift,
      order: data.order,
      label: data.label,
      is_break: data.isBreak,
      academic_year: data.academicYear,
      duration: data.duration,
      updated_at: new Date().toISOString()
    }),

    classSubject: (data: Partial<ClassSubject>) => ({
      class_id: data.classId,
      subject_id: data.subjectId,
      teacher_id: data.teacherId,
      weekly_hours: data.weeklyHours,
      weekly_classes: data.weeklyClasses,
      academic_year: data.academicYear,
      priority: data.priority,
      updated_at: new Date().toISOString()
    }),

    schedule: (data: Partial<Schedule>) => ({
      teacher_id: data.teacherId,
      subject_id: data.subjectId,
      class_id: data.classId,
      classroom_id: data.classroomId,
      time_slot_id: data.timeSlotId,
      day_of_week: data.dayOfWeek,
      academic_year: data.academicYear,
      status: data.status,
      is_double_class: data.isDoubleClass,
      priority: data.priority,
      generated_by: data.generatedBy,
      notes: data.notes,
      updated_at: new Date().toISOString()
    }),

    segment: (data: Partial<Segment>) => ({
      name: data.name,
      description: data.description,
      grades: data.grades,
      default_shift: data.defaultShift,
      academic_year: data.academicYear,
      updated_at: new Date().toISOString()
    }),

    teacherRestriction: (data: Partial<TeacherRestriction>) => ({
      teacher_id: data.teacherId,
      type: data.type,
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
      reason: data.reason,
      is_active: data.isActive
    }),

    teacherPreference: (data: Partial<TeacherPreference>) => ({
      teacher_id: data.teacherId,
      type: data.type,
      priority: data.priority,
      value: data.value,
      description: data.description
    })
  };

  // Carregar todos os dados iniciais
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [
        academicYearsResult,
        usersResult,
        subjectsResult,
        classesResult,
        classroomsResult,
        timeSlotsResult,
        classSubjectsResult,
        schedulesResult,
        segmentsResult,
        teacherRestrictionsResult,
        teacherPreferencesResult
      ] = await Promise.all([
        supabase.from('academic_years').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('classes').select('*').order('name'),
        supabase.from('classrooms').select('*').order('name'),
        supabase.from('time_slots').select('*').order('day_of_week, order'),
        supabase.from('class_subjects').select('*'),
        supabase.from('schedules').select('*'),
        supabase.from('segments').select('*').order('name'),
        supabase.from('teacher_restrictions').select('*'),
        supabase.from('teacher_preferences').select('*')
      ]);

      // Verificar erros
      const results = [
        academicYearsResult,
        usersResult,
        subjectsResult,
        classesResult,
        classroomsResult,
        timeSlotsResult,
        classSubjectsResult,
        schedulesResult,
        segmentsResult,
        teacherRestrictionsResult,
        teacherPreferencesResult
      ];

      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      // Converter e definir dados
      setAcademicYears(academicYearsResult.data?.map(convertFromSupabase.academicYear) || []);
      setUsers(usersResult.data?.map(convertFromSupabase.user) || []);
      setSubjects(subjectsResult.data?.map(convertFromSupabase.subject) || []);
      setClasses(classesResult.data?.map(convertFromSupabase.class) || []);
      setClassrooms(classroomsResult.data?.map(convertFromSupabase.classroom) || []);
      setTimeSlots(timeSlotsResult.data?.map(convertFromSupabase.timeSlot) || []);
      setClassSubjects(classSubjectsResult.data?.map(convertFromSupabase.classSubject) || []);
      setSchedules(schedulesResult.data?.map(convertFromSupabase.schedule) || []);
      setSegments(segmentsResult.data?.map(convertFromSupabase.segment) || []);
      setTeacherRestrictions(teacherRestrictionsResult.data?.map(convertFromSupabase.teacherRestriction) || []);
      setTeacherPreferences(teacherPreferencesResult.data?.map(convertFromSupabase.teacherPreference) || []);

      console.log('✅ Dados carregados do Supabase com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Supabase:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadAllData();
  }, []);

  // Funções CRUD genéricas
  const createRecord = async (table: string, data: any, converter: any) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(converter(data))
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Erro ao criar registro em ${table}:`, error);
      throw error;
    }
  };

  const updateRecord = async (table: string, id: string, data: any, converter: any) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(converter(data))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar registro em ${table}:`, error);
      throw error;
    }
  };

  const deleteRecord = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao deletar registro em ${table}:`, error);
      throw error;
    }
  };

  return {
    // Estados
    isLoading,
    error,
    academicYears,
    users,
    subjects,
    classes,
    classrooms,
    timeSlots,
    classSubjects,
    schedules,
    segments,
    teacherRestrictions,
    teacherPreferences,

    // Funções
    loadAllData,
    createRecord,
    updateRecord,
    deleteRecord,
    convertFromSupabase,
    convertToSupabase,

    // Estados setters (para atualizações locais)
    setAcademicYears,
    setUsers,
    setSubjects,
    setClasses,
    setClassrooms,
    setTimeSlots,
    setClassSubjects,
    setSchedules,
    setSegments,
    setTeacherRestrictions,
    setTeacherPreferences
  };
}
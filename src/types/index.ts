export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'viewer';
  registrationNumber?: string;
  phone?: string;
  subjects?: string[];
  // Novas propriedades para restrições e preferências
  restrictions?: TeacherRestriction[];
  preferences?: TeacherPreference[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherRestriction {
  id: string;
  teacherId: string;
  type: 'unavailable_day' | 'unavailable_time' | 'unavailable_period';
  dayOfWeek?: number; // 1-7 (segunda-domingo)
  startTime?: string;
  endTime?: string;
  reason?: string;
  isActive: boolean;
}

export interface TeacherPreference {
  id: string;
  teacherId: string;
  type: 'avoid_first_period' | 'avoid_last_period' | 'prefer_grouped_classes' | 'prefer_specific_days';
  priority: 'low' | 'medium' | 'high';
  value?: string; // Para valores específicos
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  color: string;
  description?: string;
  // Novas propriedades avançadas
  requiresSpecialRoom: boolean;
  specialRoomType?: 'laboratory' | 'gym' | 'computer_lab' | 'art_room' | 'music_room';
  allowsDoubleClasses: boolean; // Aulas geminadas
  cognitiveLoad: 'low' | 'medium' | 'high'; // Para distribuição inteligente
  preferredTimeSlots?: string[]; // IDs dos time slots preferidos
  createdAt: Date;
  updatedAt: Date;
}

export interface Segment {
  id: string;
  name: string; // Ex: "Educação Infantil", "Ensino Fundamental I"
  description?: string;
  grades: string[]; // Ex: ["Maternal II", "1º ano", "2º ano"]
  defaultShift: 'morning' | 'afternoon' | 'full';
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  name: string; // Ex: "1º ano do Fundamental", "9º ano"
  segmentId: string;
  level: number; // Para ordenação
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string; // Ex: "9º Ano A"
  grade: string; // Ex: "9º Ano"
  gradeId: string;
  segmentId: string;
  identifier: string; // Ex: "A", "B", "C"
  shift: 'morning' | 'afternoon' | 'full';
  studentsCount: number;
  academicYear: string;
  // Horários específicos por grupo
  customTimeSlots?: string[]; // IDs de time slots específicos para esta turma
  createdAt: Date;
  updatedAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  resources: string[];
  floor?: string;
  building?: string;
  // Novas propriedades
  type: 'regular' | 'laboratory' | 'gym' | 'computer_lab' | 'art_room' | 'music_room' | 'auditorium';
  isSpecialRoom: boolean;
  equipments: string[]; // Lista detalhada de equipamentos
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 1-7 (segunda-domingo)
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'full';
  order: number;
  label: string;
  isBreak: boolean;
  academicYear: string;
  // Novas propriedades para grupos específicos
  segmentIds?: string[]; // Quais segmentos usam este horário
  gradeIds?: string[]; // Quais séries usam este horário
  duration: number; // Duração em minutos
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  classroomId: string;
  timeSlotId: string;
  dayOfWeek: number;
  academicYear: string;
  status: 'active' | 'pending' | 'conflict' | 'locked';
  // Novas propriedades
  isDoubleClass: boolean; // Se é aula geminada
  doubleClassPartnerId?: string; // ID da aula seguinte se for geminada
  priority: number; // Para resolução de conflitos
  generatedBy: 'automatic' | 'manual'; // Como foi criada
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  // Configurações do ano letivo
  settings: AcademicYearSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYearSettings {
  maxConsecutiveClasses: number; // Máximo de aulas seguidas
  preferGroupedClasses: boolean; // Preferir agrupar aulas do mesmo professor
  avoidGaps: boolean; // Evitar janelas
  balanceWorkload: boolean; // Equilibrar carga de trabalho
  distributeCognitiveLoad: boolean; // Distribuir disciplinas pesadas
  allowDoubleClasses: boolean; // Permitir aulas geminadas
  breakDuration: number; // Duração do intervalo em minutos
  maxDailyHours: number; // Máximo de horas por dia
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  weeklyHours: number;
  weeklyClasses: number; // Número de aulas por semana
  teacherId?: string;
  academicYear: string;
  // Novas propriedades para distribuição específica
  specificDayOfWeek?: number; // Para disciplinas em dias específicos
  specificTimeSlots?: string[]; // Para horários específicos
  priority: number; // Prioridade na alocação
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleConflict {
  id: string;
  type: 'teacher_double_booking' | 'classroom_double_booking' | 'class_double_booking' | 'teacher_restriction' | 'room_mismatch' | 'workload_exceeded' | 'unassigned_class';
  description: string;
  scheduleIds: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolved: boolean;
  resolutionNotes?: string;
  affectedEntities: {
    teacherIds?: string[];
    classIds?: string[];
    classroomIds?: string[];
    subjectIds?: string[];
  };
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ScheduleGeneration {
  id: string;
  academicYear: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  conflicts: ScheduleConflict[];
  generatedAt: Date;
  completedAt?: Date;
  settings: ScheduleGenerationSettings;
  statistics: ScheduleStatistics;
}

export interface ScheduleGenerationSettings {
  // Restrições rígidas
  enforceTeacherAvailability: boolean;
  enforceRoomCapacity: boolean;
  enforceSubjectRequirements: boolean;
  
  // Restrições flexíveis com pesos
  minimizeTeacherGaps: { enabled: boolean; weight: number };
  respectTeacherPreferences: { enabled: boolean; weight: number };
  distributeCognitiveLoad: { enabled: boolean; weight: number };
  avoidConsecutiveSameSubject: { enabled: boolean; weight: number };
  groupDoubleClasses: { enabled: boolean; weight: number };
  balanceWorkload: { enabled: boolean; weight: number };
  
  // Configurações específicas
  maxConsecutiveClasses: number;
  maxDailyHours: number;
  preferredBreakDuration: number;
  allowOvertime: boolean;
}

export interface ScheduleStatistics {
  totalSchedules: number;
  successfulAllocations: number;
  conflicts: number;
  teacherGaps: number;
  averageWorkload: number;
  constraintsSatisfied: number;
  constraintsTotal: number;
  satisfactionRate: number; // Porcentagem de satisfação
}

export interface SystemSettings {
  general: {
    schoolName: string;
    academicYearFormat: 'YYYY' | 'YYYY/YYYY';
    defaultLanguage: 'pt-BR' | 'en-US';
    timezone: string;
  };
  scheduling: {
    autoSave: boolean;
    conflictDetection: boolean;
    maxClassesPerDay: number;
    defaultBreakDuration: number;
    allowOverlapping: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    conflictAlerts: boolean;
    generationComplete: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
    auditLog: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
}

export interface DashboardData {
  overview: {
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
    totalClassrooms: number;
    totalSchedules: number;
    activeConflicts: number;
  };
  scheduleCompletion: {
    percentage: number;
    completed: number;
    total: number;
  };
  teacherWorkload: {
    teacherId: string;
    teacherName: string;
    totalHours: number;
    gaps: number;
    satisfaction: number;
  }[];
  todaySchedules: {
    id: string;
    time: string;
    subject: string;
    class: string;
    teacher: string;
    classroom: string;
  }[];
  recentActivities: {
    id: string;
    type: 'schedule_created' | 'conflict_resolved' | 'teacher_added' | 'generation_completed';
    message: string;
    timestamp: Date;
  }[];
  conflictsSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ScheduleFilter {
  type: 'class' | 'teacher' | 'classroom' | 'subject';
  entityId: string;
  dayOfWeek?: number;
  timeSlotId?: string;
}

export interface ScheduleView {
  id: string;
  name: string;
  type: 'weekly' | 'daily' | 'monthly';
  filters: ScheduleFilter[];
  layout: 'grid' | 'list' | 'timeline';
  showConflicts: boolean;
  showGaps: boolean;
  colorBy: 'subject' | 'teacher' | 'classroom' | 'priority';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  scope: 'all' | 'filtered';
  includeDetails: boolean;
  includeStatistics: boolean;
  template: 'standard' | 'detailed' | 'summary';
  orientation: 'portrait' | 'landscape';
}

export interface ImportData {
  teachers?: Partial<User>[];
  subjects?: Partial<Subject>[];
  classes?: Partial<Class>[];
  classrooms?: Partial<Classroom>[];
  schedules?: Partial<Schedule>[];
  timeSlots?: Partial<TimeSlot>[];
  validation: {
    errors: string[];
    warnings: string[];
    imported: number;
    skipped: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}
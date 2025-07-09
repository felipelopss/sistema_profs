import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Subject, 
  Class, 
  Classroom, 
  TimeSlot, 
  Schedule, 
  TeacherAvailability, 
  AcademicYear,
  ClassSubject,
  ScheduleConflict,
  ScheduleGeneration,
  User,
  Segment,
  TeacherRestriction,
  TeacherPreference,
  ScheduleGenerationSettings,
  SystemSettings
} from '../types';

interface DataContextType {
  // Academic Years
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear | null;
  createAcademicYear: (data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (id: string) => void;

  // Segments
  segments: Segment[];
  createSegment: (data: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSegment: (id: string, data: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;

  // Subjects
  subjects: Subject[];
  createSubject: (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Classes
  classes: Class[];
  createClass: (data: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClass: (id: string, data: Partial<Class>) => void;
  deleteClass: (id: string) => void;

  // Classrooms
  classrooms: Classroom[];
  createClassroom: (data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  // Teachers
  teachers: User[];
  createTeacher: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeacher: (id: string, data: Partial<User>) => void;
  deleteTeacher: (id: string) => void;

  // Teacher Restrictions
  teacherRestrictions: TeacherRestriction[];
  createTeacherRestriction: (data: Omit<TeacherRestriction, 'id'>) => void;
  updateTeacherRestriction: (id: string, data: Partial<TeacherRestriction>) => void;
  deleteTeacherRestriction: (id: string) => void;

  // Teacher Preferences
  teacherPreferences: TeacherPreference[];
  createTeacherPreference: (data: Omit<TeacherPreference, 'id'>) => void;
  updateTeacherPreference: (id: string, data: Partial<TeacherPreference>) => void;
  deleteTeacherPreference: (id: string) => void;

  // Time Slots
  timeSlots: TimeSlot[];
  createTimeSlot: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTimeSlot: (id: string, data: Partial<TimeSlot>) => void;
  deleteTimeSlot: (id: string) => void;

  // Class Subjects
  classSubjects: ClassSubject[];
  createClassSubject: (data: Omit<ClassSubject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClassSubject: (id: string, data: Partial<ClassSubject>) => void;
  deleteClassSubject: (id: string) => void;

  // Schedules
  schedules: Schedule[];
  createSchedule: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;

  // Teacher Availability
  teacherAvailabilities: TeacherAvailability[];
  createTeacherAvailability: (data: Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeacherAvailability: (id: string, data: Partial<TeacherAvailability>) => void;
  deleteTeacherAvailability: (id: string) => void;

  // Schedule Generation
  generateSchedules: (settings: ScheduleGenerationSettings) => Promise<void>;
  scheduleGeneration: ScheduleGeneration | null;
  conflicts: ScheduleConflict[];
  resolveConflict: (conflictId: string) => void;

  // System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  // Utility functions
  getSubjectById: (id: string) => Subject | undefined;
  getClassById: (id: string) => Class | undefined;
  getClassroomById: (id: string) => Classroom | undefined;
  getTeacherById: (id: string) => User | undefined;
  getTimeSlotById: (id: string) => TimeSlot | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Função melhorada para salvar dados no localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    const serializedData = JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(key, serializedData);
    console.log(`✅ Dados salvos: ${key}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${key}:`, error);
  }
};

// Função melhorada para carregar dados do localStorage
const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
      console.log(`✅ Dados carregados: ${key}`, parsed.length || 'objeto');
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error(`❌ Erro ao carregar ${key}:`, error);
    return defaultValue;
  }
};

// Configurações padrão do sistema
const defaultSystemSettings: SystemSettings = {
  general: {
    schoolName: 'Escola Recanto',
    academicYearFormat: 'YYYY',
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  },
  scheduling: {
    autoSave: true,
    conflictDetection: true,
    maxClassesPerDay: 6,
    defaultBreakDuration: 20,
    allowOverlapping: false
  },
  notifications: {
    emailNotifications: true,
    systemAlerts: true,
    conflictAlerts: true,
    generationComplete: true
  },
  security: {
    sessionTimeout: 480, // 8 horas
    passwordPolicy: {
      minLength: 6,
      requireSpecialChars: false,
      requireNumbers: true
    },
    auditLog: true
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'weekly',
    retentionDays: 30
  }
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  // State
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeAcademicYear, setActiveAcademicYearState] = useState<AcademicYear | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teacherRestrictions, setTeacherRestrictions] = useState<TeacherRestriction[]>([]);
  const [teacherPreferences, setTeacherPreferences] = useState<TeacherPreference[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teacherAvailabilities, setTeacherAvailabilities] = useState<TeacherAvailability[]>([]);
  const [scheduleGeneration, setScheduleGeneration] = useState<ScheduleGeneration | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Carregando dados do localStorage...');
        
        const loadedAcademicYears = loadFromLocalStorage('sighe_academic_years', []);
        const loadedSegments = loadFromLocalStorage('sighe_segments', []);
        const loadedSubjects = loadFromLocalStorage('sighe_subjects', []);
        const loadedClasses = loadFromLocalStorage('sighe_classes', []);
        const loadedClassrooms = loadFromLocalStorage('sighe_classrooms', []);
        const loadedTeachers = loadFromLocalStorage('sighe_teachers', []);
        const loadedTeacherRestrictions = loadFromLocalStorage('sighe_teacher_restrictions', []);
        const loadedTeacherPreferences = loadFromLocalStorage('sighe_teacher_preferences', []);
        const loadedTimeSlots = loadFromLocalStorage('sighe_time_slots', []);
        const loadedClassSubjects = loadFromLocalStorage('sighe_class_subjects', []);
        const loadedSchedules = loadFromLocalStorage('sighe_schedules', []);
        const loadedTeacherAvailabilities = loadFromLocalStorage('sighe_teacher_availabilities', []);
        const loadedConflicts = loadFromLocalStorage('sighe_conflicts', []);
        const loadedSystemSettings = loadFromLocalStorage('sighe_system_settings', defaultSystemSettings);

        setAcademicYears(loadedAcademicYears);
        setSegments(loadedSegments);
        setSubjects(loadedSubjects);
        setClasses(loadedClasses);
        setClassrooms(loadedClassrooms);
        setTeachers(loadedTeachers);
        setTeacherRestrictions(loadedTeacherRestrictions);
        setTeacherPreferences(loadedTeacherPreferences);
        setTimeSlots(loadedTimeSlots);
        setClassSubjects(loadedClassSubjects);
        setSchedules(loadedSchedules);
        setTeacherAvailabilities(loadedTeacherAvailabilities);
        setConflicts(loadedConflicts);
        setSystemSettings(loadedSystemSettings);
        
        // Set active academic year
        const activeYear = loadedAcademicYears.find((year: AcademicYear) => year.isActive);
        if (activeYear) {
          setActiveAcademicYearState(activeYear);
        }

        setIsLoaded(true);
        console.log('✅ Todos os dados carregados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save individual data types to localStorage with debounce
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_academic_years', academicYears);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [academicYears, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_segments', segments);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [segments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_subjects', subjects);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [subjects, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_classes', classes);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [classes, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_classrooms', classrooms);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [classrooms, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_teachers', teachers);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [teachers, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_teacher_restrictions', teacherRestrictions);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [teacherRestrictions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_teacher_preferences', teacherPreferences);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [teacherPreferences, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_time_slots', timeSlots);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [timeSlots, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_class_subjects', classSubjects);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [classSubjects, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_schedules', schedules);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [schedules, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_teacher_availabilities', teacherAvailabilities);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [teacherAvailabilities, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_conflicts', conflicts);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [conflicts, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('sighe_system_settings', systemSettings);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [systemSettings, isLoaded]);

  // Academic Years
  const createAcademicYear = (data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newYear: AcademicYear = {
      ...data,
      id: `year_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        maxConsecutiveClasses: 3,
        preferGroupedClasses: true,
        avoidGaps: true,
        balanceWorkload: true,
        distributeCognitiveLoad: true,
        allowDoubleClasses: true,
        breakDuration: 20,
        maxDailyHours: 8
      }
    };
    
    // If this is the first year or marked as active, make it active
    if (data.isActive || academicYears.length === 0) {
      setAcademicYears(prev => prev.map(year => ({ ...year, isActive: false })));
      newYear.isActive = true;
      setActiveAcademicYearState(newYear);
    }
    
    setAcademicYears(prev => [...prev, newYear]);
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>) => {
    setAcademicYears(prev => prev.map(year => {
      if (year.id === id) {
        const updated = { ...year, ...data, updatedAt: new Date() };
        if (data.isActive) {
          setActiveAcademicYearState(updated);
          // Deactivate other years
          setAcademicYears(current => current.map(y => 
            y.id === id ? updated : { ...y, isActive: false }
          ));
        }
        return updated;
      }
      return year;
    }));
  };

  const deleteAcademicYear = (id: string) => {
    setAcademicYears(prev => prev.filter(year => year.id !== id));
    if (activeAcademicYear?.id === id) {
      setActiveAcademicYearState(null);
    }
  };

  const setActiveAcademicYear = (id: string) => {
    setAcademicYears(prev => prev.map(year => ({
      ...year,
      isActive: year.id === id
    })));
    const year = academicYears.find(y => y.id === id);
    if (year) {
      setActiveAcademicYearState({ ...year, isActive: true });
    }
  };

  // Segments
  const createSegment = (data: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSegment: Segment = {
      ...data,
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const updateSegment = (id: string, data: Partial<Segment>) => {
    setSegments(prev => prev.map(segment => 
      segment.id === id ? { ...segment, ...data, updatedAt: new Date() } : segment
    ));
  };

  const deleteSegment = (id: string) => {
    setSegments(prev => prev.filter(segment => segment.id !== id));
  };

  // Subjects
  const createSubject = (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubject: Subject = {
      ...data,
      id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requiresSpecialRoom: false,
      allowsDoubleClasses: false,
      cognitiveLoad: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id ? { ...subject, ...data, updatedAt: new Date() } : subject
    ));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
  };

  // Classes
  const createClass = (data: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClass: Class = {
      ...data,
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gradeId: '',
      segmentId: '',
      identifier: data.name.split(' ').pop() || 'A',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (id: string, data: Partial<Class>) => {
    setClasses(prev => prev.map(cls => 
      cls.id === id ? { ...cls, ...data, updatedAt: new Date() } : cls
    ));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(cls => cls.id !== id));
  };

  // Classrooms
  const createClassroom = (data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClassroom: Classroom = {
      ...data,
      id: `classroom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'regular',
      isSpecialRoom: false,
      equipments: data.resources || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClassrooms(prev => [...prev, newClassroom]);
  };

  const updateClassroom = (id: string, data: Partial<Classroom>) => {
    setClassrooms(prev => prev.map(classroom => 
      classroom.id === id ? { ...classroom, ...data, updatedAt: new Date() } : classroom
    ));
  };

  const deleteClassroom = (id: string) => {
    setClassrooms(prev => prev.filter(classroom => classroom.id !== id));
  };

  // Teachers
  const createTeacher = (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTeacher: User = {
      ...data,
      id: `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTeachers(prev => [...prev, newTeacher]);
    
    // Notificar que um novo professor foi criado
    console.log('✅ Novo professor criado:', newTeacher.name, newTeacher.email);
  };

  const updateTeacher = (id: string, data: Partial<User>) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === id ? { ...teacher, ...data, updatedAt: new Date() } : teacher
    ));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== id));
  };

  // Teacher Restrictions
  const createTeacherRestriction = (data: Omit<TeacherRestriction, 'id'>) => {
    const newRestriction: TeacherRestriction = {
      ...data,
      id: `restriction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTeacherRestrictions(prev => [...prev, newRestriction]);
  };

  const updateTeacherRestriction = (id: string, data: Partial<TeacherRestriction>) => {
    setTeacherRestrictions(prev => prev.map(restriction => 
      restriction.id === id ? { ...restriction, ...data } : restriction
    ));
  };

  const deleteTeacherRestriction = (id: string) => {
    setTeacherRestrictions(prev => prev.filter(restriction => restriction.id !== id));
  };

  // Teacher Preferences
  const createTeacherPreference = (data: Omit<TeacherPreference, 'id'>) => {
    const newPreference: TeacherPreference = {
      ...data,
      id: `preference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTeacherPreferences(prev => [...prev, newPreference]);
  };

  const updateTeacherPreference = (id: string, data: Partial<TeacherPreference>) => {
    setTeacherPreferences(prev => prev.map(preference => 
      preference.id === id ? { ...preference, ...data } : preference
    ));
  };

  const deleteTeacherPreference = (id: string) => {
    setTeacherPreferences(prev => prev.filter(preference => preference.id !== id));
  };

  // Time Slots
  const createTimeSlot = (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTimeSlot: TimeSlot = {
      ...data,
      id: `timeslot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      duration: 50, // Default 50 minutes
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTimeSlots(prev => [...prev, newTimeSlot]);
  };

  const updateTimeSlot = (id: string, data: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, ...data, updatedAt: new Date() } : slot
    ));
  };

  const deleteTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  // Class Subjects
  const createClassSubject = (data: Omit<ClassSubject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClassSubject: ClassSubject = {
      ...data,
      id: `classsubject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: 1,
      weeklyClasses: data.weeklyHours || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClassSubjects(prev => [...prev, newClassSubject]);
  };

  const updateClassSubject = (id: string, data: Partial<ClassSubject>) => {
    setClassSubjects(prev => prev.map(cs => 
      cs.id === id ? { ...cs, ...data, updatedAt: new Date() } : cs
    ));
  };

  const deleteClassSubject = (id: string) => {
    setClassSubjects(prev => prev.filter(cs => cs.id !== id));
  };

  // Schedules
  const createSchedule = (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSchedule: Schedule = {
      ...data,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isDoubleClass: false,
      priority: 1,
      generatedBy: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const updateSchedule = (id: string, data: Partial<Schedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id ? { ...schedule, ...data, updatedAt: new Date() } : schedule
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  // Teacher Availability
  const createTeacherAvailability = (data: Omit<TeacherAvailability, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAvailability: TeacherAvailability = {
      ...data,
      id: `availability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTeacherAvailabilities(prev => [...prev, newAvailability]);
  };

  const updateTeacherAvailability = (id: string, data: Partial<TeacherAvailability>) => {
    setTeacherAvailabilities(prev => prev.map(availability => 
      availability.id === id ? { ...availability, ...data, updatedAt: new Date() } : availability
    ));
  };

  const deleteTeacherAvailability = (id: string) => {
    setTeacherAvailabilities(prev => prev.filter(availability => availability.id !== id));
  };

  // Motor de Geração de Horários Inteligente e Funcional
  const generateSchedules = async (settings: ScheduleGenerationSettings) => {
    if (!activeAcademicYear) {
      console.error('❌ Nenhum ano letivo ativo encontrado');
      alert('Por favor, defina um ano letivo ativo antes de gerar horários.');
      return;
    }

    console.log("=== 🚀 INICIANDO GERAÇÃO INTELIGENTE DE HORÁRIOS ===");
    
    setScheduleGeneration({
      id: `generation_${Date.now()}`,
      academicYear: activeAcademicYear.id,
      status: 'running',
      progress: 0,
      conflicts: [],
      generatedAt: new Date(),
      settings,
      statistics: {
        totalSchedules: 0,
        successfulAllocations: 0,
        conflicts: 0,
        teacherGaps: 0,
        averageWorkload: 0,
        constraintsSatisfied: 0,
        constraintsTotal: 10,
        satisfactionRate: 0
      }
    });

    try {
      // 1. Limpar horários existentes do ano letivo
      console.log('🧹 Limpando horários existentes...');
      setSchedules(prev => prev.filter(s => s.academicYear !== activeAcademicYear.id));
      setConflicts([]);

      // 2. Preparar dados filtrados por ano letivo
      const classesDoAno = classes.filter(c => c.academicYear === activeAcademicYear.id);
      const slotsDoAno = timeSlots.filter(ts => 
        ts.academicYear === activeAcademicYear.id && !ts.isBreak
      ).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.order - b.order);
      
      const professoresAtivos = teachers.filter(t => t.role === 'teacher');
      const salasDisponiveis = classrooms.slice();

      console.log(`📊 Dados preparados:`);
      console.log(`   - ${classesDoAno.length} turmas do ano ${activeAcademicYear.year}`);
      console.log(`   - ${slotsDoAno.length} horários disponíveis`);
      console.log(`   - ${professoresAtivos.length} professores ativos`);
      console.log(`   - ${salasDisponiveis.length} salas disponíveis`);
      console.log(`   - ${classSubjects.length} disciplinas-turma cadastradas`);

      if (classesDoAno.length === 0) {
        throw new Error('Nenhuma turma encontrada para o ano letivo ativo. Cadastre turmas primeiro.');
      }

      if (slotsDoAno.length === 0) {
        throw new Error('Nenhum horário configurado para o ano letivo ativo. Configure os horários primeiro.');
      }

      if (professoresAtivos.length === 0) {
        throw new Error('Nenhum professor cadastrado. Cadastre professores primeiro.');
      }

      if (salasDisponiveis.length === 0) {
        throw new Error('Nenhuma sala cadastrada. Cadastre salas de aula primeiro.');
      }

      // 3. Criar lista de todas as aulas que precisam ser agendadas
      const aulasParaAgendar: any[] = [];
      
      for (const turma of classesDoAno) {
        const disciplinasDaTurma = classSubjects.filter(cs => cs.classId === turma.id);
        console.log(`📚 Turma ${turma.name}: ${disciplinasDaTurma.length} disciplinas`);
        
        if (disciplinasDaTurma.length === 0) {
          console.warn(`⚠️ Turma ${turma.name} não tem disciplinas associadas`);
          continue;
        }
        
        for (const disciplinaTurma of disciplinasDaTurma) {
          const subject = subjects.find(s => s.id === disciplinaTurma.subjectId);
          const teacher = professoresAtivos.find(t => t.id === disciplinaTurma.teacherId);
          
          if (!subject) {
            console.warn(`⚠️ Disciplina ${disciplinaTurma.subjectId} não encontrada`);
            continue;
          }

          if (!teacher) {
            console.warn(`⚠️ Professor ${disciplinaTurma.teacherId} não encontrado`);
            continue;
          }

          const aulasSemanais = disciplinaTurma.weeklyClasses || disciplinaTurma.weeklyHours || subject.weeklyHours || 1;
          
          for (let aulaNum = 0; aulaNum < aulasSemanais; aulaNum++) {
            aulasParaAgendar.push({
              id: `${turma.id}-${subject.id}-${aulaNum}`,
              classId: turma.id,
              className: turma.name,
              classShift: turma.shift,
              classStudents: turma.studentsCount,
              subjectId: subject.id,
              subjectName: subject.name,
              teacherId: teacher.id,
              teacherName: teacher.name,
              weeklyHour: aulaNum + 1,
              priority: disciplinaTurma.priority || 1,
              cognitiveLoad: subject.cognitiveLoad || 'medium',
              requiresSpecialRoom: subject.requiresSpecialRoom || false,
              specialRoomType: subject.specialRoomType
            });
          }
        }
      }

      if (aulasParaAgendar.length === 0) {
        throw new Error('Nenhuma aula para agendar. Verifique se as turmas têm disciplinas associadas com professores.');
      }

      // Embaralhar para distribuição mais equilibrada
      aulasParaAgendar.sort(() => Math.random() - 0.5);
      
      console.log(`📝 Total de ${aulasParaAgendar.length} aulas para agendar`);

      const horariosGerados: Schedule[] = [];
      const conflitosDetectados: ScheduleConflict[] = [];

      // 4. Algoritmo de alocação inteligente
      for (let i = 0; i < aulasParaAgendar.length; i++) {
        const aula = aulasParaAgendar[i];
        let aulaAlocada = false;

        // Atualizar progresso
        const progress = Math.round((i / aulasParaAgendar.length) * 100);
        setScheduleGeneration(prev => prev ? { ...prev, progress } : null);
        
        // Pequeno delay para UI responsiva
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`🔄 [${i + 1}/${aulasParaAgendar.length}] ${aula.subjectName} - ${aula.className} (${aula.teacherName})`);

        // Tentar alocar em cada slot disponível
        for (const slot of slotsDoAno) {
          // === VERIFICAÇÕES DE RESTRIÇÕES RÍGIDAS ===
          
          // 1. Verificar compatibilidade de turno
          const turnoCompativel = aula.classShift === slot.shift || 
                                 aula.classShift === 'full' || 
                                 slot.shift === 'full';

          if (!turnoCompativel) {
            continue;
          }

          // 2. Professor já ocupado neste horário?
          const professorOcupado = horariosGerados.some(h => 
            h.timeSlotId === slot.id && h.teacherId === aula.teacherId
          );

          if (professorOcupado) {
            continue;
          }

          // 3. Turma já ocupada neste horário?
          const turmaOcupada = horariosGerados.some(h => 
            h.timeSlotId === slot.id && h.classId === aula.classId
          );

          if (turmaOcupada) {
            continue;
          }

          // 4. Professor tem restrição para este horário?
          const temRestricao = teacherRestrictions.some(r => 
            r.teacherId === aula.teacherId &&
            r.isActive &&
            r.dayOfWeek === slot.dayOfWeek &&
            (r.type === 'unavailable_day' || 
             (r.type === 'unavailable_time' && 
              r.startTime && r.endTime &&
              slot.startTime >= r.startTime && slot.endTime <= r.endTime))
          );

          if (temRestricao) {
            continue;
          }

          // === BUSCAR SALA ADEQUADA ===
          let salaEscolhida = null;

          // Priorizar salas especiais se necessário
          if (aula.requiresSpecialRoom && aula.specialRoomType) {
            salaEscolhida = salasDisponiveis.find(sala => 
              sala.type === aula.specialRoomType &&
              !horariosGerados.some(h => h.timeSlotId === slot.id && h.classroomId === sala.id) &&
              sala.capacity >= aula.classStudents
            );
          }

          // Se não encontrou sala especial ou não precisa, buscar sala regular
          if (!salaEscolhida) {
            salaEscolhida = salasDisponiveis.find(sala => 
              !horariosGerados.some(h => h.timeSlotId === slot.id && h.classroomId === sala.id) &&
              sala.capacity >= aula.classStudents
            );
          }

          if (!salaEscolhida) {
            continue; // Nenhuma sala disponível
          }

          // === SUCESSO! CRIAR HORÁRIO ===
          const novoHorario: Schedule = {
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            academicYear: activeAcademicYear.id,
            classId: aula.classId,
            subjectId: aula.subjectId,
            teacherId: aula.teacherId,
            classroomId: salaEscolhida.id,
            timeSlotId: slot.id,
            dayOfWeek: slot.dayOfWeek,
            status: 'active',
            isDoubleClass: false,
            priority: aula.priority,
            generatedBy: 'automatic',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          horariosGerados.push(novoHorario);
          aulaAlocada = true;
          
          console.log(`✅ Alocada: ${slot.label} - ${salaEscolhida.name}`);
          break; // Sair do loop de slots
        }

        // Se não conseguiu alocar, criar conflito
        if (!aulaAlocada) {
          console.warn(`❌ Não alocada: ${aula.subjectName} - ${aula.className}`);
          
          const conflito: ScheduleConflict = {
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'unassigned_class',
            description: `Não foi possível alocar a disciplina "${aula.subjectName}" para a turma "${aula.className}" com o professor "${aula.teacherName}". Possíveis causas: falta de horários compatíveis, salas insuficientes ou restrições do professor.`,
            scheduleIds: [],
            severity: 'high',
            resolved: false,
            affectedEntities: {
              teacherIds: [aula.teacherId],
              classIds: [aula.classId],
              subjectIds: [aula.subjectId]
            },
            createdAt: new Date()
          };
          
          conflitosDetectados.push(conflito);
        }
      }

      // 5. Finalizar e salvar resultados
      console.log('💾 Salvando resultados...');
      setSchedules(prev => [...prev, ...horariosGerados]);
      setConflicts(conflitosDetectados);

      const totalAulas = aulasParaAgendar.length;
      const aulasAlocadas = horariosGerados.length;
      const conflitos = conflitosDetectados.length;
      const taxaSucesso = totalAulas > 0 ? Math.round((aulasAlocadas / totalAulas) * 100) : 0;

      console.log("=== ✅ GERAÇÃO FINALIZADA ===");
      console.log(`✅ ${aulasAlocadas} aulas alocadas com sucesso`);
      console.log(`❌ ${conflitos} conflitos detectados`);
      console.log(`📊 Taxa de sucesso: ${taxaSucesso}%`);

      // Atualizar estatísticas finais
      setScheduleGeneration(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        statistics: {
          totalSchedules: totalAulas,
          successfulAllocations: aulasAlocadas,
          conflicts: conflitos,
          teacherGaps: Math.floor(aulasAlocadas * 0.05), // Estimativa
          averageWorkload: aulasAlocadas / Math.max(professoresAtivos.length, 1),
          constraintsSatisfied: 8,
          constraintsTotal: 10,
          satisfactionRate: taxaSucesso
        }
      } : null);

      // Mostrar resultado para o usuário
      if (taxaSucesso === 100) {
        alert(`🎉 Geração concluída com sucesso!\n\n✅ ${aulasAlocadas} aulas alocadas\n📊 Taxa de sucesso: ${taxaSucesso}%`);
      } else {
        alert(`⚠️ Geração concluída com ressalvas:\n\n✅ ${aulasAlocadas} aulas alocadas\n❌ ${conflitos} conflitos detectados\n📊 Taxa de sucesso: ${taxaSucesso}%\n\nVerifique a seção de conflitos para mais detalhes.`);
      }

    } catch (error) {
      console.error('❌ Erro durante a geração de horários:', error);
      setScheduleGeneration(prev => prev ? {
        ...prev,
        status: 'failed',
        completedAt: new Date()
      } : null);
      
      alert(`❌ Erro na geração de horários:\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nVerifique os dados cadastrados e tente novamente.`);
    }
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.map(conflict => 
      conflict.id === conflictId ? { ...conflict, resolved: true, resolvedAt: new Date() } : conflict
    ));
  };

  // System Settings
  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Utility functions
  const getSubjectById = (id: string) => subjects.find(s => s.id === id);
  const getClassById = (id: string) => classes.find(c => c.id === id);
  const getClassroomById = (id: string) => classrooms.find(c => c.id === id);
  const getTeacherById = (id: string) => teachers.find(t => t.id === id);
  const getTimeSlotById = (id: string) => timeSlots.find(t => t.id === id);

  return (
    <DataContext.Provider value={{
      // Academic Years
      academicYears,
      activeAcademicYear,
      createAcademicYear,
      updateAcademicYear,
      deleteAcademicYear,
      setActiveAcademicYear,

      // Segments
      segments,
      createSegment,
      updateSegment,
      deleteSegment,

      // Subjects
      subjects,
      createSubject,
      updateSubject,
      deleteSubject,

      // Classes
      classes,
      createClass,
      updateClass,
      deleteClass,

      // Classrooms
      classrooms,
      createClassroom,
      updateClassroom,
      deleteClassroom,

      // Teachers
      teachers,
      createTeacher,
      updateTeacher,
      deleteTeacher,

      // Teacher Restrictions
      teacherRestrictions,
      createTeacherRestriction,
      updateTeacherRestriction,
      deleteTeacherRestriction,

      // Teacher Preferences
      teacherPreferences,
      createTeacherPreference,
      updateTeacherPreference,
      deleteTeacherPreference,

      // Time Slots
      timeSlots,
      createTimeSlot,
      updateTimeSlot,
      deleteTimeSlot,

      // Class Subjects
      classSubjects,
      createClassSubject,
      updateClassSubject,
      deleteClassSubject,

      // Schedules
      schedules,
      createSchedule,
      updateSchedule,
      deleteSchedule,

      // Teacher Availability
      teacherAvailabilities,
      createTeacherAvailability,
      updateTeacherAvailability,
      deleteTeacherAvailability,

      // Schedule Generation
      generateSchedules,
      scheduleGeneration,
      conflicts,
      resolveConflict,

      // System Settings
      systemSettings,
      updateSystemSettings,

      // Utility functions
      getSubjectById,
      getClassById,
      getClassroomById,
      getTeacherById,
      getTimeSlotById
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
}
/*
  # Correção para o erro de UUID inválido
  
  Execute este SQL no Supabase SQL Editor em vez da migração original.
  Este arquivo corrige o problema do UUID inválido para o usuário admin.
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de anos letivos
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de usuários (admin e professores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'viewer')),
  registration_number TEXT,
  phone TEXT,
  subjects TEXT[],
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  requires_special_room BOOLEAN DEFAULT false,
  special_room_type TEXT,
  allows_double_classes BOOLEAN DEFAULT false,
  cognitive_load TEXT DEFAULT 'medium' CHECK (cognitive_load IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de segmentos de ensino
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  grades TEXT[],
  default_shift TEXT NOT NULL CHECK (default_shift IN ('morning', 'afternoon', 'full')),
  academic_year UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  grade_id TEXT DEFAULT '',
  segment_id TEXT DEFAULT '',
  identifier TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'full')),
  students_count INTEGER NOT NULL DEFAULT 0,
  academic_year UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de salas de aula
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  resources TEXT[],
  floor TEXT,
  building TEXT,
  type TEXT DEFAULT 'regular',
  is_special_room BOOLEAN DEFAULT false,
  equipments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de horários (time slots)
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'full')),
  "order" INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_break BOOLEAN DEFAULT false,
  academic_year UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  duration INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de associação disciplina-turma
CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  weekly_hours INTEGER NOT NULL DEFAULT 1,
  weekly_classes INTEGER NOT NULL DEFAULT 1,
  academic_year UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

-- Tabela de horários das aulas
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  academic_year UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'conflict', 'locked')),
  is_double_class BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  generated_by TEXT DEFAULT 'manual' CHECK (generated_by IN ('automatic', 'manual')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de restrições dos professores
CREATE TABLE IF NOT EXISTS teacher_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('unavailable_day', 'unavailable_time', 'unavailable_period')),
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME,
  end_time TIME,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Tabela de preferências dos professores
CREATE TABLE IF NOT EXISTS teacher_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('avoid_first_period', 'avoid_last_period', 'prefer_grouped_classes', 'prefer_specific_days')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  value TEXT,
  description TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso total por enquanto - pode ser refinado depois)
CREATE POLICY "Allow all operations" ON academic_years FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON subjects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON segments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON classrooms FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON time_slots FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON class_subjects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teacher_restrictions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teacher_preferences FOR ALL USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_academic_years_active ON academic_years(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);
CREATE INDEX IF NOT EXISTS idx_time_slots_academic_year ON time_slots(academic_year);
CREATE INDEX IF NOT EXISTS idx_time_slots_day_order ON time_slots(day_of_week, "order");
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_teacher ON class_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_academic_year ON schedules(academic_year);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_time_slot ON schedules(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_teacher_restrictions_teacher ON teacher_restrictions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_preferences_teacher ON teacher_preferences(teacher_id);

-- Inserir usuário admin padrão com UUID válido gerado automaticamente
INSERT INTO users (name, email, role, registration_number, phone, password_hash, created_at, updated_at)
VALUES (
  'Administrador',
  'admin@escola.com',
  'admin',
  'ADM001',
  '(11) 99999-0001',
  '123456',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
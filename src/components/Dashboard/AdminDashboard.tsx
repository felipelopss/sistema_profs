import React from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export default function AdminDashboard() {
  const { 
    teachers, 
    subjects, 
    classes, 
    classrooms, 
    schedules, 
    conflicts, 
    activeAcademicYear,
    timeSlots 
  } = useData();

  // Calculate real statistics
  const activeTeachers = teachers.filter(t => t.role === 'teacher').length;
  const totalSubjects = subjects.length;
  const totalClasses = classes.filter(c => !activeAcademicYear || c.academicYear === activeAcademicYear?.id).length;
  const totalClassrooms = classrooms.length;

  // Calculate schedule completion
  const totalSlotsNeeded = totalClasses * timeSlots.filter(ts => !ts.isBreak).length * 5; // 5 days
  const scheduledSlots = schedules.filter(s => !activeAcademicYear || s.academicYear === activeAcademicYear?.id).length;
  const completionPercentage = totalSlotsNeeded > 0 ? Math.round((scheduledSlots / totalSlotsNeeded) * 100) : 0;

  // Get today's schedules for current week view
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const todaySchedules = schedules.filter(schedule => {
    const timeSlot = timeSlots.find(ts => ts.id === schedule.timeSlotId);
    return timeSlot && timeSlot.dayOfWeek === currentDayOfWeek;
  }).slice(0, 5); // Show first 5 for today

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Disciplina não encontrada';
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem?.name || 'Turma não encontrada';
  };

  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom?.name || 'Sala não encontrada';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Professor não encontrado';
  };

  const getTimeSlotInfo = (timeSlotId: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'Horário não encontrado';
  };

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      message: `${scheduledSlots} aulas foram programadas no sistema`,
      time: 'Atualizado agora'
    },
    {
      id: 2,
      type: 'info',
      message: `${totalClasses} turmas cadastradas para ${activeAcademicYear?.year || 'este ano'}`,
      time: '1 hora atrás'
    },
    {
      id: 3,
      type: 'warning',
      message: `${conflicts.filter(c => !c.resolved).length} conflitos pendentes de resolução`,
      time: '2 horas atrás'
    },
    {
      id: 4,
      type: 'success',
      message: `${activeTeachers} professores ativos no sistema`,
      time: '3 horas atrás'
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      task: `Completar programação de ${Math.max(0, totalSlotsNeeded - scheduledSlots)} aulas restantes`,
      priority: 'high',
      deadline: 'Esta semana'
    },
    {
      id: 2,
      task: 'Revisar conflitos de horário detectados',
      priority: conflicts.filter(c => !c.resolved).length > 0 ? 'high' : 'low',
      deadline: 'Hoje'
    },
    {
      id: 3,
      task: 'Validar horários das turmas do turno da tarde',
      priority: 'medium',
      deadline: 'Amanhã'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Professores</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeTeachers}</p>
              <p className="text-sm text-green-600 mt-1">Ativos no sistema</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disciplinas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubjects}</p>
              <p className="text-sm text-blue-600 mt-1">Cadastradas</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turmas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalClasses}</p>
              <p className="text-sm text-purple-600 mt-1">
                {activeAcademicYear ? activeAcademicYear.year : 'Sem ano ativo'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salas de Aula</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalClassrooms}</p>
              <p className="text-sm text-orange-600 mt-1">Disponíveis</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Status */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Status dos Horários</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Progresso Geral</p>
                  <p className="text-sm text-blue-700">{scheduledSlots} de {totalSlotsNeeded} aulas programadas</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Aulas Programadas</p>
                  <p className="text-sm text-green-700">{scheduledSlots} aulas no sistema</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{scheduledSlots}</div>
            </div>

            {conflicts.filter(c => !c.resolved).length > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Conflitos Detectados</p>
                    <p className="text-sm text-red-700">{conflicts.filter(c => !c.resolved).length} conflitos precisam ser resolvidos</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors">
                  Resolver
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tarefas Pendentes</h3>
          
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.deadline}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority === 'high' ? 'Alta' :
                     task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Aulas de Hoje</h3>
          
          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {getTimeSlotInfo(schedule.timeSlotId)}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{getSubjectName(schedule.subjectId)}</p>
                        <p className="text-sm text-gray-600">{getClassName(schedule.classId)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{getClassroomName(schedule.classroomId)}</p>
                        <p className="text-xs text-gray-500">{getTeacherName(schedule.teacherId)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma aula programada para hoje</p>
              <p className="text-sm text-gray-500 mt-1">Configure os horários para ver as aulas</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividades Recentes</h3>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Calendar, Clock, Users, BookOpen, AlertCircle, MapPin, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { 
    schedules, 
    subjects, 
    classes, 
    classrooms, 
    timeSlots, 
    activeAcademicYear,
    conflicts 
  } = useData();

  // Filtrar horários do professor logado
  const teacherSchedules = schedules.filter(s => 
    s.teacherId === user?.id && 
    (!activeAcademicYear || s.academicYear === activeAcademicYear.id)
  );

  // Obter horários de hoje
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const todaySchedules = teacherSchedules
    .filter(schedule => {
      const timeSlot = timeSlots.find(ts => ts.id === schedule.timeSlotId);
      return timeSlot && timeSlot.dayOfWeek === currentDayOfWeek;
    })
    .sort((a, b) => {
      const timeSlotA = timeSlots.find(ts => ts.id === a.timeSlotId);
      const timeSlotB = timeSlots.find(ts => ts.id === b.timeSlotId);
      if (!timeSlotA || !timeSlotB) return 0;
      return timeSlotA.order - timeSlotB.order;
    })
    .slice(0, 6); // Máximo 6 aulas por dia

  // Calcular estatísticas
  const totalWeeklyClasses = teacherSchedules.length;
  const uniqueClasses = [...new Set(teacherSchedules.map(s => s.classId))].length;
  const teacherSubjects = user?.subjects || [];
  const teacherConflicts = conflicts.filter(c => 
    c.affectedEntities.teacherIds?.includes(user?.id || '') && !c.resolved
  );

  // Funções auxiliares
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

  const getTimeSlotInfo = (timeSlotId: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'Horário não encontrado';
  };

  const getTimeSlotLabel = (timeSlotId: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timeSlot?.label || 'Horário';
  };

  const weeklyStats = [
    {
      label: 'Aulas esta semana',
      value: totalWeeklyClasses.toString(),
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Turmas atendidas',
      value: uniqueClasses.toString(),
      icon: Users,
      color: 'green'
    },
    {
      label: 'Disciplinas',
      value: teacherSubjects.length.toString(),
      icon: BookOpen,
      color: 'purple'
    }
  ];

  const getDayName = () => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[currentDayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name}!</h2>
        <p className="text-primary-100">
          {todaySchedules.length > 0 
            ? `Hoje você tem ${todaySchedules.length} aula${todaySchedules.length > 1 ? 's' : ''} programada${todaySchedules.length > 1 ? 's' : ''}. Tenha um ótimo dia letivo!`
            : `Hoje é ${getDayName()} e você não tem aulas programadas. Aproveite para planejar suas próximas atividades!`
          }
        </p>
        {activeAcademicYear && (
          <p className="text-primary-200 text-sm mt-2">
            Ano Letivo: {activeAcademicYear.year}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weeklyStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Horário de Hoje - {getDayName()}</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-20 text-sm font-medium text-gray-600">
                    {getTimeSlotInfo(schedule.timeSlotId)}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{getSubjectName(schedule.subjectId)}</p>
                        <p className="text-sm text-gray-600">{getClassName(schedule.classId)}</p>
                        <p className="text-xs text-gray-500">{getTimeSlotLabel(schedule.timeSlotId)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{getClassroomName(schedule.classroomId)}</span>
                        </div>
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
              <p className="text-sm text-gray-500 mt-1">Aproveite para planejar suas próximas atividades</p>
            </div>
          )}
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">Ver Horário Completo</span>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">Definir Disponibilidade</span>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">Minhas Turmas</span>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avisos</h3>
            
            <div className="space-y-3">
              {teacherConflicts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Conflitos de Horário
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {teacherConflicts.length} conflito{teacherConflicts.length > 1 ? 's' : ''} detectado{teacherConflicts.length > 1 ? 's' : ''} em seus horários
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Sistema Atualizado
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Novos recursos de horários disponíveis
                    </p>
                  </div>
                </div>
              </div>

              {totalWeeklyClasses === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Nenhuma Aula Programada
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Entre em contato com a coordenação para verificar sua grade de horários
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meu Perfil</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.registrationNumber}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Disciplinas que leciono:</p>
                <div className="flex flex-wrap gap-1">
                  {teacherSubjects.map((subjectId, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                    >
                      {getSubjectName(subjectId)}
                    </span>
                  ))}
                  {teacherSubjects.length === 0 && (
                    <span className="text-xs text-gray-500">Nenhuma disciplina atribuída</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
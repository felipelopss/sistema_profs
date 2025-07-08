import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Edit, Save, X, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const daysOfWeek = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
];

interface ScheduleGridProps {
  selectedClass?: string;
  selectedTeacher?: string;
}

export default function ScheduleGrid({ selectedClass, selectedTeacher }: ScheduleGridProps) {
  const { 
    schedules, 
    timeSlots, 
    subjects, 
    classes, 
    classrooms, 
    teachers,
    activeAcademicYear,
    createSchedule,
    updateSchedule,
    deleteSchedule
  } = useData();

  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    timeSlotId: '',
    dayOfWeek: 1,
    teacherId: '',
    subjectId: '',
    classId: '',
    classroomId: ''
  });

  // Filter data based on active academic year
  const filteredSchedules = schedules.filter(s => 
    !activeAcademicYear || s.academicYear === activeAcademicYear.id
  );
  const filteredTimeSlots = timeSlots.filter(ts => 
    !activeAcademicYear || ts.academicYear === activeAcademicYear.id
  ).filter(ts => !ts.isBreak);
  const filteredClasses = classes.filter(c => 
    !activeAcademicYear || c.academicYear === activeAcademicYear.id
  );

  // Get current selection
  const currentClassId = selectedClassId || (filteredClasses.length > 0 ? filteredClasses[0].id : '');
  const currentTeacherId = selectedTeacherId || '';

  // Get schedules for current view
  const currentSchedules = filteredSchedules.filter(schedule => {
    if (viewMode === 'class' && currentClassId) {
      return schedule.classId === currentClassId;
    }
    if (viewMode === 'teacher' && currentTeacherId) {
      return schedule.teacherId === currentTeacherId;
    }
    return false;
  });

  // Group time slots by order for display
  const timeSlotsByOrder = filteredTimeSlots.reduce((acc, slot) => {
    if (!acc[slot.order]) {
      acc[slot.order] = slot;
    }
    return acc;
  }, {} as Record<number, any>);

  const sortedOrders = Object.keys(timeSlotsByOrder).map(Number).sort();

  const getScheduleForSlot = (dayOfWeek: number, order: number) => {
    const timeSlot = timeSlotsByOrder[order];
    if (!timeSlot) return null;

    return currentSchedules.find(schedule => {
      const scheduleTimeSlot = filteredTimeSlots.find(ts => ts.id === schedule.timeSlotId);
      return scheduleTimeSlot && 
             scheduleTimeSlot.dayOfWeek === dayOfWeek && 
             scheduleTimeSlot.order === order;
    });
  };

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

  const handleCreateSchedule = (dayOfWeek: number, order: number) => {
    const timeSlot = timeSlotsByOrder[order];
    if (!timeSlot || !activeAcademicYear) return;

    setCreateFormData({
      timeSlotId: timeSlot.id,
      dayOfWeek,
      teacherId: '',
      subjectId: '',
      classId: viewMode === 'class' ? currentClassId : '',
      classroomId: ''
    });
    setShowCreateForm(true);
  };

  const handleSaveSchedule = () => {
    if (!activeAcademicYear) return;

    createSchedule({
      ...createFormData,
      academicYear: activeAcademicYear.id,
      status: 'active'
    });

    setShowCreateForm(false);
    setCreateFormData({
      timeSlotId: '',
      dayOfWeek: 1,
      teacherId: '',
      subjectId: '',
      classId: '',
      classroomId: ''
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      deleteSchedule(scheduleId);
    }
  };

  if (!activeAcademicYear) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Ano Letivo Ativo</h3>
        <p className="text-gray-600">
          Defina um ano letivo ativo para visualizar e editar os horários
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Grade de Horários</h2>
            <p className="text-gray-600 mt-1">
              {activeAcademicYear.year} - Visualização e Edição
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Ano Letivo {activeAcademicYear.year}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Editável</span>
            </div>
          </div>
        </div>

        {/* View Mode and Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('class')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'class'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Por Turma
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'teacher'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Por Professor
            </button>
          </div>

          {viewMode === 'class' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {filteredClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          )}

          {viewMode === 'teacher' && (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Selecione um professor</option>
              {teachers.filter(t => t.role === 'teacher').map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      {((viewMode === 'class' && currentClassId) || (viewMode === 'teacher' && currentTeacherId)) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Horário
                  </th>
                  {daysOfWeek.map((day) => (
                    <th key={day.value} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => {
                  const timeSlot = timeSlotsByOrder[order];
                  
                  return (
                    <tr key={order} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{timeSlot.label}</div>
                            <div className="text-xs text-gray-500">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </div>
                          </div>
                        </div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const schedule = getScheduleForSlot(day.value, order);
                        
                        return (
                          <td key={`${day.value}-${order}`} className="px-4 py-4 align-top">
                            {schedule ? (
                              <div className="p-3 rounded-lg border-2 bg-blue-50 border-blue-200 text-blue-800 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-medium text-sm">
                                    {getSubjectName(schedule.subjectId)}
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <button
                                      onClick={() => setEditingSlot(schedule.id)}
                                      className="p-1 hover:bg-blue-200 rounded"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSchedule(schedule.id)}
                                      className="p-1 hover:bg-red-200 rounded text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {viewMode === 'class' && (
                                    <div className="flex items-center text-xs">
                                      <User className="w-3 h-3 mr-1" />
                                      <span>{getTeacherName(schedule.teacherId)}</span>
                                    </div>
                                  )}
                                  {viewMode === 'teacher' && (
                                    <div className="flex items-center text-xs">
                                      <User className="w-3 h-3 mr-1" />
                                      <span>{getClassName(schedule.classId)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center text-xs">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span>{getClassroomName(schedule.classroomId)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => handleCreateSchedule(day.value, order)}
                                className="h-16 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer flex items-center justify-center group"
                              >
                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Aula</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professor
                </label>
                <select
                  value={createFormData.teacherId}
                  onChange={(e) => setCreateFormData({ ...createFormData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um professor</option>
                  {teachers.filter(t => t.role === 'teacher').map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplina
                </label>
                <select
                  value={createFormData.subjectId}
                  onChange={(e) => setCreateFormData({ ...createFormData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma disciplina</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {viewMode === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma
                  </label>
                  <select
                    value={createFormData.classId}
                    onChange={(e) => setCreateFormData({ ...createFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {filteredClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sala de Aula
                </label>
                <select
                  value={createFormData.classroomId}
                  onChange={(e) => setCreateFormData({ ...createFormData, classroomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma sala</option>
                  {classrooms.map(classroom => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'class' && !currentClassId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma selecionada</h3>
          <p className="text-gray-600">
            Selecione uma turma para visualizar e editar os horários
          </p>
        </div>
      )}

      {viewMode === 'teacher' && !currentTeacherId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum professor selecionado</h3>
          <p className="text-gray-600">
            Selecione um professor para visualizar e editar os horários
          </p>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Plus, Clock, X, AlertTriangle, User, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { TeacherRestriction, TeacherPreference } from '../../types';

export default function TeacherRestrictions() {
  const { teachers, teacherRestrictions, teacherPreferences, createTeacherRestriction, createTeacherPreference, deleteTeacherRestriction, deleteTeacherPreference } = useData();
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [showRestrictionForm, setShowRestrictionForm] = useState(false);
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);
  
  const [restrictionForm, setRestrictionForm] = useState({
    type: 'unavailable_time' as 'unavailable_day' | 'unavailable_time' | 'unavailable_period',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    reason: ''
  });

  const [preferenceForm, setPreferenceForm] = useState({
    type: 'avoid_first_period' as 'avoid_first_period' | 'avoid_last_period' | 'prefer_grouped_classes' | 'prefer_specific_days',
    priority: 'medium' as 'low' | 'medium' | 'high',
    value: '',
    description: ''
  });

  const teachersList = teachers.filter(t => t.role === 'teacher');
  const selectedTeacherData = teachersList.find(t => t.id === selectedTeacher);
  
  const teacherRestrictionsFiltered = teacherRestrictions.filter(r => r.teacherId === selectedTeacher);
  const teacherPreferencesFiltered = teacherPreferences.filter(p => p.teacherId === selectedTeacher);

  const daysOfWeek = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  const handleCreateRestriction = () => {
    if (!selectedTeacher) return;

    createTeacherRestriction({
      teacherId: selectedTeacher,
      ...restrictionForm,
      isActive: true
    });

    setShowRestrictionForm(false);
    setRestrictionForm({
      type: 'unavailable_time',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      reason: ''
    });
  };

  const handleCreatePreference = () => {
    if (!selectedTeacher) return;

    createTeacherPreference({
      teacherId: selectedTeacher,
      ...preferenceForm
    });

    setShowPreferenceForm(false);
    setPreferenceForm({
      type: 'avoid_first_period',
      priority: 'medium',
      value: '',
      description: ''
    });
  };

  const getRestrictionTypeLabel = (type: string) => {
    const labels = {
      unavailable_day: 'Dia Indisponível',
      unavailable_time: 'Horário Indisponível',
      unavailable_period: 'Período Indisponível'
    };
    return labels[type as keyof typeof labels];
  };

  const getPreferenceTypeLabel = (type: string) => {
    const labels = {
      avoid_first_period: 'Evitar Primeiro Horário',
      avoid_last_period: 'Evitar Último Horário',
      prefer_grouped_classes: 'Preferir Aulas Agrupadas',
      prefer_specific_days: 'Preferir Dias Específicos'
    };
    return labels[type as keyof typeof labels];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[priority as keyof typeof colors];
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };
    return labels[priority as keyof typeof labels];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restrições e Preferências dos Professores</h1>
          <p className="text-gray-600 mt-1">Configure disponibilidades e preferências de horário</p>
        </div>
      </div>

      {/* Teacher Selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <User className="w-5 h-5 text-gray-400" />
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Selecione um professor</option>
            {teachersList.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTeacher && (
        <>
          {/* Teacher Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedTeacherData?.name}</h3>
                <p className="text-sm text-gray-600">{selectedTeacherData?.email}</p>
                {selectedTeacherData?.subjects && (
                  <p className="text-sm text-gray-500">
                    Disciplinas: {selectedTeacherData.subjects.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowRestrictionForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Adicionar Restrição</span>
            </button>
            
            <button
              onClick={() => setShowPreferenceForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Preferência</span>
            </button>
          </div>

          {/* Restrictions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Restrições (Indisponibilidades)</span>
              </h3>
            </div>
            
            <div className="p-6">
              {teacherRestrictionsFiltered.length > 0 ? (
                <div className="space-y-3">
                  {teacherRestrictionsFiltered.map((restriction) => (
                    <div key={restriction.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-red-900">
                            {getRestrictionTypeLabel(restriction.type)}
                          </span>
                          {restriction.type !== 'unavailable_day' && (
                            <span className="text-sm text-red-700">
                              {restriction.startTime} - {restriction.endTime}
                            </span>
                          )}
                        </div>
                        
                        {restriction.dayOfWeek && (
                          <p className="text-sm text-red-700">
                            {daysOfWeek.find(d => d.value === restriction.dayOfWeek)?.label}
                          </p>
                        )}
                        
                        {restriction.reason && (
                          <p className="text-sm text-red-600 mt-1">{restriction.reason}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteTeacherRestriction(restriction.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma restrição cadastrada</p>
              )}
            </div>
          </div>

          {/* Preferences List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Preferências</span>
              </h3>
            </div>
            
            <div className="p-6">
              {teacherPreferencesFiltered.length > 0 ? (
                <div className="space-y-3">
                  {teacherPreferencesFiltered.map((preference) => (
                    <div key={preference.id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-blue-900">
                            {getPreferenceTypeLabel(preference.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(preference.priority)}`}>
                            {getPriorityLabel(preference.priority)}
                          </span>
                        </div>
                        
                        {preference.value && (
                          <p className="text-sm text-blue-700">Valor: {preference.value}</p>
                        )}
                        
                        {preference.description && (
                          <p className="text-sm text-blue-600 mt-1">{preference.description}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteTeacherPreference(preference.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma preferência cadastrada</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Restriction Form Modal */}
      {showRestrictionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Restrição</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Restrição
                </label>
                <select
                  value={restrictionForm.type}
                  onChange={(e) => setRestrictionForm({ ...restrictionForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="unavailable_time">Horário Indisponível</option>
                  <option value="unavailable_day">Dia Indisponível</option>
                  <option value="unavailable_period">Período Indisponível</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia da Semana
                </label>
                <select
                  value={restrictionForm.dayOfWeek}
                  onChange={(e) => setRestrictionForm({ ...restrictionForm, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              {restrictionForm.type !== 'unavailable_day' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Início
                    </label>
                    <input
                      type="time"
                      value={restrictionForm.startTime}
                      onChange={(e) => setRestrictionForm({ ...restrictionForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Fim
                    </label>
                    <input
                      type="time"
                      value={restrictionForm.endTime}
                      onChange={(e) => setRestrictionForm({ ...restrictionForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (Opcional)
                </label>
                <textarea
                  value={restrictionForm.reason}
                  onChange={(e) => setRestrictionForm({ ...restrictionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ex: Consulta médica, outro compromisso..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateRestriction}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Adicionar Restrição
                </button>
                <button
                  onClick={() => setShowRestrictionForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preference Form Modal */}
      {showPreferenceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Preferência</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Preferência
                </label>
                <select
                  value={preferenceForm.type}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="avoid_first_period">Evitar Primeiro Horário</option>
                  <option value="avoid_last_period">Evitar Último Horário</option>
                  <option value="prefer_grouped_classes">Preferir Aulas Agrupadas</option>
                  <option value="prefer_specific_days">Preferir Dias Específicos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={preferenceForm.priority}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {preferenceForm.type === 'prefer_specific_days' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias Preferidos
                  </label>
                  <input
                    type="text"
                    value={preferenceForm.value}
                    onChange={(e) => setPreferenceForm({ ...preferenceForm, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Segunda, Quarta, Sexta"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={preferenceForm.description}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Detalhes sobre a preferência..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreatePreference}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Preferência
                </button>
                <button
                  onClick={() => setShowPreferenceForm(false)}
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
      {!selectedTeacher && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Professor</h3>
          <p className="text-gray-600">
            Escolha um professor para configurar suas restrições e preferências de horário
          </p>
        </div>
      )}
    </div>
  );
}
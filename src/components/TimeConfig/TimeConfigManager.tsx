import React, { useState } from 'react';
import { Plus, Clock, Edit, Trash2, Coffee } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { TimeSlot } from '../../types';

export default function TimeConfigManager() {
  const { timeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot, activeAcademicYear } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'full'>('morning');
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    shift: 'morning' as 'morning' | 'afternoon' | 'full',
    order: 1,
    label: '',
    isBreak: false
  });

  const daysOfWeek = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  const filteredTimeSlots = timeSlots.filter(slot => {
    const matchesShift = slot.shift === selectedShift || slot.shift === 'full';
    const matchesYear = !activeAcademicYear || slot.academicYear === activeAcademicYear.id;
    return matchesShift && matchesYear;
  });

  const groupedSlots = daysOfWeek.reduce((acc, day) => {
    acc[day.value] = filteredTimeSlots
      .filter(slot => slot.dayOfWeek === day.value)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAcademicYear) {
      alert('Por favor, selecione um ano letivo ativo primeiro.');
      return;
    }

    const slotData = {
      ...formData,
      academicYear: activeAcademicYear.id
    };

    if (editingSlot) {
      updateTimeSlot(editingSlot.id, slotData);
    } else {
      createTimeSlot(slotData);
    }

    setShowForm(false);
    setEditingSlot(null);
    setFormData({
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      shift: 'morning',
      order: 1,
      label: '',
      isBreak: false
    });
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      shift: slot.shift,
      order: slot.order,
      label: slot.label,
      isBreak: slot.isBreak
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
      deleteTimeSlot(id);
    }
  };

  const createDefaultSchedule = () => {
    if (!activeAcademicYear) return;

    const morningSlots = [
      { startTime: '07:30', endTime: '08:20', label: '1ª Aula', order: 1 },
      { startTime: '08:20', endTime: '09:10', label: '2ª Aula', order: 2 },
      { startTime: '09:10', endTime: '09:30', label: 'Intervalo', order: 3, isBreak: true },
      { startTime: '09:30', endTime: '10:20', label: '3ª Aula', order: 4 },
      { startTime: '10:20', endTime: '11:10', label: '4ª Aula', order: 5 },
      { startTime: '11:10', endTime: '12:00', label: '5ª Aula', order: 6 }
    ];

    const afternoonSlots = [
      { startTime: '13:30', endTime: '14:20', label: '1ª Aula', order: 1 },
      { startTime: '14:20', endTime: '15:10', label: '2ª Aula', order: 2 },
      { startTime: '15:10', endTime: '15:30', label: 'Intervalo', order: 3, isBreak: true },
      { startTime: '15:30', endTime: '16:20', label: '3ª Aula', order: 4 },
      { startTime: '16:20', endTime: '17:10', label: '4ª Aula', order: 5 }
    ];

    // Create slots for all weekdays
    daysOfWeek.forEach(day => {
      morningSlots.forEach(slot => {
        createTimeSlot({
          dayOfWeek: day.value,
          startTime: slot.startTime,
          endTime: slot.endTime,
          shift: 'morning',
          order: slot.order,
          label: slot.label,
          isBreak: slot.isBreak || false,
          academicYear: activeAcademicYear.id
        });
      });

      afternoonSlots.forEach(slot => {
        createTimeSlot({
          dayOfWeek: day.value,
          startTime: slot.startTime,
          endTime: slot.endTime,
          shift: 'afternoon',
          order: slot.order,
          label: slot.label,
          isBreak: slot.isBreak || false,
          academicYear: activeAcademicYear.id
        });
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de Horários</h1>
          <p className="text-gray-600 mt-1">Configure os horários de aula e intervalos</p>
          {activeAcademicYear && (
            <p className="text-sm text-primary-600 mt-1">
              Ano Letivo: {activeAcademicYear.year}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          {filteredTimeSlots.length === 0 && activeAcademicYear && (
            <button
              onClick={createDefaultSchedule}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Criar Grade Padrão
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            disabled={!activeAcademicYear}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Horário</span>
          </button>
        </div>
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> Você precisa definir um ano letivo ativo antes de configurar horários.
          </p>
        </div>
      )}

      {/* Shift Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedShift('morning')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedShift === 'morning'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manhã
          </button>
          <button
            onClick={() => setSelectedShift('afternoon')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedShift === 'afternoon'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tarde
          </button>
          <button
            onClick={() => setSelectedShift('full')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedShift === 'full'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Integral
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSlot ? 'Editar Horário' : 'Novo Horário'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia da Semana
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turno
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="full">Integral</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rótulo
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1ª Aula"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBreak"
                  checked={formData.isBreak}
                  onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isBreak" className="ml-2 text-sm text-gray-700">
                  É um intervalo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingSlot ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlot(null);
                    setFormData({
                      dayOfWeek: 1,
                      startTime: '',
                      endTime: '',
                      shift: 'morning',
                      order: 1,
                      label: '',
                      isBreak: false
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                {daysOfWeek.map(day => (
                  <th key={day.value} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from(new Set(filteredTimeSlots.map(slot => slot.order))).sort().map(order => {
                const sampleSlot = filteredTimeSlots.find(slot => slot.order === order);
                if (!sampleSlot) return null;

                return (
                  <tr key={order} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        {sampleSlot.isBreak ? (
                          <Coffee className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">{sampleSlot.label}</div>
                          <div className="text-xs text-gray-500">
                            {sampleSlot.startTime} - {sampleSlot.endTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    {daysOfWeek.map(day => {
                      const slot = groupedSlots[day.value]?.find(s => s.order === order);
                      return (
                        <td key={day.value} className="px-4 py-4 align-top">
                          {slot ? (
                            <div className={`p-2 rounded border-2 ${
                              slot.isBreak 
                                ? 'bg-orange-50 border-orange-200 text-orange-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{slot.label}</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleEdit(slot)}
                                    className="p-1 hover:bg-white rounded"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(slot.id)}
                                    className="p-1 hover:bg-white rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs mt-1">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-400">-</span>
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

      {filteredTimeSlots.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário configurado</h3>
          <p className="text-gray-600 mb-4">
            {activeAcademicYear 
              ? 'Comece criando a grade de horários ou use a grade padrão'
              : 'Defina um ano letivo ativo primeiro'}
          </p>
          {activeAcademicYear && (
            <div className="flex justify-center space-x-3">
              <button
                onClick={createDefaultSchedule}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Criar Grade Padrão
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Criar Manualmente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
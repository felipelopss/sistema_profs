import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Users, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Segment } from '../../types';

export default function SegmentsList() {
  const { segments, createSegment, updateSegment, deleteSegment, activeAcademicYear } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grades: [''],
    defaultShift: 'morning' as 'morning' | 'afternoon' | 'full'
  });

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAcademicYear) {
      alert('Por favor, selecione um ano letivo ativo primeiro.');
      return;
    }
    
    const segmentData = {
      ...formData,
      grades: formData.grades.filter(grade => grade.trim() !== ''),
      academicYear: activeAcademicYear.id
    };

    if (editingSegment) {
      updateSegment(editingSegment.id, segmentData);
    } else {
      createSegment(segmentData);
    }

    setShowForm(false);
    setEditingSegment(null);
    setFormData({
      name: '',
      description: '',
      grades: [''],
      defaultShift: 'morning'
    });
  };

  const handleEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      grades: segment.grades.length > 0 ? segment.grades : [''],
      defaultShift: segment.defaultShift
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este segmento?')) {
      deleteSegment(id);
    }
  };

  const addGradeField = () => {
    setFormData(prev => ({
      ...prev,
      grades: [...prev.grades, '']
    }));
  };

  const removeGradeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.filter((_, i) => i !== index)
    }));
  };

  const updateGrade = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.map((grade, i) => i === index ? value : grade)
    }));
  };

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      full: 'Integral'
    };
    return labels[shift as keyof typeof labels];
  };

  const getShiftColor = (shift: string) => {
    const colors = {
      morning: 'bg-blue-100 text-blue-700',
      afternoon: 'bg-orange-100 text-orange-700',
      full: 'bg-purple-100 text-purple-700'
    };
    return colors[shift as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segmentos de Ensino</h1>
          <p className="text-gray-600 mt-1">Organize os níveis educacionais da instituição</p>
          {activeAcademicYear && (
            <p className="text-sm text-primary-600 mt-1">
              Ano Letivo: {activeAcademicYear.year}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!activeAcademicYear}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Segmento</span>
        </button>
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> Você precisa definir um ano letivo ativo antes de cadastrar segmentos.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSegment ? 'Editar Segmento' : 'Novo Segmento'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Segmento
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Ensino Fundamental I"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição do segmento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turno Padrão
                </label>
                <select
                  value={formData.defaultShift}
                  onChange={(e) => setFormData({ ...formData, defaultShift: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="full">Integral</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Séries/Anos
                  </label>
                  <button
                    type="button"
                    onClick={addGradeField}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Adicionar Série
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.grades.map((grade, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => updateGrade(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ex: 1º ano, 2º ano, Maternal II"
                      />
                      {formData.grades.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGradeField(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingSegment ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSegment(null);
                    setFormData({
                      name: '',
                      description: '',
                      grades: [''],
                      defaultShift: 'morning'
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

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSegments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(segment.defaultShift)}`}>
                    {getShiftLabel(segment.defaultShift)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(segment)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(segment.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {segment.description && (
              <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Séries/Anos:</span>
                <span className="text-sm font-medium text-gray-900">{segment.grades.length}</span>
              </div>

              {segment.grades.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {segment.grades.slice(0, 3).map((grade, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {grade}
                      </span>
                    ))}
                    {segment.grades.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{segment.grades.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum segmento encontrado' : 'Nenhum segmento cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os filtros de pesquisa' 
              : activeAcademicYear 
                ? 'Comece criando o primeiro segmento de ensino'
                : 'Defina um ano letivo ativo primeiro'}
          </p>
          {!searchTerm && activeAcademicYear && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Criar Primeiro Segmento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
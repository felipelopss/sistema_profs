import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Users, Clock, BookOpen } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Class } from '../../types';

export default function ClassesList() {
  const { classes, createClass, updateClass, deleteClass, activeAcademicYear, subjects, teachers, classSubjects, createClassSubject, updateClassSubject, deleteClassSubject } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showSubjectsForm, setShowSubjectsForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<'all' | 'morning' | 'afternoon' | 'full'>('all');
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    shift: 'morning' as 'morning' | 'afternoon' | 'full',
    studentsCount: 0
  });

  const [subjectFormData, setSubjectFormData] = useState({
    subjectId: '',
    teacherId: '',
    weeklyHours: 1
  });
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = filterShift === 'all' || cls.shift === filterShift;
    const matchesYear = !activeAcademicYear || cls.academicYear === activeAcademicYear.id;
    
    return matchesSearch && matchesShift && matchesYear;
  });

  const getClassSubjects = (classId: string) => {
    return classSubjects.filter(cs => cs.classId === classId);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Disciplina não encontrada';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Professor não encontrado';
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAcademicYear) {
      alert('Por favor, selecione um ano letivo ativo primeiro.');
      return;
    }
    
    const classData = {
      ...formData,
      academicYear: activeAcademicYear.id
    };

    if (editingClass) {
      updateClass(editingClass.id, classData);
    } else {
      createClass(classData);
    }

    setShowForm(false);
    setEditingClass(null);
    setFormData({
      name: '',
      grade: '',
      shift: 'morning',
      studentsCount: 0
    });
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !activeAcademicYear) return;

    // Verificar se já existe essa associação
    const existingAssociation = classSubjects.find(cs => 
      cs.classId === selectedClass.id && 
      cs.subjectId === subjectFormData.subjectId
    );

    if (existingAssociation) {
      alert('Esta disciplina já está associada a esta turma.');
      return;
    }

    createClassSubject({
      classId: selectedClass.id,
      subjectId: subjectFormData.subjectId,
      teacherId: subjectFormData.teacherId,
      weeklyHours: subjectFormData.weeklyHours,
      weeklyClasses: subjectFormData.weeklyHours,
      academicYear: activeAcademicYear.id,
      priority: 1
    });

    setSubjectFormData({
      subjectId: '',
      teacherId: '',
      weeklyHours: 1
    });
  };

  const handleManageSubjects = (cls: Class) => {
    setSelectedClass(cls);
    setShowSubjectsForm(true);
  };

  const handleRemoveSubject = (classSubjectId: string) => {
    if (confirm('Tem certeza que deseja remover esta disciplina da turma?')) {
      deleteClassSubject(classSubjectId);
    }
  };
  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      studentsCount: cls.studentsCount
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      deleteClass(id);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600 mt-1">Gerencie as turmas da instituição</p>
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
          <span>Nova Turma</span>
        </button>
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> Você precisa definir um ano letivo ativo antes de cadastrar turmas.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Todos os Turnos</option>
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="full">Integral</option>
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClass ? 'Editar Turma' : 'Nova Turma'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="7º Ano A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Série/Ano
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="7º Ano"
                  required
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Alunos
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.studentsCount}
                  onChange={(e) => setFormData({ ...formData, studentsCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingClass ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClass(null);
                    setFormData({
                      name: '',
                      grade: '',
                      shift: 'morning',
                      studentsCount: 0
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

      {/* Subjects Management Modal */}
      {showSubjectsForm && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Disciplinas da Turma: {selectedClass.name}
            </h3>
            
            {/* Current Subjects */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Disciplinas Atuais</h4>
              <div className="space-y-2">
                {getClassSubjects(selectedClass.id).map((cs) => (
                  <div key={cs.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{getSubjectName(cs.subjectId)}</p>
                          <p className="text-sm text-gray-600">
                            Professor: {cs.teacherId ? getTeacherName(cs.teacherId) : 'Não definido'} | 
                            {cs.weeklyHours}h/semana
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(cs.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {getClassSubjects(selectedClass.id).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma disciplina associada</p>
                )}
              </div>
            </div>

            {/* Add New Subject */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Adicionar Disciplina</h4>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplina
                  </label>
                  <select
                    value={subjectFormData.subjectId}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma disciplina</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professor
                  </label>
                  <select
                    value={subjectFormData.teacherId}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, teacherId: e.target.value })}
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
                    Carga Horária Semanal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={subjectFormData.weeklyHours}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, weeklyHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Adicionar Disciplina
                </button>
              </form>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowSubjectsForm(false);
                  setSelectedClass(null);
                  setSubjectFormData({
                    subjectId: '',
                    teacherId: '',
                    weeklyHours: 1
                  });
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{cls.grade}</p>
                  <p className="text-xs text-gray-500">ID: {cls.id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleManageSubjects(cls)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Gerenciar Disciplinas"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(cls)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Turno:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(cls.shift)}`}>
                  {getShiftLabel(cls.shift)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disciplinas:</span>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{getClassSubjects(cls.id).length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alunos:</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{cls.studentsCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os filtros de pesquisa' 
              : activeAcademicYear 
                ? 'Comece criando a primeira turma'
                : 'Defina um ano letivo ativo primeiro'}
          </p>
          {!searchTerm && activeAcademicYear && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Criar Primeira Turma
            </button>
          )}
        </div>
      )}
    </div>
  );
}
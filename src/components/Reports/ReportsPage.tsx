import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export default function ReportsPage() {
  const { 
    schedules, 
    teachers, 
    subjects, 
    classes, 
    classrooms, 
    timeSlots,
    activeAcademicYear 
  } = useData();

  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');

  // Filter data based on active academic year
  const filteredSchedules = schedules.filter(s => 
    !activeAcademicYear || s.academicYear === activeAcademicYear.id
  );
  const filteredClasses = classes.filter(c => 
    !activeAcademicYear || c.academicYear === activeAcademicYear.id
  );

  // Calculate statistics
  const totalScheduledClasses = filteredSchedules.length;
  const activeTeachers = teachers.filter(t => t.role === 'teacher').length;
  const totalSubjects = subjects.length;
  const totalClassrooms = classrooms.length;

  // Teacher workload analysis
  const teacherWorkload = teachers
    .filter(t => t.role === 'teacher')
    .map(teacher => {
      const teacherSchedules = filteredSchedules.filter(s => s.teacherId === teacher.id);
      return {
        name: teacher.name,
        totalClasses: teacherSchedules.length,
        subjects: [...new Set(teacherSchedules.map(s => s.subjectId))].length,
        classes: [...new Set(teacherSchedules.map(s => s.classId))].length
      };
    })
    .sort((a, b) => b.totalClasses - a.totalClasses);

  // Subject distribution
  const subjectDistribution = subjects.map(subject => {
    const subjectSchedules = filteredSchedules.filter(s => s.subjectId === subject.id);
    return {
      name: subject.name,
      totalClasses: subjectSchedules.length,
      color: subject.color
    };
  }).sort((a, b) => b.totalClasses - a.totalClasses);

  // Classroom utilization
  const classroomUtilization = classrooms.map(classroom => {
    const classroomSchedules = filteredSchedules.filter(s => s.classroomId === classroom.id);
    const totalSlots = timeSlots.filter(ts => !ts.isBreak).length * 5; // 5 days
    const utilizationRate = totalSlots > 0 ? (classroomSchedules.length / totalSlots) * 100 : 0;
    
    return {
      name: classroom.name,
      totalClasses: classroomSchedules.length,
      utilizationRate: Math.round(utilizationRate),
      capacity: classroom.capacity
    };
  }).sort((a, b) => b.utilizationRate - a.utilizationRate);

  // Class schedule completion
  const classCompletion = filteredClasses.map(cls => {
    const classSchedules = filteredSchedules.filter(s => s.classId === cls.id);
    const totalSlots = timeSlots.filter(ts => !ts.isBreak).length * 5; // 5 days
    const completionRate = totalSlots > 0 ? (classSchedules.length / totalSlots) * 100 : 0;
    
    return {
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      totalClasses: classSchedules.length,
      completionRate: Math.round(completionRate),
      studentsCount: cls.studentsCount
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      full: 'Integral'
    };
    return labels[shift as keyof typeof labels];
  };

  const generatePDF = (reportType: string) => {
    // Simulate PDF generation
    alert(`Relatório "${reportType}" será gerado em PDF. Funcionalidade em desenvolvimento.`);
  };

  const exportExcel = (reportType: string) => {
    // Simulate Excel export
    alert(`Relatório "${reportType}" será exportado para Excel. Funcionalidade em desenvolvimento.`);
  };

  const reportTypes = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'teachers', name: 'Professores', icon: Users },
    { id: 'subjects', name: 'Disciplinas', icon: BookOpen },
    { id: 'classrooms', name: 'Salas de Aula', icon: MapPin },
    { id: 'classes', name: 'Turmas', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e estatísticas do sistema de horários</p>
          {activeAcademicYear && (
            <p className="text-sm text-primary-600 mt-1">
              Ano Letivo: {activeAcademicYear.year}
            </p>
          )}
        </div>
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> Defina um ano letivo ativo para visualizar relatórios específicos.
          </p>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedReport === type.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aulas Programadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalScheduledClasses}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Professores Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{activeTeachers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disciplinas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubjects}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Salas de Aula</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalClassrooms}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Distribuição por Disciplina</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {subjectDistribution.slice(0, 5).map((subject, index) => (
                  <div key={subject.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{subject.totalClasses} aulas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Carga Horária dos Professores</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {teacherWorkload.slice(0, 5).map((teacher, index) => (
                  <div key={teacher.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-xs text-gray-500">{teacher.subjects} disciplinas</p>
                    </div>
                    <span className="text-sm text-gray-600">{teacher.totalClasses} aulas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Report */}
      {selectedReport === 'teachers' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Professores</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => generatePDF('teachers')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportExcel('teachers')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total de Aulas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disciplinas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turmas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherWorkload.map((teacher) => (
                  <tr key={teacher.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.totalClasses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.subjects}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.classes}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Classrooms Report */}
      {selectedReport === 'classrooms' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Utilização de Salas</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => generatePDF('classrooms')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportExcel('classrooms')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aulas Programadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Utilização
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classroomUtilization.map((classroom) => (
                  <tr key={classroom.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{classroom.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{classroom.capacity} alunos</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{classroom.totalClasses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-2">{classroom.utilizationRate}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(classroom.utilizationRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Classes Report */}
      {selectedReport === 'classes' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Turmas</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => generatePDF('classes')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportExcel('classes')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Série
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alunos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aulas Programadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completude
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classCompletion.map((cls) => (
                  <tr key={cls.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cls.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {getShiftLabel(cls.shift)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cls.studentsCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cls.totalClasses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-2">{cls.completionRate}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              cls.completionRate >= 80 ? 'bg-green-600' :
                              cls.completionRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(cls.completionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subjects Report */}
      {selectedReport === 'subjects' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Relatório de Disciplinas</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => generatePDF('subjects')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => exportExcel('subjects')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total de Aulas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turmas Atendidas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjectDistribution.map((subject) => {
                  const subjectSchedules = filteredSchedules.filter(s => s.subjectId === subjects.find(sub => sub.name === subject.name)?.id);
                  const teachersCount = [...new Set(subjectSchedules.map(s => s.teacherId))].length;
                  const classesCount = [...new Set(subjectSchedules.map(s => s.classId))].length;
                  
                  return (
                    <tr key={subject.name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{subject.totalClasses}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teachersCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classesCount}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
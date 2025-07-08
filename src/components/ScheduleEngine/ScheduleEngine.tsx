import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Zap,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ScheduleGenerationSettings, ScheduleStatistics } from '../../types';

export default function ScheduleEngine() {
  const { 
    scheduleGeneration, 
    generateSchedules, 
    conflicts, 
    activeAcademicYear,
    teachers,
    subjects,
    classes,
    classrooms,
    timeSlots,
    schedules
  } = useData();

  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'automatic' | 'manual'>('automatic');
  const [settings, setSettings] = useState<ScheduleGenerationSettings>({
    // Restrições rígidas
    enforceTeacherAvailability: true,
    enforceRoomCapacity: true,
    enforceSubjectRequirements: true,
    
    // Restrições flexíveis com pesos
    minimizeTeacherGaps: { enabled: true, weight: 8 },
    respectTeacherPreferences: { enabled: true, weight: 7 },
    distributeCognitiveLoad: { enabled: true, weight: 6 },
    avoidConsecutiveSameSubject: { enabled: true, weight: 5 },
    groupDoubleClasses: { enabled: true, weight: 4 },
    balanceWorkload: { enabled: true, weight: 3 },
    
    // Configurações específicas
    maxConsecutiveClasses: 3,
    maxDailyHours: 8,
    preferredBreakDuration: 20,
    allowOvertime: false
  });

  const [statistics, setStatistics] = useState<ScheduleStatistics>({
    totalSchedules: 0,
    successfulAllocations: 0,
    conflicts: 0,
    teacherGaps: 0,
    averageWorkload: 0,
    constraintsSatisfied: 0,
    constraintsTotal: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    // Calcular estatísticas em tempo real
    calculateStatistics();
  }, [teachers, subjects, classes, classrooms, timeSlots, schedules]);

  useEffect(() => {
    // Monitorar status da geração
    if (scheduleGeneration) {
      setIsGenerating(scheduleGeneration.status === 'running');
      if (scheduleGeneration.statistics) {
        setStatistics(scheduleGeneration.statistics);
      }
    }
  }, [scheduleGeneration]);

  const calculateStatistics = () => {
    const totalTeachers = teachers.filter(t => t.role === 'teacher').length;
    const totalSubjects = subjects.length;
    const totalClasses = classes.filter(c => !activeAcademicYear || c.academicYear === activeAcademicYear.id).length;
    const totalTimeSlots = timeSlots.filter(ts => !ts.isBreak && (!activeAcademicYear || ts.academicYear === activeAcademicYear.id)).length;
    
    // Calcular total de aulas necessárias
    const totalSchedulesNeeded = totalClasses * totalTimeSlots * 5; // 5 dias da semana
    const currentSchedules = schedules.filter(s => !activeAcademicYear || s.academicYear === activeAcademicYear.id).length;
    
    setStatistics(prev => ({
      ...prev,
      totalSchedules: totalSchedulesNeeded,
      successfulAllocations: currentSchedules,
      conflicts: conflicts.filter(c => !c.resolved).length,
      teacherGaps: Math.floor(currentSchedules * 0.1),
      averageWorkload: totalSchedulesNeeded / Math.max(totalTeachers, 1),
      constraintsSatisfied: 8,
      constraintsTotal: 10,
      satisfactionRate: totalSchedulesNeeded > 0 ? Math.round((currentSchedules / totalSchedulesNeeded) * 100) : 0
    }));
  };

  const handleGenerateSchedules = async () => {
    if (!activeAcademicYear) {
      alert('Por favor, selecione um ano letivo ativo primeiro.');
      return;
    }

    if (teachers.filter(t => t.role === 'teacher').length === 0) {
      alert('Cadastre pelo menos um professor antes de gerar horários.');
      return;
    }

    if (subjects.length === 0) {
      alert('Cadastre pelo menos uma disciplina antes de gerar horários.');
      return;
    }

    if (classes.filter(c => c.academicYear === activeAcademicYear.id).length === 0) {
      alert('Cadastre pelo menos uma turma antes de gerar horários.');
      return;
    }

    if (classrooms.length === 0) {
      alert('Cadastre pelo menos uma sala de aula antes de gerar horários.');
      return;
    }

    if (timeSlots.filter(ts => ts.academicYear === activeAcademicYear.id && !ts.isBreak).length === 0) {
      alert('Configure os horários de aula antes de gerar a grade.');
      return;
    }

    setIsGenerating(true);
    
    try {
      await generateSchedules(settings);
    } catch (error) {
      console.error('Erro na geração de horários:', error);
      alert('Erro ao gerar horários. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    // Implementar lógica para parar geração se necessário
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateFlexibleConstraint = (key: string, field: 'enabled' | 'weight', value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Clock;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Motor de Geração de Horários</h1>
          <p className="text-gray-600 mt-1">Sistema inteligente de criação automática de horários</p>
          {activeAcademicYear && (
            <p className="text-sm text-primary-600 mt-1">
              Ano Letivo: {activeAcademicYear.year}
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> Você precisa definir um ano letivo ativo antes de gerar horários.
          </p>
        </div>
      )}

      {/* Generation Mode Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Modo de Geração</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setGenerationMode('automatic')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              generationMode === 'automatic' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Zap className={`w-6 h-6 ${generationMode === 'automatic' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div>
                <h4 className="font-medium text-gray-900">Geração Automática</h4>
                <p className="text-sm text-gray-600">IA otimiza automaticamente com base nas restrições</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setGenerationMode('manual')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              generationMode === 'manual' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Edit3 className={`w-6 h-6 ${generationMode === 'manual' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div>
                <h4 className="font-medium text-gray-900">Geração Manual</h4>
                <p className="text-sm text-gray-600">Controle total sobre alocações específicas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalSchedules}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alocações Bem-sucedidas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.successfulAllocations}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflitos Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.conflicts}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Satisfação</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.satisfactionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Generation Control */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Controle de Geração</h3>
          
          {scheduleGeneration && (
            <div className="flex items-center space-x-2">
              {React.createElement(getStatusIcon(scheduleGeneration.status), {
                className: `w-5 h-5 ${getStatusColor(scheduleGeneration.status)}`
              })}
              <span className={`text-sm font-medium ${getStatusColor(scheduleGeneration.status)}`}>
                {scheduleGeneration.status === 'running' ? 'Gerando...' :
                 scheduleGeneration.status === 'completed' ? 'Concluído' :
                 scheduleGeneration.status === 'failed' ? 'Falhou' : 'Pendente'}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {scheduleGeneration && scheduleGeneration.status === 'running' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm text-gray-600">{scheduleGeneration.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scheduleGeneration.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-4">
          {!isGenerating ? (
            <button
              onClick={handleGenerateSchedules}
              disabled={!activeAcademicYear}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>
                {generationMode === 'automatic' ? 'Gerar Automaticamente' : 'Iniciar Geração Manual'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleStopGeneration}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Square className="w-5 h-5" />
              <span>Parar Geração</span>
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Configurar Restrições</span>
          </button>

          <button
            onClick={calculateStatistics}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Atualizar Estatísticas</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configurações de Geração</h3>
            
            <div className="space-y-6">
              {/* Restrições Rígidas */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Restrições Rígidas (Invioláveis)</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.enforceTeacherAvailability}
                      onChange={(e) => updateSetting('enforceTeacherAvailability', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Respeitar disponibilidade dos professores</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.enforceRoomCapacity}
                      onChange={(e) => updateSetting('enforceRoomCapacity', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Respeitar capacidade das salas</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.enforceSubjectRequirements}
                      onChange={(e) => updateSetting('enforceSubjectRequirements', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Respeitar requisitos especiais das disciplinas</span>
                  </label>
                </div>
              </div>

              {/* Restrições Flexíveis */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Restrições Flexíveis (Otimizáveis)</h4>
                <div className="space-y-4">
                  {Object.entries(settings).filter(([key, value]) => 
                    typeof value === 'object' && value !== null && 'enabled' in value
                  ).map(([key, constraint]) => (
                    <div key={key} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(constraint as any).enabled}
                          onChange={(e) => updateFlexibleConstraint(key, 'enabled', e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 min-w-0 flex-1">
                          {key === 'minimizeTeacherGaps' && 'Minimizar janelas dos professores'}
                          {key === 'respectTeacherPreferences' && 'Respeitar preferências dos professores'}
                          {key === 'distributeCognitiveLoad' && 'Distribuir carga cognitiva'}
                          {key === 'avoidConsecutiveSameSubject' && 'Evitar disciplinas consecutivas'}
                          {key === 'groupDoubleClasses' && 'Agrupar aulas geminadas'}
                          {key === 'balanceWorkload' && 'Equilibrar carga de trabalho'}
                        </span>
                      </label>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Peso:</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={(constraint as any).weight}
                          onChange={(e) => updateFlexibleConstraint(key, 'weight', parseInt(e.target.value))}
                          className="w-20"
                          disabled={!(constraint as any).enabled}
                        />
                        <span className="text-xs text-gray-600 w-6">{(constraint as any).weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurações Específicas */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Configurações Específicas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de aulas consecutivas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={settings.maxConsecutiveClasses}
                      onChange={(e) => updateSetting('maxConsecutiveClasses', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de horas por dia
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={settings.maxDailyHours}
                      onChange={(e) => updateSetting('maxDailyHours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração preferida do intervalo (min)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={settings.preferredBreakDuration}
                      onChange={(e) => updateSetting('preferredBreakDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.allowOvertime}
                        onChange={(e) => updateSetting('allowOvertime', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Permitir horas extras</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Salvar Configurações
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
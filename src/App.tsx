import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import TeachersList from './components/Teachers/TeachersList';
import ScheduleGrid from './components/Schedules/ScheduleGrid';
import AcademicYearManager from './components/AcademicYear/AcademicYearManager';
import SubjectsList from './components/Subjects/SubjectsList';
import ClassesList from './components/Classes/ClassesList';
import ClassroomsList from './components/Classrooms/ClassroomsList';
import TimeConfigManager from './components/TimeConfig/TimeConfigManager';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';
import SegmentsList from './components/Segments/SegmentsList';
import ScheduleEngine from './components/ScheduleEngine/ScheduleEngine';
import TeacherRestrictions from './components/TeacherRestrictions/TeacherRestrictions';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const getSectionTitle = (section: string) => {
    const titles = {
      dashboard: 'Dashboard',
      'academic-years': 'Anos Letivos',
      'segments': 'Segmentos de Ensino',
      teachers: 'Professores',
      'teacher-restrictions': 'Restrições e Preferências',
      subjects: 'Disciplinas',
      classes: 'Turmas',
      classrooms: 'Salas de Aula',
      schedules: 'Horários',
      'schedule-engine': 'Motor de Geração',
      'time-config': 'Configuração de Horários',
      reports: 'Relatórios',
      settings: 'Configurações',
    };
    return titles[section as keyof typeof titles] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return user.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />;
      case 'academic-years':
        return <AcademicYearManager />;
      case 'segments':
        return <SegmentsList />;
      case 'teachers':
        return <TeachersList />;
      case 'teacher-restrictions':
        return <TeacherRestrictions />;
      case 'subjects':
        return <SubjectsList />;
      case 'classes':
        return <ClassesList />;
      case 'classrooms':
        return <ClassroomsList />;
      case 'schedules':
        return <ScheduleGrid />;
      case 'schedule-engine':
        return <ScheduleEngine />;
      case 'time-config':
        return <TimeConfigManager />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return user.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getSectionTitle(activeSection)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
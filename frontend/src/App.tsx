import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import NewCasePage from './pages/NewCasePage';
import CaseWorkspacePage from './pages/CaseWorkspacePage';
import ImagesPage from './pages/ImagesPage';
import ChatsPage from './pages/ChatsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Initial Entry Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Existing Application Workspace Pages */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/new" element={<NewCasePage />} />
          <Route path="/cases/:caseId" element={<CaseWorkspacePage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

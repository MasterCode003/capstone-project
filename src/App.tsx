import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import StaffLoginPage from './components/StaffLoginPage';
import CreateAccount from './components/CreateAccount';
import DirectorsPage from './components/DirectorsPage';
import StaffDashboard from './components/StaffDashboard';
import StaffCreateAccount from './components/StaffCreateAccount';
import { EditorsProvider } from './contexts/EditorsContext';
import { ReviewersProvider } from './contexts/ReviewersContext';
import { RecordProvider } from './contexts/RecordContext';
import { DashboardProvider } from './contexts/DashboardContext';

import './index.css';

function App() {
  return (
    <DashboardProvider>
      <ReviewersProvider>
        <EditorsProvider>
          <RecordProvider>
            <Router>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/create-account" element={<CreateAccount />} />
                  
                  {/* Director routes */}
                  <Route path="/director">
                    <Route path="login" element={<LoginPage />} />
                    <Route path="dashboard" element={<DirectorsPage />} />
                  </Route>
                  
                  {/* Staff routes */}
                  <Route path="/staff">
                    <Route path="login" element={<StaffLoginPage />} />
                    <Route path="create-account" element={<StaffCreateAccount />} />
                    <Route path="dashboard" element={<StaffDashboard />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </RecordProvider>
        </EditorsProvider>
      </ReviewersProvider>
    </DashboardProvider>
  );
}

export default App;
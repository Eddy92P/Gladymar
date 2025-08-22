import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthContext from './store/auth-context';

import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
   const authCtx = useContext(AuthContext);

   return (
      <Routes>
         {!authCtx.isLoggedIn && (
            <>
               <Route path="/" element={<AuthPage />} />
               <Route path="*" element={<Navigate to="/" replace={true} />} />
            </>
         )}
         {authCtx.isLoggedIn && (
            <>
               <Route
                  path="/"
                  element={
                     <Navigate to="/principal/dashboard" replace={true} />
                  }
               />
               <Route path="/principal" element={<MainPage />}>
                  <Route
                     index
                     element={<Navigate to="dashboard" replace={true} />}
                  />
                  <Route path="dashboard" element={<DashboardPage />} />
               </Route>
               <Route
                  path="*"
                  element={
                     <Navigate to="/principal/dashboard" replace={true} />
                  }
               />
            </>
         )}
      </Routes>
   );
}

export default App;

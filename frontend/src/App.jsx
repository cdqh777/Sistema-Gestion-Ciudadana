import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Inicio           from './pages/Inicio';
import Login            from './pages/Login';
import Registro         from './pages/Registro';
import Requisitos       from './pages/Requisitos';
import MisTramites      from './pages/MisTramites';
import NuevoTramite     from './pages/NuevoTramite';
import DashboardFuncionario from './pages/DashboardFuncionario';
import DashboardAutoridad   from './pages/DashboardAutoridad';
import DetalleSolicitud     from './pages/DetalleSolicitud';
import GestionTramites      from './pages/GestionTramites';
import ReporteFuncionario   from './pages/ReporteFuncionario';
import PanelGestorUMSA      from './pages/PanelGestorUMSA';
import GestionConvenios     from './pages/GestionConvenios';
import MisTramitesUMSA      from './pages/MisTramitesUMSA';

function Ruta({ children, roles }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!usuario) return <Navigate to="/login" />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/"           element={<Inicio />} />
      <Route path="/login"      element={usuario ? <Navigate to="/" /> : <Login />} />
      <Route path="/registro"   element={usuario ? <Navigate to="/" /> : <Registro />} />
      <Route path="/requisitos" element={<Requisitos />} />

      {/* ciudadano */}
      <Route path="/mis-tramites"   element={<Ruta roles={['ciudadano']}><MisTramites /></Ruta>} />
      <Route path="/nuevo-tramite"  element={<Ruta roles={['ciudadano']}><NuevoTramite /></Ruta>} />

      {/* funcionario */}
      <Route path="/funcionario"               element={<Ruta roles={['funcionario']}><DashboardFuncionario /></Ruta>} />
      <Route path="/funcionario/solicitud/:id" element={<Ruta roles={['funcionario']}><DetalleSolicitud /></Ruta>} />
      <Route path="/funcionario/tramites"      element={<Ruta roles={['funcionario']}><GestionTramites /></Ruta>} />
      <Route path="/funcionario/reporte"       element={<Ruta roles={['funcionario']}><ReporteFuncionario /></Ruta>} />

      {/* gestor_umsa */}
      <Route path="/gestor-umsa"               element={<Ruta roles={['gestor_umsa']}><PanelGestorUMSA /></Ruta>} />
      <Route path="/gestor-umsa/solicitud/:id" element={<Ruta roles={['gestor_umsa']}><DetalleSolicitud /></Ruta>} />
      <Route path="/gestor-umsa/convenios"     element={<Ruta roles={['gestor_umsa', 'funcionario']}><GestionConvenios /></Ruta>} />
      <Route path="/gestor-umsa/reporte"       element={<Ruta roles={['gestor_umsa']}><ReporteFuncionario /></Ruta>} />

      {/* autoridad */}
      <Route path="/autoridad"               element={<Ruta roles={['autoridad']}><DashboardAutoridad /></Ruta>} />
      <Route path="/autoridad/solicitud/:id" element={<Ruta roles={['autoridad']}><DetalleSolicitud /></Ruta>} />
      <Route path="/autoridad/reporte"       element={<Ruta roles={['autoridad']}><ReporteFuncionario /></Ruta>} />

      {/* umsa - vista ciudadano */}
      <Route path="/mis-tramites-umsa" element={<Ruta roles={['ciudadano']}><MisTramitesUMSA /></Ruta>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14 } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

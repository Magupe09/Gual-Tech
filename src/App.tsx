import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MachineDetail from './pages/MachineDetail'
import AddMachine from './pages/AddMachine'
import AddReport from './pages/AddReport'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/machine/:id" 
        element={
          <ProtectedRoute>
            <Layout><MachineDetail /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-machine" 
        element={
          <ProtectedRoute>
            <Layout><AddMachine /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/machine/:id/add-report" 
        element={
          <ProtectedRoute>
            <Layout><AddReport /></Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App

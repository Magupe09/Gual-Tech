import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MachineDetail from './pages/MachineDetail'
import AddMachine from './pages/AddMachine'
import AddReport from './pages/AddReport'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/machine/:id" element={<MachineDetail />} />
      <Route path="/add-machine" element={<AddMachine />} />
      <Route path="/machine/:id/add-report" element={<AddReport />} />
    </Routes>
  )
}

export default App

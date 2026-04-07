import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MachineDetail from './pages/MachineDetail'
import AddMachine from './pages/AddMachine'
import AddReport from './pages/AddReport'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/machine/:id" element={<Layout><MachineDetail /></Layout>} />
      <Route path="/add-machine" element={<Layout><AddMachine /></Layout>} />
      <Route path="/machine/:id/add-report" element={<Layout><AddReport /></Layout>} />
    </Routes>
  )
}

export default App

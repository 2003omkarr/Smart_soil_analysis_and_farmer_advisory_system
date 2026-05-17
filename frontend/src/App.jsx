import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadSoilReport from './pages/UploadSoilReport'
import SoilAnalysis from './pages/SoilAnalysis'
import Recommendations from './pages/Recommendations'
import History from './pages/History'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'

function App() {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/upload" element={<PrivateRoute><UploadSoilReport /></PrivateRoute>} />
                <Route path="/analysis/:id" element={<PrivateRoute><SoilAnalysis /></PrivateRoute>} />
                <Route path="/recommendations/:id" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App

import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { FiHome, FiUpload, FiClock, FiUser, FiLogOut } from 'react-icons/fi'

const Layout = ({ children }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary-600">
                                Smart Soil Advisory
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                                <FiHome />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/upload" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                                <FiUpload />
                                <span>Upload</span>
                            </Link>
                            <Link to="/history" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                                <FiClock />
                                <span>History</span>
                            </Link>
                            <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                                <FiUser />
                                <span>Profile</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                            >
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}

export default Layout

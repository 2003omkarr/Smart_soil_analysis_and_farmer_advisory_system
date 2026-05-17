import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import {
    FiHome, FiUpload, FiClock, FiUser,
    FiBarChart2, FiTrendingUp, FiLogOut, FiFeather
} from 'react-icons/fi'
import { motion } from 'framer-motion'

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useAuth()
    const { t } = useTranslation()

    const menuItems = [
        { name: t('dashboard'),    path: '/dashboard',          icon: FiHome,       color: 'text-primary-600', bg: 'bg-primary-50' },
        { name: t('uploadReport'),path: '/upload',     icon: FiUpload,     color: 'text-blue-600',    bg: 'bg-blue-50'    },
        { name: t('soilAnalysis'),path: '/analysis',   icon: FiBarChart2,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
        { name: t('recommendations'),path:'/recommendations', icon: FiTrendingUp, color:'text-purple-600', bg:'bg-purple-50'},
        { name: t('history'),      path: '/history',    icon: FiClock,      color: 'text-green-600',   bg: 'bg-green-50'   },
        { name: t('profile'),      path: '/profile',    icon: FiUser,       color: 'text-rose-600',    bg: 'bg-rose-50'    },
    ]

    const initials = (userInfo?.name || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    const isActive = (path) =>
        path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                className="fixed lg:hidden inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-100 dark:border-gray-700
                           transform transition-transform duration-300 ease-in-out flex flex-col"
            >
                {/* ── Logo ── */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                        <FiFeather className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">Smart Soil</h1>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Advisory System</p>
                    </div>
                </div>

                {/* ── User Info ── */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userInfo?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize truncate">{userInfo?.role?.replace('_', ' ') || t('farmer')}</p>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-3">{t('mainMenu')}</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon   = item.icon
                            const active = isActive(item.path)
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                            active
                                                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            active ? 'bg-white/20' : `${item.bg} dark:bg-gray-700`
                                        }`}>
                                            <Icon className={`w-4 h-4 ${active ? 'text-white' : item.color}`} />
                                        </div>
                                        <span>{item.name}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="active-dot"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                            />
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* ── Logout ── */}
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                   text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        {t('logout')}
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">© 2026 Smart Soil Advisory</p>
                </div>
            </motion.aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-100 dark:border-gray-700 flex-col">
                {/* ── Logo ── */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                        <FiFeather className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">Smart Soil</h1>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Advisory System</p>
                    </div>
                </div>

                {/* ── User Info ── */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userInfo?.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize truncate">{userInfo?.role?.replace('_', ' ') || t('farmer')}</p>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-3">{t('mainMenu')}</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                            active
                                                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            active ? 'bg-white/20' : `${item.bg} dark:bg-gray-700`
                                        }`}>
                                            <Icon className={`w-4 h-4 ${active ? 'text-white' : item.color}`} />
                                        </div>
                                        <span>{item.name}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="active-dot"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                            />
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* ── Logout ── */}
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                   text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        {t('logout')}
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">© 2026 Smart Soil Advisory</p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DashboardLayout from '../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiUser, FiMail, FiPhone, FiMapPin,
    FiEdit2, FiSave, FiX, FiShield, FiCalendar, FiCheckCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTranslation } from '../hooks/useTranslation'

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
            <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value || '—'}</p>
        </div>
    </div>
)

const Profile = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((s) => s.auth)
    const { t } = useTranslation()

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        name:     user?.name     || '',
        phone:    user?.phone    || '',
        location: user?.location || '',
    })
    const [saving, setSaving] = useState(false)

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSave = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))   // simulate save
        toast.success('Profile updated successfully!')
        setSaving(false)
        setEditing(false)
    }

    const initials = (user?.name || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : t('recently')

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

                {/* ── Page Title ── */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('manageProfileDesc')}</p>
                </div>

                {/* ── Hero Card ── */}
                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 rounded-2xl p-8 text-white relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/10 rounded-full" />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border-2 border-white/30 shrink-0">
                            {initials}
                        </div>

                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold">{user?.name || 'Farmer'}</h2>
                            <p className="text-primary-200 capitalize mt-0.5">{user?.role?.replace('_', ' ') || 'Farmer'}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                    <FiShield className="w-3.5 h-3.5" /> {t('verifiedAccount')}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                    <FiCalendar className="w-3.5 h-3.5" /> {t('joined')} {joinDate}
                                </span>
                            </div>
                        </div>

                        <div className="sm:ml-auto">
                            <button
                                onClick={() => setEditing(!editing)}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur transition-all"
                            >
                                {editing ? <><FiX className="w-4 h-4" /> {t('cancel')}</> : <><FiEdit2 className="w-4 h-4" /> {t('editProfile')}</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Info / Edit Card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{t('personalInfo')}</h3>
                        {editing && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FiSave className="w-4 h-4" />
                                )}
                                {saving ? t('saving') : t('saveChanges')}
                            </motion.button>
                        )}
                    </div>

                    <div className="p-4 space-y-1">
                        <AnimatePresence mode="wait">
                            {editing ? (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="space-y-4 p-2"
                                >
                                    {/* Name */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                            <FiUser className="w-3.5 h-3.5" /> {t('fullName')}
                                        </label>
                                        <input
                                            name="name" value={form.name} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                        />
                                    </div>
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                            <FiMail className="w-3.5 h-3.5" /> {t('emailReadOnly')}
                                        </label>
                                        <input
                                            value={user?.email} disabled
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    {/* Phone */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                            <FiPhone className="w-3.5 h-3.5" /> {t('phone')}
                                        </label>
                                        <input
                                            name="phone" value={form.phone} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                        />
                                    </div>
                                    {/* Location */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                            <FiMapPin className="w-3.5 h-3.5" /> {t('location')}
                                        </label>
                                        <input
                                            name="location" value={form.location} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                >
                                    <InfoRow icon={FiUser}   label={t('fullName')} value={user?.name} />
                                    <InfoRow icon={FiMail}   label={t('email')}     value={user?.email} />
                                    <InfoRow icon={FiPhone}  label={t('phone')}     value={user?.phone} />
                                    <InfoRow icon={FiMapPin} label={t('location')}  value={user?.location} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Account Security Card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">{t('accountSecurity')}</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{t('password')}</p>
                                <p className="text-xs text-gray-500">{t('lastChangedRecently')}</p>
                            </div>
                        </div>
                        <button className="text-sm text-primary-600 font-medium hover:underline">{t('change')}</button>
                    </div>
                </div>

            </motion.div>
        </DashboardLayout>
    )
}

export default Profile

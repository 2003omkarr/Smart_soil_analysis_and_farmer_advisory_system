import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFeather, FiActivity, FiCpu, FiCloudLightning, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const Landing = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                                <FiFeather className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                                Smart Soil
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 px-5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-primary-50/50 to-white -z-10" />
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary-100/40 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -z-10" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6 border border-primary-100">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                AI-Powered Agriculture
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                                Grow Smarter with <br className="hidden md:block" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-emerald-500">
                                    Data-Driven Insights
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Upload your soil test reports and let our advanced AI instantly provide personalized crop recommendations, fertilizer schedules, and weather advisories to maximize your yield.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-lg font-medium py-4 px-8 rounded-full transition-all shadow-xl shadow-primary-200 hover:shadow-2xl hover:shadow-primary-300 transform hover:-translate-y-1">
                                    Start Analyzing Free
                                    <FiArrowRight />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines cutting-edge machine learning with agricultural science to give you the most accurate farming advice.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiActivity className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Instant Soil Analysis</h3>
                            <p className="text-gray-600">Simply upload a photo of your soil report. Our OCR technology extracts the data instantly so you don't have to type anything.</p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiCpu className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI Crop Prediction</h3>
                            <p className="text-gray-600">Our machine learning models analyze your soil's NPK, pH, and local climate to recommend the most profitable crops to plant.</p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiCloudLightning className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Weather Alerts</h3>
                            <p className="text-gray-600">Get location-based weather advisories tailored specifically to the crops you are growing, protecting your yield from extreme conditions.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <FiFeather className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">Smart Soil Advisory</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 Smart Soil Advisory System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing

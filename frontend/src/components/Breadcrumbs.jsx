import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // If we are on the dashboard, don't show breadcrumbs
    if (pathnames.length === 0) return null;

    const routeNameMap = {
        'upload': 'Upload Report',
        'history': 'Report History',
        'profile': 'My Profile',
        'analysis': 'Soil Analysis',
        'recommendations': 'AI Recommendations',
    };

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <FiHome className="w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    // Skip long IDs in the breadcrumb
                    if (name.length > 20) return null;

                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1 || (index === pathnames.length - 2 && pathnames[index + 1].length > 20);
                    
                    const displayName = routeNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

                    return (
                        <li key={name}>
                            <div className="flex items-center">
                                <FiChevronRight className="w-4 h-4 text-gray-400" />
                                {isLast ? (
                                    <span className="ml-1 text-sm font-medium text-gray-800 md:ml-2">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link
                                        to={routeTo}
                                        className="ml-1 text-sm font-medium text-gray-500 hover:text-primary-600 md:ml-2 transition-colors"
                                    >
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;

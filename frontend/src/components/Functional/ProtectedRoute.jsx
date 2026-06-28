import { Navigate } from 'react-router-dom';
import AuthContext from '../../store/auth-context';
import { useContext } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
	const authContext = useContext(AuthContext);

    if (!authContext.isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(authContext.userType)) {
        return <Navigate to="dashboard" />;
    }

    return children;
};

export default ProtectedRoute;
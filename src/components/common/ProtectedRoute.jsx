import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin');

    if (isAdmin !== 'true') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;

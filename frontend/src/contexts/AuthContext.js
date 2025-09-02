import React, { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import authStore from '../stores/AuthStore';

const AuthContext = createContext();

export const AuthProvider = observer(({ children }) => {
    return (
        <AuthContext.Provider value={authStore}>
            {children}
        </AuthContext.Provider>
    );
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

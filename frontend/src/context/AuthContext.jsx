import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from local storage or verify token on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser({ ...res.data, token: token }); // Assuming /me returns user info
                    setOrganization(res.data.organization);
                } catch (error) {
                    console.error("Failed to load user", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user, organization: org } = res.data;

        localStorage.setItem('token', token);
        setUser({ ...user, token }); // user object from response
        setOrganization(org);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        const { token, user: newUser, organization: newOrg } = res.data;

        localStorage.setItem('token', token);
        setUser({ ...newUser, token });
        setOrganization(newOrg);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setOrganization(null);
    };

    return (
        <AuthContext.Provider value={{ user, organization, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useContext } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                return null;
            }
            return decoded;
        } catch {
            localStorage.removeItem('token');
            return null;
        }
    });
    const [loading] = useState(false);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);

            // Redirect based on role
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'uploader') navigate('/uploader');
            else navigate('/verifier');

            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (data) => {
        try {
            const res = await api.post('/auth/register', data);
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);

            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'uploader') navigate('/uploader');
            else navigate('/verifier');

            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Signup failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

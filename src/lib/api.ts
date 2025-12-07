import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request - Headers:', config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login, clear token)
            // For now, we'll just reject the promise and let the UI handle it.
            // localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// Leaderboard API functions
export const leaderboardApi = {
    getLeaderboard: (sortBy: string = 'net_profit', limit: number = 100, timePeriod: string = 'all_time') =>
        api.get(`/api/leaderboard?sort_by=${sortBy}&limit=${limit}&time_period=${timePeriod}`),

    getUserRanking: (userId: string, sortBy: string = 'net_profit', timePeriod: string = 'all_time') =>
        api.get(`/api/leaderboard/user/${userId}?sort_by=${sortBy}&time_period=${timePeriod}`)
};

export default api;

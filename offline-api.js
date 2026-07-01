// ============================================
// MOCK DATA HANDLING (Replaces Backend API)
// EDCEPTA EDUCATION — offline / demo mode
// ============================================

const STORAGE_KEYS = {
    USERS: 'edcepta_users',
    CURRENT_USER: 'edcepta_current_user',
    AUTH_TOKEN: 'edcepta_auth_token',
    ORDERS: 'edcepta_orders',
    COURSES: 'edcepta_courses'
};

const LEGACY_STORAGE_KEYS = {
    USERS: 'gurukul_users',
    ORDERS: 'gurukul_orders',
    CURRENT_USER: 'currentUser',
    AUTH_TOKEN: 'authToken',
};

const EDCEPTA_DEMO_USERS = [
    {
        _id: 'user_admin_educepta',
        name: 'EDCEPTA Admin',
        email: 'admin@educepta.in',
        password: 'password123',
        role: 'admin',
        enrolledCourses: [],
        wishlist: []
    },
    {
        _id: 'user_student_educepta',
        name: 'EDCEPTA Student',
        email: 'student@educepta.in',
        password: 'password123',
        role: 'student',
        enrolledCourses: [],
        wishlist: []
    }
];

function migrateLegacyEdceptaStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const legacyUsers =
            localStorage.getItem(LEGACY_STORAGE_KEYS.USERS) ||
            localStorage.getItem('users');
        if (legacyUsers) {
            localStorage.setItem(STORAGE_KEYS.USERS, legacyUsers);
        }
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        const legacySession =
            localStorage.getItem(LEGACY_STORAGE_KEYS.CURRENT_USER) ||
            localStorage.getItem('gurukul_current_user');
        if (legacySession) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, legacySession);
        }
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
        const legacyToken =
            localStorage.getItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN) ||
            localStorage.getItem('gurukul_auth_token');
        if (legacyToken) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, legacyToken);
        }
    }
}

function initializeMockData() {
    migrateLegacyEdceptaStorage();
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(EDCEPTA_DEMO_USERS));
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
}

function isUserLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

function isUserAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

async function registerUser(name, email, password, role = 'student') {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'User already exists' };
    }
    const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email,
        password,
        role,
        enrolledCourses: [],
        wishlist: []
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'edcepta-mock-token-' + Date.now());
    return { success: true, data: { user: newUser, token: 'mock-token' } };
}

async function loginUser(email, password) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return { success: false, error: 'Invalid credentials' };
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'edcepta-mock-token-' + Date.now());
    return { success: true, data: { user, token: 'mock-token' } };
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem('selectedCourse');
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutItems');
    window.location.href = '/';
}

initializeMockData();

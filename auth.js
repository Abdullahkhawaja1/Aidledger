// User Authentication System

export const defaultUsers = [
  {
    id: 1,
    username: 'superadmin',
    password: 'superadmin123',
    role: 'superadmin',
    name: 'System Administrator',
    email: 'admin@aidledger.net',
    ngoId: null,
    ngoName: null
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin',
    role: 'ngo-admin',
    name: 'Admin User',
    email: 'admin@hopeaid.org',
    ngoId: 1,
    ngoName: 'HopeAid International'
  },
  {
    id: 3,
    username: 'abdullah',
    password: 'abdullah123',
    role: 'ngo-admin',
    name: 'Dr. Abdullah Khawaja',
    email: 'abdullah@hopeaid.org',
    ngoId: 1,
    ngoName: 'HopeAid International'
  },
  {
    id: 4,
    username: 'sarah',
    password: 'sarah123',
    role: 'ngo-admin',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@medrelief.org',
    ngoId: 2,
    ngoName: 'MedRelief Foundation'
  },
  {
    id: 5,
    username: 'michael',
    password: 'michael123',
    role: 'ngo-admin',
    name: 'Michael Chen',
    email: 'michael@shelterforall.org',
    ngoId: 3,
    ngoName: 'ShelterForAll Organization'
  }
];

export const defaultNGOs = [
  { 
    id: 1, 
    name: 'HopeAid International', 
    icon: 'Heart', 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    gradient: 'from-red-500 to-pink-500',
    description: 'Global humanitarian relief',
    location: 'Nairobi, Kenya',
    contact: 'contact@hopeaid.org',
    active: true,
    created: '2020-01-15'
  },
  { 
    id: 2, 
    name: 'MedRelief Foundation', 
    icon: 'Heart', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Medical assistance worldwide',
    location: 'Geneva, Switzerland',
    contact: 'info@medrelief.org',
    active: true,
    created: '2019-06-20'
  },
  { 
    id: 3, 
    name: 'ShelterForAll Organization', 
    icon: 'Home', 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Emergency housing solutions',
    location: 'Istanbul, Turkey',
    contact: 'help@shelterforall.org',
    active: true,
    created: '2021-03-10'
  },
  { 
    id: 4, 
    name: 'GlobalCash Assistance', 
    icon: 'DollarSign', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Financial aid programs',
    location: 'New York, USA',
    contact: 'support@globalcash.org',
    active: true,
    created: '2020-09-05'
  },
  { 
    id: 5, 
    name: 'NutriCare Program', 
    icon: 'Package', 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    gradient: 'from-orange-500 to-amber-500',
    description: 'Nutrition and food security',
    location: 'Rome, Italy',
    contact: 'info@nutricare.org',
    active: true,
    created: '2018-11-30'
  },
  { 
    id: 6, 
    name: 'Emergency Response Unit', 
    icon: 'Zap', 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Rapid crisis response',
    location: 'Dubai, UAE',
    contact: 'emergency@eru.org',
    active: true,
    created: '2022-01-15'
  }
];

export const authenticateUser = (username, password, userList) => {
  return userList.find(u => u.username === username && u.password === password);
};

export const getUsersByNGO = (ngoId, userList) => {
  return userList.filter(u => u.ngoId === ngoId);
};

export const getNGOById = (ngoId, ngoList) => {
  return ngoList.find(n => n.id === ngoId);
};

export const createNewUser = (userData, userList) => {
  const newUser = {
    id: Date.now(),
    username: userData.username,
    password: userData.password,
    role: 'ngo-admin',
    name: userData.name,
    email: userData.email,
    ngoId: parseInt(userData.ngoId),
    ngoName: userData.ngoName,
    createdAt: new Date().toISOString()
  };
  return [...userList, newUser];
};

export const updateUser = (userId, updates, userList) => {
  return userList.map(u => u.id === userId ? { ...u, ...updates } : u);
};

export const deleteUser = (userId, userList) => {
  return userList.filter(u => u.id !== userId);
};


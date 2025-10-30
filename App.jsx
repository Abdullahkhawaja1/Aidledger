import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Users, Package, History, CheckCircle, AlertCircle, ExternalLink, Zap, Database, Lock, Eye, ChevronRight, TrendingUp, Globe, QrCode, Camera, RefreshCw, Download, Upload, Activity, Award, FileText, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Filter, Search, Bell, Settings, LogOut, UserCheck, Clock, MapPin, DollarSign, Heart, Box, Home, Link as LinkIcon, Trash2, Copy, Check, Plus, Edit, User } from 'lucide-react';
import { testConnection, getNetworkStats, storeAidOnBlockchain, getSolanaExplorerUrl } from './solana';
import Logo from './Logo';

const hashUNHCRID = async (id, salt = 'AIDLEDGER2025SECRET') => {
  const input = salt + id.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const AidLedger = () => {
  const [view, setView] = useState('splash');
  const [unhcrId, setUnhcrId] = useState('');
  const [hashedId, setHashedId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedNgo, setSelectedNgo] = useState('HopeAid International');
  const [selectedAidType, setSelectedAidType] = useState('Food Package');
  const [aidAmount, setAidAmount] = useState('50');
  const [aidDescription, setAidDescription] = useState('');
  const [issuedAids, setIssuedAids] = useState([]);
  const [claimedAids, setClaimedAids] = useState([]);
  const [availableAids, setAvailableAids] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('issue');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  const [networkStats, setNetworkStats] = useState(null);
  const [copiedTx, setCopiedTx] = useState(null);
  const [adminProfile] = useState({
    name: 'Dr. Sarah Johnson',
    organization: 'HopeAid International',
    role: 'Field Coordinator',
    location: 'Nairobi, Kenya'
  });

  // Super Admin States
  const [superAdminTab, setSuperAdminTab] = useState('overview');
  const [ngoList, setNgoList] = useState([
    { id: 1, name: 'HopeAid International', description: 'Global humanitarian relief', active: true, aidCount: 45, totalValue: 2250 },
    { id: 2, name: 'MedRelief Foundation', description: 'Medical assistance worldwide', active: true, aidCount: 32, totalValue: 2400 },
    { id: 3, name: 'ShelterForAll Organization', description: 'Emergency housing solutions', active: true, aidCount: 28, totalValue: 5600 },
    { id: 4, name: 'GlobalCash Assistance', description: 'Financial aid programs', active: true, aidCount: 67, totalValue: 6700 },
    { id: 5, name: 'NutriCare Program', description: 'Nutrition and food security', active: true, aidCount: 89, totalValue: 4450 },
    { id: 6, name: 'Emergency Response Unit', description: 'Rapid crisis response', active: false, aidCount: 12, totalValue: 1200 }
  ]);
  const [userList, setUserList] = useState([
    { id: 1, username: 'superadmin', name: 'System Administrator', role: 'superadmin', ngoId: null, email: 'admin@aidledger.net', active: true },
    { id: 2, username: 'admin', name: 'Admin User', role: 'ngo-admin', ngoId: 1, ngoName: 'HopeAid International', email: 'admin@hopeaid.org', active: true },
    { id: 3, username: 'abdullah', name: 'Dr. Abdullah Khawaja', role: 'ngo-admin', ngoId: 1, ngoName: 'HopeAid International', email: 'abdullah@hopeaid.org', active: true },
    { id: 4, username: 'sarah', name: 'Dr. Sarah Johnson', role: 'ngo-admin', ngoId: 2, ngoName: 'MedRelief Foundation', email: 'sarah@medrelief.org', active: true },
    { id: 5, username: 'michael', name: 'Michael Chen', role: 'ngo-admin', ngoId: 3, ngoName: 'ShelterForAll Organization', email: 'michael@shelterforall.org', active: false }
  ]);
  const [showAddNGO, setShowAddNGO] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingNGO, setEditingNGO] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newNGO, setNewNGO] = useState({ name: '', description: '', active: true });
  const [newUser, setNewUser] = useState({ username: '', name: '', email: '', role: 'ngo-admin', ngoId: '', password: '', active: true });

  const ngos = [
    { name: 'HopeAid International', icon: Heart, color: 'text-red-600', bg: 'bg-red-50', description: 'Global humanitarian relief' },
    { name: 'MedRelief Foundation', icon: Heart, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Medical assistance worldwide' },
    { name: 'ShelterForAll Organization', icon: Home, color: 'text-green-600', bg: 'bg-green-50', description: 'Emergency housing solutions' },
    { name: 'GlobalCash Assistance', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', description: 'Financial aid programs' },
    { name: 'NutriCare Program', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Nutrition and food security' },
    { name: 'Emergency Response Unit', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Rapid crisis response' }
  ];

  const aidTypes = [
    { name: 'Food Package', value: '$50', icon: Package, description: 'Monthly food ration for family of 4', color: 'bg-orange-100 text-orange-700', details: 'Rice, beans, oil, salt, sugar' },
    { name: 'Shelter Kit', value: '$200', icon: Home, description: 'Emergency shelter materials', color: 'bg-blue-100 text-blue-700', details: 'Tarpaulin, rope, tools, nails' },
    { name: 'Medical Supplies', value: '$75', icon: Heart, description: 'Essential medicines and first aid', color: 'bg-red-100 text-red-700', details: 'Bandages, antibiotics, pain relief' },
    { name: 'Cash Transfer', value: '$100', icon: DollarSign, description: 'Direct financial assistance', color: 'bg-green-100 text-green-700', details: 'Unconditional cash assistance' },
    { name: 'Hygiene Kit', value: '$30', icon: Box, description: 'Personal hygiene essentials', color: 'bg-purple-100 text-purple-700', details: 'Soap, toothpaste, sanitary items' },
    { name: 'Education Materials', value: '$40', icon: FileText, description: 'School supplies and books', color: 'bg-indigo-100 text-indigo-700', details: 'Notebooks, pens, textbooks' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'splash') setView('home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    loadStorageData();
    initializeBlockchain();
  }, []);

  useEffect(() => {
    if (blockchainConnected) {
      const interval = setInterval(async () => {
        try {
          const stats = await getNetworkStats();
          setNetworkStats(stats);
        } catch (error) {
          console.error('Failed to fetch network stats:', error);
        }
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [blockchainConnected]);

  const initializeBlockchain = async () => {
    try {
      const result = await testConnection();
      setBlockchainConnected(result.connected);
      if (result.connected) {
        const stats = await getNetworkStats();
        setNetworkStats(stats);
        showAlert('Connected to Solana Devnet via QuickNode!', 'success');
      } else {
        showAlert('Using simulation mode - blockchain unavailable', 'info');
      }
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      setBlockchainConnected(false);
    }
  };

  const loadStorageData = () => {
    try {
      const issued = localStorage.getItem('issued_aids');
      const claimed = localStorage.getItem('claimed_aids');
      const notifs = localStorage.getItem('notifications');
      
      if (issued) setIssuedAids(JSON.parse(issued));
      if (claimed) setClaimedAids(JSON.parse(claimed));
      if (notifs) setNotifications(JSON.parse(notifs));
    } catch (e) {
      console.log('First time loading');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  // Super Admin Helper Functions
  const addNGO = () => {
    if (!newNGO.name.trim()) {
      showAlert('Please enter NGO name', 'error');
      return;
    }
    const ngo = {
      id: Math.max(...ngoList.map(n => n.id)) + 1,
      ...newNGO,
      aidCount: 0,
      totalValue: 0
    };
    setNgoList([...ngoList, ngo]);
    setNewNGO({ name: '', description: '', active: true });
    setShowAddNGO(false);
    showAlert('NGO added successfully!', 'success');
  };

  const editNGO = (ngo) => {
    setEditingNGO(ngo);
    setNewNGO({ name: ngo.name, description: ngo.description, active: ngo.active });
    setShowAddNGO(true);
  };

  const updateNGO = () => {
    if (!newNGO.name.trim()) {
      showAlert('Please enter NGO name', 'error');
      return;
    }
    setNgoList(ngoList.map(n => n.id === editingNGO.id ? { ...n, ...newNGO } : n));
    setEditingNGO(null);
    setNewNGO({ name: '', description: '', active: true });
    setShowAddNGO(false);
    showAlert('NGO updated successfully!', 'success');
  };

  const deleteNGO = (id) => {
    if (window.confirm('Are you sure you want to delete this NGO?')) {
      setNgoList(ngoList.filter(n => n.id !== id));
      showAlert('NGO deleted successfully!', 'success');
    }
  };

  const addUser = () => {
    if (!newUser.username.trim() || !newUser.name.trim() || !newUser.email.trim()) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }
    const user = {
      id: Math.max(...userList.map(u => u.id)) + 1,
      ...newUser,
      ngoName: newUser.ngoId ? ngoList.find(n => n.id === parseInt(newUser.ngoId))?.name : null
    };
    setUserList([...userList, user]);
    setNewUser({ username: '', name: '', email: '', role: 'ngo-admin', ngoId: '', password: '', active: true });
    setShowAddUser(false);
    showAlert('User added successfully!', 'success');
  };

  const editUser = (user) => {
    setEditingUser(user);
    setNewUser({ 
      username: user.username, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      ngoId: user.ngoId || '', 
      password: '', 
      active: user.active 
    });
    setShowAddUser(true);
  };

  const updateUser = () => {
    if (!newUser.username.trim() || !newUser.name.trim() || !newUser.email.trim()) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }
    const updatedUser = {
      ...newUser,
      ngoName: newUser.ngoId ? ngoList.find(n => n.id === parseInt(newUser.ngoId))?.name : null
    };
    setUserList(userList.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
    setEditingUser(null);
    setNewUser({ username: '', name: '', email: '', role: 'ngo-admin', ngoId: '', password: '', active: true });
    setShowAddUser(false);
    showAlert('User updated successfully!', 'success');
  };

  const deleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUserList(userList.filter(u => u.id !== id));
      showAlert('User deleted successfully!', 'success');
    }
  };

  const handleAdminLogin = async () => {
    if (password === 'admin') {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setView('admin-dashboard');
      showAlert('Welcome back, ' + adminProfile.name + '!', 'success');
      addNotification('Admin login successful from ' + adminProfile.location, 'success');
      setLoading(false);
    } else {
      showAlert('Invalid credentials. Demo password: admin', 'error');
    }
  };

  const handleIssueAid = async () => {
    if (!unhcrId.trim()) {
      showAlert('Please enter a UNHCR ID', 'error');
      return;
    }

    setLoading(true);
    
    try {
      showAlert('Hashing UNHCR ID...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const hashed = await hashUNHCRID(unhcrId);
      
      showAlert('Broadcasting to Solana network...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const aidTypeDetails = aidTypes.find(a => a.name === selectedAidType);
      
      // Store on blockchain
      const blockchainData = await storeAidOnBlockchain({
        action: 'issue',
        hashedId: hashed,
        ngo: selectedNgo,
        aidType: selectedAidType,
        amount: aidAmount
      });

      const newIssuance = {
        id: Date.now(),
        hashed_id: hashed,
        unhcr_id: unhcrId,
        ngo: selectedNgo,
        aid_type: selectedAidType,
        aid_value: aidTypeDetails?.value || '$50',
        amount: aidAmount,
        description: aidDescription || aidTypeDetails?.description || 'Humanitarian aid assistance',
        details: aidTypeDetails?.details || '',
        tx_signature: blockchainData.signature,
        block_time: blockchainData.blockTime,
        slot: blockchainData.slot,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        issuer: adminProfile.name,
        location: adminProfile.location,
        confirmations: blockchainData.simulated ? 12 : 0,
        explorerUrl: blockchainData.explorerUrl,
        simulated: blockchainData.simulated || false
      };

      const updatedIssued = [...issuedAids, newIssuance];
      setIssuedAids(updatedIssued);
      localStorage.setItem('issued_aids', JSON.stringify(updatedIssued));

      showAlert(`Aid issued successfully! ${blockchainData.simulated ? 'Simulated' : 'Confirmed on blockchain'}`, 'success');
      addNotification(`Issued ${selectedAidType} to ${unhcrId.substring(0, 8)}*** via ${selectedNgo}`, 'success');
      
      setUnhcrId('');
      setAidDescription('');
      
      if (!blockchainData.simulated) {
        setTimeout(() => {
          newIssuance.confirmations = 12;
          const updated = updatedIssued.map(a => a.id === newIssuance.id ? newIssuance : a);
          setIssuedAids(updated);
          localStorage.setItem('issued_aids', JSON.stringify(updated));
        }, 3000);
      }
      
    } catch (error) {
      showAlert('Failed to issue aid. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefugeeLogin = async () => {
    if (!unhcrId.trim()) {
      showAlert('Please enter your UNHCR ID', 'error');
      return;
    }

    setLoading(true);
    try {
      showAlert('Verifying identity...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Querying blockchain records...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const hashed = await hashUNHCRID(unhcrId);
      setHashedId(hashed);

      const available = issuedAids.filter(aid => 
        aid.hashed_id === hashed && 
        !claimedAids.some(claim => 
          claim.hashed_id === hashed && 
          claim.ngo === aid.ngo && 
          claim.aid_type === aid.aid_type
        )
      );

      setAvailableAids(available);
      setView('refugee-home');
      showAlert('Identity verified! Welcome to your dashboard', 'success');
    } catch (error) {
      showAlert('Failed to verify identity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAid = async (aid) => {
    setLoading(true);
    try {
      showAlert('Initiating claim transaction...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Recording claim on Solana...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const blockchainData = await storeAidOnBlockchain({
        action: 'claim',
        hashedId: aid.hashed_id,
        ngo: aid.ngo,
        aidType: aid.aid_type,
        amount: aid.amount
      });

      const newClaim = {
        id: Date.now(),
        hashed_id: aid.hashed_id,
        ngo: aid.ngo,
        aid_type: aid.aid_type,
        aid_value: aid.aid_value,
        tx_signature: blockchainData.signature,
        block_time: blockchainData.blockTime,
        slot: blockchainData.slot,
        timestamp: new Date().toISOString(),
        original_issue_tx: aid.tx_signature,
        confirmations: blockchainData.simulated ? 12 : 0,
        explorerUrl: blockchainData.explorerUrl,
        simulated: blockchainData.simulated || false
      };

      const updatedClaimed = [...claimedAids, newClaim];
      setClaimedAids(updatedClaimed);
      localStorage.setItem('claimed_aids', JSON.stringify(updatedClaimed));

      setAvailableAids(availableAids.filter(a => 
        !(a.ngo === aid.ngo && a.aid_type === aid.aid_type)
      ));

      showAlert(`${aid.aid_type} claimed successfully!`, 'success');
      
      if (!blockchainData.simulated) {
        setTimeout(() => {
          newClaim.confirmations = 12;
          const updated = updatedClaimed.map(c => c.id === newClaim.id ? newClaim : c);
          setClaimedAids(updated);
          localStorage.setItem('claimed_aids', JSON.stringify(updated));
        }, 3000);
      }
      
    } catch (error) {
      showAlert('Failed to claim aid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRefugeeClaimedAids = () => {
    return claimedAids.filter(claim => claim.hashed_id === hashedId);
  };

  const resetDemo = () => {
    localStorage.clear();
    setIssuedAids([]);
    setClaimedAids([]);
    setAvailableAids([]);
    setNotifications([]);
    setView('home');
    setUnhcrId('');
    setHashedId('');
    showAlert('Demo data has been reset', 'success');
  };

  const deleteIssuance = (id) => {
    const updated = issuedAids.filter(a => a.id !== id);
    setIssuedAids(updated);
    localStorage.setItem('issued_aids', JSON.stringify(updated));
    showAlert('Issuance deleted', 'success');
  };

  const getFilteredIssuances = () => {
    let filtered = issuedAids;
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.aid_type === filterType);
    }
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.unhcr_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ngo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tx_signature.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const calculateStats = () => {
    const totalValue = issuedAids.reduce((sum, aid) => {
      const value = parseFloat(aid.aid_value.replace('$', ''));
      return sum + value;
    }, 0);
    
    const claimedValue = claimedAids.reduce((sum, claim) => {
      const originalAid = issuedAids.find(a => a.tx_signature === claim.original_issue_tx);
      if (originalAid) {
        const value = parseFloat(originalAid.aid_value.replace('$', ''));
        return sum + value;
      }
      return sum;
    }, 0);

    const claimRate = issuedAids.length > 0 ? ((claimedAids.length / issuedAids.length) * 100).toFixed(1) : 0;
    const unclaimedValue = totalValue - claimedValue;

    return { totalValue, claimedValue, claimRate, unclaimedValue };
  };

  // SPLASH SCREEN
  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative text-center z-10">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-2 border-white border-opacity-30 animate-bounce">
            <Shield className="text-white" size={64} />
          </div>
          
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            <span className="text-white">Aid</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">Ledger</span>
          </h1>
          <p className="text-xl text-white text-opacity-80 mb-8">Blockchain-Powered Humanitarian Aid</p>
          
          <div className="flex items-center justify-center gap-2 text-white text-opacity-60 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connecting to Solana Network via QuickNode...</span>
          </div>
        </div>
      </div>
    );
  }

  // HOME SCREEN - COMPREHENSIVE LANDING PAGE
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        
        {/* Navigation */}
        <nav className="relative z-50 bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo />
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#about" className="text-white text-opacity-80 hover:text-white transition">About</a>
                <a href="#features" className="text-white text-opacity-80 hover:text-white transition">Features</a>
                <a href="#founder" className="text-white text-opacity-80 hover:text-white transition">Founder</a>
                <a href="#download" className="text-white text-opacity-80 hover:text-white transition">Download</a>
                <button 
                  onClick={() => setView('login-selection')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Launch App
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Network Status Bar */}
          {blockchainConnected && networkStats && (
            <div className="mt-6 mb-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-green-400 text-sm font-semibold mb-1">Network Status</div>
                  <div className="text-white font-bold flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Connected
                  </div>
                </div>
                <div>
                  <div className="text-blue-400 text-sm font-semibold mb-1">Current Slot</div>
                  <div className="text-white font-bold">{networkStats.currentSlot?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-purple-400 text-sm font-semibold mb-1">Block Height</div>
                  <div className="text-white font-bold">{networkStats.blockHeight?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-orange-400 text-sm font-semibold mb-1">TPS</div>
                  <div className="text-white font-bold">{networkStats.tps?.toFixed(0)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-full border border-white border-opacity-20 mb-8">
              <Shield className="text-green-400" size={24} />
              <span className="text-white font-semibold">Powered by Solana Blockchain</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="text-white">Transparent Aid Distribution</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">on Blockchain</span>
            </h1>
            
            <p className="text-2xl text-white text-opacity-80 max-w-4xl mx-auto mb-12 leading-relaxed">
              Ensuring every refugee gets fair access to humanitarian aid through blockchain technology. 
              <span className="text-blue-300 font-semibold"> No duplicates. Complete transparency. Privacy protected.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                onClick={() => setView('login-selection')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition transform hover:scale-105"
              >
                Get Started
              </button>
              <button 
                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-xl text-lg font-semibold transition"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
                <div className="text-white text-opacity-70">Refugees Helped</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">250K+</div>
                <div className="text-white text-opacity-70">Aid Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">15+</div>
                <div className="text-white text-opacity-70">NGO Partners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">$2M+</div>
                <div className="text-white text-opacity-70">Donations Tracked</div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <section id="about" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">About AidLedger</h2>
              <p className="text-2xl text-blue-300 font-semibold">Revolutionary Technology for Humanitarian Aid</p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 mb-20">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20">
                <h3 className="text-3xl font-bold text-red-400 mb-6">The Problem</h3>
                <p className="text-white text-opacity-80 mb-6 text-lg leading-relaxed">
                  In refugee camps worldwide, multiple NGOs distribute aid without coordination. This leads to:
                </p>
                <ul className="space-y-4 text-white text-opacity-70">
                  <li className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <span>Some refugees receive duplicate aid while others get nothing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <span>Lack of transparency in aid distribution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <span>No way for donors to track their contributions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <span>Privacy concerns with centralized databases</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20">
                <h3 className="text-3xl font-bold text-green-400 mb-6">Our Solution</h3>
                <p className="text-white text-opacity-80 mb-6 text-lg leading-relaxed">
                  AidLedger uses Solana blockchain to solve these challenges:
                </p>
                <ul className="space-y-4 text-white text-opacity-70">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span><strong className="text-green-300">NFT Identity:</strong> Each refugee gets a unique blockchain identity (NFT)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span><strong className="text-green-300">Prevent Duplicates:</strong> On-chain verification ensures fair distribution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span><strong className="text-green-300">Donor Transparency:</strong> Track donations with unique bill numbers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                    <span><strong className="text-green-300">Privacy Protected:</strong> UNHCR IDs are hashed, never stored publicly</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="features" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">How It Works</h2>
              <p className="text-2xl text-blue-300 font-semibold">Three Simple Steps to Transparent Aid</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Register</h3>
                <p className="text-white text-opacity-70 mb-6">
                  NGOs scan refugee UNHCR ID → System generates unique hash → Mints NFT identity on Solana blockchain
                </p>
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <code className="text-blue-300 text-sm">UNHCR ID → Hash → Solana NFT</code>
                </div>
              </div>

              <div className="text-center bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Distribute</h3>
                <p className="text-white text-opacity-70 mb-6">
                  NGOs issue aid → SPL tokens sent to refugee wallet → Transaction recorded on blockchain → Donors get bill numbers
                </p>
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <code className="text-green-300 text-sm">Aid → Token → Bill# → Blockchain</code>
                </div>
              </div>

              <div className="text-center bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Track</h3>
                <p className="text-white text-opacity-70 mb-6">
                  Donors track with bill number → See refugee helped → View blockchain proof → Complete transparency
                </p>
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <code className="text-purple-300 text-sm">Bill# → Refugee → Blockchain TX</code>
                </div>
              </div>
            </div>
          </section>

           {/* Founder Section */}
           <section id="founder" className="py-20">
             <div className="text-center mb-16">
               <h2 className="text-5xl font-bold text-white mb-6">Meet the Founder</h2>
               <p className="text-2xl text-blue-300 font-semibold">Innovating for Humanitarian Impact</p>
             </div>

             <div className="max-w-5xl mx-auto">
               <div className="relative">
                 {/* Main Gradient Card */}
                 <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                   {/* Decorative Circle Element */}
                   <div className="absolute left-8 top-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-30 blur-sm"></div>
                   
                   {/* Content */}
                   <div className="relative z-10 max-w-4xl mx-auto text-center">
                     <h3 className="text-4xl font-bold text-white mb-4">Abdullah Khawaja</h3>
                     <p className="text-xl text-purple-200 font-semibold mb-8">Blockchain Innovator & Humanitarian Technology Advocate</p>
                     
                     <div className="space-y-6 text-white text-opacity-90 text-lg leading-relaxed mb-8">
                       <p>
                         Abdullah Khawaja is a visionary blockchain innovator and humanitarian technology advocate dedicated to leveraging decentralized systems for social good. As a Solana blockchain expert with deep expertise in smart contracts, NFTs, and distributed ledger technology, Abdullah recognized the urgent need for transparent and fair humanitarian aid distribution in refugee camps worldwide.
                       </p>
                       
                       <p>
                         Driven by a passion for refugee rights and social justice, Abdullah founded AidLedger to revolutionize how humanitarian aid is distributed, tracked, and verified. By implementing cutting-edge blockchain technology with privacy-preserving cryptographic techniques, AidLedger ensures that every refugee receives fair access to aid while maintaining their dignity and privacy.
                       </p>
                       
                       <blockquote className="text-xl font-semibold italic text-white mt-8">
                         "Technology should serve humanity's most vulnerable. Every refugee deserves dignity, transparency, and fair access to aid."
                       </blockquote>
                     </div>
                     
                     {/* Social Media Buttons */}
                     <div className="flex justify-center gap-4">
                       <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                         </svg>
                         LinkedIn
                       </button>
                       <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                         </svg>
                         Twitter
                       </button>
                       <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                         </svg>
                         Instagram
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </section>

          {/* Download Section */}
          <section id="download" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">Download Our App</h2>
              <p className="text-2xl text-blue-300 font-semibold">Available on iOS and Android - Coming Soon!</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20 text-center">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-2">Download on the</h3>
                <h2 className="text-2xl font-bold text-white mb-4">App Store</h2>
                <button className="bg-gray-600 text-white px-6 py-3 rounded-lg opacity-50 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl border border-white border-opacity-20 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">Get it on</h3>
                <h2 className="text-2xl font-bold text-white mb-4">Google Play</h2>
                <button className="bg-gray-600 text-white px-6 py-3 rounded-lg opacity-50 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white text-opacity-70 text-lg mb-6">
                Meanwhile, use our web app on any device at aidledger.alkhawaja.net
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-12 rounded-3xl">
              <h2 className="text-5xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
              <p className="text-2xl text-white text-opacity-90 mb-8">
                Join us in revolutionizing humanitarian aid distribution
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => setView('login-selection')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition transform hover:scale-105"
                >
                  Launch Platform
                </button>
                <button 
                  onClick={() => setView('login-selection')}
                  className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-xl text-lg font-semibold transition"
                >
                  NGO Login
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 border-t border-white border-opacity-20">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Logo />
                </div>
                <p className="text-white text-opacity-70 mb-6">
                  Blockchain-powered humanitarian aid distribution for a transparent future.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-white text-opacity-70">
                  <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#features" className="hover:text-white transition">Features</a></li>
                  <li><a href="#founder" className="hover:text-white transition">Founder</a></li>
                  <li><a href="#download" className="hover:text-white transition">Download</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-white text-opacity-70">
                  <li><button onClick={() => setView('login-selection')} className="hover:text-white transition">NGO Login</button></li>
                  <li><button onClick={() => setView('refugee-login')} className="hover:text-white transition">Refugee Access</button></li>
                  <li><a href="#" className="hover:text-white transition">Dashboard</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Connect</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-green-400" size={20} />
                  <span className="text-white text-opacity-70 text-sm">Built on Solana</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white border-opacity-20 pt-8 text-center">
              <p className="text-white text-opacity-60">
                © 2025 AidLedger. All rights reserved.
              </p>
              <div className="flex justify-center gap-6 mt-4 text-white text-opacity-60 text-sm">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // LOGIN SELECTION SCREEN
  if (view === 'login-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-white text-opacity-80 hover:text-white transition mb-8"
          >
            <ArrowUpRight size={20} />
            Back to Home
          </button>

          <div className="text-center mb-12">
            <Logo size="large" className="justify-center mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to AidLedger</h1>
            <p className="text-white text-opacity-80 text-lg">Choose your access level to continue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* NGO Login */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition cursor-pointer group"
                 onClick={() => setView('admin-login')}>
              <div className="text-center">
                <div className="bg-blue-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">NGO Portal</h3>
                <p className="text-white text-opacity-80 mb-6">
                  Access for humanitarian organizations to issue and track aid distribution
                </p>
                <div className="space-y-2 text-sm text-white text-opacity-70">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Issue aid packages
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Track distribution history
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    View analytics dashboard
                  </div>
                </div>
              </div>
            </div>

            {/* Super Admin Login */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition cursor-pointer group"
                 onClick={() => setView('super-admin-login')}>
              <div className="text-center">
                <div className="bg-purple-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Super Admin</h3>
                <p className="text-white text-opacity-80 mb-6">
                  System administration access for platform management and oversight
                </p>
                <div className="space-y-2 text-sm text-white text-opacity-70">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Manage all NGOs
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    System analytics
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Platform configuration
                  </div>
                </div>
              </div>
            </div>

            {/* Refugee Access */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition cursor-pointer group"
                 onClick={() => setView('refugee-login')}>
              <div className="text-center">
                <div className="bg-green-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Refugee Access</h3>
                <p className="text-white text-opacity-80 mb-6">
                  For refugees to check their aid status and claim assistance
                </p>
                <div className="space-y-2 text-sm text-white text-opacity-70">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Check aid status
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Claim assistance
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    View transaction history
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white text-opacity-60 text-sm">
              Need help? Contact support at support@aidledger.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN LOGIN
  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-md mx-auto pt-12">
          <button
            onClick={() => setView('home')}
            className="mb-8 text-white text-opacity-80 hover:text-white flex items-center gap-2 transition"
          >
            <ChevronRight className="rotate-180" size={20} />
            Back to Home
          </button>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white border-opacity-20">
            <div className="bg-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="text-white" size={32} />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h2>
            <p className="text-white text-opacity-60 text-center mb-8">NGO Administrator Access</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white text-opacity-80 mb-2">
                  Organization ID
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-white placeholder-opacity-40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-lg transition"
                  placeholder="Enter your organization ID"
                  defaultValue="admin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white text-opacity-80 mb-2">
                  Access Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-white placeholder-opacity-40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-lg transition"
                  placeholder="Enter your password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              
              <div className="bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-xl p-4">
                <p className="text-blue-200 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  Demo credentials: Use password <span className="font-mono font-bold">admin</span>
                </p>
              </div>
              
              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Secure Login
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {alert && (
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3 z-50`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (view === 'admin-dashboard') {
    const stats = calculateStats();
    const filteredIssuances = getFilteredIssuances();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-gray-800">Aid</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Ledger</span>
                    <span className="text-gray-500 text-sm ml-2">Admin</span>
                  </h1>
                  <p className="text-sm text-gray-500">{adminProfile.organization}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {blockchainConnected && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-semibold">QuickNode Connected</span>
                  </div>
                )}
                
                <div className="relative cursor-pointer">
                  <Bell className="text-gray-600 hover:text-gray-800" size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <UserCheck size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{adminProfile.name}</p>
                    <p className="text-xs text-gray-500">{adminProfile.role}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setView('home');
                    setPassword('');
                  }}
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Package className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Issued</h3>
              <p className="text-3xl font-bold text-gray-800">{issuedAids.length}</p>
              <p className="text-sm text-gray-500 mt-2">${stats.totalValue.toFixed(2)} total value</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Claimed</h3>
              <p className="text-3xl font-bold text-gray-800">{claimedAids.length}</p>
              <p className="text-sm text-gray-500 mt-2">${stats.claimedValue.toFixed(2)} claimed</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Activity className="text-purple-600" size={24} />
                </div>
                <BarChart3 className="text-purple-500" size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Claim Rate</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.claimRate}%</p>
              <p className="text-sm text-gray-500 mt-2">{issuedAids.length - claimedAids.length} pending</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <DollarSign className="text-orange-600" size={24} />
                </div>
                <Clock className="text-orange-500" size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Unclaimed Value</h3>
              <p className="text-3xl font-bold text-gray-800">${stats.unclaimedValue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Awaiting distribution</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 border border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('issue')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
                  activeTab === 'issue'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Upload size={20} />
                  Issue Aid
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History size={20} />
                  Issuance History
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 size={20} />
                  Analytics
                </div>
              </button>
            </div>
          </div>

          {/* Issue Aid Tab */}
          {activeTab === 'issue' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Issue Form */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Package className="text-indigo-600" size={24} />
                  </div>
                  Issue New Aid Package
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refugee UNHCR ID
                    </label>
                    <input
                      type="text"
                      value={unhcrId}
                      onChange={(e) => setUnhcrId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Enter UNHCR ID"
                    />
                    <p className="text-xs text-gray-500 mt-2">ID will be hashed for privacy</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select NGO Organization
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ngos.map((ngo) => {
                        const Icon = ngo.icon;
                        return (
                          <button
                            key={ngo.name}
                            onClick={() => setSelectedNgo(ngo.name)}
                            className={`p-4 rounded-xl border-2 transition ${
                              selectedNgo === ngo.name
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`${ngo.bg} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                              <Icon className={ngo.color} size={24} />
                            </div>
                            <p className="text-xs font-semibold text-gray-700 text-center">{ngo.name.split(' ')[0]}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Aid Type
                    </label>
                    <div className="space-y-2">
                      {aidTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.name}
                            onClick={() => setSelectedAidType(type.name)}
                            className={`w-full p-4 rounded-xl border-2 transition text-left ${
                              selectedAidType === type.name
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`${type.color.split(' ')[0]} p-3 rounded-lg`}>
                                <Icon className={type.color.split(' ')[1]} size={24} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-gray-800">{type.name}</p>
                                  <p className="font-bold text-indigo-600">{type.value}</p>
                                </div>
                                <p className="text-xs text-gray-500">{type.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{type.details}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={aidDescription}
                      onChange={(e) => setAidDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                      rows={3}
                      placeholder="Add any special notes or conditions..."
                    />
                  </div>

                  <button
                    onClick={handleIssueAid}
                    disabled={loading || !unhcrId}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Processing on Blockchain...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Issue Aid Package
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview / Info */}
              <div className="space-y-6">
                {/* Selected Aid Preview */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                  <h3 className="text-xl font-bold mb-6">Issue Preview</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4">
                      <div className="text-sm text-white text-opacity-70 mb-1">Organization</div>
                      <div className="font-bold text-lg">{selectedNgo}</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4">
                      <div className="text-sm text-white text-opacity-70 mb-1">Aid Type</div>
                      <div className="font-bold text-lg">{selectedAidType}</div>
                      <div className="text-sm text-white text-opacity-70 mt-1">
                        {aidTypes.find(a => a.name === selectedAidType)?.description}
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4">
                      <div className="text-sm text-white text-opacity-70 mb-1">Estimated Value</div>
                      <div className="font-bold text-2xl">
                        {aidTypes.find(a => a.name === selectedAidType)?.value}
                      </div>
                    </div>

                    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4">
                      <div className="text-sm text-white text-opacity-70 mb-1">Issued By</div>
                      <div className="font-semibold">{adminProfile.name}</div>
                      <div className="text-sm text-white text-opacity-70">{adminProfile.location}</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Database className="text-indigo-600" size={20} />
                    Blockchain Information
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Network</span>
                      <span className="font-semibold text-gray-800">Solana Devnet</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">RPC Provider</span>
                      <span className="font-semibold text-gray-800">QuickNode</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Privacy Method</span>
                      <span className="font-semibold text-gray-800">SHA-256 Hash</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Confirmations</span>
                      <span className="font-semibold text-gray-800">~2-3 seconds</span>
                    </div>
                  </div>

                  {blockchainConnected && networkStats && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                        <CheckCircle size={16} />
                        Network Active
                      </div>
                      <div className="text-xs text-green-600 space-y-1">
                        <div>Current Slot: {networkStats.currentSlot?.toLocaleString()}</div>
                        <div>TPS: {networkStats.tps?.toFixed(0)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <History className="text-indigo-600" size={28} />
                    Issuance History
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Search..."
                      />
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      {aidTypes.map(type => (
                        <option key={type.name} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredIssuances.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 text-lg mb-2">No issuances found</p>
                    <p className="text-gray-400 text-sm">Start by issuing your first aid package</p>
                  </div>
                ) : (
                  filteredIssuances.map((aid) => {
                    const aidType = aidTypes.find(t => t.name === aid.aid_type);
                    const Icon = aidType?.icon || Package;
                    const ngo = ngos.find(n => n.name === aid.ngo);
                    const NgoIcon = ngo?.icon || Heart;
                    
                    return (
                      <div key={aid.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`${aidType?.color.split(' ')[0] || 'bg-gray-100'} p-3 rounded-xl`}>
                              <Icon className={aidType?.color.split(' ')[1] || 'text-gray-600'} size={24} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-bold text-gray-800 text-lg mb-1">{aid.aid_type}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <NgoIcon size={14} className={ngo?.color} />
                                    <span>{aid.ngo}</span>
                                    <span>•</span>
                                    <span>{aid.aid_value}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      aid.confirmations >= 12 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {aid.confirmations >= 12 ? (
                                        <div className="flex items-center gap-1">
                                          <CheckCircle size={12} />
                                          Confirmed
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <RefreshCw size={12} className="animate-spin" />
                                          Confirming...
                                        </div>
                                      )}
                                    </div>
                                    {aid.simulated && (
                                      <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        Simulated
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(aid.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">Refugee ID (Hashed)</div>
                                  <div className="font-mono text-xs text-gray-700 truncate">{aid.hashed_id.substring(0, 24)}...</div>
                                </div>
                                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">Issued By</div>
                                  <div className="text-xs text-gray-700">{aid.issuer}</div>
                                  <div className="text-xs text-gray-500">{aid.location}</div>
                                </div>
                              </div>

                              <div className="bg-indigo-50 px-3 py-2 rounded-lg mb-3">
                                <div className="text-xs text-indigo-600 font-semibold mb-1">Transaction Signature</div>
                                <div className="flex items-center gap-2">
                                  <div className="font-mono text-xs text-indigo-700 truncate flex-1">{aid.tx_signature}</div>
                                  <button
                                    onClick={() => copyToClipboard(aid.tx_signature, aid.id)}
                                    className="p-1 hover:bg-indigo-100 rounded transition"
                                  >
                                    {copiedTx === aid.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-indigo-600" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {!aid.simulated && aid.explorerUrl && (
                                  <a
                                    href={aid.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                                  >
                                    <ExternalLink size={14} />
                                    View on Solana Explorer
                                  </a>
                                )}
                                {aid.simulated && (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold">
                                    <AlertCircle size={14} />
                                    Simulation Mode
                                  </div>
                                )}
                                <button
                                  onClick={() => deleteIssuance(aid.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BarChart3 className="text-indigo-600" size={28} />
                  Distribution Analytics
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <Package className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-sm text-blue-600 font-semibold">Total Packages</div>
                        <div className="text-3xl font-bold text-blue-900">{issuedAids.length}</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-700">All time issuances</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-500 p-3 rounded-lg">
                        <CheckCircle className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-sm text-green-600 font-semibold">Claimed Rate</div>
                        <div className="text-3xl font-bold text-green-900">{stats.claimRate}%</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-700">{claimedAids.length} of {issuedAids.length} claimed</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-500 p-3 rounded-lg">
                        <DollarSign className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-sm text-purple-600 font-semibold">Total Value</div>
                        <div className="text-3xl font-bold text-purple-900">${stats.totalValue.toFixed(0)}</div>
                      </div>
                    </div>
                    <div className="text-sm text-purple-700">Across all packages</div>
                  </div>
                </div>

                {/* Aid Types Breakdown */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Aid Types Distribution</h3>
                  <div className="space-y-3">
                    {aidTypes.map(type => {
                      const count = issuedAids.filter(a => a.aid_type === type.name).length;
                      const percentage = issuedAids.length > 0 ? (count / issuedAids.length * 100).toFixed(1) : 0;
                      const Icon = type.icon;
                      
                      return (
                        <div key={type.name} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`${type.color.split(' ')[0]} p-2 rounded-lg`}>
                                <Icon className={type.color.split(' ')[1]} size={20} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{type.name}</div>
                                <div className="text-xs text-gray-500">{type.value} each</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800 text-lg">{count}</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${type.color.split(' ')[0]} h-2 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* NGO Distribution */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">NGO Distribution</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {ngos.map(ngo => {
                      const count = issuedAids.filter(a => a.ngo === ngo.name).length;
                      const Icon = ngo.icon;
                      
                      return (
                        <div key={ngo.name} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`${ngo.bg} p-3 rounded-lg`}>
                                <Icon className={ngo.color} size={24} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{ngo.name}</div>
                                <div className="text-xs text-gray-500">{ngo.description}</div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{count}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3 z-50 animate-fade-in`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  // SUPER ADMIN LOGIN
  if (view === 'super-admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
        <div className="max-w-md mx-auto pt-12">
          <button
            onClick={() => setView('login-selection')}
            className="flex items-center gap-2 text-white text-opacity-80 hover:text-white transition mb-8"
          >
            <ArrowUpRight size={20} />
            Back to Login Selection
          </button>

          <div className="text-center mb-8">
            <div className="bg-purple-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Super Admin Access</h1>
            <p className="text-white text-opacity-80">System administration portal</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (password === 'superadmin2025') {
                setView('super-admin-dashboard');
                showAlert('Super Admin access granted!', 'success');
              } else {
                showAlert('Invalid credentials', 'error');
              }
            }}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Super Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter super admin password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition transform hover:scale-105"
                >
                  Access Super Admin Portal
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-60 text-sm">
                Demo password: superadmin2025
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REFUGEE LOGIN
  if (view === 'refugee-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900 p-6">
        <div className="max-w-md mx-auto pt-12">
          <button
            onClick={() => setView('home')}
            className="mb-8 text-white text-opacity-80 hover:text-white flex items-center gap-2 transition"
          >
            <ChevronRight className="rotate-180" size={20} />
            Back to Home
          </button>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white border-opacity-20">
            <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="text-white" size={32} />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Refugee Portal</h2>
            <p className="text-white text-opacity-60 text-center mb-8">Access Your Aid Benefits</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white text-opacity-80 mb-2">
                  Your UNHCR ID
                </label>
                <input
                  type="text"
                  value={unhcrId}
                  onChange={(e) => setUnhcrId(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-white placeholder-opacity-40 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-lg transition"
                  placeholder="Enter your UNHCR ID"
                  onKeyPress={(e) => e.key === 'Enter' && handleRefugeeLogin()}
                />
                <p className="text-xs text-white text-opacity-60 mt-2">Your ID will be verified on the blockchain</p>
              </div>
              
              <div className="bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Lock className="text-blue-200 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-blue-200 text-sm font-semibold mb-1">Your Privacy is Protected</p>
                    <p className="text-blue-200 text-xs">Your ID is hashed using SHA-256 encryption before blockchain verification</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRefugeeLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Secure Access
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {alert && (
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3 z-50`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  // REFUGEE DASHBOARD
  if (view === 'refugee-home') {
    const myClaimed = getRefugeeClaimedAids();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500 via-teal-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-gray-800">Aid</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Ledger</span>
                    <span className="text-gray-500 text-sm ml-2">Refugee</span>
                  </h1>
                  <p className="text-sm text-gray-500">Your Aid Benefits</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {blockchainConnected && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-semibold">Verified</span>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setView('home');
                    setUnhcrId('');
                    setHashedId('');
                    setAvailableAids([]);
                  }}
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Available Aid</h3>
              <p className="text-3xl font-bold text-gray-800">{availableAids.length}</p>
              <p className="text-sm text-gray-500 mt-2">Ready to claim</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Claimed Aid</h3>
              <p className="text-3xl font-bold text-gray-800">{myClaimed.length}</p>
              <p className="text-sm text-gray-500 mt-2">Successfully received</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Shield className="text-purple-600" size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-semibold mb-1">Your ID (Hashed)</h3>
              <p className="text-sm font-mono text-gray-600 truncate">{hashedId.substring(0, 24)}...</p>
              <p className="text-xs text-gray-500 mt-2">Privacy protected</p>
            </div>
          </div>

          {/* Available Aid */}
          {availableAids.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Package className="text-blue-600" size={28} />
                Available Aid Packages
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {availableAids.map(aid => {
                  const aidType = aidTypes.find(t => t.name === aid.aid_type);
                  const Icon = aidType?.icon || Package;
                  const ngo = ngos.find(n => n.name === aid.ngo);
                  const NgoIcon = ngo?.icon || Heart;
                  
                  return (
                    <div key={aid.id} className="bg-white rounded-2xl shadow-sm p-6 border-2 border-blue-200 hover:border-blue-400 transition">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`${aidType?.color.split(' ')[0] || 'bg-gray-100'} p-4 rounded-xl`}>
                          <Icon className={aidType?.color.split(' ')[1] || 'text-gray-600'} size={32} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-xl mb-2">{aid.aid_type}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <NgoIcon size={14} className={ngo?.color} />
                            <span>{aid.ngo}</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mb-2">{aid.aid_value}</div>
                          <p className="text-sm text-gray-600">{aid.description}</p>
                          {aid.details && (
                            <p className="text-xs text-gray-500 mt-2">Includes: {aid.details}</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                        <div className="text-gray-500 mb-1">Issued on</div>
                        <div className="text-gray-700 font-semibold">{new Date(aid.timestamp).toLocaleString()}</div>
                        <div className="text-gray-500 mt-2">By {aid.issuer} • {aid.location}</div>
                      </div>

                      <button
                        onClick={() => handleClaimAid(aid)}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Claim This Aid
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Claimed History */}
          {myClaimed.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <History className="text-green-600" size={28} />
                Claimed Aid History
              </h2>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {myClaimed.map(claim => {
                  const aidType = aidTypes.find(t => t.name === claim.aid_type);
                  const Icon = aidType?.icon || Package;
                  const ngo = ngos.find(n => n.name === claim.ngo);
                  const NgoIcon = ngo?.icon || Heart;
                  
                  return (
                    <div key={claim.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`${aidType?.color.split(' ')[0] || 'bg-gray-100'} p-3 rounded-xl`}>
                          <Icon className={aidType?.color.split(' ')[1] || 'text-gray-600'} size={24} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">{claim.aid_type}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <NgoIcon size={14} className={ngo?.color} />
                                <span>{claim.ngo}</span>
                                <span>•</span>
                                <span>{claim.aid_value}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Claimed
                              </div>
                              {claim.simulated && (
                                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                  Simulated
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-green-50 px-3 py-2 rounded-lg mb-3">
                            <div className="text-xs text-green-600 font-semibold mb-1">Claim Transaction</div>
                            <div className="flex items-center gap-2">
                              <div className="font-mono text-xs text-green-700 truncate flex-1">{claim.tx_signature}</div>
                              <button
                                onClick={() => copyToClipboard(claim.tx_signature, claim.id)}
                                className="p-1 hover:bg-green-100 rounded transition"
                              >
                                {copiedTx === claim.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-600" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(claim.timestamp).toLocaleString()}
                            </div>
                          </div>

                          {!claim.simulated && claim.explorerUrl && (
                            <a
                              href={claim.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                            >
                              <ExternalLink size={14} />
                              View on Solana Explorer
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {availableAids.length === 0 && myClaimed.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
              <Package className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Aid Packages Found</h3>
              <p className="text-gray-600 mb-6">No aid packages have been issued to your ID yet. Please check with your local NGO office.</p>
              <button
                onClick={() => {
                  setView('home');
                  setUnhcrId('');
                  setHashedId('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Return Home
              </button>
            </div>
          )}
        </div>

        {alert && (
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3 z-50 animate-fade-in`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  // SUPER ADMIN DASHBOARD
  if (view === 'super-admin-dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-gray-800">Aid</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">Ledger</span>
                    <span className="text-purple-500 text-sm ml-2">Super Admin</span>
                  </h1>
                  <p className="text-sm text-gray-500">System Administration Portal</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {blockchainConnected && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-semibold">Blockchain Connected</span>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setView('login-selection');
                    setPassword('');
                  }}
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'ngos', label: 'Manage NGOs', icon: Users },
                { id: 'users', label: 'User Accounts', icon: User },
                { id: 'donations', label: 'Donations', icon: DollarSign },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSuperAdminTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-semibold text-sm transition ${
                    superAdminTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Overview Tab */}
          {superAdminTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 font-semibold">Active NGOs</div>
                      <div className="text-3xl font-bold text-blue-900">{ngoList.filter(n => n.active).length}</div>
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">Registered organizations</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-green-600 font-semibold">Total Users</div>
                      <div className="text-3xl font-bold text-green-900">{userList.length}</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">System users</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <Package className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-purple-600 font-semibold">Total Aid Packages</div>
                      <div className="text-3xl font-bold text-purple-900">{issuedAids.length}</div>
                    </div>
                  </div>
                  <div className="text-sm text-purple-700">All time distributions</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500 p-3 rounded-lg">
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-orange-600 font-semibold">Total Value</div>
                      <div className="text-3xl font-bold text-orange-900">${issuedAids.reduce((sum, aid) => sum + parseInt(aid.amount || 0), 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-sm text-orange-700">Aid value distributed</div>
                </div>
              </div>

              {/* Blockchain Status */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Database className="text-green-600" size={24} />
                  </div>
                  Blockchain Status
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-semibold">Network Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-semibold">Connected</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-semibold">RPC Provider</span>
                      <span className="text-blue-600 font-semibold">Helius</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {networkStats && (
                      <>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-semibold">Current Slot</span>
                          <span className="text-gray-900 font-mono">{networkStats.currentSlot?.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-semibold">TPS</span>
                          <span className="text-gray-900 font-semibold">{networkStats.tps?.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {issuedAids.slice(-5).map((aid, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Package className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{aid.aidType}</div>
                        <div className="text-xs text-gray-500">{aid.ngo} • ${aid.amount}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(aid.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NGOs Tab */}
          {superAdminTab === 'ngos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">NGO Management</h2>
                <button
                  onClick={() => {
                    setEditingNGO(null);
                    setNewNGO({ name: '', description: '', active: true });
                    setShowAddNGO(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add New NGO
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">NGO Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aid Count</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Value</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ngoList.map(ngo => (
                        <tr key={ngo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{ngo.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{ngo.description}</td>
                          <td className="px-6 py-4 text-gray-900">{ngo.aidCount}</td>
                          <td className="px-6 py-4 text-gray-900">${ngo.totalValue.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ngo.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ngo.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editNGO(ngo)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteNGO(ngo.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {superAdminTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Account Management</h2>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setNewUser({ username: '', name: '', email: '', role: 'ngo-admin', ngoId: '', password: '', active: true });
                    setShowAddUser(true);
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add New User
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">NGO</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userList.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{user.username}</td>
                          <td className="px-6 py-4 text-gray-600">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'superadmin' ? 'Super Admin' : 'NGO Admin'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.ngoName || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editUser(user)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {superAdminTab === 'donations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Donation Tracking</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-green-600 font-semibold">Total Donations</div>
                      <div className="text-3xl font-bold text-green-900">$45,250</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">This month</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 font-semibold">Growth Rate</div>
                      <div className="text-3xl font-bold text-blue-900">+12.5%</div>
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">vs last month</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-purple-600 font-semibold">Active Donors</div>
                      <div className="text-3xl font-bold text-purple-900">1,247</div>
                    </div>
                  </div>
                  <div className="text-sm text-purple-700">Registered donors</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Donations</h3>
                <div className="space-y-4">
                  {[
                    { donor: 'Anonymous', amount: 5000, date: '2024-01-15', ngo: 'HopeAid International' },
                    { donor: 'Tech Corp', amount: 2500, date: '2024-01-14', ngo: 'MedRelief Foundation' },
                    { donor: 'Global Fund', amount: 10000, date: '2024-01-13', ngo: 'ShelterForAll Organization' },
                    { donor: 'Community Trust', amount: 1500, date: '2024-01-12', ngo: 'NutriCare Program' }
                  ].map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <DollarSign className="text-white" size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{donation.donor}</div>
                          <div className="text-sm text-gray-500">{donation.ngo}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${donation.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{donation.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {superAdminTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Aid Distribution by NGO</h3>
                  <div className="space-y-4">
                    {ngoList.map(ngo => (
                      <div key={ngo.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">{ngo.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{ngo.aidCount}</div>
                          <div className="text-sm text-gray-500">packages</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Trends</h3>
                  <div className="space-y-4">
                    {[
                      { month: 'January 2024', aidCount: 45, value: 22500 },
                      { month: 'December 2023', aidCount: 38, value: 19000 },
                      { month: 'November 2023', aidCount: 42, value: 21000 },
                      { month: 'October 2023', aidCount: 35, value: 17500 }
                    ].map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-800">{month.month}</div>
                          <div className="text-sm text-gray-500">{month.aidCount} packages</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">${month.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Aid Type Distribution</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {aidTypes.map((type, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{Math.floor(Math.random() * 50) + 10}</div>
                      <div className="text-sm text-gray-600">{type.name}</div>
                      <div className="text-xs text-gray-500">{type.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit NGO Modal */}
        {showAddNGO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editingNGO ? 'Edit NGO' : 'Add New NGO'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NGO Name</label>
                  <input
                    type="text"
                    value={newNGO.name}
                    onChange={(e) => setNewNGO({ ...newNGO, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter NGO name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newNGO.description}
                    onChange={(e) => setNewNGO({ ...newNGO, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter NGO description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newNGO.active}
                    onChange={(e) => setNewNGO({ ...newNGO, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm font-semibold text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingNGO ? updateNGO : addNGO}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  {editingNGO ? 'Update NGO' : 'Add NGO'}
                </button>
                <button
                  onClick={() => {
                    setShowAddNGO(false);
                    setEditingNGO(null);
                    setNewNGO({ name: '', description: '', active: true });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ngo-admin">NGO Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NGO</label>
                  <select
                    value={newUser.ngoId}
                    onChange={(e) => setNewUser({ ...newUser, ngoId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select NGO</option>
                    {ngoList.map(ngo => (
                      <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="userActive"
                    checked={newUser.active}
                    onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="userActive" className="text-sm font-semibold text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingUser ? updateUser : addUser}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  onClick={() => {
                    setShowAddUser(false);
                    setEditingUser(null);
                    setNewUser({ username: '', name: '', email: '', role: 'ngo-admin', ngoId: '', password: '', active: true });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {alert && (
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3 z-50`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AidLedger;


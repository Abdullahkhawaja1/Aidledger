import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Users, Package, History, CheckCircle, AlertCircle, ExternalLink, Zap, Database, Lock, Eye, ChevronRight, TrendingUp, Globe, QrCode, Camera, RefreshCw, Download, Upload, Activity, Award, FileText, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Filter, Search, Bell, Settings, LogOut, UserCheck, Clock, MapPin, DollarSign, Heart, Box, Home } from 'lucide-react';

const hashUNHCRID = async (id, salt = 'AIDLEDGER2025SECRET') => {
  const input = salt + id.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateTxSignature = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  return Array.from({length: 88}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateBlockHash = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  return Array.from({length: 44}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

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
  const [showScanner, setShowScanner] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [adminProfile] = useState({
    name: 'Dr. Sarah Johnson',
    organization: 'HopeAid International',
    role: 'Field Coordinator',
    location: 'Nairobi, Kenya'
  });
  const [blockchainStats, setBlockchainStats] = useState({
    totalTransactions: 0,
    confirmedBlocks: 0,
    networkHealth: 100,
    gasPrice: 0.000005
  });

  const ngos = [
    { name: 'HopeAid International', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'MedRelief Foundation', icon: Heart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'ShelterForAll Organization', icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'GlobalCash Assistance', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'NutriCare Program', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Emergency Response Unit', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ];

  const aidTypes = [
    { name: 'Food Package', value: '$50', icon: Package, description: 'Monthly food ration for family of 4', color: 'bg-orange-100 text-orange-700' },
    { name: 'Shelter Kit', value: '$200', icon: Home, description: 'Emergency shelter materials', color: 'bg-blue-100 text-blue-700' },
    { name: 'Medical Supplies', value: '$75', icon: Heart, description: 'Essential medicines and first aid', color: 'bg-red-100 text-red-700' },
    { name: 'Cash Transfer', value: '$100', icon: DollarSign, description: 'Direct financial assistance', color: 'bg-green-100 text-green-700' },
    { name: 'Hygiene Kit', value: '$30', icon: Box, description: 'Personal hygiene essentials', color: 'bg-purple-100 text-purple-700' },
    { name: 'Education Materials', value: '$40', icon: FileText, description: 'School supplies and books', color: 'bg-indigo-100 text-indigo-700' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'splash') setView('home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainStats(prev => ({
        totalTransactions: issuedAids.length + claimedAids.length,
        confirmedBlocks: Math.floor((issuedAids.length + claimedAids.length) / 10) + 1,
        networkHealth: 95 + Math.random() * 5,
        gasPrice: 0.000005 + Math.random() * 0.000002
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [issuedAids, claimedAids]);

  const loadStorageData = async () => {
    try {
      const issued = await window.storage.get('issued_aids');
      const claimed = await window.storage.get('claimed_aids');
      const notifs = await window.storage.get('notifications');
      
      if (issued) setIssuedAids(JSON.parse(issued.value));
      if (claimed) setClaimedAids(JSON.parse(claimed.value));
      if (notifs) setNotifications(JSON.parse(notifs.value));
    } catch (e) {
      console.log('First time loading');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const addNotification = async (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    try {
      await window.storage.set('notifications', JSON.stringify(updated));
    } catch (e) {
      console.log('Storage error');
    }
  };

  const handleAdminLogin = async () => {
    if (password === 'admin') {
      setLoading(true);
      await simulateNetworkDelay();
      setView('admin-dashboard');
      showAlert('Welcome back, ' + adminProfile.name + '!');
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
      
      showAlert('Waiting for block confirmation...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const txSignature = generateTxSignature();
      const blockHash = generateBlockHash();
      const timestamp = new Date().toISOString();
      const blockNumber = blockchainStats.confirmedBlocks + 1;

      const aidTypeDetails = aidTypes.find(a => a.name === selectedAidType);
      
      const newIssuance = {
        id: Date.now(),
        hashed_id: hashed,
        unhcr_id: unhcrId,
        ngo: selectedNgo,
        aid_type: selectedAidType,
        aid_value: aidTypeDetails?.value || '$50',
        amount: aidAmount,
        description: aidDescription || aidTypeDetails?.description || 'Humanitarian aid assistance',
        tx_signature: txSignature,
        block_hash: blockHash,
        block_number: blockNumber,
        timestamp,
        status: 'confirmed',
        issuer: adminProfile.name,
        location: adminProfile.location,
        confirmations: 0,
        memo: `hashed_id:${hashed.substring(0, 16)}...|ngo:${selectedNgo}|aid:${selectedAidType}|action:issue`
      };

      const updatedIssued = [...issuedAids, newIssuance];
      setIssuedAids(updatedIssued);
      await window.storage.set('issued_aids', JSON.stringify(updatedIssued));

      showAlert(`Aid issued successfully! Transaction confirmed on block ${blockNumber}`, 'success');
      addNotification(`Issued ${selectedAidType} to ${unhcrId.substring(0, 8)}*** via ${selectedNgo}`, 'success');
      
      setUnhcrId('');
      setAidDescription('');
      
      setTimeout(async () => {
        newIssuance.confirmations = 12;
        const updated = updatedIssued.map(a => a.id === newIssuance.id ? newIssuance : a);
        setIssuedAids(updated);
        await window.storage.set('issued_aids', JSON.stringify(updated));
      }, 3000);
      
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
      
      const txSignature = generateTxSignature();
      const blockHash = generateBlockHash();
      const timestamp = new Date().toISOString();
      const blockNumber = blockchainStats.confirmedBlocks + 2;

      const newClaim = {
        id: Date.now(),
        hashed_id: aid.hashed_id,
        ngo: aid.ngo,
        aid_type: aid.aid_type,
        aid_value: aid.aid_value,
        tx_signature: txSignature,
        block_hash: blockHash,
        block_number: blockNumber,
        timestamp,
        original_issue_tx: aid.tx_signature,
        confirmations: 0,
        memo: `hashed_id:${aid.hashed_id.substring(0, 16)}...|ngo:${aid.ngo}|action:claim`
      };

      const updatedClaimed = [...claimedAids, newClaim];
      setClaimedAids(updatedClaimed);
      await window.storage.set('claimed_aids', JSON.stringify(updatedClaimed));

      setAvailableAids(availableAids.filter(a => 
        !(a.ngo === aid.ngo && a.aid_type === aid.aid_type)
      ));

      showAlert(`${aid.aid_type} claimed successfully! Transaction confirmed.`, 'success');
      
      setTimeout(async () => {
        newClaim.confirmations = 12;
        const updated = updatedClaimed.map(c => c.id === newClaim.id ? newClaim : c);
        setClaimedAids(updated);
        await window.storage.set('claimed_aids', JSON.stringify(updated));
      }, 3000);
      
    } catch (error) {
      showAlert('Failed to claim aid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRefugeeClaimedAids = () => {
    return claimedAids.filter(claim => claim.hashed_id === hashedId);
  };

  const resetDemo = async () => {
    try {
      await window.storage.delete('issued_aids');
      await window.storage.delete('claimed_aids');
      await window.storage.delete('notifications');
      setIssuedAids([]);
      setClaimedAids([]);
      setAvailableAids([]);
      setNotifications([]);
      setView('home');
      setUnhcrId('');
      setHashedId('');
      showAlert('Demo data has been reset', 'success');
    } catch (error) {
      showAlert('Failed to reset data', 'error');
    }
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

    return { totalValue, claimedValue, claimRate };
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative text-center z-10">
          <div className="bg-white bg-opacity-10 backdrop-blur-xl w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white border-opacity-20 animate-bounce">
            <Shield className="text-white" size={64} />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">AidLedger</h1>
          <p className="text-xl text-white text-opacity-80 mb-8">Blockchain-Powered Humanitarian Aid</p>
          
          <div className="flex items-center justify-center gap-2 text-white text-opacity-60 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connecting to Solana Network...</span>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-full border border-white border-opacity-20 mb-6">
              <Shield className="text-green-400" size={24} />
              <span className="text-white font-semibold">Powered by Solana</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Aid<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ledger</span>
            </h1>
            <p className="text-xl text-white text-opacity-70 max-w-2xl mx-auto mb-8">
              Revolutionary blockchain platform ensuring transparent, verifiable, and fraud-resistant humanitarian aid distribution
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div 
              onClick={() => setView('admin-login')}
              className="group bg-gradient-to-br from-indigo-500 from-opacity-20 to-purple-500 to-opacity-20 backdrop-blur-xl p-8 rounded-3xl border border-white border-opacity-20 hover:border-white hover:border-opacity-40 transition-all cursor-pointer transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="bg-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Wallet className="text-white" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">NGO Admin Portal</h3>
              <p className="text-white text-opacity-70 mb-6">Issue verified aid packages to refugees with blockchain-backed proof of distribution</p>
              
              <div className="flex items-center text-indigo-300 font-semibold group-hover:gap-3 gap-2 transition-all">
                Access Dashboard <ChevronRight size={20} />
              </div>
            </div>

            <div 
              onClick={() => setView('refugee-login')}
              className="group bg-gradient-to-br from-green-500 from-opacity-20 to-teal-500 to-opacity-20 backdrop-blur-xl p-8 rounded-3xl border border-white border-opacity-20 hover:border-white hover:border-opacity-40 transition-all cursor-pointer transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Users className="text-white" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Refugee Portal</h3>
              <p className="text-white text-opacity-70 mb-6">Access your aid entitlements and claim verified assistance with complete privacy</p>
              
              <div className="flex items-center text-green-300 font-semibold group-hover:gap-3 gap-2 transition-all">
                View My Aid <ChevronRight size={20} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl border border-white border-opacity-20">
              <Lock className="text-blue-400 mb-3" size={32} />
              <h4 className="text-white font-semibold mb-2">Privacy First</h4>
              <p className="text-white text-opacity-60 text-sm">SHA-256 hashed IDs ensure refugee privacy while maintaining verification</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl border border-white border-opacity-20">
              <Database className="text-purple-400 mb-3" size={32} />
              <h4 className="text-white font-semibold mb-2">Immutable Records</h4>
              <p className="text-white text-opacity-60 text-sm">All transactions recorded permanently on Solana blockchain</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl border border-white border-opacity-20">
              <Eye className="text-green-400 mb-3" size={32} />
              <h4 className="text-white font-semibold mb-2">Full Transparency</h4>
              <p className="text-white text-opacity-60 text-sm">Auditable transactions visible to all stakeholders</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetDemo}
              className="text-white text-opacity-60 hover:text-white text-sm underline transition"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className={`fixed top-4 right-4 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20 flex items-center gap-3`}>
            {alert.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {alert.message}
          </div>
        )}
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    const stats = calculateStats();
    const filteredIssuances = getFilteredIssuances();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AidLedger Admin</h1>
                  <p className="text-sm text-gray-500">{adminProfile.organization}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
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
                    <p className="text-
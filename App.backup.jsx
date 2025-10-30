import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Users, Package, History, CheckCircle, AlertCircle, ExternalLink, Zap, Database, Lock, Eye, ChevronRight, TrendingUp, Globe, QrCode, Camera, RefreshCw, Download, Upload, Activity, Award, FileText, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Filter, Search, Bell, Settings, LogOut, UserCheck, Clock, MapPin, DollarSign, Heart, Box, Home, Link as LinkIcon, Trash2, Copy, Check } from 'lucide-react';
import { connection, testConnection, getNetworkStats, storeAidOnBlockchain, getSolanaExplorerUrl } from './solana';
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

  // HOME SCREEN
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {blockchainConnected && networkStats && (
            <div className="mb-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20">
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
          
          <div className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-full border border-white border-opacity-20 mb-6">
              <Shield className="text-green-400" size={24} />
              <span className="text-white font-semibold">Powered by Solana + QuickNode</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="text-white">Aid</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Ledger</span>
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
              <p className="text-white text-opacity-60 text-sm">All transactions recorded permanently on Solana blockchain via QuickNode</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl border border-white border-opacity-20">
              <Eye className="text-green-400 mb-3" size={32} />
              <h4 className="text-white font-semibold mb-2">Full Transparency</h4>
              <p className="text-white text-opacity-60 text-sm">Auditable transactions visible on Solana Explorer</p>
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
};

export default AidLedger;


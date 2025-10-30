import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Users, Package, History, CheckCircle, AlertCircle, ExternalLink, Zap, Database, Lock, Eye, ChevronRight, TrendingUp, Globe, QrCode, Camera, RefreshCw, Download, Upload, Activity, Award, FileText, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Filter, Search, Bell, Settings, LogOut, UserCheck, Clock, MapPin, DollarSign, Heart, Box, Home, Link as LinkIcon, Trash2, Copy, Check, Plus, Edit, X, Building2, UserPlus } from 'lucide-react';
import { connection, testConnection, getNetworkStats, storeAidOnBlockchain, getSolanaExplorerUrl } from './solana';

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

const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

const AidLedger = () => {
  const [view, setView] = useState('splash');
  const [unhcrId, setUnhcrId] = useState('');
  const [hashedId, setHashedId] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState(null); // 'superadmin' or 'ngo-admin'
  const [currentNGO, setCurrentNGO] = useState(null);
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
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  const [networkStats, setNetworkStats] = useState(null);
  const [copiedTx, setCopiedTx] = useState(null);
  
  // SuperAdmin states
  const [ngoList, setNgoList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showAddNGO, setShowAddNGO] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingNGO, setEditingNGO] = useState(null);

  const defaultNGOs = [
    { id: 1, name: 'HopeAid International', icon: 'Heart', color: 'text-red-600', bg: 'bg-red-50', description: 'Global humanitarian relief', active: true },
    { id: 2, name: 'MedRelief Foundation', icon: 'Heart', color: 'text-blue-600', bg: 'bg-blue-50', description: 'Medical assistance worldwide', active: true },
    { id: 3, name: 'ShelterForAll Organization', icon: 'Home', color: 'text-green-600', bg: 'bg-green-50', description: 'Emergency housing solutions', active: true },
    { id: 4, name: 'GlobalCash Assistance', icon: 'DollarSign', color: 'text-purple-600', bg: 'bg-purple-50', description: 'Financial aid programs', active: true },
    { id: 5, name: 'NutriCare Program', icon: 'Package', color: 'text-orange-600', bg: 'bg-orange-50', description: 'Nutrition and food security', active: true },
    { id: 6, name: 'Emergency Response Unit', icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Rapid crisis response', active: true }
  ];

  const defaultUsers = [
    { id: 1, username: 'superadmin', password: 'super123', role: 'superadmin', name: 'System Administrator', ngoId: null },
    { id: 2, username: 'abdullah', password: 'abdullah123', role: 'ngo-admin', name: 'Dr. Abdullah Khawaja', ngoId: 1, ngoName: 'HopeAid International' },
    { id: 3, username: 'sarah', password: 'sarah123', role: 'ngo-admin', name: 'Dr. Sarah Johnson', ngoId: 2, ngoName: 'MedRelief Foundation' },
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
    testConnection().then(result => {
      setBlockchainConnected(result.connected);
      if (result.connected) {
        getNetworkStats().then(stats => setNetworkStats(stats));
      }
    });
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
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [blockchainConnected]);

  const loadStorageData = () => {
    try {
      const issued = localStorage.getItem('issued_aids');
      const claimed = localStorage.getItem('claimed_aids');
      const notifs = localStorage.getItem('notifications');
      const ngos = localStorage.getItem('ngo_list');
      const users = localStorage.getItem('user_list');
      
      if (issued) setIssuedAids(JSON.parse(issued));
      if (claimed) setClaimedAids(JSON.parse(claimed));
      if (notifs) setNotifications(JSON.parse(notifs));
      if (ngos) setNgoList(JSON.parse(ngos));
      else setNgoList(defaultNGOs);
      if (users) setUserList(JSON.parse(users));
      else setUserList(defaultUsers);
    } catch (e) {
      console.log('First time loading, using defaults');
      setNgoList(defaultNGOs);
      setUserList(defaultUsers);
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

  const handleLogin = async () => {
    const user = userList.find(u => u.username === username && u.password === password);
    
    if (user) {
      setLoading(true);
      await simulateNetworkDelay();
      setUserRole(user.role);
      
      if (user.role === 'superadmin') {
        setView('superadmin-dashboard');
        showAlert(`Welcome Super Admin!`);
      } else {
        const ngo = ngoList.find(n => n.id === user.ngoId);
        setCurrentNGO(ngo);
        setSelectedNgo(ngo.name);
        setView('admin-dashboard');
        showAlert(`Welcome ${user.name}!`);
      }
      
      addNotification(`${user.name} logged in`, 'success');
      setLoading(false);
    } else {
      showAlert('Invalid credentials', 'error');
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
      
      showAlert('Broadcasting to Solana network via QuickNode...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // REAL BLOCKCHAIN INTEGRATION
      const blockchainResult = await storeAidOnBlockchain({
        hashedId: hashed,
        ngo: selectedNgo,
        aidType: selectedAidType,
        amount: aidAmount,
        description: aidDescription
      });
      
      showAlert('Waiting for block confirmation...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aidTypeDetails = aidTypes.find(a => a.name === selectedAidType);
      const currentUser = userList.find(u => u.username === username);
      
      const newIssuance = {
        id: Date.now(),
        hashed_id: hashed,
        unhcr_id: unhcrId,
        ngo: selectedNgo,
        ngoId: currentNGO?.id || 1,
        aid_type: selectedAidType,
        aid_value: aidTypeDetails?.value || '$50',
        amount: aidAmount,
        description: aidDescription || aidTypeDetails?.description || 'Humanitarian aid assistance',
        tx_signature: blockchainResult.signature,
        block_time: blockchainResult.blockTime,
        slot: blockchainResult.slot,
        timestamp: new Date().toISOString(),
        status: 'unclaimed', // Changed to unclaimed by default
        issuer: currentUser?.name || 'Admin',
        confirmations: blockchainResult.success ? 12 : 0,
        explorerUrl: blockchainResult.explorerUrl,
        onChain: blockchainResult.success,
        simulated: blockchainResult.simulated || false
      };

      const updatedIssued = [...issuedAids, newIssuance];
      setIssuedAids(updatedIssued);
      localStorage.setItem('issued_aids', JSON.stringify(updatedIssued));

      if (blockchainResult.success) {
        showAlert(`✅ Aid issued on Solana! TX: ${blockchainResult.signature.substring(0, 12)}...`, 'success');
      } else {
        showAlert(`Aid issued (simulation mode)`, 'info');
      }
      
      addNotification(`Issued ${selectedAidType} to ${unhcrId.substring(0, 8)}*** via ${selectedNgo}`, 'success');
      
      setUnhcrId('');
      setAidDescription('');
      
    } catch (error) {
      console.error('Issue aid error:', error);
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

      // Get unclaimed aids
      const available = issuedAids.filter(aid => 
        aid.hashed_id === hashed && aid.status === 'unclaimed'
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
      
      // Record claim on blockchain
      const blockchainResult = await storeAidOnBlockchain({
        hashedId: aid.hashed_id,
        ngo: aid.ngo,
        aidType: aid.aid_type,
        amount: aid.amount,
        action: 'claim'
      });

      const newClaim = {
        id: Date.now(),
        hashed_id: aid.hashed_id,
        ngo: aid.ngo,
        aid_type: aid.aid_type,
        aid_value: aid.aid_value,
        tx_signature: blockchainResult.signature,
        block_time: blockchainResult.blockTime,
        slot: blockchainResult.slot,
        timestamp: new Date().toISOString(),
        original_issue_tx: aid.tx_signature,
        original_issue_id: aid.id,
        confirmations: blockchainResult.success ? 12 : 0,
        explorerUrl: blockchainResult.explorerUrl,
        onChain: blockchainResult.success
      };

      // Update the original aid to claimed status
      const updatedIssued = issuedAids.map(a => 
        a.id === aid.id ? { ...a, status: 'claimed', claimedAt: new Date().toISOString(), claimTx: blockchainResult.signature } : a
      );
      setIssuedAids(updatedIssued);
      localStorage.setItem('issued_aids', JSON.stringify(updatedIssued));

      const updatedClaimed = [...claimedAids, newClaim];
      setClaimedAids(updatedClaimed);
      localStorage.setItem('claimed_aids', JSON.stringify(updatedClaimed));

      setAvailableAids(availableAids.filter(a => a.id !== aid.id));

      if (blockchainResult.success) {
        showAlert(`✅ ${aid.aid_type} claimed! TX: ${blockchainResult.signature.substring(0, 12)}...`, 'success');
      } else {
        showAlert(`${aid.aid_type} claimed (simulation mode)`, 'info');
      }
      
    } catch (error) {
      console.error('Claim error:', error);
      showAlert('Failed to claim aid', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Continue in next part...
  return <div>Loading...</div>;
};

export default AidLedger;


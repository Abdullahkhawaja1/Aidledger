import React from 'react';
import { Shield, TrendingUp, Users, DollarSign, Heart, ArrowRight, Check, Globe, Lock, Database, Zap } from 'lucide-react';

const LandingPage = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AidLedger</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-300 hover:text-white transition">About</a>
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#founder" className="text-gray-300 hover:text-white transition">Founder</a>
            <a href="#download" className="text-gray-300 hover:text-white transition">Download</a>
            <button
              onClick={onLaunchApp}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg shadow-purple-500/50"
            >
              Launch App
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Powered by Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold">Powered by Solana Blockchain</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Transparent Aid Distribution</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                on Blockchain
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Ensuring every refugee gets fair access to humanitarian aid through blockchain
              technology. No duplicates. Complete transparency. Privacy protected.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLaunchApp}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-2xl shadow-purple-500/50 flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-gray-300 font-medium">Refugees Helped</div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                250K+
              </div>
              <div className="text-gray-300 font-medium">Aid Distributed</div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                15+
              </div>
              <div className="text-gray-300 font-medium">NGO Partners</div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                $2M+
              </div>
              <div className="text-gray-300 font-medium">Donations Tracked</div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="mb-20 pt-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AidLedger</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Privacy First</h3>
                <p className="text-gray-300 leading-relaxed">
                  SHA-256 hashed IDs ensure refugee privacy while maintaining verification capabilities.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Immutable Records</h3>
                <p className="text-gray-300 leading-relaxed">
                  All transactions recorded permanently on Solana blockchain with complete transparency.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition group">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Full Transparency</h3>
                <p className="text-gray-300 leading-relaxed">
                  Auditable transactions visible to all stakeholders on Solana Explorer.
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/30 mb-20">
            <h3 className="text-3xl font-bold mb-8 text-center">Why Choose AidLedger?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Prevent Fraud</h4>
                  <p className="text-gray-300">Blockchain ensures no duplicate claims and complete accountability</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Track Everything</h4>
                  <p className="text-gray-300">Real-time visibility into aid distribution from source to recipient</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Protect Privacy</h4>
                  <p className="text-gray-300">Refugee identities secured with cryptographic hashing</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Build Trust</h4>
                  <p className="text-gray-300">Donors and stakeholders can verify every transaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Aid Distribution?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join NGOs worldwide using blockchain to ensure aid reaches those who need it most.
            </p>
            <button
              onClick={onLaunchApp}
              className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-xl hover:from-purple-700 hover:to-pink-700 transition shadow-2xl shadow-purple-500/50 inline-flex items-center gap-3 group"
            >
              Launch AidLedger Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition" />
            </button>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default LandingPage;


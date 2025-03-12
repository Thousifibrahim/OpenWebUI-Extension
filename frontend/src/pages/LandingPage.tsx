import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../store/store';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { user } = useStore();

  useEffect(() => {
    setIsVisible(true);
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Intelligent AI Management",
      description: "Create and manage AI-powered galaxies with unprecedented control and precision.",
      icon: "🧠"
    },
    {
      title: "Seamless Collaboration", 
      description: "Work together in real-time with your team across multiple AI workspaces.",
      icon: "🤝"
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption for all your AI conversations.",
      icon: "🔒"
    }
  ];

  const stats = [
    { value: "10M+", label: "AI Conversations" },
    { value: "50K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "180+", label: "Countries" }
  ];

  if (user) {
    // If user is logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P5</span>
              </div>
              <span className="text-xl font-semibold">Platform 5</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-6xl md:text-8xl font-thin mb-8 leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Experience the next generation of AI workspace management. 
              Designed for teams that demand excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/login"
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-2xl"
              >
                Start Free Trial
              </Link>
              <button className="border border-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:border-gray-400 transition-all duration-200 hover:scale-105">
                Watch Demo
              </button>
            </div>

            {/* Floating Product Preview */}
            <div className={`relative transform transition-all duration-1500 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl max-w-4xl mx-auto hover:scale-105 transition-transform duration-500">
                <div className="bg-black rounded-2xl p-6 border border-gray-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 h-20 hover:bg-gray-700 transition-colors"></div>
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 h-20 hover:from-blue-500 hover:to-purple-500 transition-all"></div>
                    <div className="bg-gray-800 rounded-lg p-4 h-20 hover:bg-gray-700 transition-colors"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-700 rounded h-3 w-3/4 animate-pulse"></div>
                    <div className="bg-gray-700 rounded h-3 w-1/2 animate-pulse delay-75"></div>
                    <div className="bg-gray-700 rounded h-3 w-2/3 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
              {/* Enhanced Floating Elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-8 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin mb-6">
              Engineered for
              <span className="text-blue-400"> Excellence</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every detail crafted to perfection. Every feature designed to empower.
            </p>
          </div>

          {/* Rotating Feature Display */}
          <div className="relative h-96 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  currentFeature === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="text-center">
                  <div className="text-8xl mb-8">{feature.icon}</div>
                  <h3 className="text-4xl font-light mb-6">{feature.title}</h3>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Indicators */}
          <div className="flex justify-center space-x-4">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentFeature === index 
                    ? 'bg-white' 
                    : 'bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-light mb-2 text-blue-400">
                  {stat.value}
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8 bg-gradient-to-t from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-thin mb-8">
            Ready to Transform
            <br />
            Your AI Workflow?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using Platform 5 to revolutionize 
            their AI management experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-2xl"
            >
              Start Your Journey
            </Link>
            <button className="border border-gray-600 text-white px-12 py-4 rounded-full text-lg font-medium hover:border-gray-400 transition-all duration-200 hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P5</span>
              </div>
              <span className="text-xl font-semibold">Platform 5</span>
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; 2025 Platform 5. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
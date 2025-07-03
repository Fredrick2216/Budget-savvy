
import React from 'react';

const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
      
      {/* Animated nebula clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Twinkling stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: 'twinkle 3s infinite'
            }}
          />
        ))}
      </div>

      {/* Floating asteroids */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-br from-gray-600 to-gray-800 rounded-full opacity-40"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Moving planets */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-60 blur-sm"
          style={{
            animation: 'orbit 30s linear infinite',
            left: '10%',
            top: '20%'
          }}
        />
        <div 
          className="absolute w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-50 blur-sm"
          style={{
            animation: 'orbit 45s linear infinite reverse',
            right: '15%',
            bottom: '30%'
          }}
        />
        <div 
          className="absolute w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-40 blur-sm"
          style={{
            animation: 'orbit 60s linear infinite',
            left: '70%',
            top: '60%'
          }}
        />
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `shootingStar 8s linear infinite`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          from { transform: translateX(-100px) rotate(0deg); }
          to { transform: translateX(calc(100vw + 100px)) rotate(360deg); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        
        @keyframes shootingStar {
          0% { 
            opacity: 0; 
            transform: translateX(0) translateY(0) scale(0);
          }
          10% { 
            opacity: 1; 
            transform: translateX(20px) translateY(20px) scale(1);
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
          }
          90% { 
            opacity: 1; 
            transform: translateX(200px) translateY(200px) scale(1);
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
          }
          100% { 
            opacity: 0; 
            transform: translateX(220px) translateY(220px) scale(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceBackground;

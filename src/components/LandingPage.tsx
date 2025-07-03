
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Wallet, TrendingUp, Shield, Smartphone, BarChart3 } from 'lucide-react';
import GalaxyBackground from './GalaxyBackground';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: <Wallet className="h-8 w-8 text-purple-300" />,
      title: "Smart Expense Tracking",
      description: "Track your expenses with AI-powered categorization and real-time insights"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-pink-300" />,
      title: "Budget Management",
      description: "Set budgets for daily, weekly, monthly, or yearly periods with smart alerts"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-300" />,
      title: "Visual Analytics",
      description: "Beautiful charts and graphs to visualize your spending patterns"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-300" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and stored securely in the cloud"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-yellow-300" />,
      title: "Multi-Currency Support",
      description: "Track expenses in multiple currencies with real-time conversion"
    },
    {
      icon: <Star className="h-8 w-8 text-purple-300" />,
      title: "AI Assistant",
      description: "Get personalized financial advice and spending recommendations"
    }
  ];

  return (
    <div className="min-h-screen relative text-white">
      <GalaxyBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-purple-300" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Budget Savvy
            </h1>
          </div>
          <Button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Master Your Money
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Track expenses, manage budgets, and achieve financial freedom with our AI-powered expense tracker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
            >
              Start Tracking Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-purple-900 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Why Choose Budget Savvy?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/30 border-purple-500/50 backdrop-blur-sm hover:bg-black/40 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Ready to Take Control?
          </h3>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of users who have transformed their financial habits with Budget Savvy
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

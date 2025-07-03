
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Session } from '@supabase/supabase-js';
import { 
  Home, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Wallet,
  Target,
  History,
  Star,
  Scan,
  Globe,
  Users,
  TrendingUp,
  FileDown,
  CreditCard
} from 'lucide-react';
import SpaceBackground from './SpaceBackground';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import ExpenseCharts from './ExpenseCharts';
import RecentTransactions from './RecentTransactions';
import BudgetOverview from './BudgetOverview';
import SettingsPanel from './SettingsPanel';
import EnhancedAnalytics from './EnhancedAnalytics';
import SmartReceiptScanner from './SmartReceiptScanner';
import MultiCurrencyTracker from './MultiCurrencyTracker';
import SocialExpenseSharing from './SocialExpenseSharing';
import FinancialGoalsTracker from './FinancialGoalsTracker';
import DataExportManager from './DataExportManager';
import DebtTracker from './DebtTracker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardProps {
  user: User;
  session: Session;
  onLogout: () => void;
}

const Dashboard = ({ user, session, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      onLogout();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'scanner', label: 'Receipt Scanner', icon: Scan },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'analytics', label: 'Advanced Analytics', icon: TrendingUp },
    { id: 'goals', label: 'Financial Goals', icon: Wallet },
    { id: 'debt-tracker', label: 'Debt Tracker', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'export', label: 'Export Data', icon: FileDown },
    { id: 'currency', label: 'Multi-Currency', icon: Globe },
    { id: 'social', label: 'Social Sharing', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen relative text-white">
      <SpaceBackground />
      
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <div className={`${isMobile ? 'hidden' : 'block'} w-64 bg-black/40 backdrop-blur-sm border-r border-purple-500/50 flex-shrink-0`}>
          <div className="p-4 xl:p-6 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6 xl:mb-8">
              <Star className="h-6 xl:h-8 w-6 xl:w-8 text-purple-300" />
              <h1 className="text-lg xl:text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Budget Savvy
              </h1>
            </div>

            <div className="space-y-1 xl:space-y-2 flex-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left text-sm xl:text-base ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2 xl:mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 xl:mt-8 pt-6 xl:pt-8 border-t border-purple-500/50">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/20 text-sm xl:text-base"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2 xl:mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Header and Navigation */}
        {isMobile && (
          <>
            {/* Mobile Header */}
            <div className="bg-black/40 backdrop-blur-sm border-b border-purple-500/50 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-purple-300" />
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Budget Savvy
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="bg-black/40 backdrop-blur-sm border-b border-purple-500/50 p-2 overflow-x-auto flex-shrink-0">
              <div className="flex space-x-1 min-w-max">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      size="sm"
                      className={`whitespace-nowrap text-xs ${
                        activeTab === item.id 
                          ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
            <div className="max-w-full mx-auto">
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Welcome back, {user.email?.split('@')[0]}!
                </h2>
                <p className="text-gray-300 mt-2 text-sm lg:text-base">
                  Manage your finances with comprehensive tracking and insights
                </p>
              </div>

              {/* Content */}
              <div className="w-full">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <BudgetOverview user={user} refreshTrigger={refreshTrigger} />
                    <div className="w-full">
                      <ExpenseCharts user={user} refreshTrigger={refreshTrigger} />
                    </div>
                    <RecentTransactions user={user} refreshTrigger={refreshTrigger} onUpdate={refreshData} />
                  </div>
                )}

                {activeTab === 'add-expense' && (
                  <ExpenseForm user={user} onExpenseAdded={refreshData} />
                )}

                {activeTab === 'scanner' && (
                  <SmartReceiptScanner user={user} onExpenseAdded={refreshData} />
                )}

                {activeTab === 'budgets' && (
                  <BudgetForm user={user} onBudgetAdded={refreshData} refreshTrigger={refreshTrigger} />
                )}

                {activeTab === 'analytics' && (
                  <EnhancedAnalytics user={user} refreshTrigger={refreshTrigger} />
                )}

                {activeTab === 'goals' && (
                  <FinancialGoalsTracker user={user} />
                )}

                {activeTab === 'debt-tracker' && (
                  <DebtTracker user={user} />
                )}

                {activeTab === 'transactions' && (
                  <RecentTransactions user={user} refreshTrigger={refreshTrigger} onUpdate={refreshData} detailed />
                )}

                {activeTab === 'export' && (
                  <DataExportManager user={user} refreshTrigger={refreshTrigger} />
                )}

                {activeTab === 'currency' && (
                  <MultiCurrencyTracker user={user} />
                )}

                {activeTab === 'social' && (
                  <SocialExpenseSharing user={user} />
                )}

                {activeTab === 'settings' && (
                  <SettingsPanel user={user} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

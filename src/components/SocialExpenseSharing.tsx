
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Share2, Users, MessageCircle, Trophy, TrendingUp, Copy, Download, Eye } from 'lucide-react';

interface SocialExpenseSharingProps {
  user: User;
}

const SocialExpenseSharing = ({ user }: SocialExpenseSharingProps) => {
  const [displayName, setDisplayName] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { toast } = useToast();

  const { data: expenses } = useQuery({
    queryKey: ['expenses', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const generateShareableInsight = () => {
    if (!expenses || expenses.length === 0) return null;

    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    const periodExpenses = expenses.filter((expense: any) => 
      new Date(expense.date) >= startDate
    );

    const totalSpent = periodExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const avgDaily = totalSpent / Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const categorySpending = periodExpenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    return {
      period: selectedPeriod,
      totalSpent,
      avgDaily,
      expenseCount: periodExpenses.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      categories: Object.keys(categorySpending).length
    };
  };

  const createShareText = () => {
    const insight = generateShareableInsight();
    if (!insight) return '';

    const userName = displayName.trim() || 'Budget Savvy User';
    
    const baseMessage = `🏆 ${userName}'s ${insight.period}ly spending summary:
💰 Total: $${insight.totalSpent.toFixed(2)}
📊 ${insight.expenseCount} transactions across ${insight.categories} categories
📈 Daily average: $${insight.avgDaily.toFixed(2)}`;

    const topCategoryText = insight.topCategory 
      ? `\n🎯 Top category: ${insight.topCategory.name} ($${(insight.topCategory.amount as number).toFixed(2)})`
      : '';

    const customMessage = shareMessage.trim() 
      ? `\n\n💭 "${shareMessage}"`
      : '';

    return `${baseMessage}${topCategoryText}${customMessage}

#BudgetSavvy #PersonalFinance #MoneyManagement`;
  };

  const handleCopyToClipboard = () => {
    const shareText = createShareText();
    if (shareText) {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Your spending summary is ready to share!",
      });
    } else {
      toast({
        title: "No Data Available",
        description: "Add some expenses first to generate a shareable summary.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadImage = () => {
    // Create a simple image with the sharing data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Budget Savvy Report', canvas.width/2, 80);
    
    const insight = generateShareableInsight();
    if (insight) {
      ctx.font = '32px Arial';
      const userName = displayName.trim() || 'My';
      ctx.fillText(`${userName} ${insight.period}ly Summary`, canvas.width/2, 140);
      
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`$${insight.totalSpent.toFixed(2)}`, canvas.width/2, 220);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`${insight.expenseCount} transactions`, canvas.width/2, 280);
      ctx.fillText(`${insight.categories} categories`, canvas.width/2, 320);
      ctx.fillText(`$${insight.avgDaily.toFixed(2)} daily average`, canvas.width/2, 360);
      
      if (insight.topCategory) {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText(`Top: ${insight.topCategory.name}`, canvas.width/2, 420);
        ctx.fillText(`$${(insight.topCategory.amount as number).toFixed(2)}`, canvas.width/2, 460);
      }
    }
    
    // Download
    const link = document.createElement('a');
    link.download = 'budget-savvy-report.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Image Downloaded",
      description: "Your spending report image has been saved!",
    });
  };

  const insight = generateShareableInsight();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Share2 className="h-6 w-6 text-purple-300" />
        <h2 className="text-2xl font-bold text-white">Social Expense Sharing</h2>
      </div>

      {/* Configuration */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Customize Your Share</CardTitle>
          <CardDescription className="text-gray-300">
            Personalize your spending summary before sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name or handle"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period" className="text-white">Period</Label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/50 rounded-md p-2 text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shareMessage" className="text-white">Personal Message (Optional)</Label>
            <Textarea
              id="shareMessage"
              placeholder="Add a personal note about your spending goals or achievements..."
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {insight && (
        <Card className="bg-black/40 border-green-500/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-green-400" />
              <CardTitle className="text-white">Preview Your Share</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <pre className="text-green-100 whitespace-pre-wrap text-sm font-mono">
                {createShareText()}
              </pre>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopyToClipboard}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
              
              <Button
                onClick={handleDownloadImage}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">${insight.totalSpent.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{insight.expenseCount}</p>
                <p className="text-gray-400 text-sm">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{insight.categories}</p>
                <p className="text-gray-400 text-sm">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">${insight.avgDaily.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Daily Avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Ideas */}
      <Card className="bg-black/40 border-blue-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white">Sharing Ideas</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Ways to use your spending summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span>Achievement Sharing</span>
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Celebrate meeting budget goals</li>
                <li>• Share money-saving milestones</li>
                <li>• Motivate friends with progress</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Community Building</span>
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Join budget challenges</li>
                <li>• Compare with friends</li>
                <li>• Share tips and insights</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-100 text-sm">
              <strong>Privacy Tip:</strong> Your shared summaries only include general statistics, not specific transaction details. 
              Your personal financial information remains secure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialExpenseSharing;

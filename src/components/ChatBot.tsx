
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Bot, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatBotProps {
  user: User;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = ({ user }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your Budget Savvy AI assistant. I can help you analyze your spending patterns, provide budgeting tips, and answer questions about your finances. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: expenses } = useQuery({
    queryKey: ['expenses-chatbot', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets-chatbot', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Calculate spending data
    const totalSpent = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0) || 0;
    const totalBudget = budgets?.reduce((sum, budget) => sum + parseFloat(budget.amount.toString()), 0) || 0;
    const categorySpending = expenses?.reduce((acc: any, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount.toString());
      return acc;
    }, {}) || {};
    
    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    const recentExpenses = expenses?.slice(0, 5) || [];

    // Response logic based on user input
    if (message.includes('spending') || message.includes('spent') || message.includes('expense')) {
      if (totalSpent === 0) {
        return "You haven't recorded any expenses yet. Start by adding some expenses to track your spending patterns!";
      }
      return `You've spent a total of $${totalSpent.toFixed(2)} so far. Your top spending category is ${topCategory?.[0] || 'N/A'} with $${(topCategory?.[1] as number)?.toFixed(2) || '0.00'} spent.`;
    }

    if (message.includes('budget') || message.includes('limit')) {
      if (totalBudget === 0) {
        return "You haven't set any budgets yet. Setting budgets helps you control your spending and reach your financial goals. Would you like some tips on budget planning?";
      }
      const remaining = totalBudget - totalSpent;
      return `Your total budget is $${totalBudget.toFixed(2)}. You've spent $${totalSpent.toFixed(2)}, leaving you with $${remaining.toFixed(2)} ${remaining >= 0 ? 'remaining' : 'over budget'}.`;
    }

    if (message.includes('tip') || message.includes('advice') || message.includes('suggest')) {
      const tips = [
        "Track every expense, no matter how small. Small purchases add up quickly!",
        "Use the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.",
        "Review your spending weekly to stay on track with your goals.",
        "Set up separate budgets for different categories to better control spending.",
        "Consider using cash for discretionary spending to avoid overspending.",
        "Look for subscription services you're not using and cancel them.",
        "Plan your meals to reduce food waste and dining out expenses.",
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (message.includes('category') || message.includes('categories')) {
      if (Object.keys(categorySpending).length === 0) {
        return "You haven't recorded expenses in any categories yet. Start tracking to see your spending breakdown!";
      }
      const categoryList = Object.entries(categorySpending)
        .map(([category, amount]) => `${category}: $${(amount as number).toFixed(2)}`)
        .join(', ');
      return `Here's your spending breakdown by category: ${categoryList}`;
    }

    if (message.includes('recent') || message.includes('latest') || message.includes('last')) {
      if (recentExpenses.length === 0) {
        return "You don't have any recent expenses recorded.";
      }
      const recentList = recentExpenses
        .map(expense => `$${parseFloat(expense.amount.toString()).toFixed(2)} on ${expense.item}`)
        .join(', ');
      return `Your recent expenses include: ${recentList}`;
    }

    if (message.includes('save') || message.includes('saving')) {
      return "Here are some saving tips: Set up automatic transfers to savings, track your expenses to identify areas to cut back, and consider the 24-hour rule before making non-essential purchases.";
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you with: analyzing your spending patterns, providing budgeting advice, explaining your expense categories, giving saving tips, and answering questions about your financial data. Just ask me anything about your finances!";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting question! Based on your spending data, I'd recommend reviewing your budget regularly and tracking expenses consistently.",
      "I'm here to help with your financial questions! You can ask me about your spending, budgets, or request financial tips.",
      "Good financial habits include tracking expenses, setting realistic budgets, and reviewing your spending regularly. What specific area would you like help with?",
      "Financial planning is important! I can analyze your current spending patterns and suggest improvements. What would you like to know?",
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-purple-300" />
          <CardTitle className="text-white">AI Financial Assistant</CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          Get personalized financial advice and insights about your spending
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isBot
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-pink-500/20 border border-pink-500/30'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.isBot ? (
                    <Bot className="h-4 w-4 text-purple-300 mt-1 flex-shrink-0" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-pink-300 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm">{message.content}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-purple-300" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your expenses, budgets, or financial tips..."
            className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;

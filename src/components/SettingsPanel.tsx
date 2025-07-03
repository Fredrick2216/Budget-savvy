
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, User as UserIcon, Palette, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsPanelProps {
  user: User;
}

const SettingsPanel = ({ user }: SettingsPanelProps) => {
  const [fullName, setFullName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [theme, setTheme] = useState('galaxy');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateTheme, updateCurrency, refreshProfile } = useTheme();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      console.log('Updating profile with data:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: profileData.fullName || null,
          preferred_currency: profileData.preferredCurrency || 'USD',
          theme: profileData.theme || 'galaxy',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      console.log('Profile update successful:', data);
      return profileData;
    },
    onSuccess: (data) => {
      console.log('Profile update mutation succeeded:', data);
      
      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
      
      // Update theme context to reflect changes across the app
      updateTheme(data.theme);
      updateCurrency(data.preferredCurrency);
      refreshProfile();
      
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['theme-profile', user.id] });
    },
    onError: (error: any) => {
      console.error('Profile update mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      console.log('Setting form values from profile:', profile);
      setFullName(profile.full_name || '');
      setPreferredCurrency(profile.preferred_currency || 'USD');
      setTheme(profile.theme || 'galaxy');
    }
  }, [profile]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  const themes = [
    { value: 'galaxy', label: 'Galaxy Theme' },
    { value: 'nebula', label: 'Nebula Theme' },
    { value: 'cosmic', label: 'Cosmic Theme' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with values:', {
      fullName,
      preferredCurrency,
      theme
    });
    
    updateProfileMutation.mutate({
      fullName: fullName.trim(),
      preferredCurrency,
      theme,
    });
  };

  const handlePasswordReset = () => {
    passwordResetMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Profile Settings */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">Profile Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-black/50 border-purple-500/50 text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">Preferred Currency</Label>
                <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50 z-50">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code} className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-white">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50 z-50">
                    {themes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">Security Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Manage your account security and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Password</h4>
              <p className="text-gray-400 text-sm mb-4">
                Reset your password to maintain account security
              </p>
              <Button
                onClick={handlePasswordReset}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                disabled={passwordResetMutation.isPending}
              >
                {passwordResetMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Password Reset Email'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">App Preferences</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Data Management</h4>
              <p className="text-gray-400 text-sm mb-4">
                Export and manage your financial data
              </p>
              <div className="space-y-2">
                <p className="text-green-400 text-sm">✓ Automatic data backup enabled</p>
                <p className="text-green-400 text-sm">✓ Privacy protection active</p>
                <p className="text-green-400 text-sm">✓ Data export available in Export tab</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;

import React from 'react';
import { User, Mail, Phone, MapPin, Shield, Calendar, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Profile: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) return null;

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      user: { label: t('auth.user'), color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      admin: { label: t('auth.admin'), color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
      district_officer: {
        label: t('auth.district_officer'),
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      },
      social_welfare: {
        label: t('auth.social_welfare'),
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      },
    };

    const config = roleConfig[role] || roleConfig.user;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}>{config.label}</span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('nav.profile')}</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 bg-white dark:bg-slate-700 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
              <User className="w-16 h-16 text-slate-400" />
            </div>
            <div className="flex-1 pt-16">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.full_name}</h2>
                {getRoleBadge(profile.role)}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.state && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profile.district && `${profile.district}, `}
                      {profile.state}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Language Preference</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {profile.language_preference}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Details</h3>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Account Role</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {profile.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(profile.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {profile.aadhaar_number && (
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Aadhaar Verified</p>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      XXXX-XXXX-{profile.aadhaar_number.slice(-4)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Security Information</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your personal information is protected with bank-grade encryption. All sensitive data including
                Aadhaar and bank details are securely stored and accessible only to authorized personnel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              Update Profile Information
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              Link DigiLocker Account
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-blue-50 mb-4">
            Contact our support team for assistance with your account or any queries about the DBT system.
          </p>
          <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg font-medium transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

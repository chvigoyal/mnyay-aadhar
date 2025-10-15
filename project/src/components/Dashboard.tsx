import React, { useEffect, useState } from 'react';
import { FileText, DollarSign, MessageCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Stats {
  totalCases: number;
  pendingDisbursements: number;
  activeGrievances: number;
  verifiedVictims: number;
}

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalCases: 0,
    pendingDisbursements: 0,
    activeGrievances: 0,
    verifiedVictims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    try {
      if (profile?.role === 'user') {
        const { data: victimData } = await supabase
          .from('victims')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (victimData) {
          const [casesResult, disbursementsResult, grievancesResult] = await Promise.all([
            supabase.from('cases').select('id', { count: 'exact' }).eq('victim_id', victimData.id),
            supabase
              .from('disbursements')
              .select('id', { count: 'exact' })
              .eq('victim_id', victimData.id)
              .in('disbursement_status', ['sanctioned', 'processing']),
            supabase
              .from('grievances')
              .select('id', { count: 'exact' })
              .eq('user_id', profile.id)
              .in('status', ['open', 'in_progress']),
          ]);

          setStats({
            totalCases: casesResult.count || 0,
            pendingDisbursements: disbursementsResult.count || 0,
            activeGrievances: grievancesResult.count || 0,
            verifiedVictims: 1,
          });
        }
      } else {
        const [casesResult, disbursementsResult, grievancesResult, victimsResult] = await Promise.all([
          supabase.from('cases').select('id', { count: 'exact' }),
          supabase
            .from('disbursements')
            .select('id', { count: 'exact' })
            .in('disbursement_status', ['sanctioned', 'processing']),
          supabase
            .from('grievances')
            .select('id', { count: 'exact' })
            .in('status', ['open', 'in_progress']),
          supabase.from('victims').select('id', { count: 'exact' }).eq('verification_status', 'verified'),
        ]);

        setStats({
          totalCases: casesResult.count || 0,
          pendingDisbursements: disbursementsResult.count || 0,
          activeGrievances: grievancesResult.count || 0,
          verifiedVictims: victimsResult.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('dashboard.total_cases'),
      value: stats.totalCases,
      icon: FileText,
      color: 'blue',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('dashboard.pending_disbursements'),
      value: stats.pendingDisbursements,
      icon: Clock,
      color: 'amber',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: t('dashboard.active_grievances'),
      value: stats.activeGrievances,
      icon: AlertCircle,
      color: 'red',
      bgLight: 'bg-red-50',
      bgDark: 'dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: t('dashboard.verified_victims'),
      value: stats.verifiedVictims,
      icon: CheckCircle2,
      color: 'green',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('dashboard.welcome')}, {profile?.full_name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t('dashboard.overview')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.bgLight} ${card.bgDark} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${card.textColor}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  System ready for operation
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Just now</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 text-left font-medium transition-all">
              Register New Case
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 text-left font-medium transition-all">
              Track Disbursement
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 text-left font-medium transition-all">
              Submit Grievance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

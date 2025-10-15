import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CheckCircle2, Clock, XCircle, Calendar, CreditCard } from 'lucide-react';
import { supabase, Disbursement } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Disbursements: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisbursements();
  }, [profile]);

  const fetchDisbursements = async () => {
    try {
      if (profile?.role === 'user') {
        const { data: victimData } = await supabase
          .from('victims')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (victimData) {
          const { data, error } = await supabase
            .from('disbursements')
            .select('*')
            .eq('victim_id', victimData.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setDisbursements(data || []);
        }
      } else {
        const { data, error } = await supabase
          .from('disbursements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDisbursements(data || []);
      }
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sanctioned':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'disbursed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sanctioned':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'processing':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'disbursed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      sanctioned: t('disbursement.sanctioned'),
      processing: t('disbursement.processing'),
      disbursed: t('disbursement.disbursed'),
      failed: t('disbursement.failed'),
    };
    return statusMap[status] || status;
  };

  const getReliefTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      immediate_relief: 'Immediate Relief',
      rehabilitation: 'Rehabilitation',
      marriage_incentive: 'Marriage Incentive',
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('nav.disbursements')}</h1>
      </div>

      {disbursements.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
          <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No disbursements found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {disbursements.map((disbursement) => (
            <div
              key={disbursement.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    {getStatusIcon(disbursement.disbursement_status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {disbursement.disbursement_number}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {getReliefTypeLabel(disbursement.relief_type)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                    disbursement.disbursement_status
                  )}`}
                >
                  {getStatusLabel(disbursement.disbursement_status)}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Sanctioned Amount</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(disbursement.sanction_amount)}
                  </p>
                </div>

                {disbursement.disbursed_amount && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Disbursed Amount</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(disbursement.disbursed_amount)}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Beneficiary</p>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {disbursement.beneficiary_name}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {disbursement.sanction_date && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Sanctioned: {new Date(disbursement.sanction_date).toLocaleDateString()}</span>
                  </div>
                )}
                {disbursement.disbursement_date && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Disbursed: {new Date(disbursement.disbursement_date).toLocaleDateString()}</span>
                  </div>
                )}
                {disbursement.transaction_id && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-mono text-xs">{disbursement.transaction_id}</span>
                  </div>
                )}
                {disbursement.sanction_order_number && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Order: {disbursement.sanction_order_number}</span>
                  </div>
                )}
              </div>

              {disbursement.remarks && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Remarks:</span> {disbursement.remarks}
                  </p>
                </div>
              )}

              {disbursement.disbursement_status === 'disbursed' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">
                      Amount successfully transferred to your account ending in{' '}
                      {disbursement.bank_account_number?.slice(-4)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

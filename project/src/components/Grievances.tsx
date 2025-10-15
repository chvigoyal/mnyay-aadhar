import React, { useEffect, useState } from 'react';
import { MessageCircle, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { supabase, Grievance } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Grievances: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrievances();
  }, [profile]);

  const fetchGrievances = async () => {
    try {
      if (profile?.role === 'user') {
        const { data, error } = await supabase
          .from('grievances')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGrievances(data || []);
      } else {
        const { data, error } = await supabase
          .from('grievances')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGrievances(data || []);
      }
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-slate-600" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'in_progress':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'resolved':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'closed':
        return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
      default:
        return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      delay: t('grievance.delay'),
      wrong_amount: t('grievance.wrong_amount'),
      not_received: t('grievance.not_received'),
      documentation: t('grievance.documentation'),
      other: t('grievance.other'),
    };
    return typeMap[type] || type;
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('nav.grievances')}</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
          {t('grievance.submit')}
        </button>
      </div>

      {grievances.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
          <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No grievances found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {grievances.map((grievance) => (
            <div
              key={grievance.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    {getStatusIcon(grievance.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {grievance.grievance_number}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                        {grievance.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {getTypeLabel(grievance.grievance_type)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(
                    grievance.status
                  )}`}
                >
                  {grievance.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mb-4">{grievance.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Submitted: {new Date(grievance.created_at).toLocaleDateString()}</span>
                </div>
                {grievance.resolved_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved: {new Date(grievance.resolved_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {grievance.resolution_notes && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">Resolution:</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{grievance.resolution_notes}</p>
                </div>
              )}

              {grievance.status === 'open' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your grievance is being reviewed. You will receive updates via email and SMS.
                  </p>
                </div>
              )}

              {grievance.status === 'in_progress' && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    An officer is currently working on resolving your grievance.
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

import React, { useEffect, useState } from 'react';
import { FileText, Calendar, MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase, Case } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Cases: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [profile]);

  const fetchCases = async () => {
    try {
      if (profile?.role === 'user') {
        const { data: victimData } = await supabase
          .from('victims')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (victimData) {
          const { data, error } = await supabase
            .from('cases')
            .select('*')
            .eq('victim_id', victimData.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setCases(data || []);
        }
      } else {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCases(data || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'under_investigation':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'in_trial':
        return <FileText className="w-5 h-5 text-violet-600" />;
      case 'closed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'under_investigation':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'in_trial':
        return 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400';
      case 'closed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      registered: t('case.registered'),
      under_investigation: t('case.investigation'),
      in_trial: t('case.trial'),
      closed: t('case.closed'),
    };
    return statusMap[status] || status;
  };

  const getCaseTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      PCR: t('case.pcr'),
      PoA: t('case.poa'),
      'Inter-caste Marriage': t('case.marriage'),
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('nav.cases')}</h1>
        {(profile?.role === 'admin' ||
          profile?.role === 'district_officer' ||
          profile?.role === 'social_welfare') && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
            {t('case.register')}
          </button>
        )}
      </div>

      {cases.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No cases found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {getStatusIcon(caseItem.case_status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {caseItem.case_number}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {getCaseTypeLabel(caseItem.case_type)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                    caseItem.case_status
                  )}`}
                >
                  {getStatusLabel(caseItem.case_status)}
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                {caseItem.incident_description}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {caseItem.incident_date && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(caseItem.incident_date).toLocaleDateString()}</span>
                  </div>
                )}
                {caseItem.fir_number && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span>FIR: {caseItem.fir_number}</span>
                  </div>
                )}
                {caseItem.police_station && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{caseItem.police_station}</span>
                  </div>
                )}
                {caseItem.court_name && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span>{caseItem.court_name}</span>
                  </div>
                )}
              </div>

              {(caseItem.cctns_reference || caseItem.ecourt_reference) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-xs">
                  {caseItem.cctns_reference && (
                    <div className="text-slate-600 dark:text-slate-400">
                      CCTNS: <span className="font-mono">{caseItem.cctns_reference}</span>
                    </div>
                  )}
                  {caseItem.ecourt_reference && (
                    <div className="text-slate-600 dark:text-slate-400">
                      eCourt: <span className="font-mono">{caseItem.ecourt_reference}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

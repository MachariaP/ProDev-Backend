import { useState, useEffect } from 'react';
import { analyticsService } from '../services/apiService';
import type { AnalyticsData } from '../types/api';

// Create a partial version of AnalyticsData since weekly_activity is optional
type PartialAnalyticsData = Omit<AnalyticsData, 'weekly_activity'> & {
  weekly_activity?: AnalyticsData['weekly_activity'];
};

export const useGroupAnalytics = (groupId?: number) => {
  const [analytics, setAnalytics] = useState<PartialAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (id: number) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardAnalytics(id);
      // Transform the API response to match our PartialAnalyticsData type
      const transformedData: PartialAnalyticsData = {
        ...data,
        member_activity: (data.member_activity || []).map(item => ({
          member_name: item.member_name,
          transactions: item.transactions,
          contributions: (item as any).contributions || 0, // Default to 0 if not provided
        })),
        weekly_activity: (data as any).weekly_activity || undefined,
      };
      setAnalytics(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchAnalytics(groupId);
    }
  }, [groupId]);

  return { 
    analytics, 
    loading, 
    error, 
    refetch: fetchAnalytics,
    exportAnalytics: (format: 'json' | 'csv' = 'json') => {
      if (!analytics) return;
      
      const exportData = {
        timestamp: new Date().toISOString(),
        groupId,
        analytics,
      };
      
      if (format === 'csv') {
        const csv = convertToCSV(exportData);
        downloadFile(csv, `analytics-${groupId}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      } else {
        downloadFile(
          JSON.stringify(exportData, null, 2),
          `analytics-${groupId}-${new Date().toISOString().split('T')[0]}.json`,
          'application/json'
        );
      }
    }
  };
};

const convertToCSV = (data: any): string => {
  const rows = [];
  rows.push(['Metric', 'Value']);
  
  Object.entries(data.analytics).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      rows.push([key, JSON.stringify(value)]);
    } else if (typeof value === 'object' && value !== null) {
      rows.push([key, JSON.stringify(value)]);
    } else {
      rows.push([key, value]);
    }
  });
  
  return rows.map(row => row.join(',')).join('\n');
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// chamahub-frontend/src/hooks/useGroupAnalytics.ts
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/apiService';

export const useGroupAnalytics = (groupId?: number) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (id: number) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardAnalytics(id);
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
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
        // Convert to CSV
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
  // Simple CSV conversion
  const rows = [];
  rows.push(['Metric', 'Value']);
  
  Object.entries(data.analytics).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      rows.push([key, JSON.stringify(value)]);
    } else if (typeof value === 'object') {
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

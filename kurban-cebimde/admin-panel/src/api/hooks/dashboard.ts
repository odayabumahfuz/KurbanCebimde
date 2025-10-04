import { useQuery } from '@tanstack/react-query'
import { adminApi, type MetricsSummary } from '../../lib/adminApi'

const qk = {
  metrics: ['dashboard','metrics'] as const,
  donationsTrend: (range: string)=> ['dashboard','donationsTrend', range] as const,
  audit: ['dashboard','audit','latest'] as const,
  viewers: ['dashboard','viewers','avg'] as const,
}

export function useDashboardMetrics(){
  return useQuery({
    queryKey: qk.metrics,
    queryFn: async (): Promise<MetricsSummary> => {
      return adminApi.getMetricsSummary()
    },
    staleTime: 60_000,
  })
}

export function useDonationsTrend(range: string = '7d'){
  return useQuery({
    queryKey: qk.donationsTrend(range),
    queryFn: async (): Promise<Array<{ date: string; amount: number }>> => {
      const res = await (adminApi as any).request(`/reports/donations/trend?range=${encodeURIComponent(range)}`)
      return res?.items || []
    },
    staleTime: 60_000,
  })
}

export function useAuditLatest(){
  return useQuery({
    queryKey: qk.audit,
    queryFn: async (): Promise<Array<{ id: string; ts: string; actor: string; action: string; target?: string }>> => {
      const res = await (adminApi as any).request('/audit?size=10')
      return res?.items || []
    },
    staleTime: 30_000,
  })
}

export function useAvgViewers(){
  return useQuery({
    queryKey: qk.viewers,
    queryFn: async (): Promise<Array<{ title: string; avg: number }>> => {
      const res = await (adminApi as any).request('/reports/broadcasts/avg-viewers')
      return res?.items || []
    },
    staleTime: 60_000,
  })
}



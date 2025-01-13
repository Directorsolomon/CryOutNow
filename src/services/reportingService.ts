import { api } from './api'

export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  sections: ('users' | 'prayer' | 'community')[];
  format: 'csv' | 'json';
  recipients: string[];
  enabled: boolean;
  lastSent?: string;
  nextScheduled?: string;
}

export interface CreateReportScheduleDto {
  frequency: 'daily' | 'weekly' | 'monthly';
  sections: ('users' | 'prayer' | 'community')[];
  format: 'csv' | 'json';
  recipients: string[];
}

class ReportingService {
  async getSchedules(): Promise<ReportSchedule[]> {
    const response = await api.get('/reports/schedules')
    return response.data
  }

  async createSchedule(schedule: CreateReportScheduleDto): Promise<ReportSchedule> {
    const response = await api.post('/reports/schedules', schedule)
    return response.data
  }

  async updateSchedule(id: string, updates: Partial<CreateReportScheduleDto>): Promise<ReportSchedule> {
    const response = await api.put(`/reports/schedules/${id}`, updates)
    return response.data
  }

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`/reports/schedules/${id}`)
  }

  async toggleSchedule(id: string, enabled: boolean): Promise<ReportSchedule> {
    const response = await api.patch(`/reports/schedules/${id}/toggle`, { enabled })
    return response.data
  }

  async sendTestReport(schedule: CreateReportScheduleDto): Promise<void> {
    await api.post('/reports/test', schedule)
  }
}

export const reportingService = new ReportingService() 

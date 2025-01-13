import api from './api'

export interface EmailPreferences {
  prayerTurnReminders: boolean;
  prayerRequestUpdates: boolean;
  dailyDigest: boolean;
  commentNotifications: boolean;
  chainInvites: boolean;
}

class EmailService {
  async updatePreferences(preferences: Partial<EmailPreferences>) {
    const response = await api.put('/user/email-preferences', preferences)
    return response.data
  }

  async getPreferences(): Promise<EmailPreferences> {
    const response = await api.get('/user/email-preferences')
    return response.data
  }

  async sendTestEmail() {
    const response = await api.post('/email/test')
    return response.data
  }

  async verifyEmail(token: string) {
    const response = await api.post('/email/verify', { token })
    return response.data
  }

  async resendVerificationEmail() {
    const response = await api.post('/email/resend-verification')
    return response.data
  }
}

export const emailService = new EmailService()
export default emailService 

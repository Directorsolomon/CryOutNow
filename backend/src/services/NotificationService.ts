import { User } from '../models/User';
import { PrayerGroup } from '../models/PrayerGroup';
import { GroupSession } from '../models/GroupSession';
import { GroupPrayerRequest } from '../models/GroupPrayerRequest';
import { sendEmail } from '../utils/email';
import { WebSocket } from 'ws';

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private static wsClients: Map<string, WebSocket> = new Map();

  // WebSocket connection management
  static addClient(userId: string, ws: WebSocket) {
    this.wsClients.set(userId, ws);
  }

  static removeClient(userId: string) {
    this.wsClients.delete(userId);
  }

  // Send in-app notification
  static async sendInAppNotification(userId: string, payload: NotificationPayload) {
    const ws = this.wsClients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
    
    // Store notification in database for history
    // TODO: Implement notification storage
  }

  // Send email notification
  static async sendEmailNotification(user: User, subject: string, content: string) {
    await sendEmail({
      to: user.email,
      subject,
      html: content,
    });
  }

  // Notification triggers for different events
  static async notifyPrayerChainTurn(userId: string, chainId: string) {
    await this.sendInAppNotification(userId, {
      type: 'prayer_chain_turn',
      title: 'Your Prayer Turn',
      message: 'It\'s your turn to pray in the prayer chain.',
      data: { chainId }
    });

    const user = await User.query().findById(userId);
    if (user?.emailNotifications) {
      await this.sendEmailNotification(
        user,
        'Your Prayer Turn',
        'It\'s your turn to pray in the prayer chain. Please log in to participate.'
      );
    }
  }

  static async notifyNewGroupInvitation(userId: string, groupId: string) {
    const group = await PrayerGroup.query().findById(groupId);
    await this.sendInAppNotification(userId, {
      type: 'group_invitation',
      title: 'New Group Invitation',
      message: `You've been invited to join ${group?.name}`,
      data: { groupId }
    });
  }

  static async notifyUpcomingSession(userId: string, sessionId: string) {
    const session = await GroupSession.query()
      .findById(sessionId)
      .withGraphFetched('group');
      
    await this.sendInAppNotification(userId, {
      type: 'upcoming_session',
      title: 'Upcoming Prayer Session',
      message: `Reminder: ${session?.title} starts in 15 minutes`,
      data: { sessionId }
    });

    const user = await User.query().findById(userId);
    if (user?.emailNotifications) {
      await this.sendEmailNotification(
        user,
        'Upcoming Prayer Session Reminder',
        `Your prayer session "${session?.title}" with ${session?.group?.name} starts in 15 minutes.`
      );
    }
  }

  static async notifyPrayerRequestUpdate(userId: string, requestId: string) {
    const request = await GroupPrayerRequest.query()
      .findById(requestId)
      .withGraphFetched('user');

    await this.sendInAppNotification(userId, {
      type: 'prayer_request_update',
      title: 'Prayer Request Updated',
      message: `${request?.user?.displayName}'s prayer request has been marked as answered`,
      data: { requestId }
    });
  }

  static async notifyNewComment(userId: string, requestId: string, commenterId: string) {
    const request = await GroupPrayerRequest.query()
      .findById(requestId)
      .withGraphFetched('user');
    const commenter = await User.query().findById(commenterId);

    await this.sendInAppNotification(userId, {
      type: 'new_comment',
      title: 'New Comment',
      message: `${commenter?.displayName} commented on your prayer request`,
      data: { requestId }
    });
  }

  // Daily digest email
  static async sendDailyDigest(userId: string) {
    const user = await User.query().findById(userId);
    if (!user?.emailNotifications) return;

    // Gather user's prayer activity for the day
    // TODO: Implement daily activity aggregation

    await this.sendEmailNotification(
      user,
      'Your Daily Prayer Digest',
      'Here\'s your daily summary of prayer activities...'
    );
  }

  // Weekly group summary
  static async sendWeeklyGroupSummary(userId: string, groupId: string) {
    const user = await User.query().findById(userId);
    const group = await PrayerGroup.query().findById(groupId);
    
    if (!user?.emailNotifications) return;

    // Gather group activity for the week
    // TODO: Implement weekly activity aggregation

    await this.sendEmailNotification(
      user,
      `Weekly Summary - ${group?.name}`,
      'Here\'s your weekly summary of group activities...'
    );
  }
} 
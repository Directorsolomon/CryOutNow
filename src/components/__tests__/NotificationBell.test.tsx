import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

// Mock the hooks
vi.mock('@/contexts/NotificationContext');
vi.mock('react-router-dom');

describe('NotificationBell', () => {
  const mockNavigate = vi.fn();
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();
  const mockClearNotifications = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      clearNotifications: mockClearNotifications,
    });
  });

  it('renders without notifications', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          title: 'Test Notification',
          message: 'Test Message',
          read: false,
          createdAt: new Date(),
        },
      ],
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      clearNotifications: mockClearNotifications,
    });

    render(<NotificationBell />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('displays empty state message when no notifications', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('displays notifications in dropdown', () => {
    const notifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'Test Message',
        read: false,
        createdAt: new Date(),
      },
    ];

    (useNotifications as jest.Mock).mockReturnValue({
      notifications,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      clearNotifications: mockClearNotifications,
    });

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls markAllAsRead when clicking "Mark all as read"', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Mark all as read'));
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('calls clearNotifications when clicking "Clear all"', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Clear all'));
    expect(mockClearNotifications).toHaveBeenCalled();
  });

  it('navigates to correct route when clicking notification', () => {
    const notifications = [
      {
        id: '1',
        type: 'prayer_chain_turn',
        title: 'Prayer Chain',
        message: 'Your turn',
        read: false,
        createdAt: new Date(),
        data: { chainId: '123' },
      },
    ];

    (useNotifications as jest.Mock).mockReturnValue({
      notifications,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      clearNotifications: mockClearNotifications,
    });

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Prayer Chain'));

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    expect(mockNavigate).toHaveBeenCalledWith('/chains/123');
  });
}); 
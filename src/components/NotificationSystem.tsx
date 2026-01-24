import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './NotificationSystem.css';
import defaultNotifications from '../data/notifications.json';

interface Notification {
  id: string;
  message: string;
}

interface NotificationSystemProps {
  className?: string;
}

// Local storage key
const NOTIFICATIONS_STORAGE_KEY = 'shopping-app-notifications';

// Local storage utilities
const loadNotificationsFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultNotifications;
  } catch {
    return defaultNotifications;
  }
};

const saveNotificationsToStorage = (notifications: string[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn('Failed to save notifications to localStorage:', error);
  }
};

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<string[]>(() => loadNotificationsFromStorage());
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [newNotification, setNewNotification] = useState('');

  // Refs to store timeout IDs
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  // Show next notification
  const showNextNotification = useCallback(() => {
    if (notifications.length === 0 || isPaused) return;

    // Clear any existing timeouts first
    clearAllTimeouts();

    const message = notifications[currentIndex];
    const notification: Notification = {
      id: uuidv4(),
      message
    };

    setCurrentNotification(notification);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      clearTimeoutRef.current = setTimeout(() => {
        setCurrentNotification(null);
        setCurrentIndex(prev => (prev + 1) % notifications.length);
      }, 300); // Wait for fade-out animation
    }, 5000);
  }, [notifications, currentIndex, isPaused, clearAllTimeouts]);

  // Timer for showing notifications every 7 seconds
  useEffect(() => {
    if (notifications.length === 0 || isPaused) {
      // Clear existing intervals when paused or no notifications
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
      return;
    }

    // Clear existing intervals before setting new ones
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!currentNotification) {
        showNextNotification();
      }
    }, 7000);

    // Show first notification after 3 seconds
    initialTimeoutRef.current = setTimeout(() => {
      if (!currentNotification) {
        showNextNotification();
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
    };
  }, [notifications, currentNotification, showNextNotification, isPaused]);

  // Close current notification
  const closeNotification = useCallback(() => {
    // Clear any pending timeouts to prevent conflicts
    clearAllTimeouts();
    
    setIsVisible(false);
    clearTimeoutRef.current = setTimeout(() => {
      setCurrentNotification(null);
      setCurrentIndex(prev => (prev + 1) % notifications.length);
    }, 300);
  }, [notifications.length, clearAllTimeouts]);

  // Add new notification
  const addNotification = useCallback(() => {
    if (!newNotification.trim()) return;

    const updatedNotifications = [...notifications, newNotification.trim()];
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);
    setNewNotification('');
  }, [notifications, newNotification]);

  // Delete notification
  const deleteNotification = useCallback((index: number) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);

    // Adjust current index if needed
    if (currentIndex >= updatedNotifications.length && updatedNotifications.length > 0) {
      setCurrentIndex(0);
    }
  }, [notifications, currentIndex]);

  // Export notifications
  const exportNotifications = useCallback(async () => {
    try {
      const dataStr = JSON.stringify(notifications, null, 2);
      await navigator.clipboard.writeText(dataStr);
      alert('¡Notificaciones copiadas al portapapeles!');
    } catch (err) {
      console.error('Failed to export notifications:', err);
    }
  }, [notifications]);

  // Pause/Resume system
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newPauseState = !prev;
      // If resuming and no current notification, clear all timeouts to restart fresh
      if (!newPauseState && !currentNotification) {
        clearAllTimeouts();
      }
      return newPauseState;
    });
  }, [currentNotification, clearAllTimeouts]);

  return (
    <>
      {/* Floating notification */}
      {currentNotification && (
        <div className={`notification-popup ${isVisible ? 'visible' : ''} ${className || ''}`}>
          <div className="notification-content">
            <span className="notification-message">{currentNotification.message}</span>
            <button 
              className="notification-close"
              onClick={closeNotification}
              title="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Control panel */}
      <div className="notification-controls">
        <button
          className="notification-control-btn"
          onClick={() => setShowManager(!showManager)}
          title="Gestionar notificaciones"
        >
          🔔
        </button>
        <button
          className={`notification-control-btn ${isPaused ? 'paused' : ''}`}
          onClick={togglePause}
          title={isPaused ? 'Reanudar notificaciones' : 'Pausar notificaciones'}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      {/* Management modal */}
      {showManager && (
        <div className="notification-manager-overlay">
          <div className="notification-manager">
            <div className="notification-manager-header">
              <h3>Cosas que Siempre Olvido</h3>
              <button 
                className="close-manager"
                onClick={() => setShowManager(false)}
              >
                ✕
              </button>
            </div>

            <div className="add-notification-section">
              <input
                type="text"
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                placeholder="¿Qué siempre olvidas hacer?"
                className="new-notification-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNotification();
                  }
                }}
              />
              <button 
                className="add-notification-btn"
                onClick={addNotification}
                disabled={!newNotification.trim()}
              >
                Añadir
              </button>
            </div>

            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <span className="notification-text">{notification}</span>
                  <button
                    className="delete-notification-btn"
                    onClick={() => deleteNotification(index)}
                    title="Eliminar notificación"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="notification-manager-footer">
              <button 
                className="export-btn"
                onClick={exportNotifications}
                title="Copiar todas las notificaciones al portapapeles"
              >
                📋 Exportar
              </button>
              <div className="notification-stats">
                {notifications.length} recordatorios
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSystem;
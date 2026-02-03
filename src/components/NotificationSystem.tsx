import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './NotificationSystem.css';
import defaultNotifications from '../data/notifications.json';
import { FoodSupply } from './CommonFoodSupplies';

interface NotificationData {
  message: string;
  relatedItems: string[];
}

interface Notification {
  id: string;
  message: string;
  relatedItems: string[];
}

interface NotificationSystemProps {
  className?: string;
  foods?: FoodSupply[];
  onAddToShoppingList?: (itemName: string) => void;
}

// Local storage keys
const NOTIFICATIONS_STORAGE_KEY = 'shopping-app-notifications';
const INTERACTED_NOTIFICATIONS_KEY = 'shopping-app-interacted-notifications';

// Local storage utilities
const loadInteractedNotifications = (): Set<string> => {
  try {
    const stored = localStorage.getItem(INTERACTED_NOTIFICATIONS_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const saveInteractedNotifications = (interacted: Set<string>) => {
  try {
    localStorage.setItem(INTERACTED_NOTIFICATIONS_KEY, JSON.stringify(Array.from(interacted)));
  } catch (error) {
    console.warn('Failed to save interacted notifications to localStorage:', error);
  }
};
const loadNotificationsFromStorage = (): NotificationData[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Handle legacy format (array of strings)
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        return parsed.map(msg => ({ message: msg, relatedItems: [] }));
      }
      return parsed;
    }
    return defaultNotifications;
  } catch {
    return defaultNotifications;
  }
};

const saveNotificationsToStorage = (notifications: NotificationData[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn('Failed to save notifications to localStorage:', error);
  }
};

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  className, 
  foods = [], 
  onAddToShoppingList 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>(() => loadNotificationsFromStorage());
  const [interactedNotifications, setInteractedNotifications] = useState<Set<string>>(() => loadInteractedNotifications());
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [newNotification, setNewNotification] = useState('');
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

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
    const shouldPause = isPaused || isInteracting || showManager || showItemSelector;
    if (notifications.length === 0 || shouldPause) return;

    // Clear any existing timeouts first
    clearAllTimeouts();

    // Find next non-interacted notification
    let nextIndex = currentIndex;
    let attempts = 0;
    while (interactedNotifications.has(notifications[nextIndex].message) && attempts < notifications.length) {
      nextIndex = (nextIndex + 1) % notifications.length;
      attempts++;
    }

    // If all notifications have been interacted with, skip
    if (attempts >= notifications.length) {
      return;
    }

    const notificationData = notifications[nextIndex];
    const notification: Notification = {
      id: uuidv4(),
      message: notificationData.message,
      relatedItems: notificationData.relatedItems || []
    };

    setCurrentNotification(notification);
    setCurrentIndex(nextIndex);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      clearTimeoutRef.current = setTimeout(() => {
        setCurrentNotification(null);
        setCurrentIndex(prev => (prev + 1) % notifications.length);
      }, 300); // Wait for fade-out animation
    }, 5000);
  }, [notifications, currentIndex, isPaused, isInteracting, showManager, showItemSelector, clearAllTimeouts, interactedNotifications]);

  // Timer for showing notifications every 7 seconds
  useEffect(() => {
    const shouldPause = notifications.length === 0 || isPaused || isInteracting || showManager || showItemSelector;
    if (shouldPause) {
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
  }, [notifications, currentNotification, showNextNotification, isPaused, isInteracting, showManager, showItemSelector]);

  // Close current notification and mark as interacted
  const closeNotification = useCallback(() => {
    // Clear any pending timeouts to prevent conflicts
    clearAllTimeouts();
    
    // Mark current notification as interacted
    if (currentNotification) {
      const updatedInteracted = new Set(interactedNotifications);
      updatedInteracted.add(currentNotification.message);
      setInteractedNotifications(updatedInteracted);
      saveInteractedNotifications(updatedInteracted);
    }
    
    setIsVisible(false);
    setShowItemSelector(false);
    setIsInteracting(false);
    clearTimeoutRef.current = setTimeout(() => {
      setCurrentNotification(null);
      setCurrentIndex(prev => (prev + 1) % notifications.length);
    }, 300);
  }, [notifications.length, clearAllTimeouts, currentNotification, interactedNotifications]);

  // Handle notification click to toggle item selector
  const handleNotificationClick = useCallback(() => {
    if (currentNotification && (currentNotification.relatedItems.length > 0 || foods.length > 0)) {
      if (showItemSelector) {
        // Close the selector and restart timer for current notification
        setShowItemSelector(false);
        setIsInteracting(false);
        // Restart timer for current notification
        setIsVisible(true);
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          clearTimeoutRef.current = setTimeout(() => {
            setCurrentNotification(null);
            setCurrentIndex(prev => (prev + 1) % notifications.length);
          }, 300);
        }, 5000);
      } else {
        // Open the selector and clear auto-hide timeout
        clearAllTimeouts();
        setShowItemSelector(true);
        setIsInteracting(true);
      }
    } else {
      closeNotification();
    }
  }, [currentNotification, foods.length, showItemSelector, notifications.length, clearAllTimeouts]);

  // Add item to shopping list, mark as interacted, and restart timer
  const handleAddItem = useCallback((itemName: string) => {
    if (onAddToShoppingList) {
      onAddToShoppingList(itemName);
    }
    
    // Mark current notification as interacted
    if (currentNotification) {
      const updatedInteracted = new Set(interactedNotifications);
      updatedInteracted.add(currentNotification.message);
      setInteractedNotifications(updatedInteracted);
      saveInteractedNotifications(updatedInteracted);
    }
    
    // Close selector and restart timer for current notification
    setShowItemSelector(false);
    setIsInteracting(false);
    // Restart timer for current notification
    setIsVisible(true);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      clearTimeoutRef.current = setTimeout(() => {
        setCurrentNotification(null);
        setCurrentIndex(prev => (prev + 1) % notifications.length);
      }, 300);
    }, 5000);
  }, [onAddToShoppingList, notifications.length, currentNotification, interactedNotifications]);

  // Get items for selector (only related items, no search)
  const getItemsForSelector = useCallback(() => {
    if (currentNotification) {
      return currentNotification.relatedItems;
    }
    return [];
  }, [currentNotification]);

  // Add new notification
  const addNotification = useCallback(() => {
    if (!newNotification.trim()) return;

    const newNotificationData: NotificationData = {
      message: newNotification.trim(),
      relatedItems: []
    };
    
    const updatedNotifications = [...notifications, newNotificationData];
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

  // Add item to notification's related items
  const addRelatedItem = useCallback((notificationIndex: number, itemName: string) => {
    const updatedNotifications = [...notifications];
    if (!updatedNotifications[notificationIndex].relatedItems.includes(itemName)) {
      updatedNotifications[notificationIndex].relatedItems.push(itemName);
      setNotifications(updatedNotifications);
      saveNotificationsToStorage(updatedNotifications);
    }
  }, [notifications]);

  // Remove item from notification's related items
  const removeRelatedItem = useCallback((notificationIndex: number, itemIndex: number) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[notificationIndex].relatedItems.splice(itemIndex, 1);
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);
  }, [notifications]);

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

  // Reset all interacted notifications
  const resetInteractedNotifications = useCallback(() => {
    setInteractedNotifications(new Set());
    saveInteractedNotifications(new Set());
    setCurrentIndex(0);
  }, []);

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
        <div 
          className={`notification-popup ${isVisible ? 'visible' : ''} ${className || ''}`}
          onMouseEnter={() => {
            setIsInteracting(true);
            // Clear auto-hide timeout when hovering
            clearAllTimeouts();
          }}
          onMouseLeave={() => {
            if (!showItemSelector) {
              setIsInteracting(false);
            }
          }}
        >
          <div className="notification-content">
            <div 
              className="notification-message-area"
              onClick={handleNotificationClick}
              style={{ cursor: currentNotification.relatedItems.length > 0 || foods.length > 0 ? 'pointer' : 'default' }}
            >
              <span className="notification-message">{currentNotification.message}</span>
              {(currentNotification.relatedItems.length > 0 || foods.length > 0) && (
                <div className="notification-hint">
                  👆 {showItemSelector ? 'Click para colapsar lista' : 'Click para añadir artículos'}
                </div>
              )}
            </div>
            <button 
              className="notification-close"
              onClick={closeNotification}
              title="Cerrar notificación"
            >
              ✕
            </button>
          </div>
          
          {/* Item selector dropdown */}
          {showItemSelector && (
            <div className="notification-item-selector">
              <div className="item-list">
                {getItemsForSelector().map((item, index) => (
                  <button
                    key={index}
                    className="item-option"
                    onClick={() => handleAddItem(item)}
                  >
                    {item}
                  </button>
                ))}
                {getItemsForSelector().length === 0 && (
                  <div className="no-items-message">
                    No hay artículos relacionados configurados
                  </div>
                )}
              </div>
            </div>
          )}
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
        <div 
          className="notification-manager-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowManager(false);
            }
          }}
        >
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
                  <div className="notification-main">
                    <span className="notification-text">{notification.message}</span>
                    <button
                      className="delete-notification-btn"
                      onClick={() => deleteNotification(index)}
                      title="Eliminar notificación"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {/* Related items section */}
                  <div className="related-items-section">
                    <div className="related-items-header">
                      <span className="items-count">{notification.relatedItems.length} artículos</span>
                      <button
                        className="toggle-items-btn"
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      >
                        {editingIndex === index ? '▲' : '▼'}
                      </button>
                    </div>
                    
                    {editingIndex === index && (
                      <div className="related-items-manager">
                        <div className="add-item-section">
                          <input
                            type="text"
                            placeholder="Añadir artículo relacionado..."
                            className="add-item-input"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addRelatedItem(index, e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                        <div className="items-list">
                          {notification.relatedItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="related-item">
                              <span>{item}</span>
                              <button
                                className="remove-item-btn"
                                onClick={() => removeRelatedItem(index, itemIndex)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
              <button 
                className="reset-btn"
                onClick={resetInteractedNotifications}
                title="Restaurar todas las notificaciones usadas"
              >
                🔄 Restaurar
              </button>
              <div className="notification-stats">
                {notifications.length} recordatorios · {interactedNotifications.size} usados
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSystem;
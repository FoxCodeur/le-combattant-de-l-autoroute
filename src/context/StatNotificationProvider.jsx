import React, { useState, useCallback, useRef } from "react";
import StatNotificationContext from "./StatNotificationContext";

const StatNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const queueRef = useRef([]);
  const timerRef = useRef(null);

  const showNextNotification = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const nextNotif = queueRef.current.shift();
    setNotifications([nextNotif]);

    timerRef.current = setTimeout(() => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === nextNotif.id ? { ...notif, leaving: true } : notif
        )
      );
      timerRef.current = setTimeout(() => {
        setNotifications([]);
        showNextNotification();
      }, 400);
    }, 1000);
  }, []);

  // Ajoute une notif
  const addNotification = useCallback(
    (notif) => {
      queueRef.current.push({
        ...notif,
        id: Date.now() + Math.random(),
        leaving: false,
      });
      if (notifications.length === 0 && queueRef.current.length === 1) {
        showNextNotification();
      }
    },
    [notifications.length, showNextNotification]
  );

  // Ajoute plusieurs notifs d'un coup
  const addNotifications = useCallback(
    (notifs) => {
      notifs.forEach((notif) =>
        queueRef.current.push({
          ...notif,
          id: Date.now() + Math.random(),
          leaving: false,
        })
      );
      if (
        notifications.length === 0 &&
        queueRef.current.length === notifs.length
      ) {
        showNextNotification();
      }
    },
    [notifications.length, showNextNotification]
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <StatNotificationContext.Provider
      value={{
        notifications,
        addNotification,
        addNotifications, // expose la nouvelle méthode
        removeNotification,
      }}
    >
      {children}
    </StatNotificationContext.Provider>
  );
};

export default StatNotificationProvider;

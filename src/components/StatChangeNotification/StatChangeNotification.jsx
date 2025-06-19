import React from "react";
import "./StatChangeNotification.scss";

export default function StatChangeNotification({ notifications }) {
  if (!notifications.length) return null;
  return (
    <div className="stat-change-notification">
      {notifications.map((notif) => {
        // Met la première lettre en majuscule
        const type =
          notif.type.charAt(0).toUpperCase() +
          notif.type.slice(1).toLowerCase();
        const isPositive = notif.value > 0;
        return (
          <div
            key={notif.id}
            className={`notif notif-${notif.type.toLowerCase()} ${
              isPositive ? "notif-up" : "notif-down"
            }${notif.leaving ? " leaving" : ""}`}
          >
            <span className="stat-text">
              {isPositive ? "+" : ""}
              {notif.value} {type}
            </span>
          </div>
        );
      })}
    </div>
  );
}

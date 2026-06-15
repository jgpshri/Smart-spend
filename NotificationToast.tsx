/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationPanelProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onDismiss,
  onClearAll,
  onMarkRead
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100 max-w-md w-full">
      <div className="flex justify-between items-center pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[10px] font-bold text-white px-1.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm tracking-widest text-[#0df0ff] uppercase">SYSTEM ALERTS</h3>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No system notifications. Alerts will trigger automatically when budgets approach limits!
          </div>
        ) : (
          notifications.map((notification) => {
            const isAlert = notification.type === 'alert';
            const isSuccess = notification.type === 'success';

            return (
              <div
                key={notification.id}
                onClick={() => onMarkRead(notification.id)}
                className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                  notification.isRead
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isAlert
                    ? 'bg-rose-955/20 border-rose-500/40 hover:border-rose-400 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]'
                    : isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5">
                    {isAlert && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {isSuccess && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {!isAlert && !isSuccess && <Info className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="flex-1 pr-4">
                    <p className={`text-xs font-semibold ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">
                      {notification.timestamp}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

'use client'

import React, { useState } from 'react'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  receive_notifications: boolean
  created_at: string
}

export interface NotificationLog {
  id: string
  order_id: string | null
  recipient_email: string
  recipient_type: 'customer' | 'admin'
  subject: string
  status: 'sent' | 'failed'
  error_message: string | null
  created_at: string
}

interface SettingsTabProps {
  admins: AdminUser[]
  adminsLoading: boolean
  logs: NotificationLog[]
  logsLoading: boolean
  newAdminEmail: string
  setNewAdminEmail: (v: string) => void
  newAdminName: string
  setNewAdminName: (v: string) => void
  newAdminNotify: boolean
  setNewAdminNotify: (v: boolean) => void
  handleAddAdmin: (e: React.FormEvent) => void
  handleDeleteAdmin: (adminId: string) => void
  handleClearLogs: () => void
}

export function SettingsTab({
  admins,
  adminsLoading,
  logs,
  logsLoading,
  newAdminEmail,
  setNewAdminEmail,
  newAdminName,
  setNewAdminName,
  newAdminNotify,
  setNewAdminNotify,
  handleAddAdmin,
  handleDeleteAdmin,
  handleClearLogs
}: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'logs'>('admins')

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
            Settings & Notification Logs
          </h2>
          <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
            Configure administrator email alerts and audit automated dispatch logs
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex gap-1.5 bg-[#181818] border border-white/10 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('admins')}
            className={`px-4 py-2 rounded-lg font-body text-xs uppercase tracking-wider transition-all ${
              activeSubTab === 'admins'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Admins & Alerts
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 rounded-lg font-body text-xs uppercase tracking-wider transition-all ${
              activeSubTab === 'logs'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Notification Logs
          </button>
        </div>
      </div>

      {activeSubTab === 'admins' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Add Admin Form */}
          <form
            onSubmit={handleAddAdmin}
            className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg"
          >
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Add Administrator Email
            </h3>

            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Administrator Email *
              </label>
              <input
                type="email"
                required
                placeholder="admin@zanka.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Administrator Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-white block">
                  Order Email Alerts
                </span>
                <span className="font-body text-[11px] text-white/40">
                  Receive instant notifications when new orders arrive
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNewAdminNotify(!newAdminNotify)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  newAdminNotify ? 'bg-red-600' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    newAdminNotify ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Register Admin</span>
            </button>
          </form>

          {/* Admin List Grid */}
          <div className="lg:col-span-2 space-y-4">
            {adminsLoading ? (
              <div className="text-center py-20 text-white/40 font-body text-xs uppercase tracking-widest">
                Loading Administrator List...
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#121212] px-4">
                <p className="font-body text-xs text-white/40 tracking-wider uppercase">
                  No registered admin notifications found. Add an administrator email on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admins.map((adm) => (
                  <div
                    key={adm.id}
                    className="bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-white font-bold truncate" title={adm.email}>
                          {adm.email}
                        </span>
                        <span
                          className={`font-body text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                            adm.receive_notifications
                              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {adm.receive_notifications ? 'Alerts ON' : 'Alerts OFF'}
                        </span>
                      </div>
                      <p className="font-body text-xs text-white/50">{adm.name || 'Unnamed Admin'}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                      <span className="font-body text-[10px] text-white/30 font-mono">
                        Added: {new Date(adm.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteAdmin(adm.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-body text-xs font-semibold uppercase transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Notification Logs Sub-Tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#121212] border border-white/10 rounded-2xl p-4">
            <div>
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                System Email Dispatch Audit
              </h3>
              <p className="font-body text-xs text-white/40">
                Log history for order confirmations & administrator email alerts ({logs.length} entries)
              </p>
            </div>
            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-red-950/20 text-red-400 hover:text-white font-body text-xs font-bold uppercase transition-all"
            >
              Clear Logs
            </button>
          </div>

          {logsLoading ? (
            <div className="text-center py-20 text-white/40 font-body text-xs uppercase tracking-widest">
              Loading Notification Audit Logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#121212] px-4">
              <p className="font-body text-xs text-white/40 tracking-wider uppercase">
                No notification logs recorded yet.
              </p>
            </div>
          ) : (
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#121212]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0d0d0d] font-body text-[10px] uppercase tracking-widest text-white/50">
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-body text-xs">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono text-white/90">{log.recipient_email}</td>
                        <td className="p-4 uppercase text-[10px] text-white/50 font-semibold">{log.recipient_type}</td>
                        <td className="p-4 text-white/80">{log.subject}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'sent'
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-950/40 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-white/40 text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

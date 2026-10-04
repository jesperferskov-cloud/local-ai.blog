import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, RefreshCw, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

interface Subscriber {
  email: string;
  date: string;
}

interface SubscribersWorkspaceProps {
  onNotify?: (message: string) => void;
}

export const SubscribersWorkspace: React.FC<SubscribersWorkspaceProps> = ({ onNotify }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscribers');
      if (!res.ok) {
        throw new Error('Kunne ikke hente abonnenter fra /content/subscribers.json');
      }
      const data = await res.json();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch subscribers error:', err);
      setError(err?.message || 'Fejl ved indlæsning af abonnenter.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async (email: string) => {
    if (!confirm(`Er du sikker på, at du vil slette ${email} fra abonnentlisten? (GDPR)`)) {
      return;
    }

    setDeletingEmail(email);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Kunne ikke slette abonnent');
      }

      setSubscribers((prev) => prev.filter((s) => s.email.toLowerCase() !== email.toLowerCase()));
      const msg = `Abonnent slettet: ${email}`;
      if (onNotify) {
        onNotify(msg);
      }
    } catch (err: any) {
      alert(`Fejl: ${err?.message || 'Kunne ikke slette abonnent'}`);
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="w-full px-6 sm:px-10 py-6 sm:py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] mb-1">
            <Mail className="w-4 h-4" />
            <span className="uppercase tracking-wider">Zero-Cloud Notifikationscenter</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#F1F5F4] tracking-tight">
            Tilmeldte Abonnenter
          </h2>
          <p className="text-xs font-mono text-[#728984] mt-1">
            Gemt lokalt i <code className="text-[#8c9e97] bg-white/5 px-1.5 py-0.5 rounded">/content/subscribers.json</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0c1d19] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#8c9e97]">
            <Users className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{subscribers.length} {subscribers.length === 1 ? 'abonnent' : 'abonnenter'}</span>
          </div>

          <button
            type="button"
            onClick={fetchSubscribers}
            disabled={isLoading}
            className="p-2 bg-[#0c1d19] hover:bg-white/5 text-[#8c9e97] hover:text-[#F1F5F4] border border-white/5 rounded-lg text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            title="Genindlæs liste"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Ultra-simpel liste: E-mail og Dato med lille [ Slet ] knap */}
      <div className="bg-[#0c1d19] rounded-2xl border border-white/5 overflow-hidden">
        {isLoading && subscribers.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#728984]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#10B981]" />
            Indlæser abonnenter fra lokal disk...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#728984] space-y-2">
            <Mail className="w-6 h-6 mx-auto text-[#2b3d37]" />
            <p className="text-[#8c9e97] font-medium">Ingen tilmeldte abonnenter endnu</p>
            <p className="text-[#556961]">
              Besøgende kan tilmelde sig via notifikations-sektionen på forsiden.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#6c8077] uppercase tracking-wider text-[10px] bg-[#091614]/50">
                  <th className="py-3 px-6 font-medium">E-mail</th>
                  <th className="py-3 px-6 font-medium">Dato</th>
                  <th className="py-3 px-6 font-medium text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((sub, idx) => (
                  <tr
                    key={`${sub.email}-${idx}`}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-6 text-[#F1F5F4] font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        <span>{sub.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-[#728984]">
                      {sub.date || 'Ukendt dato'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.email)}
                        disabled={deletingEmail === sub.email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                        title={`Slet ${sub.email} (GDPR hygiejne)`}
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Slet</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GDPR / Zen-Tech info footer */}
      <div className="text-[11px] font-mono text-[#556961] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <span>GDPR Hygiejne: Sletning fjerner øjeblikkeligt e-mailen fra /content/subscribers.json</span>
        <span className="text-[#3c4f46]">Zero-Cloud · 100% On-Device Mail Queue</span>
      </div>
    </div>
  );
};

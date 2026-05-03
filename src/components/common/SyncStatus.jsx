import { useStore } from '../../app/state/loadSessionStore.js';
import { isSupabaseEnabled } from '../../services/supabaseClient.js';

const STATES = {
  idle:    null,
  local:   { icon: 'save',          label: 'Local draft',  cls: 'sync-local'   },
  syncing: { icon: 'sync',          label: 'Saving…',      cls: 'sync-syncing' },
  saved:   { icon: 'cloud_done',    label: 'Saved',        cls: 'sync-saved'   },
  failed:  { icon: 'cloud_off',     label: 'Sync failed',  cls: 'sync-failed'  },
};

/**
 * Small non-blocking status pill.
 * Renders nothing when status is 'idle' or Supabase is not configured and
 * status is 'local' (no point showing "Local draft" when that's the only mode).
 */
export default function SyncStatus() {
  const syncStatus = useStore((s) => s.syncStatus);
  const syncError  = useStore((s) => s.syncError);

  // Never show anything if we haven't started a session yet
  if (syncStatus === 'idle') return null;

  // In localStorage-only mode, "local" is the normal/final state — show briefly then hide
  // In Supabase mode, "local" means "pending sync"
  if (syncStatus === 'local' && !isSupabaseEnabled()) return null;

  const state = STATES[syncStatus];
  if (!state) return null;

  return (
    <div
      className={`sync-pill ${state.cls}`}
      title={syncError || state.label}
      aria-label={`Sync status: ${state.label}`}
    >
      <span
        className="material-icons-round"
        style={{ fontSize: 13, animation: syncStatus === 'syncing' ? 'spinIcon 1s linear infinite' : 'none' }}
      >
        {state.icon}
      </span>
      <span className="sync-label">{state.label}</span>
    </div>
  );
}

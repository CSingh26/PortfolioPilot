'use client';

import { useEffect, useState } from 'react';
import type { RunRecord } from '@portfoliopilot/shared';
import Panel from '../Panel';
import { listRuns } from '../../lib/api';

export default function RunHistory() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRuns()
      .then((data) => setRuns(data))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel title="Backtest Runs" subtitle="Saved Configurations">
      {loading ? (
        <p className="text-sm text-muted">Loading runs…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Strategy</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-muted">
                    No runs yet. Run a backtest to generate history.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-t border-border">
                    <td className="py-3">
                      {new Date(run.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 capitalize">{run.strategy.replace('_', ' ')}</td>
                    <td className="py-3">{run.name ?? 'Untitled'}</td>
                    <td className="py-3">{run.summary ? 'Complete' : 'Queued'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

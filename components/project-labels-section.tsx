"use client";

import { useState } from "react";
import { LabelManager } from "@/components/label-manager";
import { SyncLabelsButton } from "@/components/sync-labels-button";

export function ProjectLabelsSection({
  projectId,
  canSync,
}: {
  projectId: number;
  canSync: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {canSync && (
        <div className="flex justify-end">
          <SyncLabelsButton projectId={projectId} onSynced={() => setRefreshKey((k) => k + 1)} />
        </div>
      )}
      <LabelManager
        key={refreshKey}
        listUrl={`/api/projects/${projectId}/labels`}
        addUrl={`/api/projects/${projectId}/labels`}
        deleteUrlFor={(id) => `/api/projects/${projectId}/labels/${id}`}
      />
    </div>
  );
}

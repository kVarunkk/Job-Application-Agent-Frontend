"use client";

import { IWorkflow, IWorkflowRun } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WorkflowSheetStatusComponentProps {
  workflow: IWorkflow;
}

export default function WorkflowSheetStatusComponent({
  workflow,
}: WorkflowSheetStatusComponentProps) {
  const [selectedRun, setSelectedRun] = useState<IWorkflowRun | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="">
      {workflow.workflow_runs && workflow.workflow_runs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border rounded">
            <thead>
              <tr className=" text-sm text-left">
                <th className="p-3">Run ID</th>
                <th className="p-3">Started</th>
                <th className="p-3">Ended</th>
                <th className="p-3">Status</th>
                {/* <th className="p-3">Error</th> */}
                {/* <th className="p-3">Auto Apply</th> */}
                <th className="p-3"># Suitable</th>
                <th className="p-3"># Applied</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflow.workflow_runs.map((run) => {
                const suitableCount =
                  run.suitable_jobs_scraped_or_applied_in_current_run.length;
                const appliedCount = Object.values(
                  run.job_results || {}
                ).filter((j) => j.applied).length;

                return (
                  <tr
                    key={run.id}
                    className={cn(
                      "border-t text-sm hover:bg-muted hover:text-muted-foreground",
                      selectedRun?.id === run.id && "bg-muted"
                    )}
                  >
                    <td className="p-3 font-mono text-xs">
                      {run.id.slice(0, 8)}…
                    </td>
                    <td className="p-3">{formatDate(run.started_at)}</td>
                    <td className="p-3">{formatDate(run.ended_at)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded font-bold text-xs ${
                          run.status === "success"
                            ? "bg-green-200 text-green-700"
                            : run.status === "error"
                            ? "bg-red-200 text-red-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    {/* <td className="p-3">{run.error}</td> */}
                    {/* <td className="p-3">{run.auto_apply}</td> */}
                    <td className="p-3 text-center">{suitableCount}</td>
                    <td className="p-3 text-center">{appliedCount}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Optional Modal or Detailed View Placeholder */}
          {selectedRun && (
            <div className="mt-4 p-4 rounded border ">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold">Run Details</h3>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Close
                </button>
              </div>

              {/* Error + auto_apply */}
              <div className="mb-4 space-y-1 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                      selectedRun.status === "success"
                        ? "bg-green-200 text-green-700"
                        : selectedRun.status === "failed"
                        ? "bg-red-200 text-red-700"
                        : "bg-yellow-200 text-yellow-700"
                    }`}
                  >
                    {selectedRun.status}
                  </span>
                </p>
                <p>
                  <strong>Auto Apply:</strong>{" "}
                  <span className="font-mono">
                    {workflow.auto_apply ? "true" : "false"}
                  </span>
                </p>
                {selectedRun.error && (
                  <p className="text-red-600">
                    <strong>Error:</strong> {selectedRun.error}
                  </p>
                )}
              </div>

              {/* Job Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRun.suitable_jobs_scraped_or_applied_in_current_run.map(
                  (url) => {
                    const job = selectedRun.job_results?.[url];
                    if (!job) return null;

                    return (
                      <div
                        key={url}
                        className=" border border-border rounded p-3 shadow-sm text-sm"
                      >
                        <div className="mb-2">
                          <a
                            href={`${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View Job
                          </a>
                        </div>

                        {job.description && (
                          <p className="text-muted-foreground line-clamp-3 text-xs mb-1">
                            {job.description.slice(0, 200)}...
                          </p>
                        )}

                        <ul className="text-xs space-y-0.5 text-muted-foreground mt-2">
                          {job.score !== undefined && (
                            <li>
                              <strong>Score:</strong> {job.score.toFixed(2)}
                            </li>
                          )}
                          <li>
                            <strong>Suitable:</strong>{" "}
                            {job.suitable ? "Yes" : "No"}
                          </li>
                          <li>
                            <strong>Applied:</strong>{" "}
                            {job.applied ? "Yes" : "No"}
                          </li>
                        </ul>

                        {job.cover_letter && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 hover:underline cursor-pointer">
                              Show Cover Letter
                            </summary>
                            <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                              {job.cover_letter}
                            </p>
                          </details>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No workflow runs yet.</p>
      )}
    </div>
  );
}

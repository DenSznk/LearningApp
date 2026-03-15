'use client';

import React, { useState } from 'react';
import TaskDisplay from './TaskDisplay';

interface GenerateTaskPanelProps {
  topicId: string;
}

export default function GenerateTaskPanel({ topicId }: GenerateTaskPanelProps) {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taskType, setTaskType] = useState('Build from Scratch');

  const generateTask = async () => {
    setIsLoading(true);
    setError(null);
    setTask(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/agent/generate-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          difficulty: 'Easy',
          taskType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || 'Failed to generate task');
      }

      const data = await response.json();
      setTask(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

        {/* Controls */}
        <div className="flex-1 max-w-2xl flex flex-wrap gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Type</label>
             <select
               value={taskType}
               onChange={(e) => setTaskType(e.target.value)}
               className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
             >
               <option value="Build from Scratch">Build from Scratch</option>
               <option value="Find the Bug">Find the Bug / Code Review</option>
               <option value="Predict Execution Output">Predict Execution Output</option>
               <option value="Refactor this Code">Refactor & Optimize Code</option>
               <option value="System Design Snippet">System Design / Architecture</option>
             </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateTask}
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <>
               <span className="animate-spin text-xl leading-none">⏳</span>
               <span>Generating Code...</span>
             </>
          ) : (
             <>
               <span className="text-xl leading-none">✨</span>
               <span>Generate Unique Task</span>
             </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 border-l-4 border-red-500 rounded-r-md">
          <p className="font-semibold">Error communicating with AI Agent:</p>
          <p className="font-mono text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {task && <TaskDisplay task={task} />}

    </div>
  );
}

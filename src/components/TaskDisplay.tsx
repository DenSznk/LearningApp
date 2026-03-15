'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TaskDisplayProps {
  task: {
    prompt: string;
    candidateCode?: string;
    interviewerSolution: string;
    difficulty: string;
    taskType: string;
  };
}

export default function TaskDisplay({ task }: TaskDisplayProps) {
  // A custom renderer for code blocks to apply syntax highlighting
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-md mt-2 mb-4"
          showLineNumbers={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-purple-600 dark:text-purple-400" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm mt-6 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-xl">🤖</span> AI Generated Task
        </h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            {task.difficulty}
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
            {task.taskType}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Candidate View Section */}
        <div>
          <h4 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-3">👁️ Candidate View (Share this)</h4>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
             <ReactMarkdown components={MarkdownComponents}>
               {task.prompt}
             </ReactMarkdown>
          </div>

          {task.candidateCode && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Starting Code:</p>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language="javascript"
                PreTag="div"
                className="rounded-md"
                showLineNumbers={true}
              >
                {task.candidateCode}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <hr className="border-gray-200 dark:border-gray-800" />

        {/* Interviewer View Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/10 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-yellow-200 dark:border-yellow-900/30">
          <h4 className="text-sm font-bold tracking-wider text-yellow-600 dark:text-yellow-500 uppercase flex items-center gap-2 mb-3">
            <span>🕵️</span> Interviewer Cheat Sheet (Do not share)
          </h4>
          <div className="prose dark:prose-invert max-w-none prose-yellow text-gray-800 dark:text-gray-200">
             <ReactMarkdown components={MarkdownComponents}>
               {task.interviewerSolution}
             </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

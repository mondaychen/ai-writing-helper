import React, { useState, useRef, useEffect } from 'react';
import { useStorage, useAiInstance } from '@extension/shared';
import { aiSettingsStorage } from '@extension/storage';

import { rewriteContent as rewriteContentImpl } from './rewrite-content.js';

interface EditorUIProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onApply?: (content: string) => void;
  className?: string;
  showCloseButton?: boolean;
  isContentEditable?: boolean;
}

export const EditorUI = ({
  isOpen,
  onClose,
  initialContent = '',
  onApply,
  className = '',
  showCloseButton = true,
  isContentEditable = false,
}: EditorUIProps) => {
  console.log('[CEB] EditorUI isContentEditable', isContentEditable);
  const [editorContent, setEditorContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [reason, setReason] = useState('');
  const [prompt, setPrompt] = useState('');
  const [applyButtonHover, setApplyButtonHover] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const aiSettings = useStorage(aiSettingsStorage);
  const aiInstance = useAiInstance(aiSettings.provider, aiSettings.baseUrl, aiSettings.apiKey);

  useEffect(() => {
    if (aiSettings.defaultPrompt && !prompt) {
      setPrompt(aiSettings.defaultPrompt);
    }
  }, [aiSettings.defaultPrompt, prompt]);

  useEffect(() => {
    if (initialContent !== undefined) {
      setEditorContent(initialContent);
      setOriginalContent(initialContent);
    }
  }, [initialContent]);

  const applyChanges = () => {
    onApply?.(editorContent);
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorContent);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetChanges = () => {
    setEditorContent(originalContent);
  };

  const rewriteContent = async () => {
    if (!prompt.trim() || !editorContent.trim()) {
      alert('Please enter both content and a prompt for rewriting.');
      return;
    }

    setIsRewriting(true);
    try {
      const rewrittenContent = await rewriteContentImpl(aiInstance, editorContent, prompt);
      setEditorContent(rewrittenContent.rewrittenContent);
      setReason(rewrittenContent.reason);
    } catch (error) {
      console.error('Error rewriting content:', error);
      alert(`Error rewriting content:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`flex h-full flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">AI Writing Helper</h2>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent p-1 text-3xl font-bold text-gray-500">
            ×
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="content-textarea" className="text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content-textarea"
            ref={textareaRef}
            value={editorContent}
            onChange={e => setEditorContent(e.target.value)}
            className="h-64 w-full resize-none rounded border p-2 text-sm focus:outline-none focus:ring-2 lg:h-full"
            placeholder="Type your content here..."
          />
        </div>
        <div className="flex w-full flex-col gap-2 md:w-80">
          <label htmlFor="prompt-textarea" className="text-sm font-medium text-gray-700">
            AI Prompt
          </label>
          <textarea
            id="prompt-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="h-32 w-full resize-none rounded border p-2 text-sm focus:outline-none focus:ring-2"
            placeholder="Enter instructions for AI (e.g., 'Fix grammar', 'Make more professional', 'Summarize')"
          />
          <button
            onClick={rewriteContent}
            disabled={isRewriting || !prompt.trim() || !editorContent.trim()}
            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400">
            {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
          </button>
        </div>
        <div className="text-sm text-gray-700">{reason}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={resetChanges} className="cursor-pointer rounded border bg-white px-4 py-2 text-gray-600">
          Reset
        </button>
        <button onClick={copyToClipboard} className="cursor-pointer rounded border bg-white px-4 py-2 text-blue-500">
          Copy
        </button>
        <div className="relative">
          <button
            onClick={applyChanges}
            disabled={isContentEditable}
            onMouseEnter={() => setApplyButtonHover(true)}
            onMouseLeave={() => setApplyButtonHover(false)}
            className={`cursor-pointer rounded px-4 py-2 text-white ${
              isContentEditable ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={isContentEditable ? 'Apply is disabled for rich text editors. Use Copy button instead.' : ''}>
            Apply
          </button>
          {isContentEditable && applyButtonHover && (
            <div className="absolute bottom-full right-0 mb-2 w-80 rounded-md border border-yellow-200 bg-yellow-50 p-3 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Rich text editor detected.</strong> Apply is disabled. Use the Copy button and paste
                    manually using Ctrl+V (or Cmd+V on Mac).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

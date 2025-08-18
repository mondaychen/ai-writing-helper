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
}

export const EditorUI = ({
  isOpen,
  onClose,
  initialContent = '',
  onApply,
  className = '',
  showCloseButton = true,
}: EditorUIProps) => {
  const [editorContent, setEditorContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [reason, setReason] = useState('');
  const [prompt, setPrompt] = useState('');
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
        <button onClick={applyChanges} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white">
          Apply
        </button>
      </div>
    </div>
  );
};

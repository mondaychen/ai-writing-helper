import { useState, useRef, useEffect } from 'react';
import { useStorage, useAiInstance } from '@extension/shared';
import { aiSettingsStorage } from '@extension/storage';
import { Button } from '@/lib/components/ui/button';
import { Textarea } from '@/lib/components/ui/textarea';
import { Label } from '@/lib/components/ui/label';

import { X, Copy, RotateCcw, Check } from 'lucide-react';

import { rewriteContent as rewriteContentImpl } from './rewrite-content.js';

interface EditorUIProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onApply?: (content: string) => void;
  className?: string;
  showCloseButton?: boolean;
  isContentAppliable?: boolean;
}

export const EditorUI = ({
  isOpen,
  onClose,
  initialContent = '',
  onApply,
  className = '',
  showCloseButton = true,
  isContentAppliable = false,
}: EditorUIProps) => {
  const [editorContent, setEditorContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [summary, setSummary] = useState('');
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
    setSummary('');
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
      setSummary(rewrittenContent.summary);
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
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="content-textarea">Content</Label>
          <Textarea
            id="content-textarea"
            ref={textareaRef}
            value={editorContent}
            onChange={e => setEditorContent(e.target.value)}
            className="h-64 resize-none lg:h-full"
            placeholder="Type your content here..."
          />
          {summary && (
            <details className="bg-card rounded-lg border p-4">
              <summary className="text-card-foreground cursor-pointer font-semibold">What's changed</summary>
              <div className="text-muted-foreground mt-2 text-sm">{summary}</div>
            </details>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 md:w-80">
          <Label htmlFor="prompt-textarea">AI Prompt</Label>
          <Textarea
            id="prompt-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="h-32 resize-none"
            placeholder="Enter instructions for AI (e.g., 'Fix grammar', 'Make more professional', 'Summarize')"
          />
          <Button
            onClick={rewriteContent}
            disabled={isRewriting || !prompt.trim() || !editorContent.trim()}
            className="w-full">
            {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {isContentAppliable && (
          <Button onClick={applyChanges} size="sm">
            <Check className="mr-1 h-4 w-4" />
            Apply
          </Button>
        )}

        <Button onClick={copyToClipboard} variant="outline" size="sm">
          <Copy className="mr-1 h-4 w-4" />
          Copy
        </Button>
        <Button onClick={resetChanges} variant="secondary" size="sm">
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

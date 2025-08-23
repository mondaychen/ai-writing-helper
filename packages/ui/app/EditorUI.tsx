import { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStorage, useAiInstance } from '@extension/shared';
import { aiSettingsStorage, styleInstructionStorage, miscSettingsStorage } from '@extension/storage';
import { Button } from '@/lib/components/ui/button';
import { Textarea } from '@/lib/components/ui/textarea';
import { Label } from '@/lib/components/ui/label';
import { NativeSelect, NativeSelectOption, NativeSelectPlaceholder } from '@/lib/components/ui/native-select';

import { rewriteContent as rewriteContentImpl } from './rewrite-content.js';
import { useVersionManager } from './use-version-manager';

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
  const versionManager = useVersionManager(initialContent);
  const [prompt, setPrompt] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedInstructionIndex, setSelectedInstructionIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current content and version info from version manager
  const editorContent = versionManager.getCurrentContent();
  const currentVersion = versionManager.getCurrentVersion();
  const summary = currentVersion?.summary || '';

  const aiSettings = useStorage(aiSettingsStorage);
  const styleInstructions = useStorage(styleInstructionStorage);
  const miscSettings = useStorage(miscSettingsStorage);
  const aiInstance = useAiInstance(aiSettings.provider, aiSettings.baseUrl, aiSettings.apiKey);

  useEffect(() => {
    if (!prompt && styleInstructions?.items?.length && selectedInstructionIndex === null) {
      setSelectedInstructionIndex(0);
      setPrompt(styleInstructions.items[0].description);
    }
  }, [styleInstructions, prompt, selectedInstructionIndex]);

  useEffect(() => {
    if (initialContent !== undefined) {
      versionManager.resetToInitialContent(initialContent);
    }
  }, [initialContent]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const rewriteContent = async () => {
    if (!prompt.trim() || !editorContent.trim()) {
      alert('Please enter both content and a prompt for rewriting.');
      return;
    }

    setIsRewriting(true);
    try {
      const rewrittenContent = await rewriteContentImpl(aiInstance, editorContent, prompt);
      let newContent = rewrittenContent.rewrittenContent;

      // Apply em-dash replacement if enabled
      if (miscSettings?.emDashReplacement?.enabled) {
        newContent = newContent.replace(/—/g, miscSettings.emDashReplacement.replacement);
      }

      // Add new version to version history
      versionManager.addNewVersion(newContent, rewrittenContent.summary, true);
    } catch (error) {
      console.error('Error rewriting content:', error);
      alert(`Error rewriting content:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  // Handle content changes in textarea
  const handleContentChange = (newContent: string) => {
    versionManager.updateCurrentVersion(newContent);
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
          <div className="flex items-center justify-between">
            <Label htmlFor="content-textarea">Content</Label>
            <div className="flex items-center gap-1">
              <Button
                onClick={versionManager.goToPreviousVersion}
                disabled={!versionManager.canGoBack || isRewriting}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="Previous version">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-muted-foreground px-1 text-xs">
                {versionManager.getCurrentVersionNumber()}/{versionManager.getTotalVersions()}
              </span>
              <Button
                onClick={versionManager.goToNextVersion}
                disabled={!versionManager.canGoForward || isRewriting}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="Next version">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Textarea
            id="content-textarea"
            ref={textareaRef}
            value={editorContent}
            onChange={e => handleContentChange(e.target.value)}
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
          <Label htmlFor="prompt-textarea">Rewrite Style Instruction</Label>
          {styleInstructions?.items?.length > 0 && (
            <div className="flex flex-row items-center gap-2">
              <Label htmlFor="style-instruction-select" className="min-w-16 text-xs">
                Use Style:
              </Label>
              <NativeSelect
                onChange={e => {
                  const value = e.target.value;
                  const index = Number(value);
                  setSelectedInstructionIndex(index);
                  const selected = styleInstructions.items[index];
                  if (selected) {
                    setPrompt(selected.description);
                  }
                }}
                value={selectedInstructionIndex !== null ? String(selectedInstructionIndex) : undefined}>
                <NativeSelectPlaceholder>Choose an instruction</NativeSelectPlaceholder>
                {styleInstructions.items.map((item, index) => (
                  <NativeSelectOption key={`${item.title}-${index}`} value={String(index)}>
                    {item.title}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          )}
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
      </div>
    </div>
  );
};

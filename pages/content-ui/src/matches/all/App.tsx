/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// import { t } from '@extension/i18n';
import { keyboardShortcutStorage, aiSettingsStorage } from '@extension/storage';
import { useEffect, useState, useRef } from 'react';

export default function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    console.log('[CEB] Content ui all loaded');

    const setupKeyboardListener = async () => {
      const shortcutSettings = await keyboardShortcutStorage.get();

      const handleKeyDown = (e: KeyboardEvent) => {
        const isMatch =
          shortcutSettings.modifiers.every((modifier: string) => {
            switch (modifier) {
              case 'ctrlKey':
                return e.ctrlKey;
              case 'shiftKey':
                return e.shiftKey;
              case 'altKey':
                return e.altKey;
              case 'metaKey':
                return e.metaKey;
              default:
                return false;
            }
          }) && e.key.toUpperCase() === shortcutSettings.key.toUpperCase();

        if (isMatch) {
          e.preventDefault();
          openEditor();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    };

    const cleanup = setupKeyboardListener();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const openEditor = () => {
    const focusedElement = document.activeElement as HTMLElement;

    if (
      focusedElement &&
      (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT' || focusedElement.isContentEditable)
    ) {
      focusedElementRef.current = focusedElement;

      const content =
        focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT'
          ? (focusedElement as HTMLInputElement | HTMLTextAreaElement).value
          : focusedElement.textContent || '';

      setOriginalContent(content);
      setEditorContent(content);
      setIsDialogOpen(true);
    }
  };

  const applyChanges = () => {
    if (focusedElementRef.current) {
      if (focusedElementRef.current.tagName === 'TEXTAREA' || focusedElementRef.current.tagName === 'INPUT') {
        (focusedElementRef.current as HTMLInputElement | HTMLTextAreaElement).value = editorContent;
        focusedElementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (focusedElementRef.current.isContentEditable) {
        focusedElementRef.current.textContent = editorContent;
        focusedElementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    setIsDialogOpen(false);
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

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const rewriteContent = async () => {
    if (!prompt.trim() || !editorContent.trim()) {
      alert('Please enter both content and a prompt for rewriting.');
      return;
    }

    setIsRewriting(true);
    try {
      const settings = await aiSettingsStorage.get();

      if (!settings.apiKey) {
        alert('Please configure your API key in the extension options first.');
        setIsRewriting(false);
        return;
      }

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.modelName,
          messages: [
            {
              role: 'system',
              content: "You are a writing assistant. Follow the user's instructions to rewrite the provided text.",
            },
            {
              role: 'user',
              content: `Please rewrite the following text according to this instruction: "${prompt}"\n\nText to rewrite:\n${editorContent}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rewrittenText = data.choices[0]?.message?.content;

      if (rewrittenText) {
        setEditorContent(rewrittenText);
      } else {
        throw new Error('No content received from API');
      }
    } catch (error) {
      console.error('Error rewriting content:', error);
      alert(`Error rewriting content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isDialogOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isDialogOpen]);

  return (
    <>
      <dialog
        className="max-w-90vw max-h-90vh border-1 fixed inset-0 m-auto h-[600px] w-[900px] bg-transparent"
        ref={dialogRef}
        onClick={e => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}>
        <div className="flex h-full flex-col gap-4 rounded-lg border bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">AI Writing Helper</h2>
            <button
              onClick={closeDialog}
              className="cursor-pointer border-0 bg-transparent p-1 text-3xl font-bold text-gray-500">
              ×
            </button>
          </div>

          <div className="flex flex-1 gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="content-textarea" className="text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content-textarea"
                ref={textareaRef}
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                className="h-full w-full resize-none rounded border p-2 text-sm focus:outline-none focus:ring-2"
                placeholder="Your content will appear here..."
              />
            </div>
            <div className="flex w-80 flex-col gap-2">
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
                className="cursor-pointer rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={resetChanges} className="cursor-pointer rounded border bg-white px-4 py-2 text-gray-600">
              Reset
            </button>
            <button
              onClick={copyToClipboard}
              className="cursor-pointer rounded border bg-white px-4 py-2 text-blue-500">
              Copy
            </button>
            <button onClick={applyChanges} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white">
              Apply
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

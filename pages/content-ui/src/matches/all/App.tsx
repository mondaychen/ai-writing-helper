/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// import { t } from '@extension/i18n';
import { useEffect, useState, useRef } from 'react';

export default function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    console.log('[CEB] Content ui all loaded');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        openEditor();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
        className="max-w-90vw max-h-90vh border-1 fixed inset-0 m-auto h-[500px] w-[800px] bg-transparent"
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

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              className="h-full w-full resize-none rounded border p-2 text-sm focus:outline-none focus:ring-2"
              placeholder="Your content will appear here..."
            />
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

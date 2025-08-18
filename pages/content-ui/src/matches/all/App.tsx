/* oxlint-disable jsx-a11y/click-events-have-key-events */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
// import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { keyboardShortcutStorage, uiModeStorage, UI_MODE } from '@extension/storage';
import { useEffect, useState, useRef, useCallback } from 'react';
import { EditorUI } from '@extension/ui/app/EditorUI';

export default function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Use the storage hook to read data reactively
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const uiModeSettings = useStorage(uiModeStorage);

  const handleApply = useCallback((content: string) => {
    if (focusedElementRef.current) {
      if (focusedElementRef.current.tagName === 'TEXTAREA' || focusedElementRef.current.tagName === 'INPUT') {
        (focusedElementRef.current as HTMLInputElement | HTMLTextAreaElement).value = content;
        focusedElementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (focusedElementRef.current.isContentEditable) {
        focusedElementRef.current.textContent = content;
        focusedElementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, []);

  const openEditor = useCallback(() => {
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

      setCurrentContent(content);

      if (uiModeSettings.mode === UI_MODE.SIDE_PANEL) {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: content,
        });
      } else {
        setIsDialogOpen(true);
      }
    } else if (uiModeSettings.mode === UI_MODE.DIALOG) {
      setIsDialogOpen(true);
    }
  }, [uiModeSettings.mode]);

  useEffect(() => {
    console.log('[CEB] Content ui all loaded');

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
        console.log('isMatch', isMatch, 'preventing default');
        e.preventDefault();
        openEditor();
      }
    };

    const handleMessage = (message: unknown) => {
      if (typeof message === 'object' && message !== null && 'type' in message && 'content' in message) {
        const msg = message as { type: string; content: string };
        if (msg.type === 'APPLY_CONTENT' && msg.content && focusedElementRef.current) {
          handleApply(msg.content);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [shortcutSettings, handleApply, openEditor]);

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
        className="max-w-90vw max-h-90vh border-1 fixed inset-0 m-auto h-[600px] w-[900px] bg-transparent"
        ref={dialogRef}
        onClick={e => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}>
        <EditorUI
          isOpen={isDialogOpen}
          onClose={closeDialog}
          initialContent={currentContent}
          onApply={handleApply}
          className="rounded-lg border bg-white px-6 py-4"
        />
      </dialog>
    </>
  );
}

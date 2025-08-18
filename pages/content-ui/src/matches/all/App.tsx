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
  const [isContentAppliable, setIsContentAppliable] = useState(false);
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Use the storage hook to read data reactively
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const uiModeSettings = useStorage(uiModeStorage);

  const handleApply = useCallback((content: string) => {
    if (focusedElementRef.current) {
      // Do nothing if it's a contenteditable element
      if (focusedElementRef.current.isContentEditable) {
        return;
      }

      // Focus the element first
      focusedElementRef.current.focus();

      // Handle INPUT and TEXTAREA elements
      if (focusedElementRef.current.tagName === 'TEXTAREA' || focusedElementRef.current.tagName === 'INPUT') {
        const inputElement = focusedElementRef.current as HTMLInputElement | HTMLTextAreaElement;
        inputElement.select();

        // Use execCommand to insert text (this simulates typing/pasting)
        if (document.execCommand('insertText', false, content)) {
          console.log('[CEB] Used execCommand insertText for input/textarea');
        } else {
          // Fallback: directly set value and dispatch events
          inputElement.value = content;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('[CEB] Used direct value setting for input/textarea');
        }

        // Move cursor to end of input
        inputElement.setSelectionRange(content.length, content.length);
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
          : focusedElement.innerText || '';

      setCurrentContent(content);
      // isContentAppliable is true when there is a focused element AND it's NOT contentEditable
      setIsContentAppliable(!focusedElement.isContentEditable);

      if (uiModeSettings.mode === UI_MODE.SIDE_PANEL) {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: content,
          isContentAppliable: !focusedElement.isContentEditable,
        });
      } else {
        setIsDialogOpen(true);
      }
    } else {
      if (uiModeSettings.mode === UI_MODE.DIALOG) {
        setIsContentAppliable(false);
        setIsDialogOpen(true);
      } else {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: '',
          isContentAppliable: false,
        });
      }
    }
  }, [uiModeSettings.mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // safety check: do nothing if user did not set any modifier
      if (shortcutSettings.modifiers.length === 0) {
        return;
      }

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
          isContentAppliable={isContentAppliable}
        />
      </dialog>
    </>
  );
}

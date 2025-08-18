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
  const [isContentEditable, setIsContentEditable] = useState(false);
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Use the storage hook to read data reactively
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const uiModeSettings = useStorage(uiModeStorage);

  const handleApply = useCallback((content: string) => {
    if (focusedElementRef.current) {
      // Check if it's a contenteditable element
      if (focusedElementRef.current.isContentEditable) {
        // For contenteditable elements, copy to clipboard and show message
        navigator.clipboard
          .writeText(content)
          .then(() => {
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 300px;
          `;
            notification.textContent = 'Content copied to clipboard! Please paste manually (Ctrl+V / Cmd+V)';
            document.body.appendChild(notification);

            // Remove notification after 3 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 3000);

            console.log('[CEB] Contenteditable detected - copied to clipboard for manual paste');
          })
          .catch(error => {
            console.error('[CEB] Failed to copy contenteditable content to clipboard:', error);
            // Fallback: show error message
            alert('Contenteditable element detected. Please copy the content manually and paste it.');
          });
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
      setIsContentEditable(focusedElement.isContentEditable);

      if (uiModeSettings.mode === UI_MODE.SIDE_PANEL) {
        console.log('[CEB] isContentEditable', focusedElement.isContentEditable);
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: content,
          isContentEditable: focusedElement.isContentEditable,
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
          isContentEditable={isContentEditable}
        />
      </dialog>
    </>
  );
}

/* oxlint-disable jsx-a11y/click-events-have-key-events */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
// import { t } from '@extension/i18n';
import { useStorage, IFRAME_MESSAGE_EVENT_NAME, IFRAME_MESSAGE_TYPE, createShortcutMatcher } from '@extension/shared';
import { keyboardShortcutStorage } from '@extension/storage';
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

  const closeDialog = () => {
    setIsDialogOpen(false);
    document.dispatchEvent(
      new CustomEvent(IFRAME_MESSAGE_EVENT_NAME, { detail: { type: IFRAME_MESSAGE_TYPE.HIDE_IFRAME } }),
    );
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    document.dispatchEvent(
      new CustomEvent(IFRAME_MESSAGE_EVENT_NAME, { detail: { type: IFRAME_MESSAGE_TYPE.SHOW_IFRAME } }),
    );
  };

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

  const openEditor = useCallback((mode: 'dialog' | 'sidePanel') => {
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

      if (mode === 'sidePanel') {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: content,
          isContentAppliable: !focusedElement.isContentEditable,
        });
      } else {
        openDialog();
      }
    } else {
      if (mode === 'sidePanel') {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDE_PANEL_EDITOR',
          content: '',
          isContentAppliable: false,
        });
      } else {
        openDialog();
        setIsContentAppliable(false);
      }
    }
  }, []);

  // Store pre-computed shortcut matchers for maximum performance
  const dialogMatcher = useRef<((e: KeyboardEvent) => boolean) | null>(null);
  const sidePanelMatcher = useRef<((e: KeyboardEvent) => boolean) | null>(null);

  // Update shortcut matchers when settings change
  useEffect(() => {
    // Create matcher for dialog shortcut
    dialogMatcher.current = createShortcutMatcher(shortcutSettings.dialog);

    // Create matcher for side panel shortcut
    sidePanelMatcher.current = createShortcutMatcher(shortcutSettings.sidePanel);
  }, [shortcutSettings]);

  // shortcut listener -- no-op if no shortcut is enabled
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check dialog shortcut first
      if (dialogMatcher.current?.(e)) {
        e.preventDefault();
        openEditor('dialog');
        return;
      }

      // Check side panel shortcut
      if (sidePanelMatcher.current?.(e)) {
        e.preventDefault();
        openEditor('sidePanel');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openEditor]);

  // set up message listener for apply content (e.g. from side panel)
  useEffect(() => {
    const handleMessage = (message: unknown) => {
      if (typeof message === 'object' && message !== null && 'type' in message && 'content' in message) {
        const msg = message as { type: string; content: string };
        if (msg.type === 'APPLY_CONTENT' && msg.content && focusedElementRef.current) {
          handleApply(msg.content);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [handleApply]);

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

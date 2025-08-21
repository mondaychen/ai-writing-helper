/* oxlint-disable jsx-a11y/click-events-have-key-events */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions */
// import { t } from '@extension/i18n';
import { useStorage, IFRAME_MESSAGE_EVENT_NAME, IFRAME_MESSAGE_TYPE } from '@extension/shared';
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
        openDialog();
      }
    } else {
      if (uiModeSettings.mode === UI_MODE.SIDE_PANEL) {
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
  }, [uiModeSettings.mode]);

  // Store pre-computed shortcut matcher for maximum performance
  const shortcutMatcher = useRef<((e: KeyboardEvent) => boolean) | null>(null);

  // Update shortcut matcher when settings change
  useEffect(() => {
    if (shortcutSettings.modifiers.length === 0) {
      shortcutMatcher.current = null; // No shortcuts configured
      return;
    }

    // Pre-compute modifier checks and key comparison (runs once, not on every keypress)
    const modifierChecks: ((e: KeyboardEvent) => boolean)[] = [];
    const targetKey = shortcutSettings.key.toUpperCase(); // Cache uppercase key

    for (const modifier of shortcutSettings.modifiers) {
      switch (modifier) {
        case 'ctrlKey':
          modifierChecks.push((e: KeyboardEvent) => e.ctrlKey); // Pre-compile modifier check
          break;
        case 'shiftKey':
          modifierChecks.push((e: KeyboardEvent) => e.shiftKey);
          break;
        case 'altKey':
          modifierChecks.push((e: KeyboardEvent) => e.altKey);
          break;
        case 'metaKey':
          modifierChecks.push((e: KeyboardEvent) => e.metaKey);
          break;
      }
    }

    // Create optimized matcher function (replaces expensive array.every() + string ops)
    shortcutMatcher.current = (e: KeyboardEvent) => {
      // Fast path: check key first (most likely to fail, avoids modifier checks)
      if (e.key.toUpperCase() !== targetKey) return false;

      // Check modifiers only if key matches (short-circuit evaluation)
      for (const check of modifierChecks) {
        if (!check(e)) return false;
      }
      return true;
    };
  }, [shortcutSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ultra-fast early return if no matcher
      if (!shortcutMatcher.current) return;

      // Use pre-computed matcher
      if (shortcutMatcher.current(e)) {
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
  }, [handleApply, openEditor]);

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

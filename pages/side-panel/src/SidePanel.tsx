import '@src/SidePanel.css';
import { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { EditorUI } from '@extension/ui/app/EditorUI';

const SidePanel = () => {
  const [currentContent, setCurrentContent] = useState('');
  const [isContentAppliable, setIsContentAppliable] = useState(false);

  useEffect(() => {
    const handleMessage = (message: unknown) => {
      if (typeof message === 'object' && message !== null && 'type' in message && 'content' in message) {
        const msg = message as { type: string; content: string; isContentAppliable?: boolean };
        if (msg.type === 'OPEN_SIDE_PANEL_EDITOR' && msg.content) {
          setCurrentContent(msg.content);
          setIsContentAppliable(msg.isContentAppliable || false);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleApply = async (content: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'APPLY_CONTENT',
          content: content,
        });
      }
    });
  };

  return (
    <EditorUI
      isOpen={true}
      onClose={() => {}}
      initialContent={currentContent}
      onApply={handleApply}
      className={cn('flex-1 p-4')}
      showCloseButton={false}
      isContentAppliable={isContentAppliable}
    />
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);

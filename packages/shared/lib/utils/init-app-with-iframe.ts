import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

export const initAppWithIframe = ({
  id,
  app,
  inlineCss,
  iframeAttributes = {},
}: {
  id: string;
  inlineCss: string;
  app: ReactElement;
  iframeAttributes?: Record<string, string>;
}) => {
  const root = document.createElement('div');
  root.id = id;

  document.body.append(root);

  // Create iframe element
  const iframe = document.createElement('iframe');
  iframe.id = `iframe-${id}`;

  // Set default iframe attributes
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.zIndex = '99999';
  iframe.style.display = 'none';

  // Apply custom iframe attributes
  Object.entries(iframeAttributes).forEach(([key, value]) => {
    iframe.setAttribute(key, value);
  });

  root.appendChild(iframe);

  // Wait for iframe to load before injecting content
  iframe.onload = () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDocument) {
      console.error('Failed to access iframe document');
      return;
    }

    // Create root element inside iframe
    const rootIntoIframe = iframeDocument.createElement('div');
    rootIntoIframe.id = `iframe-root-${id}`;

    // Inject styles into iframe
    const styleElement = iframeDocument.createElement('style');
    styleElement.innerHTML = inlineCss;
    iframeDocument.head.appendChild(styleElement);

    // Add root element to iframe body
    iframeDocument.body.appendChild(rootIntoIframe);

    // Render React app inside iframe
    createRoot(rootIntoIframe).render(app);
  };
  // set up event listener to show or hide iframe
  document.addEventListener('CEB:extension:iframe:message', (event: Event) => {
    if ('detail' in event) {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      if (message.type === 'SHOW_IFRAME') {
        iframe.style.display = 'block';
      } else if (message.type === 'HIDE_IFRAME') {
        iframe.style.display = 'none';
      }
    }
  });

  // Set iframe src to about:blank to ensure it loads
  iframe.src = 'about:blank';
};

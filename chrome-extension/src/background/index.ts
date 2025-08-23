import 'webextension-polyfill';

chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL_EDITOR') {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'side-panel/index.html',
        enabled: true,
      });

      // Forward the message to the side panel
      chrome.runtime.sendMessage({
        type: 'OPEN_SIDE_PANEL_EDITOR',
        content: message.content,
        isContentAppliable: message.isContentAppliable,
      });
    }
  }
  if (message.type === 'OPEN_OPTIONS_PAGE') {
    chrome.runtime.openOptionsPage();
  }
});

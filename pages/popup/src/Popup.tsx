import '@src/Popup.css';
import { t } from '@extension/i18n';
import {
  PROJECT_URL_OBJECT,
  useStorage,
  withErrorBoundary,
  withSuspense,
  formatShortcut,
  hasEnabledShortcuts,
} from '@extension/shared';
import { exampleThemeStorage, aiSettingsStorage, keyboardShortcutStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const aiSettings = useStorage(aiSettingsStorage);
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const logo = 'popup/logo.png';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.sidePanel
          .open({ tabId: tabs[0].id })
          .then(() => {
            // Close the popup after successfully opening the side panel
            window.close();
          })
          .catch(() => {
            // If opening side panel fails, don't close the popup
            console.error('Failed to open side panel');
          });
      }
    });
  };

  // Check if API key is set
  const hasApiKey = aiSettings?.apiKey && aiSettings.apiKey.trim() !== '';

  // Check if any shortcuts are enabled
  const hasEnabledShortcutsValue = hasEnabledShortcuts(shortcutSettings || {});

  const dialogShortcut = formatShortcut(shortcutSettings?.dialog);
  const sidePanelShortcut = formatShortcut(shortcutSettings?.sidePanel);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header
        className={cn(
          isLight ? 'text-gray-900' : 'text-gray-100',
          'flex flex-row items-center justify-center space-x-2',
        )}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <h1 className="pt-1 text-lg font-bold">AI Writing Helper</h1>
      </header>

      <div className="mt-4 flex flex-col space-y-3">
        {!hasApiKey ? (
          <div
            className={cn(
              'rounded-lg p-4 text-center',
              isLight
                ? 'border border-yellow-200 bg-yellow-50 text-yellow-800'
                : 'border border-yellow-700 bg-yellow-900/20 text-yellow-200',
            )}>
            <p className="mb-2 text-sm font-medium">API Key Required</p>
            <p className="mb-3 text-xs">Please set up your API key in settings to use the AI features.</p>
            <button
              className={cn(
                'rounded px-3 py-1 text-xs font-medium shadow',
                isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
              )}
              onClick={openOptionsPage}>
              Set API Key
            </button>
          </div>
        ) : hasEnabledShortcutsValue ? (
          <div
            className={cn(
              'rounded-lg p-4',
              isLight
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-green-700 bg-green-900/20 text-green-200',
            )}>
            <p className="mb-2 text-sm font-medium">Active Shortcuts</p>
            <div className="space-y-1 text-xs">
              {dialogShortcut && (
                <div className="flex items-center justify-between">
                  <span>Use Editor on Active Page:</span>
                  <code
                    className={cn(
                      'rounded px-2 py-1 font-mono text-xs',
                      isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-700 text-gray-200',
                    )}>
                    {dialogShortcut}
                  </code>
                </div>
              )}
              {sidePanelShortcut && (
                <div className="flex items-center justify-between">
                  <span>Use Editor in Side Panel:</span>
                  <code
                    className={cn(
                      'rounded px-2 py-1 font-mono text-xs',
                      isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-700 text-gray-200',
                    )}>
                    {sidePanelShortcut}
                  </code>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'rounded-lg p-4 text-center',
              isLight
                ? 'border border-gray-200 bg-gray-50 text-gray-700'
                : 'border border-gray-600 bg-gray-700/20 text-gray-300',
            )}>
            <p className="mb-2 text-sm font-medium">No Shortcuts Enabled</p>
            <p className="mb-3 text-xs">
              You can set up keyboard shortcuts in settings to quickly access the AI editor.
            </p>
            <button
              className={cn(
                'rounded px-3 py-1 text-xs font-medium shadow',
                isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
              )}
              onClick={openOptionsPage}>
              Configure Shortcuts
            </button>
          </div>
        )}

        <div className="mx-auto flex flex-col space-y-2">
          <button
            className={cn(
              'rounded px-4 py-2 font-medium shadow',
              isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
            )}
            onClick={openOptionsPage}>
            Settings
          </button>
          <button
            className={cn(
              'rounded px-4 py-2 font-medium shadow',
              isLight ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600',
            )}
            onClick={openSidePanel}>
            Use Editor in Side Panel
          </button>
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);

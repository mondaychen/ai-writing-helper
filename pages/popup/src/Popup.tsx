import '@src/Popup.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = 'popup/logo.png';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  };

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
        <button
          className={cn(
            'rounded px-4 py-2 font-medium shadow hover:scale-105',
            isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
          )}
          onClick={openOptionsPage}>
          Open Settings
        </button>
        <button
          className={cn(
            'rounded px-4 py-2 font-medium shadow hover:scale-105',
            isLight ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600',
          )}
          onClick={openSidePanel}>
          Open Side Panel
        </button>
        <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);

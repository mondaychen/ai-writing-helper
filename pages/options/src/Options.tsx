import '@src/Options.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, aiSettingsStorage, keyboardShortcutStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useState, useEffect } from 'react';
import type { AISettingsType, KeyboardShortcutType } from '@extension/storage';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const aiSettings = useStorage(aiSettingsStorage);
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';

  const [formData, setFormData] = useState({
    apiKey: '',
    baseUrl: '',
    modelName: '',
  });

  const [shortcutData, setShortcutData] = useState({
    modifiers: ['ctrlKey', 'shiftKey'],
    key: 'E',
  });

  useEffect(() => {
    if (aiSettings && typeof aiSettings === 'object' && 'apiKey' in aiSettings) {
      const settings = aiSettings as AISettingsType;
      setFormData({
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        modelName: settings.modelName,
      });
    }
  }, [aiSettings]);

  useEffect(() => {
    if (shortcutSettings && typeof shortcutSettings === 'object' && 'modifiers' in shortcutSettings) {
      const settings = shortcutSettings as KeyboardShortcutType;
      setShortcutData({
        modifiers: settings.modifiers,
        key: settings.key,
      });
    }
  }, [shortcutSettings]);

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const handleSaveSettings = async () => {
    await aiSettingsStorage.set(formData);
    alert('AI settings saved successfully!');
  };

  const handleSaveShortcut = async () => {
    await keyboardShortcutStorage.set(shortcutData);
    alert('Keyboard shortcut saved successfully!');
  };

  const handleModifierChange = (modifier: string, checked: boolean) => {
    if (checked) {
      setShortcutData(prev => ({
        ...prev,
        modifiers: [...prev.modifiers, modifier],
      }));
    } else {
      setShortcutData(prev => ({
        ...prev,
        modifiers: prev.modifiers.filter(m => m !== modifier),
      }));
    }
  };

  return (
    <div className={cn('min-h-screen p-8', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100')}>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <button onClick={goGithubSite}>
            <img src={chrome.runtime.getURL(logo)} className="mx-auto mb-4 h-16" alt="logo" />
          </button>
          <h1 className="text-3xl font-bold">AI Writing Helper Options</h1>
        </header>

        <div className="space-y-8">
          {/* AI Settings Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-700')}>
            <h2 className="mb-4 text-xl font-semibold">AI Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="api-key" className="mb-2 block text-sm font-medium">
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={formData.apiKey}
                  onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className={cn(
                    'w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
                    isLight
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-gray-600 bg-gray-800 text-gray-100 focus:ring-blue-400',
                  )}
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <div>
                <label htmlFor="base-url" className="mb-2 block text-sm font-medium">
                  Base URL
                </label>
                <input
                  id="base-url"
                  type="url"
                  value={formData.baseUrl}
                  onChange={e => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className={cn(
                    'w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
                    isLight
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-gray-600 bg-gray-800 text-gray-100 focus:ring-blue-400',
                  )}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div>
                <label htmlFor="model-name" className="mb-2 block text-sm font-medium">
                  Model Name
                </label>
                <input
                  id="model-name"
                  type="text"
                  value={formData.modelName}
                  onChange={e => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
                  className={cn(
                    'w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
                    isLight
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-gray-600 bg-gray-800 text-gray-100 focus:ring-blue-400',
                  )}
                  placeholder="gpt-3.5-turbo"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Save AI Settings
              </button>
            </div>
          </section>

          {/* Keyboard Shortcut Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-700')}>
            <h2 className="mb-4 text-xl font-semibold">Keyboard Shortcut</h2>
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 block text-sm font-medium">Modifiers</legend>
                <div className="space-y-2">
                  {['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].map(modifier => (
                    <label key={modifier} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shortcutData.modifiers.includes(modifier)}
                        onChange={e => handleModifierChange(modifier, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {modifier === 'ctrlKey' && 'Ctrl'}
                        {modifier === 'shiftKey' && 'Shift'}
                        {modifier === 'altKey' && 'Alt'}
                        {modifier === 'metaKey' && 'Meta/Cmd'}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="shortcut-key" className="mb-2 block text-sm font-medium">
                  Key
                </label>
                <input
                  id="shortcut-key"
                  type="text"
                  value={shortcutData.key}
                  onChange={e => setShortcutData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  className={cn(
                    'w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
                    isLight
                      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                      : 'border-gray-600 bg-gray-800 text-gray-100 focus:ring-blue-400',
                  )}
                  placeholder="E"
                  maxLength={1}
                />
              </div>
              <div className={cn('rounded p-3 text-sm', isLight ? 'bg-gray-100' : 'bg-gray-600')}>
                <strong>Current shortcut: </strong>
                {shortcutData.modifiers
                  .map(mod => {
                    const displayName =
                      mod === 'ctrlKey' ? 'Ctrl' : mod === 'shiftKey' ? 'Shift' : mod === 'altKey' ? 'Alt' : 'Meta';
                    return displayName;
                  })
                  .join(' + ')}{' '}
                + {shortcutData.key}
              </div>
              <button
                onClick={handleSaveShortcut}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Save Shortcut
              </button>
            </div>
          </section>

          {/* Theme Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-700')}>
            <h2 className="mb-4 text-xl font-semibold">Theme</h2>
            <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
          </section>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);

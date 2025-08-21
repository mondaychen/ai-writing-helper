import '@src/Options.css';

import { useState, useEffect } from 'react';
import type { z } from 'zod';
// import { t } from '@extension/i18n';
import { toast } from 'sonner';
import {
  useStorage,
  withErrorBoundary,
  withSuspense,
  validateShortcut,
  ALL_MODIFIER_KEYS,
  getModifierDisplayName,
} from '@extension/shared';
import { exampleThemeStorage, aiSettingsStorage, keyboardShortcutStorage } from '@extension/storage';
import type { KeyboardShortcutType, KeyboardShortcutsType } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Button } from '@/lib/components/ui/button';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Input } from '@/lib/components/ui/input';
import { Toaster } from '@/lib/components/ui/sonner';
import { Label } from '@/lib/components/ui/label';
import { Switch } from '@/lib/components/ui/switch';

import { AISetting, type formSchema } from './AISetting';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const aiSettings = useStorage(aiSettingsStorage);
  const shortcutSettings = useStorage(keyboardShortcutStorage);

  const [dialogShortcut, setDialogShortcut] = useState<KeyboardShortcutType>({
    modifiers: ['ctrlKey', 'shiftKey'],
    key: 'W',
    enabled: true,
  });

  const [sidePanelShortcut, setSidePanelShortcut] = useState<KeyboardShortcutType>({
    modifiers: ['ctrlKey', 'shiftKey'],
    key: 'S',
    enabled: false,
  });

  useEffect(() => {
    if (shortcutSettings && typeof shortcutSettings === 'object') {
      const settings = shortcutSettings as KeyboardShortcutsType;
      if (settings.dialog) {
        setDialogShortcut(settings.dialog);
      }
      if (settings.sidePanel) {
        setSidePanelShortcut(settings.sidePanel);
      }
    }
  }, [shortcutSettings]);

  const handleSaveSettings = async (data: z.infer<typeof formSchema>) => {
    await aiSettingsStorage.set(data);
    toast.success('AI settings saved successfully!');
  };

  const handleSaveShortcuts = async () => {
    // Validate dialog shortcut
    const dialogError = validateShortcut(dialogShortcut, 'Dialog');
    if (dialogError) {
      toast.error(dialogError);
      return;
    }

    // Validate side panel shortcut
    const sidePanelError = validateShortcut(sidePanelShortcut, 'Side Panel');
    if (sidePanelError) {
      toast.error(sidePanelError);
      return;
    }

    await keyboardShortcutStorage.set({
      dialog: dialogShortcut,
      sidePanel: sidePanelShortcut,
    });
    toast.success('Keyboard shortcuts saved successfully!');
  };

  const handleModifierChange = (shortcutType: 'dialog' | 'sidePanel', modifier: string, checked: boolean) => {
    const setShortcut = shortcutType === 'dialog' ? setDialogShortcut : setSidePanelShortcut;

    if (checked) {
      setShortcut(prev => ({
        ...prev,
        modifiers: [...prev.modifiers, modifier],
      }));
    } else {
      setShortcut(prev => ({
        ...prev,
        modifiers: prev.modifiers.filter(m => m !== modifier),
      }));
    }
  };

  const handleKeyChange = (shortcutType: 'dialog' | 'sidePanel', key: string) => {
    const setShortcut = shortcutType === 'dialog' ? setDialogShortcut : setSidePanelShortcut;
    setShortcut(prev => ({ ...prev, key: key.toUpperCase() }));
  };

  const handleEnabledChange = (shortcutType: 'dialog' | 'sidePanel', enabled: boolean) => {
    const setShortcut = shortcutType === 'dialog' ? setDialogShortcut : setSidePanelShortcut;
    setShortcut(prev => ({ ...prev, enabled }));
  };

  return (
    <div className={cn('min-h-screen p-8', isLight ? 'bg-slate-50 text-gray-900' : 'dark bg-zinc-900 text-gray-100')}>
      <Toaster position="top-center" richColors />
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">AI Writing Helper Options</h1>
        </header>

        <div className="space-y-8">
          {/* AI Settings Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-950')}>
            <AISetting onSubmit={handleSaveSettings} defaultValues={aiSettings} />
          </section>

          {/* Keyboard Shortcuts Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-950')}>
            <h2 className="mb-4 text-xl font-semibold">Keyboard Shortcuts</h2>
            <div className="space-y-6">
              {/* Dialog Shortcut */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="dialog-enabled"
                    checked={dialogShortcut.enabled}
                    onCheckedChange={checked => handleEnabledChange('dialog', checked)}
                  />
                  <Label htmlFor="dialog-enabled" className="text-lg font-medium">
                    Open in Dialog
                  </Label>
                </div>
                {dialogShortcut.enabled && (
                  <div className="space-y-4 border-l-4 pl-2">
                    <fieldset>
                      <legend className="mb-2 block text-sm font-medium">Modifiers</legend>
                      <div className="flex flex-wrap gap-4">
                        {ALL_MODIFIER_KEYS.map(modifier => (
                          <label key={modifier} className="flex items-center">
                            <Checkbox
                              checked={dialogShortcut.modifiers.includes(modifier)}
                              onCheckedChange={checked => handleModifierChange('dialog', modifier, checked as boolean)}
                              className="mr-1"
                            />
                            <span className="text-sm">{getModifierDisplayName(modifier)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div>
                      <label htmlFor="dialog-key" className="mb-2 block text-sm font-medium">
                        Key
                      </label>
                      <Input
                        id="dialog-key"
                        type="text"
                        value={dialogShortcut.key}
                        onChange={e => handleKeyChange('dialog', e.target.value)}
                        placeholder="One letter, e.g. W"
                        maxLength={1}
                      />
                    </div>
                    <div className={cn('rounded p-3 text-sm', isLight ? 'bg-gray-100' : 'bg-gray-600')}>
                      <strong>Current shortcut: </strong>
                      {dialogShortcut.modifiers.map(mod => getModifierDisplayName(mod)).join(' + ')} +{' '}
                      {dialogShortcut.key}
                    </div>
                  </div>
                )}
              </div>

              {/* Side Panel Shortcut */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="side-panel-enabled"
                    checked={sidePanelShortcut.enabled}
                    onCheckedChange={checked => handleEnabledChange('sidePanel', checked)}
                  />
                  <Label htmlFor="side-panel-enabled" className="text-lg font-medium">
                    Open Side Panel
                  </Label>
                </div>
                {sidePanelShortcut.enabled && (
                  <div className="space-y-4 border-l-4 pl-2">
                    <fieldset>
                      <legend className="mb-2 block text-sm font-medium">Modifiers</legend>
                      <div className="flex flex-wrap gap-4">
                        {ALL_MODIFIER_KEYS.map(modifier => (
                          <label key={modifier} className="flex items-center">
                            <Checkbox
                              checked={sidePanelShortcut.modifiers.includes(modifier)}
                              onCheckedChange={checked =>
                                handleModifierChange('sidePanel', modifier, checked as boolean)
                              }
                              className="mr-1"
                            />
                            <span className="text-sm">{getModifierDisplayName(modifier)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div>
                      <label htmlFor="side-panel-key" className="mb-2 block text-sm font-medium">
                        Key
                      </label>
                      <Input
                        id="side-panel-key"
                        type="text"
                        value={sidePanelShortcut.key}
                        onChange={e => handleKeyChange('sidePanel', e.target.value)}
                        placeholder="One key, e.g. S"
                        maxLength={1}
                      />
                    </div>
                    <div className={cn('rounded p-3 text-sm', isLight ? 'bg-gray-100' : 'bg-gray-600')}>
                      <strong>Current shortcut: </strong>
                      {sidePanelShortcut.modifiers.map(mod => getModifierDisplayName(mod)).join(' + ')} +{' '}
                      {sidePanelShortcut.key}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSaveShortcuts}>Save Shortcuts</Button>
            </div>
          </section>

          {/* Theme Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-950')}>
            <h2 className="mb-4 text-xl font-semibold">Theme</h2>
            <div className="flex items-center gap-2">
              <Switch id="theme-toggle" checked={isLight} onCheckedChange={exampleThemeStorage.toggle} />
              <Label htmlFor="theme-toggle">Light Mode / Dark Mode</Label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);

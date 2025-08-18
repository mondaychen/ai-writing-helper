import '@src/Options.css';

import { useState, useEffect } from 'react';
import type { z } from 'zod';
// import { t } from '@extension/i18n';
import { toast } from 'sonner';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  exampleThemeStorage,
  aiSettingsStorage,
  keyboardShortcutStorage,
  uiModeStorage,
  UI_MODE,
} from '@extension/storage';
import type { KeyboardShortcutType } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Button } from '@/lib/components/ui/button';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Input } from '@/lib/components/ui/input';
import { Toaster } from '@/lib/components/ui/sonner';
import { Label } from '@/lib/components/ui/label';
import { Switch } from '@/lib/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { AISetting, type formSchema } from './AISetting';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const aiSettings = useStorage(aiSettingsStorage);
  const shortcutSettings = useStorage(keyboardShortcutStorage);
  const uiModeSettings = useStorage(uiModeStorage);

  const [shortcutData, setShortcutData] = useState({
    modifiers: ['ctrlKey', 'shiftKey'],
    key: 'E',
  });

  useEffect(() => {
    if (shortcutSettings && typeof shortcutSettings === 'object' && 'modifiers' in shortcutSettings) {
      const settings = shortcutSettings as KeyboardShortcutType;
      setShortcutData({
        modifiers: settings.modifiers,
        key: settings.key,
      });
    }
  }, [shortcutSettings]);

  const handleSaveSettings = async (data: z.infer<typeof formSchema>) => {
    await aiSettingsStorage.set(data);
    toast.success('AI settings saved successfully!');
  };

  const handleSaveShortcut = async () => {
    await keyboardShortcutStorage.set(shortcutData);
    toast.success('Keyboard shortcut saved successfully!');
  };

  const handleUIModeChange = async (mode: string) => {
    await uiModeStorage.set({ mode: mode as typeof UI_MODE.DIALOG | typeof UI_MODE.SIDE_PANEL });
    toast.success('UI mode saved successfully!');
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

          {/* Keyboard Shortcut Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-950')}>
            <h2 className="mb-4 text-xl font-semibold">Keyboard Shortcut</h2>
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 block text-sm font-medium">Modifiers</legend>
                <div className="flex flex-wrap gap-4">
                  {['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].map(modifier => (
                    <label key={modifier} className="flex items-center">
                      <Checkbox
                        checked={shortcutData.modifiers.includes(modifier)}
                        onCheckedChange={checked => handleModifierChange(modifier, checked as boolean)}
                        className="mr-1"
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
                <Input
                  id="shortcut-key"
                  type="text"
                  value={shortcutData.key}
                  onChange={e => setShortcutData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
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
              <Button onClick={handleSaveShortcut}>Save Shortcut</Button>
            </div>
          </section>

          {/* UI Mode Section */}
          <section className={cn('rounded-lg p-6', isLight ? 'bg-white shadow-md' : 'bg-gray-950')}>
            <h2 className="mb-4 text-xl font-semibold">Editor Interface</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ui-mode-select" className="mb-2 block text-sm font-medium">
                  Editor Display Mode
                </Label>
                <Select value={uiModeSettings.mode} onValueChange={handleUIModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UI_MODE.DIALOG}>Modal Dialog (overlay on page)</SelectItem>
                    <SelectItem value={UI_MODE.SIDE_PANEL}>Side Panel (Chrome extension panel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={cn('rounded p-3 text-sm', isLight ? 'bg-gray-100' : 'bg-gray-600')}>
                <strong>Current mode: </strong>
                {uiModeSettings.mode === UI_MODE.DIALOG ? 'Modal Dialog' : 'Side Panel'}
                <br />
                <span className="text-xs opacity-75">
                  {uiModeSettings.mode === UI_MODE.DIALOG
                    ? 'Editor appears as an overlay on the current page'
                    : "Editor appears in Chrome's side panel (requires Chrome 114+)"}
                </span>
              </div>
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

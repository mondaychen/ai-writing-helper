import { useState, useCallback, useMemo } from 'react';
import type { ContentVersion, VersionHistory, VersionManager } from './version-types';

const generateVersionId = () => `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useVersionManager = (initialContent: string = ''): VersionManager => {
  const [history, setHistory] = useState<VersionHistory>(() => {
    const initialVersion: ContentVersion = {
      id: generateVersionId(),
      content: initialContent,
      createdAt: Date.now(),
      isAiGenerated: false,
    };

    return {
      versions: [initialVersion],
      currentVersionIndex: 0,
    };
  });

  // Navigation actions
  const goToPreviousVersion = useCallback(() => {
    if (history.currentVersionIndex > 0) {
      setHistory(prev => ({
        ...prev,
        currentVersionIndex: prev.currentVersionIndex - 1,
      }));
    }
  }, [history.currentVersionIndex]);

  const goToNextVersion = useCallback(() => {
    if (history.currentVersionIndex < history.versions.length - 1) {
      setHistory(prev => ({
        ...prev,
        currentVersionIndex: prev.currentVersionIndex + 1,
      }));
    }
  }, [history.currentVersionIndex, history.versions.length]);

  // Content management
  const updateCurrentVersion = useCallback((content: string) => {
    setHistory(prev => {
      const updatedVersions = [...prev.versions];
      updatedVersions[prev.currentVersionIndex] = {
        ...updatedVersions[prev.currentVersionIndex],
        content,
      };

      return {
        ...prev,
        versions: updatedVersions,
      };
    });
  }, []);

  const addNewVersion = useCallback((content: string, summary?: string, isAiGenerated: boolean = true) => {
    setHistory(prev => {
      const newVersion: ContentVersion = {
        id: generateVersionId(),
        content,
        summary,
        createdAt: Date.now(),
        isAiGenerated,
      };

      // If we're not at the latest version, truncate everything after current version
      // before adding the new version
      const versionsUpToCurrent = prev.versions.slice(0, prev.currentVersionIndex + 1);
      const newVersions = [...versionsUpToCurrent, newVersion];

      return {
        versions: newVersions,
        currentVersionIndex: newVersions.length - 1,
      };
    });
  }, []);

  // Getters
  const getCurrentVersion = useCallback((): ContentVersion | null => {
    return history.versions[history.currentVersionIndex] || null;
  }, [history.versions, history.currentVersionIndex]);

  const getCurrentContent = useCallback((): string => {
    const currentVersion = getCurrentVersion();
    return currentVersion?.content || '';
  }, [getCurrentVersion]);

  const getTotalVersions = useCallback((): number => {
    return history.versions.length;
  }, [history.versions.length]);

  const getCurrentVersionNumber = useCallback((): number => {
    return history.currentVersionIndex + 1; // 1-based for display
  }, [history.currentVersionIndex]);

  // Reset functionality
  const resetToInitialContent = useCallback((newInitialContent: string) => {
    const initialVersion: ContentVersion = {
      id: generateVersionId(),
      content: newInitialContent,
      createdAt: Date.now(),
      isAiGenerated: false,
    };

    setHistory({
      versions: [initialVersion],
      currentVersionIndex: 0,
    });
  }, []);

  // Computed properties
  const canGoBack = useMemo(() => history.currentVersionIndex > 0, [history.currentVersionIndex]);
  const canGoForward = useMemo(
    () => history.currentVersionIndex < history.versions.length - 1,
    [history.currentVersionIndex, history.versions.length],
  );

  return {
    // State
    history,

    // Navigation actions
    goToPreviousVersion,
    goToNextVersion,
    canGoBack,
    canGoForward,

    // Content management
    updateCurrentVersion,
    addNewVersion,

    // Getters
    getCurrentVersion,
    getCurrentContent,
    getTotalVersions,
    getCurrentVersionNumber,

    // Reset
    resetToInitialContent,
  };
};

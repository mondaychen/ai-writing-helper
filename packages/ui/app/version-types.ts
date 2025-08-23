export interface ContentVersion {
  id: string;
  content: string;
  summary?: string;
  createdAt: number;
  isAiGenerated: boolean;
}

export interface VersionHistory {
  versions: ContentVersion[];
  currentVersionIndex: number;
}

export interface VersionManagerState {
  history: VersionHistory;
}

export interface VersionManagerActions {
  // Version navigation
  goToPreviousVersion: () => void;
  goToNextVersion: () => void;
  canGoBack: boolean;
  canGoForward: boolean;

  // Content management
  updateCurrentVersion: (content: string) => void;
  addNewVersion: (content: string, summary?: string, isAiGenerated?: boolean) => void;

  // Getters
  getCurrentVersion: () => ContentVersion | null;
  getCurrentContent: () => string;
  getTotalVersions: () => number;
  getCurrentVersionNumber: () => number;

  // Reset
  resetToInitialContent: (initialContent: string) => void;
}

export type VersionManager = VersionManagerState & VersionManagerActions;

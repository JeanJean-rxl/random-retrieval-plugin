import { TFile, View } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };

export interface SearchDOM {
    getFiles(): TFile[];
}

export interface SearchView extends View {
    dom: SearchDOM;
}

export interface RandomRetrievalSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
    setModel: string;
    setNoteNum: string;
    setCondaEnv: string;
    vaultPath: string;
}

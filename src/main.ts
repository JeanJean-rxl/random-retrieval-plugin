import { 
    App, 
    Editor, 
    MarkdownView, 
    Modal, 
    Notice, 
    Plugin, 
    requestUrl,
    FileSystemAdapter,
    PluginManifest,
    PluginSettingTab, 
    Setting, 
    ItemView, 
    WorkspaceLeaf,
	TFile 
}from 'obsidian';

import * as os from 'os';

import { RandomRetrievalSettingTab } from './set_tab';
import { RandomRetrievalSettings } from './types';
import { InputModal } from './set_modal';
import * as fs from 'fs';
import { exec, ChildProcess } from 'child_process';
import '../styles.css';


export default class RandomRetrievalPlugin extends Plugin {

    app: App;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest); 
        this.app = app;
    }

    getAbsPath(fileName: string): string {
        let basePath='';
        let relativePath;

        if (this.app.vault.adapter instanceof FileSystemAdapter) {
            basePath = this.app.vault.adapter.getBasePath() || '';
        }

        return basePath;
    }


    ribbonIconEl: HTMLElement | undefined = undefined;

    settings: RandomRetrievalSettings = { openInNewLeaf: true, 
        setNoteNum: '3',
        setLanguage: 'zh', 
        vaultPath: `${this.getAbsPath('data.json')}`,
        setCondaEnv: 'rr-env',
        PATH_TO_JSON: `${this.getAbsPath('data.json')}/${this.manifest.dir}/data.json`,
        PATH_TO_APP: `${this.getAbsPath('data.json')}/${this.manifest.dir}/`

    };
    private uvicornProcess: ChildProcess | null = null;


	async onload() {
		await this.loadSettings();
        this.refreshRibbonIcon();
		this.addSettingTab(new RandomRetrievalSettingTab(this));
        this.runUvicorn();
	}
    
	async onunload() {
	}


	loadSettings = async (): Promise<void> => {
        const loadedSettings = (await this.loadData()) as RandomRetrievalSettings;
        if (loadedSettings) {
            this.setOpenInNewLeaf(loadedSettings.openInNewLeaf);
            this.setLanguage(loadedSettings.setLanguage);
            this.setNoteNum(loadedSettings.setNoteNum);
            this.setCondaEnv(loadedSettings.setCondaEnv);
            this.PATH_TO_JSON(loadedSettings.PATH_TO_JSON);
            this.PATH_TO_APP(loadedSettings.PATH_TO_APP);
        } else {
            this.refreshRibbonIcon();
        }
    };

	async saveSettings() {
		await this.saveData(this.settings);
        const jsonString = JSON.stringify(this.settings, null, 2);
        // await fs.promises.writeFile(this.settings.PATH_TO_JSON, jsonString, 'utf8');
	}

	setOpenInNewLeaf = (value: boolean): void => {
        this.settings.openInNewLeaf = value;
        this.saveData(this.settings);
    };

    setLanguage = (value: string): void => {
        this.settings.setLanguage = value;
        this.saveData(this.settings);
    };

    setNoteNum = (value: string): void => {
        this.settings.setNoteNum = value;
        this.saveData(this.settings);
    };

    setCondaEnv = (value: string): void => {
        this.settings.setCondaEnv = value;
        this.saveData(this.settings);
    };

    PATH_TO_JSON = (value: string): void => {
        this.settings.PATH_TO_JSON = value;
        this.saveData(this.settings);
    };

    PATH_TO_APP = (value: string): void => {
        this.settings.PATH_TO_APP = value;
        this.saveData(this.settings);
    };

    refreshRibbonIcon = (): void => {
        this.ribbonIconEl?.remove();

        this.ribbonIconEl = this.addRibbonIcon(
            'annoyed',
            'Open Random Note from Search',
            () => {
                const inputModal = new InputModal(this.app);
                inputModal.openAndGetValue().then((inputValue) => {
                    this.handleOpenRandomNote(inputValue);
                });
            }
        );

    };


    handleOpenRandomNote = async (query: string): Promise<void> => {

        let fileNames: any;
    
        try {
            const response = await requestUrl({
                url: `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`,
                method: 'GET'
            });
         
            if (response.status === 200) {

                const noteNum = Number(this.settings.setNoteNum);
                const validNoteNum = isNaN(noteNum) || noteNum <= 0 ? 1 : Math.min(noteNum, response.json.ranker.documents.length); 

                fileNames = response.json.ranker.documents.slice(0, validNoteNum).map((doc: any) => {
                    const FilesPath = doc.meta.name;
                    let relativePath = FilesPath.replace(this.settings.vaultPath, "");
                    return relativePath.replace(".md", "");
                });
                
                new Notice(`Top ${this.settings.setNoteNum} files: ${fileNames.join(', ')}`);

            } else {
                new Notice(`Failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Error details:', error);
            if (error.response) {
                new Notice(`Failed: ${error.response.status}`);
            } else if (error.request) {
                new Notice(`No response received`);
            } else {
                new Notice(`Error: ${error.message}`);
            }
        }
        
        for (const fileName of fileNames) {
            if (fileName) {
                new Notice(`Opening ${fileName}`);
                await this.app.workspace.openLinkText(fileName, '', this.settings.openInNewLeaf, {
                    active: true,
                });
            }
        }
    
    };

    
    async runUvicorn() {
        // Only supported on macOS
        if (os.platform() !== 'darwin') {
            new Notice('This feature is only supported on macOS.');
            return;
        }

        const command = `osascript -e 'tell application "Terminal"  
        activate
        do script "cd ${this.settings.PATH_TO_APP} && conda activate ${this.settings.setCondaEnv} && uvicorn rr_app:rr_app --reload"
        end tell'`;

        this.uvicornProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                new Notice(`Error: ${error.message}`);
                return;
            }

            if (stderr) {
                new Notice(`stderr: ${stderr}`);
                return;
            }

        });

    }
    
}


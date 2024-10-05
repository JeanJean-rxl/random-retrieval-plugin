import { 
    App, 
    Editor, 
    MarkdownView, 
    Modal, 
    Notice, 
    Plugin, 
    PluginSettingTab, 
    Setting, 
    ItemView, 
    WorkspaceLeaf,
	TFile 
}from 'obsidian';

import { RandomRetrievalSettingTab } from './settingTab';
import { RandomRetrievalSettings } from './types';
import { InputModal } from './set_modal';
import * as fs from 'fs';
import { exec } from 'child_process';


//@ts-ignore
const absPath = app.vault.adapter.basePath;
const PATH_TO_JSON = `${absPath}/.obsidian/plugins/random-retrieval-plugin/data.json`;
const PATH_TO_APP = `${absPath}/.obsidian/plugins/random-retrieval-plugin/`;


export default class RandomRetrievalPlugin extends Plugin {

    ribbonIconEl: HTMLElement | undefined = undefined;
    settings: RandomRetrievalSettings = { openInNewLeaf: true, 
        enableRibbonIcon: true, 
        setNoteNum: '3',
        setModel: 'default', 
        vaultPath: absPath,
        setCondaEnv: 'rr-env'
    };


	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RandomRetrievalSettingTab(this));
        this.runUvicorn();
	}

    
	async onunload() {
	}


	loadSettings = async (): Promise<void> => {
        const loadedSettings = (await this.loadData()) as RandomRetrievalSettings;
        if (loadedSettings) {
            this.setOpenInNewLeaf(loadedSettings.openInNewLeaf);
            this.setEnableRibbonIcon(loadedSettings.enableRibbonIcon);
            this.setModel(loadedSettings.setModel);
            this.setNoteNum(loadedSettings.setNoteNum);
            this.setCondaEnv(loadedSettings.setCondaEnv);
        } else {
            this.refreshRibbonIcon();
        }
    };

	async saveSettings() {
		await this.saveData(this.settings);
        const jsonString = JSON.stringify(this.settings, null, 2);
        await fs.promises.writeFile(PATH_TO_JSON, jsonString, 'utf8');
	}

	setOpenInNewLeaf = (value: boolean): void => {
        this.settings.openInNewLeaf = value;
        this.saveData(this.settings);
    };

    setModel = (value: string): void => {
        this.settings.setModel = value;
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

	setEnableRibbonIcon = (value: boolean): void => {
        this.settings.enableRibbonIcon = value;
        this.refreshRibbonIcon();
        this.saveData(this.settings);
    };

    refreshRibbonIcon = (): void => {
        this.ribbonIconEl?.remove();
        if (this.settings.enableRibbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(
                'annoyed',
                'Open Random Note from Search',
                () => {
                    const inputModal = new InputModal(this.app);
                    inputModal.openAndGetValue().then((inputValue) => {
                        this.handleOpenRandomNoteFromSearch_test(inputValue);
                    });
                }
            );
        }
    };


    handleOpenRandomNoteFromSearch_test = async (query: string): Promise<void> => {

        const axios = require('axios');
        let fileNames: any;
    
        try {
            const response = await axios.get(`http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`);
         
            if (response.status === 200) {

                const noteNum = Number(this.settings.setNoteNum);
                const validNoteNum = isNaN(noteNum) || noteNum <= 0 ? 1 : Math.min(noteNum, response.data.ranker.documents.length); // 确保 noteNum 是一个有效的正整数，并且不超过文档的长度

                fileNames = response.data.ranker.documents.slice(0, validNoteNum).map((doc: any) => {
                    const FilesPath = doc.meta.name;
                    let relativePath = FilesPath.replace(absPath, "");
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

    
    runUvicorn() {

        const command = `osascript -e 'tell application "Terminal"
        activate
        do script "cd ${PATH_TO_APP} && conda activate ${this.settings.setCondaEnv} && uvicorn rr_app:rr_app --reload"
    end tell'`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                new Notice(`Error: ${error.message}`);
                return;
            }

            if (stderr) {
                new Notice(`stderr: ${stderr}`);
                return;
            }

            new Notice(`stdout: ${stdout}`);
        });

    }
    
}


		

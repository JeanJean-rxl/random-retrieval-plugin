import RandomRetrievalPlugin from './main';
import { PluginSettingTab, Setting } from 'obsidian';

export class RandomRetrievalSettingTab extends PluginSettingTab {
    plugin: RandomRetrievalPlugin;

    constructor(plugin: RandomRetrievalPlugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Random Retrieval Settings' });

        new Setting(containerEl)
		.setName("LLM Retriever Language")
		.setDesc("zh for Chinese, en for English")
		.addText((text) =>
			text
			.setPlaceholder("zh")
			.setValue(this.plugin.settings.setLanguage)
			.onChange(async (value) => {
				this.plugin.settings.setLanguage = value;
				await this.plugin.saveSettings();
			})
		);

        new Setting(containerEl)
		.setName("Open How Many Notes")
		.setDesc("Default number of notes to open")
		.addText((text) =>
			text
			.setPlaceholder("3")
			.setValue(this.plugin.settings.setNoteNum.toString())
			.onChange(async (value) => {
                this.plugin.settings.setNoteNum = value;
				await this.plugin.saveSettings();
			})
		);

        new Setting(containerEl)
		.setName("Conda Environment Name")
		.setDesc("Default conda environment")
		.addText((text) =>
			text
			.setPlaceholder("rr-env")
			.setValue(this.plugin.settings.setCondaEnv)
			.onChange(async (value) => {
				this.plugin.settings.setCondaEnv = value;
				await this.plugin.saveSettings();
			})
		);

		new Setting(containerEl)
		.setName("Path to Plugin Configuration")
		.setDesc("Default")
		.addText((text) =>
			text
			.setPlaceholder("default")
			.setValue(this.plugin.settings.PATH_TO_JSON)
			.onChange(async (value) => {
				this.plugin.settings.PATH_TO_JSON = value;
				await this.plugin.saveSettings();
			})
		);

		new Setting(containerEl)
		.setName("Path to Plugin Application")
		.setDesc("Default")
		.addText((text) =>
			text
			.setPlaceholder("default")
			.setValue(this.plugin.settings.PATH_TO_APP)
			.onChange(async (value) => {
				this.plugin.settings.PATH_TO_APP = value;
				await this.plugin.saveSettings();
			})
		);

        new Setting(containerEl)
            .setName('Open in New Leaf')
            .setDesc('Default setting for opening random notes')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.openInNewLeaf);
                toggle.onChange(this.plugin.setOpenInNewLeaf);
            });

        new Setting(containerEl)
            .setName('Enable Ribbon Icon')
            .setDesc('Place an icon on the ribbon to open a random note from search')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.enableRibbonIcon);
                toggle.onChange(this.plugin.setEnableRibbonIcon);
            });
    }
}

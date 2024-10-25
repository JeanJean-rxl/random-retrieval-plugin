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

        new Setting(containerEl)
		.setName("LLM retriever language")
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
		.setName("Open how many notes")
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
		.setName("Conda environment name")
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
		.setName("Path to plugin configuration")
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
		.setName("Path to plugin application")
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
            .setName('Open in new leaf')
            .setDesc('Default setting for opening random notes')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.openInNewLeaf);
                toggle.onChange(this.plugin.setOpenInNewLeaf);
            });

    }
}

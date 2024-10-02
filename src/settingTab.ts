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
		.setName("LLM Model Name")
		.setDesc("Default model")
		.addText((text) =>
			text
			.setPlaceholder("default")
			.setValue(this.plugin.settings.setModel)
			.onChange(async (value) => {
				this.plugin.settings.setModel = value;
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
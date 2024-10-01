import { App, Plugin, Modal, Notice, Setting } from 'obsidian';


export class InputModal extends Modal {

    inputValue: string;
    resolve: (value: string) => void;

    constructor(app: App) {
        super(app);
        this.inputValue = '';
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: '请输入内容' });

        const inputEl = contentEl.createEl('input', {
            type: 'text',
            placeholder: '在此输入...',
        });

        inputEl.oninput = (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.inputValue = target.value;
        };

        contentEl.createEl('button', { text: '提交' }).addEventListener('click', () => {
            new Notice(`你输入了: ${this.inputValue}`);
            this.resolve(this.inputValue);
            this.close();  
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    openAndGetValue(): Promise<string> {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.open();
        });
    }

}
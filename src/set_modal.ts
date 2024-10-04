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
    
        // container
        contentEl.style.display = 'flex';
        contentEl.style.flexDirection = 'column';
        contentEl.style.alignItems = 'center';
        contentEl.style.justifyContent = 'center';
        contentEl.style.height = '120%';
    
        // title
        const titleEl = contentEl.createEl('h2', { text: 'I am wondering..' });
        titleEl.style.marginBottom = '20px';
    
        // input
        const inputEl = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'about..',
        });
        inputEl.style.width = '300px';
        inputEl.style.padding = '10px';
        inputEl.style.marginBottom = '20px';
        inputEl.style.border = '1px solid #ccc';
        inputEl.style.borderRadius = '5px';
    
        inputEl.oninput = (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.inputValue = target.value;
        };
    
        // button
        const buttonEl = contentEl.createEl('button', { text: 'NightWalk 💡' });
        buttonEl.style.padding = '10px 20px';
        buttonEl.style.border = 'none';
        buttonEl.style.backgroundColor = 'var(--color-accent)';
        buttonEl.style.color = 'white';
        buttonEl.style.borderRadius = '5px';
        buttonEl.style.cursor = 'pointer';
        buttonEl.tabIndex = 0;
    
        buttonEl.addEventListener('click', () => {
            new Notice(`Retrieving..: ${this.inputValue}`);
            this.resolve(this.inputValue);
            this.close();
        });

        inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                buttonEl.click();
            }
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
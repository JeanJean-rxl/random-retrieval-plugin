import { App, Plugin, Modal, Notice, Setting } from 'obsidian';
import '../styles.css';

export class InputModal extends Modal {

    inputValue: string;
    resolve: (value: string) => void;

    constructor(app: App) {
        super(app);
        this.inputValue = '';
    }

    onOpen() {
        const { contentEl } = this;
        // contentEl.classList.add('random-retrieval');
    
        // container
        contentEl.classList.add('random-retrieval', 'modal-content');
    
        // title
        const titleEl = contentEl.createEl('h2', { text: 'I am wondering..' });
        titleEl.classList.add('random-retrieval', 'modal-title');
    
        // input
        const inputEl = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'about..',
        });
        inputEl.classList.add('random-retrieval', 'modal-input');
    
        inputEl.oninput = (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.inputValue = target.value;
        };
    
        // button
        const buttonEl = contentEl.createEl('button', { text: 'NightWalk 💡' });
        buttonEl.classList.add('random-retrieval', 'button-nightwalk');
    
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
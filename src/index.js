import ListManager from "./ListManager";

const listManager = new ListManager();

class EditorWorkspace extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="">
                <button id="list-insert">Добавить список</button>
                <div id="editor"></div>
            </div>
        `;

        tinymce.init({
            selector: '#editor',
            setup: (editor) => {
                editor.on('init', () => {
                    this.querySelector('#list-insert').addEventListener('click', () => {
                        editor.insertContent(`&nbsp;<select class="select">${listManager.getMarkupOptions()}</select>&nbsp;`)
                    })
                })
            }
        })
    }
}

class TemplatePanel extends HTMLElement {
    #currentlyEditing = null;

    connectedCallback() {
        this.innerHTML = `
            <ul id="items-list"></ul>
            <div class="input-group">
                <input type="text" id="new-item" placeholder="Новый элемент" aria-label="Новый элемент">
                <button id="add-item">Добавить</button>
                <button id="update-item" style="display:none;">Обновить</button>
                <button id="cancel-edit" style="display:none;">Отмена</button>
            </div>
        `;

        this.#refreshItemsList();

        this.querySelector('#add-item').addEventListener('click', () => this.#addNewItem());
        this.querySelector('#update-item').addEventListener('click', () => this.#updateItem());
        this.querySelector('#cancel-edit').addEventListener('click', () => this.#cancelEditing());
        this.querySelector('#new-item').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.#currentlyEditing !== null ? this.#updateItem() : this.#addNewItem();
        }
        });

        this.querySelector('#new-item').addEventListener('blur', (e) => {
            this.#currentlyEditing !== null ? this.#updateItem() : this.#addNewItem();
        });
    }

    #refreshItemsList() {
        const ul = this.querySelector('#items-list');
        ul.innerHTML = '';
        listManager.getItems().forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="item-text">${item}</span>
            <div class="item-actions">
            <button class="edit-item" data-index="${index}" aria-label="Редактировать ${item}">✏️</button>
            <button class="delete-item" data-index="${index}" aria-label="Удалить ${item}">🗑️</button>
            </div>
        `;
        if (this.#currentlyEditing === index) {
            li.classList.add('editing');
        }
        ul.appendChild(li);
        li.querySelector('.edit-item').addEventListener('click', () => this.#startEditing(index));
        li.querySelector('.delete-item').addEventListener('click', () => this.#deleteItem(index));
        });
    }

    #addNewItem() {
        const newItemValue = this.querySelector('#new-item').value.trim();
        if (newItemValue && !listManager.addItem(newItemValue)) {
            alert('Элемент с таким названием уже существует!');
            return;
        }
        this.#refreshItemsList();
        this.querySelector('#new-item').value = '';
    }

    #updateItem() {
        const updatedItem = this.querySelector('#new-item').value.trim();
        if (updatedItem && this.#currentlyEditing !== null && !listManager.updateItem(this.#currentlyEditing, updatedItem)) {
        alert('Элемент с таким названием уже существует!');
        return;
        }
        this.#refreshItemsList();
        this.#cancelEditing();
    }

    #cancelEditing() {
        this.#currentlyEditing = null;
        this.querySelector('#new-item').value = '';
        this.querySelector('#add-item').style.display = 'inline-block';
        this.querySelector('#update-item').style.display = 'none';
        this.querySelector('#cancel-edit').style.display = 'none';
        this.#refreshItemsList();
    }

    #startEditing(index) {
        this.#currentlyEditing = index;
        this.querySelector('#new-item').value = listManager.getItems()[index];
        this.querySelector('#add-item').style.display = 'none';
        this.querySelector('#update-item').style.display = 'inline-block';
        this.querySelector('#cancel-edit').style.display = 'inline-block';
        this.#refreshItemsList();
        this.querySelector('#new-item').focus();
    }

    #deleteItem(index) {
        listManager.removeItem(index);
        this.#refreshItemsList();
    }
}

customElements.define('editor-workspace', EditorWorkspace);
customElements.define('template-panel', TemplatePanel);
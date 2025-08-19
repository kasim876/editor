class ListManager {
    #items;
    #selectsCache;
    #observer = null;

    constructor() {
        this.#items = ["Пункт 1", "Пункт 2"];
        this.#setupDOMObserver();
    }

    getItems() {
        return this.#items;
    }

    #invalidateCache() {
        this.#selectsCache = null;
    }

    #getSelects() {
        if (!this.#selectsCache) {
            const editorDoc = tinymce.activeEditor?.getDoc();
            this.#selectsCache = editorDoc ? 
                editorDoc.querySelectorAll('.select:not(.error)') : [];
        }

        return this.#selectsCache
    }

    #setupDOMObserver() {
        const editorDoc = tinymce.activeEditor?.getDoc();
        if (!editorDoc) return;

        this.#observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this.#invalidateCache();
                }
            })
        })

        this.#observer.observe(editorDoc.body, {
            childList: true,
            subtree: true,
        })
    }

    addItem(newItem) {
        if (!newItem || this.#items.includes(newItem)) return false;
        this.#items.push(newItem);
        console.log(this.#items)
        this.editMarkupOptions(null, newItem, 'ADD');

        return true;
    }

    updateItem(index, newItem) {
        if (index < 0 || index >= this.#items.length || this.#items.includes(newItem)) return false;
        const oldItem = this.#items[index];
        this.#items.splice(index, 1, newItem);
        this.editMarkupOptions(oldItem, newItem, 'UPDATE');

        return true;
    }

    removeItem(index) {
        if (index < 0 || index >= this.#items.length) return false;
        const oldItem = this.#items[index];
        this.#items.splice(index, 1);
        this.editMarkupOptions(oldItem, null, 'REMOVE');

        return true;
    }

    getMarkupOptions() {
        return this.#items.map(item => `<option value="${item}">${item}</option>`).join("");
    }

    editMarkupOptions(oldItem, newItem, type) {
        const selects = this.#getSelects();

        switch (type) {
            case 'ADD':
                this.#addOptionToSelects(selects, newItem);
                break;
                
            case 'UPDATE':
                this.#updateOptionInSelects(selects, oldItem, newItem);
                break;
                
            case 'REMOVE':
                this.#removeOptionFromSelects(selects, oldItem);
                break;
        }
    }

    #addOptionToSelects(selects, newItem) {
        selects.forEach(select => {
            const option = document.createElement('option');
            option.value = newItem;
            option.textContent = newItem;
            select.appendChild(option);
        });
    }

    #updateOptionInSelects(selects, oldItem, newItem) {
        selects.forEach(select => {
            const isCurrentValue = select.value === oldItem;
            const option = select.querySelector(`option[value="${oldItem}"]`);
            
            if (!option) return;

            option.value = newItem;
            option.textContent = newItem;
            if (isCurrentValue) select.value = newItem;
        });
    }

    #removeOptionFromSelects(selects, oldItem) {
        selects.forEach(select => {
            if (select.value === oldItem) {
                select.classList.add('error');
                select.innerHTML = '<option value="">ERROR</option>';
            }
            
            const option = select.querySelector(`option[value="${oldItem}"]`);
            option?.remove();
        });
    }
}

export default ListManager;
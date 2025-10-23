// modals.js - Gerenciador de Modais Interativos para user_page

window.Modals = {
    selectedProductsInModal: [],
    currentQuickKitProducts: [], // Para armazenar produtos do kit rápido sendo revisado
    editor: { settings: null, scaleX: 1, scaleY: 1, blocks: {} },
    
    selectAllProductsInModal: function() {
        // Marca todos com quantidade 1 e primeira unidade disponível
        const defaultUnit = (units && units.length > 0) ? (units[0].name || units[0]) : 'un';
        this.selectedProductsInModal = products.map(p => ({ product: p.name || p, quantity: 1, unit: defaultUnit }));
        // Re-renderiza UI do modal
        this.populateProductsTable();
        this.updateAddedProductsDisplay();
    },

    deselectAllProductsInModal: function() {
        this.selectedProductsInModal = [];
        this.populateProductsTable();
        this.updateAddedProductsDisplay();
    },

    // ======== FUNÇÕES UTILITÁRIAS ========
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        // Show and trigger CSS animations
        modal.style.display = 'flex';
        // delay class to ensure transition runs after layout
        requestAnimationFrame(() => {
            modal.classList.add('is-open');
        });
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        // Start exit animation then hide
        modal.classList.remove('is-open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 220); // match CSS transition
        document.body.style.overflow = 'auto';
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('is-open');
            setTimeout(() => { modal.style.display = 'none'; }, 220);
        });
        document.body.style.overflow = 'auto';
    },

    // ======== MODAL DE SELEÇÃO DE PRODUTOS ========
    showProductsSelectionModal() {
        this.selectedProductsInModal = [...currentOrderProducts]; // Pre-fill with current order products
        this.populateProductsTable();
        this.updateAddedProductsDisplay();
        this.openModal('products-selection-modal');
    },

    populateProductsTable() {
        const tbody = domElements.productsModalTbody;
        tbody.innerHTML = '';

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">Nenhum produto disponível.</td></tr>';
            return;
        }

        // Filter products based on search input
        const searchTerm = domElements.productSearchInput.value.toLowerCase();
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));

        for (let i = 0; i < filteredProducts.length; i += 2) {
            const tr = document.createElement('tr');

            const createProductCell = (product, index) => {
                const productInOrder = this.selectedProductsInModal.find(item => item.product === product.name);
                const isChecked = productInOrder ? 'checked' : '';
                const quantity = productInOrder ? productInOrder.quantity : 1;
                const selectedUnit = productInOrder ? productInOrder.unit : (units.length > 0 ? units[0].name : 'un');

                let unitOptions = '';
                units.forEach(unit => {
                    const unitName = unit.name || unit;
                    const selected = unitName === selectedUnit ? 'selected' : '';
                    unitOptions += `<option value="${unitName}" ${selected}>${unitName}</option>`;
                });

                return `
                    <td>
                        <div class="product-cell">
                            <input type="checkbox" class="product-checkbox" id="product-check-${product.name}" data-product-name="${product.name}" ${isChecked}>
                            <label for="product-check-${product.name}" class="product-label">${product.name}</label>
                        </div>
                    </td>
                    <td>
                        <div class="quantity-cell">
                            <input type="number" class="product-quantity-input" data-product-name="${product.name}" value="${quantity}" min="1" max="999" ${isChecked ? '' : 'disabled'}>
                            <select class="product-unit-select" data-product-name="${product.name}" ${isChecked ? '' : 'disabled'}>${unitOptions}</select>
                        </div>
                    </td>
                `;
            };

            tr.innerHTML = createProductCell(filteredProducts[i], i);

            if (i + 1 < filteredProducts.length) {
                tr.innerHTML += createProductCell(filteredProducts[i + 1], i + 1);
            } else {
                tr.innerHTML += '<td></td><td></td>';
            }

            tbody.appendChild(tr);
        }
    },

    toggleProductCheckbox: function(productName, isChecked) {
        const quantityInput = document.querySelector(`.product-quantity-input[data-product-name="${productName}"]`);
        const unitSelect = document.querySelector(`.product-unit-select[data-product-name="${productName}"]`);

        if (isChecked) {
            const quantity = parseInt(quantityInput.value) || 1;
            const unit = unitSelect.value;
            this.addProductToModal(productName, quantity, unit);
            quantityInput.disabled = false;
            unitSelect.disabled = false;
        } else {
            const idx = this.selectedProductsInModal.findIndex(p => p.product === productName);
            if (idx !== -1) this.selectedProductsInModal.splice(idx, 1);
            this.updateAddedProductsDisplay();
            quantityInput.disabled = true;
            unitSelect.disabled = true;
        }
    },

    addProductToModal: function(productName, quantity, unit) {
        const existing = this.selectedProductsInModal.find(p => p.product === productName);
        if (existing) {
            existing.quantity = parseInt(quantity) || 1;
            existing.unit = unit;
        } else {
            this.selectedProductsInModal.push({ product: productName, quantity: parseInt(quantity) || 1, unit: unit || 'un' });
        }
        this.updateAddedProductsDisplay();
    },

    updateAddedProductsDisplay: function() {
        const tbody = domElements.addedProductsTbody;
        const msg = domElements.noProductsMessage;
        tbody.innerHTML = '';

        if (this.selectedProductsInModal.length === 0) {
            msg.style.display = 'block';
            return;
        }

        msg.style.display = 'none';
        this.selectedProductsInModal.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.product}</td>
                <td>
                    <input type="number" class="added-quantity-input" data-index="${index}" value="${item.quantity}" min="1" max="999">
                    <span class="added-unit">${item.unit}</span>
                </td>
                <td><button type="button" class="btn btn-sm btn-delete remove-product-from-modal" data-index="${index}">Remover</button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    removeProductFromModal: function(index) {
        const productToRemove = this.selectedProductsInModal[index];
        this.selectedProductsInModal.splice(index, 1);
        const checkbox = document.querySelector(`.product-checkbox[data-product-name="${productToRemove.product}"]`);
        if (checkbox) {
            checkbox.checked = false;
            const quantityInput = document.querySelector(`.product-quantity-input[data-product-name="${productToRemove.product}"]`);
            const unitSelect = document.querySelector(`.product-unit-select[data-product-name="${productToRemove.product}"]`);
            if (quantityInput) quantityInput.disabled = true;
            if (unitSelect) unitSelect.disabled = true;
        }
        this.updateAddedProductsDisplay();
    },

    updateProductQuantityInModal: function(index, newQuantity) {
        if (this.selectedProductsInModal[index]) {
            this.selectedProductsInModal[index].quantity = parseInt(newQuantity) || 1;
        }
    },

    handleConfirmProductsSelection: function() {
        currentOrderProducts = [...this.selectedProductsInModal];
        window.UI.renderCurrentOrderProducts();
        this.closeModal('products-selection-modal');
    },

    // ======== MODAL DE CONFIRMAÇÃO DE PEDIDO ========
    showOrderConfirmationModal: function(orderData) {
        domElements.summarySchoolName.textContent = orderData.school.name;
        domElements.summarySchoolSector.textContent = orderData.school.sector;
        domElements.summaryObservations.textContent = orderData.observations;

        const tbody = domElements.summaryProductsTbody;
        tbody.innerHTML = '';
        let totalItems = 0;
        orderData.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
            `;
            tbody.appendChild(tr);
            totalItems += item.quantity;
        });
        domElements.summaryTotalItems.textContent = totalItems;
        this.openModal('order-confirmation-modal');
    },

    // ======== MODAL DE KIT RÁPIDO ========
    showQuickKitModal: function(kitName, kitProducts) {
        domElements.quickKitModal.querySelector('#quick-kit-modal-title').textContent = `Revisar ${kitName}`;
        this.currentQuickKitProducts = JSON.parse(JSON.stringify(kitProducts)); // Deep copy
        this.populateQuickKitProductsTable();
        this.openModal('quick-kit-modal');
    },

    populateQuickKitProductsTable: function() {
        const tbody = domElements.quickKitModal.querySelector('#quick-kit-products-tbody');
        tbody.innerHTML = '';

        if (this.currentQuickKitProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">Nenhum produto neste kit.</td></tr>';
            return;
        }

        this.currentQuickKitProducts.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.product}</td>
                <td><input type="number" class="quick-kit-quantity-input" data-index="${index}" value="${item.quantity}" min="1"></td>
                <td>${item.unit}</td>
                <td><button type="button" class="btn btn-sm btn-delete remove-quick-kit-item" data-index="${index}">Remover</button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    updateQuickKitQuantity: function(index, newQuantity) {
        if (this.currentQuickKitProducts[index]) {
            this.currentQuickKitProducts[index].quantity = parseInt(newQuantity) || 1;
        }
    },

    removeQuickKitItem: function(index) {
        this.currentQuickKitProducts.splice(index, 1);
        this.populateQuickKitProductsTable();
    },

    handleAddQuickKitToOrder: function() {
        this.currentQuickKitProducts.forEach(item => {
            const existingItemIndex = currentOrderProducts.findIndex(orderItem => 
                orderItem.product === item.product && orderItem.unit === item.unit
            );

            if (existingItemIndex > -1) {
                currentOrderProducts[existingItemIndex].quantity += item.quantity;
            } else {
                currentOrderProducts.push({ ...item });
            }
        });
        window.UI.renderCurrentOrderProducts();
        this.closeModal('quick-kit-modal');
    },

    // ======== MODAL DE DETALHES/EDIÇÃO DE PEDIDO ========
    showOrderDetailsModal: function(order) {
        domElements.detailOrderDate.textContent = order.date;
        domElements.detailOrderObservations.value = order.observations || '';

        // Populate school select
        domElements.detailOrderSchool.innerHTML = '';
        schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.name;
            option.textContent = `${school.name}${school.sector ? ` (${school.sector})` : ''}`;
            if (school.name === order.school.name) {
                option.selected = true;
            }
            domElements.detailOrderSchool.appendChild(option);
        });

        const tbody = domElements.detailProductsTbody;
        tbody.innerHTML = '';
        order.items.forEach((item, index) => {
            let unitOptions = '';
            units.forEach(unit => {
                const unitName = unit.name || unit;
                const selected = unitName === item.unit ? 'selected' : '';
                unitOptions += `<option value="${unitName}" ${selected}>${unitName}</option>`;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="detail-product-name">${item.product}</td>
                <td><input type="number" class="detail-quantity-input" data-index="${index}" value="${item.quantity}" min="1"></td>
                <td><select class="detail-unit-select" data-index="${index}">${unitOptions}</select></td>
                <td><button type="button" class="btn btn-sm btn-delete remove-detail-item" data-index="${index}">Remover</button></td>
            `;
            tbody.appendChild(tr);
        });

        this.openModal('order-details-modal');
    },

    // ======== MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ========
    showDeleteOrderConfirmationModal: function(orderId) {
        editingOrderId = orderId; // Set the orderId to be deleted
        this.openModal('delete-order-confirmation-modal');
    },

    // ======== MODAL DE EDITOR DE LAYOUT PDF ========
    showLayoutEditorModal: function() {
        // Carregar configurações atuais do PDF e construir blocos arrastáveis
        const container = domElements.editorPageContainer;
        if (!container) { this.openModal('layout-editor-modal'); return; }

        // Limpar conteúdo anterior
        container.innerHTML = '';

        const pageMm = { w: 210, h: 297 }; // A4 retrato padrão do jsPDF (mm)
        const rect = container.getBoundingClientRect();
        this.editor.scaleX = rect.width / pageMm.w;
        this.editor.scaleY = rect.height / pageMm.h;
        this.editor.settings = window.PDF.loadPdfSettings();
        this.editor.blocks = {};

        // Helper para criar bloco
        const createBlock = (key, label, opts = {}) => {
            const div = document.createElement('div');
            div.className = 'draggable-block';
            div.dataset.key = key;
            const s = this.editor.settings;
            // Posição em px (convertida de mm)
            const x = (s[key]?.x || 10) * this.editor.scaleX;
            const y = (s[key]?.y || 10) * this.editor.scaleY;
            div.style.left = x + 'px';
            div.style.top = y + 'px';
            // Dimensões aproximadas
            if (key === 'logo') {
                const w = (s.logo.width || 35) * this.editor.scaleX;
                const h = (s.logo.height || 35) * this.editor.scaleY;
                div.style.width = Math.max(40, w) + 'px';
                div.style.height = Math.max(40, h) + 'px';
            } else {
                div.style.width = (opts.width || 180) + 'px';
                div.style.height = (opts.height || 28) + 'px';
            }
            div.innerHTML = `<div class="handle"></div><div class="content-placeholder">${label}</div>`;
            container.appendChild(div);
            this.attachDrag(div, container);
            this.editor.blocks[key] = div;
        };

        // Criar blocos principais
        createBlock('logo', 'LOGO');
        createBlock('headerTitle', 'Título do Cabeçalho');
        createBlock('headerDate', 'Data');
        createBlock('headerSecretary', 'Órgão/Secretaria');
        createBlock('schoolInfoTitle', 'Título: Informações da Escola');
        createBlock('signatureDelivery', 'Assinatura: Entrega', { width: 220, height: 40 });
        createBlock('signatureReceive', 'Assinatura: Recebimento', { width: 220, height: 40 });

        // Mostrar modal
        this.openModal('layout-editor-modal');
    },

    handleSaveLayout: function() {
        if (!this.editor.settings) return;
        const s = this.editor.settings;
        const toMm = (px, axis) => px / (axis === 'x' ? this.editor.scaleX : this.editor.scaleY);

        // Atualizar posições com base nos blocos
        Object.keys(this.editor.blocks).forEach(key => {
            const el = this.editor.blocks[key];
            if (!el) return;
            const leftPx = parseFloat(el.style.left) || 0;
            const topPx = parseFloat(el.style.top) || 0;
            if (!s[key]) s[key] = {};
            s[key].x = Math.max(0, toMm(leftPx, 'x'));
            s[key].y = Math.max(0, toMm(topPx, 'y'));
        });

        window.PDF.savePdfSettings(s);
        alert('Posições salvas! Os próximos PDFs usarão o novo layout.');
        this.closeModal('layout-editor-modal');
    },

    // ======== EVENTOS ========
    setupEventListeners() {
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.dataset.modal));
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) this.closeAllModals();
            });
        });

        // Products Selection Modal Events
        if (domElements.productSearchInput) {
            domElements.productSearchInput.addEventListener('input', () => this.populateProductsTable());
        }

        document.addEventListener('change', e => {
            if (e.target.classList.contains('product-checkbox')) {
                this.toggleProductCheckbox(e.target.dataset.productName, e.target.checked);
            }
            if (e.target.classList.contains('product-unit-select')) {
                const productName = e.target.dataset.productName;
                const newUnit = e.target.value;
                const quantityInput = document.querySelector(`.product-quantity-input[data-product-name="${productName}"]`);
                const quantity = parseInt(quantityInput.value) || 1;
                this.addProductToModal(productName, quantity, newUnit); // Update unit in selectedProductsInModal
            }
            if (e.target.classList.contains('detail-unit-select')) {
                // Handled by handleSaveOrderDetails in events.js
            }
        });

        document.addEventListener('input', e => {
            if (e.target.classList.contains('product-quantity-input')) {
                const productName = e.target.dataset.productName;
                const newQuantity = e.target.value;
                const checkbox = document.querySelector(`.product-checkbox[data-product-name="${productName}"]`);
                if (checkbox.checked) {
                    const unitSelect = document.querySelector(`.product-unit-select[data-product-name="${productName}"]`);
                    this.addProductToModal(productName, newQuantity, unitSelect.value);
                }
            }
            if (e.target.classList.contains('added-quantity-input')) {
                this.updateProductQuantityInModal(e.target.dataset.index, e.target.value);
            }
            if (e.target.classList.contains('quick-kit-quantity-input')) {
                this.updateQuickKitQuantity(e.target.dataset.index, e.target.value);
            }
            if (e.target.classList.contains('detail-quantity-input')) {
                // Handled by handleSaveOrderDetails in events.js
            }
        });

        document.addEventListener('click', e => {
            if (e.target.id === 'select-all-products-btn') {
                this.selectAllProductsInModal();
            }
            if (e.target.id === 'deselect-all-products-btn') {
                this.deselectAllProductsInModal();
            }
            if (e.target.classList.contains('remove-product-from-modal')) {
                this.removeProductFromModal(e.target.dataset.index);
            }
            if (e.target.classList.contains('remove-quick-kit-item')) {
                this.removeQuickKitItem(e.target.dataset.index);
            }
            if (e.target.classList.contains('remove-detail-item')) {
                const index = e.target.dataset.index;
                const tbody = domElements.detailProductsTbody;
                tbody.deleteRow(index);
                // Re-index remaining items if necessary, or handle in save
            }
        });
    }
};

// Utilitário: anexar comportamento de arrastar
window.Modals.attachDrag = function(el, container) {
    let isDown = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    const onMouseDown = (e) => {
        isDown = true;
        startX = e.clientX; startY = e.clientY;
        startLeft = parseFloat(el.style.left) || 0;
        startTop = parseFloat(el.style.top) || 0;
        e.preventDefault();
    };
    const onMouseMove = (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newLeft = startLeft + dx;
        let newTop = startTop + dy;
        // Conter dentro do container
        const maxLeft = container.clientWidth - el.offsetWidth;
        const maxTop = container.clientHeight - el.offsetHeight;
        newLeft = Math.min(Math.max(0, newLeft), Math.max(0, maxLeft));
        newTop = Math.min(Math.max(0, newTop), Math.max(0, maxTop));
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
    };
    const onMouseUp = () => { isDown = false; };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
};

console.log('✅ Modals module loaded successfully for user_page');

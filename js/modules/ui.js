window.UI = {
    reRenderUI: function() {
        if (isRendering) return;
        isRendering = true;

        console.log('Re-renderizando UI para user_page...');

        try {
            this.renderSchools();
            this.renderSchoolsTable();
            this.renderProductsTable();
            this.renderUnitsTable();
            this.renderStockTable();
            this.renderUnitConversionsTable();
            this.populateSectorFilters();
            this.populateOrderSchoolSelect();
            this.populateKitSelects();
            this.populateStockSelects();
            this.populateUnitConversionSelects();
            this.renderOrders();
            this.renderAllKitProducts();
            this.renderCurrentOrderProducts();
        } catch (error) {
            console.error('Erro no reRenderUI para user_page:', error);
        }

        isRendering = false;
    },

    renderSchools: function() {
        // Na user_page, não há tabela de escolas para renderizar diretamente, 
        // mas esta função pode ser adaptada para popular selects se necessário.
        // Por enquanto, apenas para evitar erros se chamada.
        // A lógica de popular selects de escola já está em populateOrderSchoolSelect e populateModalSchoolSelect.
    },

    populateSectorFilters: function() {
        if (!domElements.orderSectorFilter || !domElements.modalSectorSelect) return;
        
        const uniqueSectors = [...new Set(schools.map(school => school.sector).filter(Boolean))];
        
        domElements.orderSectorFilter.innerHTML = '<option value="">Todos os Setores</option>';
        uniqueSectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            domElements.orderSectorFilter.appendChild(option);
        });

        domElements.modalSectorSelect.innerHTML = '<option value="">Todos os Setores</option>';
        uniqueSectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            domElements.modalSectorSelect.appendChild(option);
        });
    },

    populateOrderSchoolSelect: function() {
        if (!domElements.orderSchoolSelect) return;
        
        domElements.orderSchoolSelect.innerHTML = '<option value="">Selecione uma Escola</option>';
        const selectedSector = domElements.orderSectorFilter?.value || '';
        
        const filteredSchools = selectedSector 
            ? schools.filter(school => school.sector === selectedSector)
            : schools;

        filteredSchools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.name;
            option.textContent = `${school.name}${school.sector ? ` (${school.sector})` : ''}`;
            domElements.orderSchoolSelect.appendChild(option);
        });
    },

    populateModalSchoolSelect: function() {
        if (!domElements.modalSchoolSelect) return;
        
        domElements.modalSchoolSelect.innerHTML = '<option value="">Selecione uma Escola</option>';
        const selectedSector = domElements.modalSectorSelect?.value || '';
        
        const filteredSchools = selectedSector 
            ? schools.filter(school => school.sector === selectedSector)
            : schools;

        filteredSchools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.name;
            option.textContent = `${school.name}${school.sector ? ` (${school.sector})` : ''}`;
            domElements.modalSchoolSelect.appendChild(option);
        });
    },

    // Funções relacionadas a produtos, unidades e estoque removidas ou adaptadas para user_page

    renderKitProducts: function(kitType) {
        const table = document.querySelector(`.kit-products-table[data-kit-type="${kitType}"] tbody`);
        if (!table || !kits[kitType]) return;
        table.innerHTML = '';
        kits[kitType].forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product || ''}</td>
                <td>${item.quantity} ${item.unit || ''}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-delete btn-remove-kit-item" data-kit-type="${kitType}" data-index="${index}">Remover</button>
                </td>
            `;
            table.appendChild(row);
        });
    },

    renderAllKitProducts: function() {
        if (!kits) return;
        ['p', 'm', 'g'].forEach(type => this.renderKitProducts(type));
    },

    renderCurrentOrderProducts: function() {
        if (!domElements.currentOrderTable) return;
        
        domElements.currentOrderTable.innerHTML = '';
        if (currentOrderProducts.length === 0) {
            domElements.emptyOrderMessage.style.display = 'block';
        } else {
            domElements.emptyOrderMessage.style.display = 'none';
            currentOrderProducts.forEach((item, index) => {
                const row = domElements.currentOrderTable.insertRow();
                row.innerHTML = `
                    <td>${item.product}</td>
                    <td>${item.quantity} ${item.unit || ''}</td>
                    <td><button class="btn-delete btn-delete-order-item" data-index="${index}">Remover</button></td>
                `;
            });
        }
    },

    renderOrders: function() {
        if (!domElements.ordersTable) return;
        
        domElements.ordersTable.innerHTML = '';
        const latestOrders = [...orders]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 10);

        latestOrders.forEach((order, index) => {
            const row = domElements.ordersTable.insertRow();
            row.innerHTML = `
                <td>${order.school?.name || 'Escola não encontrada'}</td>
                <td>
                    <button class="btn btn-info btn-sm btn-pdf" data-id="${order.id}">PDF</button>
                    <button class="btn btn-warning btn-sm btn-edit-order" data-id="${order.id}">Editar</button>
                    <button class="btn-delete btn-delete-order" data-id="${order.id}">Excluir</button>
                </td>
            `;
        });
    },

    showPage: function(pageId) {
        console.log('Mostrando página:', pageId);
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            targetPage.classList.add('active');
        }

        if (domElements.navLinks && domElements.navLinks.length) {
            domElements.navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.page === pageId);
            });
        }
    },

    showTab: function(tabId) {
        if (!tabId || !domElements.tabContents) return;
        domElements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        domElements.tabLinks?.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabId);
        });
    },

    showKitTab: function(tabId) {
        if (!tabId) return;
        document.querySelectorAll('.kit-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        document.querySelectorAll('.kit-tab-link').forEach(link => {
            link.classList.toggle('active', link.dataset.kitTab === tabId);
        });
    },

    renderSchoolsTable: function() {
        if (!domElements.schoolsTable) return;
        domElements.schoolsTable.innerHTML = '';
        schools.forEach((school, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${school.name || ''}</td>
                <td>${school.sector || ''}</td>
                <td>${school.managerName || ''}</td>
                <td>${school.address || ''}</td>
                <td>${school.modality || ''}</td>
                <td>${school.students || ''}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning btn-edit-school" data-index="${index}">Editar</button>
                    <button type="button" class="btn btn-sm btn-delete btn-delete-school" data-index="${index}">Excluir</button>
                </td>
            `;
            domElements.schoolsTable.appendChild(row);
        });
    },

    renderProductsTable: function() {
        if (!domElements.productsTable) return;
        domElements.productsTable.innerHTML = '';
        products.forEach((product, index) => {
            const name = typeof product === 'string' ? product : product.name;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name || ''}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning btn-edit-product" data-index="${index}">Editar</button>
                    <button type="button" class="btn btn-sm btn-delete btn-delete-product" data-index="${index}">Excluir</button>
                </td>
            `;
            domElements.productsTable.appendChild(row);
        });
    },

    renderUnitsTable: function() {
        if (!domElements.unitsTable) return;
        domElements.unitsTable.innerHTML = '';
        units.forEach((unit, index) => {
            const name = typeof unit === 'string' ? unit : unit.name;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name || ''}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning btn-edit-unit" data-index="${index}">Editar</button>
                    <button type="button" class="btn btn-sm btn-delete btn-delete-unit" data-index="${index}">Excluir</button>
                </td>
            `;
            domElements.unitsTable.appendChild(row);
        });
    },

    renderStockTable: function() {
        if (!domElements.stockTable) return;
        domElements.stockTable.innerHTML = '';
        Object.entries(stock).forEach(([productName, info]) => {
            const quantity = info?.quantity ?? 0;
            const unit = info?.unit || '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${unit}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning btn-edit-stock" data-product="${productName}">Editar</button>
                    <button type="button" class="btn btn-sm btn-delete btn-delete-stock" data-product="${productName}">Excluir</button>
                </td>
            `;
            domElements.stockTable.appendChild(row);
        });
    },

    renderUnitConversionsTable: function() {
        if (!domElements.unitConversionsTable || !window.UnitConversions) return;
        domElements.unitConversionsTable.innerHTML = '';
        const conversions = window.UnitConversions.conversions || [];
        conversions.forEach((conversion, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${conversion.sourceUnit}</td>
                <td>${conversion.quantity}</td>
                <td>${conversion.targetUnit}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-delete btn-delete-conversion" data-index="${index}">Excluir</button>
                </td>
            `;
            domElements.unitConversionsTable.appendChild(row);
        });
    },

    populateStockSelects: function() {
        if (!domElements.stockProductSelect || !domElements.stockUnitSelect) return;
        domElements.stockProductSelect.innerHTML = '<option value="">Selecione um Produto</option>';
        products.forEach(product => {
            const name = typeof product === 'string' ? product : product.name;
            if (!name) return;
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            domElements.stockProductSelect.appendChild(option);
        });

        domElements.stockUnitSelect.innerHTML = '<option value="">Selecione a Unidade</option>';
        units.forEach(unit => {
            const name = typeof unit === 'string' ? unit : unit.name;
            if (!name) return;
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            domElements.stockUnitSelect.appendChild(option);
        });
    },

    populateKitSelects: function() {
        const productOptions = products.map(product => {
            const name = typeof product === 'string' ? product : product.name;
            return name || '';
        }).filter(Boolean);
        const unitOptions = units.map(unit => {
            const name = typeof unit === 'string' ? unit : unit.name;
            return name || '';
        }).filter(Boolean);

        document.querySelectorAll('.kit-product-select').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione um Produto</option>';
            productOptions.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (currentValue === name) option.selected = true;
                select.appendChild(option);
            });
        });

        document.querySelectorAll('.kit-unit-select').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione a Unidade</option>';
            unitOptions.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (currentValue === name) option.selected = true;
                select.appendChild(option);
            });
        });
    },

    populateUnitConversionSelects: function() {
        if (!domElements.conversionSourceUnitSelect || !domElements.conversionTargetUnitSelect) return;
        const renderOptions = select => {
            select.innerHTML = '<option value="">Selecione a Unidade</option>';
            units.forEach(unit => {
                const name = typeof unit === 'string' ? unit : unit.name;
                if (!name) return;
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            });
        };
        renderOptions(domElements.conversionSourceUnitSelect);
        renderOptions(domElements.conversionTargetUnitSelect);
    },

    showSchoolSelectionModal: function() {
        if (domElements.schoolSelectionModal) {
            this.populateModalSchoolSelect();
            domElements.schoolSelectionModal.style.display = 'flex';
        }
    }
};

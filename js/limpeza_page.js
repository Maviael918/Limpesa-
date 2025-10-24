// limpeza_page.js - fluxo simplificado para geração de pedidos de limpeza
(function() {
    const state = {
        schools: [],
        products: [],
        units: [],
        selectedSector: '',
        selectedSchool: null,
        items: [],
        observations: '',
        history: [],
        historySearchTerm: '',
        activeHistoryEdit: null
    };

    const dom = {};

    function queryDom() {
        dom.configureProductsBtn = document.getElementById('limpeza-configure-products');
        dom.selectSchoolBtn = document.getElementById('limpeza-select-school-btn');
        dom.openProductModalBtn = document.getElementById('limpeza-open-product-modal');
        dom.generatePdfBtn = document.getElementById('limpeza-generate-pdf');
        dom.printOrderBtn = document.getElementById('limpeza-print-order');
        dom.clearOrderBtn = document.getElementById('limpeza-clear-order');
        dom.selectedSector = document.getElementById('limpeza-selected-sector');
        dom.selectedSchool = document.getElementById('limpeza-selected-school');
        dom.observationsInput = document.getElementById('limpeza-observations');
        dom.orderTableBody = document.getElementById('limpeza-order-tbody');
        dom.emptyMessage = document.getElementById('limpeza-empty-message');

        dom.schoolModal = document.getElementById('limpeza-school-modal');
        dom.schoolModalCloseBtns = dom.schoolModal?.querySelectorAll('[data-modal-close="limpeza-school-modal"]');
        dom.schoolModalConfirmBtn = document.getElementById('limpeza-confirm-school');
        dom.modalSectorSelect = document.getElementById('limpeza-modal-sector');
        dom.modalSchoolSelect = document.getElementById('limpeza-modal-school');

        dom.productModal = document.getElementById('limpeza-product-modal');
        dom.productModalCloseBtns = dom.productModal?.querySelectorAll('[data-modal-close="limpeza-product-modal"]');
        dom.productModalBody = document.getElementById('limpeza-product-modal-tbody');
        dom.productModalEmpty = document.getElementById('limpeza-product-modal-empty');
        dom.productModalSelectAll = document.getElementById('limpeza-product-select-all');
        dom.productModalApplyBtn = document.getElementById('limpeza-product-apply');
        dom.productModalSearch = document.getElementById('limpeza-product-search');

        dom.historyTableBody = document.getElementById('limpeza-history-tbody');
        dom.historySearchInput = document.getElementById('limpeza-history-search-input');
        dom.historySearchBtn = document.getElementById('limpeza-history-search-btn');
        dom.historyRefreshBtn = document.getElementById('limpeza-refresh-history');
        dom.historyViewModal = document.getElementById('limpeza-history-view-modal');
        dom.historyViewCloseBtns = dom.historyViewModal?.querySelectorAll('[data-modal-close="limpeza-history-view-modal"]');
        dom.historyViewDate = document.getElementById('limpeza-view-date');
        dom.historyViewSchool = document.getElementById('limpeza-view-school');
        dom.historyViewSector = document.getElementById('limpeza-view-sector');
        dom.historyViewObservations = document.getElementById('limpeza-view-observations');
        dom.historyViewProducts = document.getElementById('limpeza-view-products');
        dom.pdfPreviewModal = document.getElementById('limpeza-pdf-preview-modal');
        dom.pdfPreviewIframe = document.getElementById('limpeza-pdf-preview-iframe');
        dom.pdfPreviewClose = document.getElementById('limpeza-close-pdf-preview');

        window.domElements = window.domElements || {};
        if (dom.pdfPreviewModal && dom.pdfPreviewIframe) {
            window.domElements.pdfPreviewModal = dom.pdfPreviewModal;
            window.domElements.pdfPreviewIframe = dom.pdfPreviewIframe;
            window.domElements.closePdfPreview = dom.pdfPreviewClose;
        }
    }

    function normalizeHistoryEntry(raw) {
        if (!raw) return null;
        const orderDate = raw.order_date || raw.date || new Date().toISOString().split('T')[0];
        const createdAt = raw.created_at || raw.localCreatedAt || new Date().toISOString();
        const localCreatedAt = raw.localCreatedAt || createdAt;
        const localId = raw.localId || raw.id || localCreatedAt || Date.now();
        return {
            id: raw.id ?? null,
            localId,
            order_date: orderDate,
            date: raw.date || formatHistoryDate(orderDate),
            created_at: createdAt,
            school: raw.school || raw.school_data || null,
            items: Array.isArray(raw.items) ? raw.items : Array.isArray(raw.items_data) ? raw.items_data : [],
            observations: raw.observations ?? '',
            pendingSync: !!raw.pendingSync,
            wasSynced: raw.wasSynced ?? !!raw.id,
            lastSyncError: raw.lastSyncError || null,
            localCreatedAt
        };
    }

    function getHistoryTimestamp(entry) {
        if (!entry) return 0;
        const candidates = [entry.created_at, entry.order_date, entry.localCreatedAt];
        for (const value of candidates) {
            if (!value) continue;
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed.getTime();
            }
        }
        return 0;
    }

    function formatHistoryDate(value) {
        if (!value) return '-';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return value;
        }
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('pt-BR');
        }
        return value;
    }

    function saveHistoryToLocalStorage() {
        try {
            const serialized = JSON.stringify(state.history);
            localStorage.setItem('cleaningOrderHistory', serialized);
            localStorage.setItem('cleaningOrders', serialized);
            localStorage.setItem('orders', serialized);
        } catch (_) {}
    }

    function loadFromLocalStorage() {
        try {
            const storedSchools = JSON.parse(localStorage.getItem('schools'));
            if (Array.isArray(storedSchools)) state.schools = storedSchools;
        } catch (_) {}

        try {
            const storedProducts = JSON.parse(localStorage.getItem('products'));
            if (Array.isArray(storedProducts)) {
                state.products = storedProducts.map(item => typeof item === 'string' ? { name: item } : item);
            }
        } catch (_) {}

        try {
            const storedUnits = JSON.parse(localStorage.getItem('units'));
            if (Array.isArray(storedUnits)) {
                state.units = storedUnits.map(unit => typeof unit === 'string' ? { name: unit } : unit);
            }
        } catch (_) {}

        try {
            let storedHistory = null;
            const primary = localStorage.getItem('cleaningOrderHistory');
            if (primary) {
                storedHistory = JSON.parse(primary);
            } else {
                const legacy = localStorage.getItem('cleaningOrders') || localStorage.getItem('orders');
                if (legacy) storedHistory = JSON.parse(legacy);
            }
            if (Array.isArray(storedHistory)) {
                state.history = storedHistory
                    .map(normalizeHistoryEntry)
                    .filter(entry => entry);
            }
        } catch (_) {}
    }

    async function fetchFromSupabase(options = {}) {
        const { forceHistory = false } = options;
        const supa = window.supabaseClient;
        if (!supa) return;

        if (state.schools.length === 0) {
            try {
                const { data, error } = await supa.from('schools').select('*').order('name');
                if (!error && Array.isArray(data)) {
                    state.schools = data.map(school => ({
                        name: school.name,
                        sector: school.sector,
                        managerName: school.manager_name,
                        address: school.address,
                        modality: school.modality,
                        students: school.students
                    }));
                    localStorage.setItem('schools', JSON.stringify(state.schools));
                }
            } catch (err) {
                console.error('Erro ao carregar escolas do Supabase:', err);
            }
        }

        if (state.products.length === 0) {
            try {
                const { data, error } = await supa.from('products').select('*').order('name');
                if (!error && Array.isArray(data)) {
                    state.products = data.map(item => ({ name: item.name }));
                    localStorage.setItem('products', JSON.stringify(state.products));
                }
            } catch (err) {
                console.error('Erro ao carregar produtos de limpeza do Supabase:', err);
            }
        }

        if (state.units.length === 0) {
            try {
                const { data, error } = await supa.from('units').select('*').order('name');
                if (!error && Array.isArray(data)) {
                    state.units = data.map(unit => ({ name: unit.name }));
                    localStorage.setItem('units', JSON.stringify(state.units));
                }
            } catch (err) {
                console.error('Erro ao carregar unidades do Supabase:', err);
            }
        }

        if (forceHistory || state.history.length === 0) {
            const pendingLocalHistory = state.history.filter(entry => entry?.pendingSync);
            try {
                let data;
                let error;

                if (typeof window.fetchCleaningOrders === 'function') {
                    const result = await window.fetchCleaningOrders();
                    data = result?.data;
                    error = result?.error;
                } else {
                    const result = await supa
                        .from('order_history')
                        .select('*')
                        .order('created_at', { ascending: false });
                    data = result?.data;
                    error = result?.error;
                }

                if (error) throw error;

                if (Array.isArray(data)) {
                    const remoteHistory = data
                        .map(normalizeHistoryEntry)
                        .filter(entry => entry);
                    const mergedHistory = [...remoteHistory];

                    if (pendingLocalHistory.length) {
                        const remoteIds = new Map();
                        remoteHistory.forEach((entry, index) => {
                            if (entry?.id !== null && entry?.id !== undefined) {
                                remoteIds.set(String(entry.id), index);
                            }
                        });

                        pendingLocalHistory.forEach(localEntry => {
                            if (!localEntry) return;
                            const localId = localEntry.id;
                            if (localId !== null && localId !== undefined) {
                                const remoteIndex = remoteIds.get(String(localId));
                                if (remoteIndex !== undefined) {
                                    mergedHistory[remoteIndex] = {
                                        ...mergedHistory[remoteIndex],
                                        ...localEntry,
                                        pendingSync: !!localEntry.pendingSync
                                    };
                                    return;
                                }
                            }
                            mergedHistory.push(localEntry);
                        });
                    }

                    state.history = mergedHistory;
                    saveHistoryToLocalStorage();
                }
            } catch (err) {
                console.error('Erro ao carregar histórico de limpeza do Supabase:', err);
            }
        }
    }

    function renderSchoolInfo() {
        if (!dom.selectedSector || !dom.selectedSchool) return;
        dom.selectedSector.textContent = state.selectedSector || '-';
        dom.selectedSchool.textContent = state.selectedSchool?.name || 'Nenhuma selecionada';
    }

    function renderItems() {
        if (!dom.orderTableBody || !dom.emptyMessage) return;
        dom.orderTableBody.innerHTML = '';
        if (!state.items.length) {
            dom.emptyMessage.style.display = 'block';
            return;
        }
        dom.emptyMessage.style.display = 'none';

        state.items.forEach((item, index) => {
            const row = dom.orderTableBody.insertRow();

            const productCell = row.insertCell();
            productCell.textContent = item.product;

            const qtyCell = row.insertCell();
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.min = '0.01';
            qtyInput.step = '0.01';
            qtyInput.value = item.quantity;
            qtyInput.className = 'cleaning-order-edit-quantity';
            qtyInput.dataset.index = String(index);
            qtyCell.appendChild(qtyInput);

            const unitCell = row.insertCell();
            const unitSelect = buildUnitSelect(item.unit);
            unitSelect.classList.add('cleaning-order-edit-unit');
            unitSelect.dataset.index = String(index);
            unitCell.appendChild(unitSelect);

            const actionsCell = row.insertCell();
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-delete';
            deleteBtn.dataset.index = String(index);
            deleteBtn.textContent = 'Remover';
            actionsCell.appendChild(deleteBtn);
        });
    }

    function renderHistory() {
        if (!dom.historyTableBody) return;
        dom.historyTableBody.innerHTML = '';

        const annotated = state.history.map((entry, index) => ({ entry, index }));
        annotated.sort((a, b) => getHistoryTimestamp(b.entry) - getHistoryTimestamp(a.entry));

        const searchTerm = (state.historySearchTerm || '').trim().toLowerCase();
        const visibleEntries = searchTerm
            ? annotated.filter(item => (item.entry.school?.name || '').toLowerCase().includes(searchTerm))
            : annotated.slice(0, 10);

        if (!visibleEntries.length) {
            const row = dom.historyTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3;
            cell.className = 'empty-message';
            cell.textContent = searchTerm
                ? 'Nenhum pedido encontrado para a busca.'
                : 'Nenhum pedido registrado ainda.';
            return;
        }

        visibleEntries.forEach(({ entry, index }) => {
            const row = dom.historyTableBody.insertRow();
            if (entry.pendingSync) {
                row.classList.add('order-row-pending');
            }

            const schoolCell = row.insertCell();
            schoolCell.textContent = entry.school?.name || 'Escola não informada';

            const dateCell = row.insertCell();
            dateCell.textContent = entry.date || formatHistoryDate(entry.order_date);

            const actionsCell = row.insertCell();

            const viewBtn = document.createElement('button');
            viewBtn.type = 'button';
            viewBtn.className = 'btn btn-secondary btn-sm limpeza-history-view';
            viewBtn.dataset.historyIndex = String(index);
            viewBtn.textContent = 'Visualizar';
            actionsCell.appendChild(viewBtn);

            const printBtn = document.createElement('button');
            printBtn.type = 'button';
            printBtn.className = 'btn btn-info btn-sm limpeza-history-print';
            printBtn.dataset.historyIndex = String(index);
            printBtn.textContent = 'Imprimir';
            printBtn.style.marginLeft = '6px';
            actionsCell.appendChild(printBtn);

            const pdfBtn = document.createElement('button');
            pdfBtn.type = 'button';
            pdfBtn.className = 'btn btn-success btn-sm limpeza-history-pdf';
            pdfBtn.dataset.historyIndex = String(index);
            pdfBtn.textContent = 'Baixar PDF';
            pdfBtn.style.marginLeft = '6px';
            actionsCell.appendChild(pdfBtn);

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-warning btn-sm limpeza-history-edit';
            editBtn.dataset.historyIndex = String(index);
            editBtn.style.marginLeft = '6px';
            editBtn.textContent = 'Editar';
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-delete limpeza-history-delete';
            deleteBtn.dataset.historyIndex = String(index);
            deleteBtn.style.marginLeft = '6px';
            deleteBtn.textContent = 'Excluir';
            actionsCell.appendChild(deleteBtn);
        });
    }

    function upsertHistoryEntry(rawEntry) {
        const normalized = normalizeHistoryEntry(rawEntry);
        if (!normalized) return;

        const hasId = normalized.id !== null && normalized.id !== undefined;
        const existingIndex = state.history.findIndex(entry => {
            if (!entry) return false;
            if (hasId) return entry.id === normalized.id;
            return entry.localCreatedAt === normalized.localCreatedAt;
        });

        if (existingIndex >= 0) {
            state.history[existingIndex] = { ...state.history[existingIndex], ...normalized };
        } else {
            state.history.unshift(normalized);
        }

        saveHistoryToLocalStorage();
        renderHistory();
    }

    function viewHistoryOrder(order) {
        if (!order || !dom.historyViewModal) {
            alert('Visualização indisponível no momento.');
            return;
        }

        const dateText = formatHistoryDate(order.order_date || order.created_at || order.date);
        const schoolName = order.school?.name || 'Escola não informada';
        const sector = order.school?.sector || 'Setor não informado';
        const observations = order.observations || 'Sem observações.';

        if (dom.historyViewDate) dom.historyViewDate.textContent = dateText;
        if (dom.historyViewSchool) dom.historyViewSchool.textContent = schoolName;
        if (dom.historyViewSector) dom.historyViewSector.textContent = sector;
        if (dom.historyViewObservations) dom.historyViewObservations.textContent = observations;

        if (dom.historyViewProducts) {
            dom.historyViewProducts.innerHTML = '';
            const items = Array.isArray(order.items)
                ? order.items
                : Array.isArray(order.items_data)
                    ? order.items_data
                    : [];

            if (!items.length) {
                const emptyRow = dom.historyViewProducts.insertRow();
                const cell = emptyRow.insertCell();
                cell.colSpan = 3;
                cell.className = 'empty-message';
                cell.textContent = 'Nenhum produto registrado.';
            } else {
                items.forEach(item => {
                    const row = dom.historyViewProducts.insertRow();
                    row.insertCell().textContent = item.product || '-';
                    row.insertCell().textContent = `${item.quantity ?? ''}`;
                    row.insertCell().textContent = item.unit || '';
                });
            }
        }

        openModal(dom.historyViewModal);
    }

    async function printHistoryOrder(order) {
        if (!order) return;
        const payload = {
            ...order,
            date: formatHistoryDate(order.order_date || order.date || order.created_at),
            school: order.school || {}
        };
        try {
            await window.PDF.printOrder(payload);
        } catch (error) {
            console.error('Erro ao imprimir pedido do histórico:', error);
            alert('Não foi possível imprimir o pedido selecionado.');
        }
    }

    function loadHistoryOrderIntoForm(order) {
        if (!order) return;
        state.activeHistoryEdit = order;

        const schoolName = order.school?.name || '';
        const matchingSchool = schoolName
            ? state.schools.find(s => s.name === schoolName)
            : null;

        state.selectedSchool = matchingSchool || order.school || null;
        state.selectedSector = state.selectedSchool?.sector || order.school?.sector || '';
        state.items = Array.isArray(order.items)
            ? order.items.map(item => ({ ...item }))
            : Array.isArray(order.items_data)
                ? order.items_data.map(item => ({ ...item }))
                : [];
        state.observations = order.observations || '';

        renderSchoolInfo();
        renderItems();
        if (dom.observationsInput) {
            dom.observationsInput.value = state.observations;
        }
    }

    async function handleHistoryAction(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const index = Number(button.dataset.historyIndex);
        if (!Number.isInteger(index)) return;

        const order = state.history[index];
        if (!order) return;

        if (button.classList.contains('limpeza-history-view')) {
            viewHistoryOrder(order);
            return;
        }

        if (button.classList.contains('limpeza-history-print')) {
            await printHistoryOrder(order);
            return;
        }

        if (button.classList.contains('limpeza-history-pdf')) {
            const payload = {
                ...order,
                date: formatHistoryDate(order.order_date || order.date),
                school: order.school || {}
            };

            try {
                await window.PDF.generateOrderPdf(payload, true);
            } catch (error) {
                console.error('Erro ao gerar PDF do histórico:', error);
                alert('Não foi possível gerar o PDF do pedido selecionado.');
            }
            return;
        }

        if (button.classList.contains('limpeza-history-edit')) {
            loadHistoryOrderIntoForm(order);
            alert('Pedido carregado no formulário. Ajuste os dados e gere o PDF para atualizar.');
            return;
        }

        if (button.classList.contains('limpeza-history-delete')) {
            if (!confirm('Deseja remover este pedido do histórico?')) return;

            state.history.splice(index, 1);
            saveHistoryToLocalStorage();
            renderHistory();

            if (order.id && window.isSupabaseConfigured?.()) {
                try {
                    await window.deleteFoodOrder(order.id);
                } catch (error) {
                    console.error('Erro ao remover pedido de limpeza no Supabase:', error);
                }
            }
        }
    }

    function handleHistorySearch(value) {
        const raw = value || '';
        const trimmed = raw.trim();
        state.historySearchTerm = trimmed;
        if (dom.historySearchInput && dom.historySearchInput.value !== trimmed) {
            dom.historySearchInput.value = trimmed;
        }
        renderHistory();
    }

    async function syncPendingHistory() {
        if (!window.isSupabaseConfigured?.()) return;
        const pending = state.history.filter(entry => entry?.pendingSync);
        if (!pending.length) return;

        let changed = false;
        for (const entry of pending) {
            const payload = {
                ...entry,
                school: entry.school,
                items: entry.items,
                observations: entry.observations,
                pendingSync: entry.pendingSync,
                wasSynced: entry.wasSynced
            };

            const { data, error } = await persistCleaningOrder(payload);
            if (!error && data?.id) {
                entry.id = data.id;
                entry.order_date = data.order_date;
                entry.created_at = data.created_at;
                entry.date = formatHistoryDate(data.order_date);
                entry.pendingSync = false;
                entry.wasSynced = true;
                entry.lastSyncError = null;
                changed = true;
            } else if (error) {
                entry.lastSyncError = error.message || 'Erro desconhecido';
                changed = true;
            }
        }

        if (changed) {
            saveHistoryToLocalStorage();
            renderHistory();
        }
    }

    function populateSectorOptions() {
        if (!dom.modalSectorSelect) return;
        const sectors = [...new Set(state.schools.map(s => s.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        dom.modalSectorSelect.innerHTML = '<option value="">Todos os Setores</option>';
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            dom.modalSectorSelect.appendChild(option);
        });
        if (state.selectedSector) {
            dom.modalSectorSelect.value = state.selectedSector;
        }
    }

    function populateSchoolOptions() {
        if (!dom.modalSchoolSelect) return;
        const sectorFilter = dom.modalSectorSelect?.value || '';
        const filtered = sectorFilter
            ? state.schools.filter(s => s.sector === sectorFilter)
            : state.schools;
        dom.modalSchoolSelect.innerHTML = '<option value="">Selecione uma Escola</option>';
        filtered.forEach((school, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.dataset.originalName = school.name;
            option.textContent = school.sector ? `${school.name} (${school.sector})` : school.name;
            dom.modalSchoolSelect.appendChild(option);
        });

        if (state.selectedSchool) {
            const matchIndex = filtered.findIndex(s => s.name === state.selectedSchool.name);
            if (matchIndex >= 0) {
                dom.modalSchoolSelect.selectedIndex = matchIndex + 1;
            }
        }
    }

    function getUnitList() {
        if (state.units.length) {
            return state.units.map(unit => unit.name);
        }
        return ['kg', 'g', 'L', 'ml', 'un'];
    }

    function buildUnitSelect(selectedUnit) {
        const select = document.createElement('select');
        select.className = 'cleaning-product-row-unit';
        select.required = true;
        getUnitList().forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            select.appendChild(option);
        });
        if (selectedUnit) {
            select.value = selectedUnit;
        }
        return select;
    }

    function renderProductSelectionRows(filterText = '') {
        if (!dom.productModalBody) return;
        dom.productModalBody.innerHTML = '';
        const normalized = filterText.trim().toLowerCase();
        const filtered = normalized
            ? state.products.filter(item => item.name.toLowerCase().includes(normalized))
            : state.products;

        if (!filtered.length) {
            if (dom.productModalEmpty) dom.productModalEmpty.style.display = 'block';
            return;
        }
        if (dom.productModalEmpty) dom.productModalEmpty.style.display = 'none';

        filtered.forEach(product => {
            const row = document.createElement('tr');
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'cleaning-product-row-select';
            checkbox.dataset.productName = product.name;
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = product.name;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '0.1';
            quantityInput.step = '0.1';
            quantityInput.value = '1';
            quantityInput.className = 'cleaning-product-row-quantity';
            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);

            const unitCell = document.createElement('td');
            const unitSelect = buildUnitSelect();
            unitCell.appendChild(unitSelect);
            row.appendChild(unitCell);

            dom.productModalBody.appendChild(row);
        });
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('is-open'));
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }

    function attachModalCloseHandlers() {
        if (dom.schoolModalCloseBtns) {
            dom.schoolModalCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal(dom.schoolModal));
            });
        }
        if (dom.productModalCloseBtns) {
            dom.productModalCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal(dom.productModal));
            });
        }
        if (dom.historyViewCloseBtns) {
            dom.historyViewCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal(dom.historyViewModal));
            });
        }
        if (dom.pdfPreviewClose) {
            dom.pdfPreviewClose.addEventListener('click', () => closeModal(dom.pdfPreviewModal));
        }
        window.addEventListener('click', event => {
            if (event.target === dom.schoolModal) closeModal(dom.schoolModal);
            if (event.target === dom.productModal) closeModal(dom.productModal);
            if (event.target === dom.historyViewModal) closeModal(dom.historyViewModal);
            if (event.target === dom.pdfPreviewModal) closeModal(dom.pdfPreviewModal);
        });
    }

    function handleConfirmSchool() {
        const sector = dom.modalSectorSelect?.value || '';
        const schoolIndex = dom.modalSchoolSelect?.value;
        const filtered = sector
            ? state.schools.filter(s => s.sector === sector)
            : state.schools;
        const selected = filtered[Number(schoolIndex)];
        if (!selected) {
            alert('Selecione uma escola válida.');
            return;
        }
        state.selectedSector = selected.sector || sector || '';
        state.selectedSchool = selected;
        renderSchoolInfo();
        closeModal(dom.schoolModal);
    }

    function handleAddSelectedProducts() {
        if (!dom.productModalBody) return;
        const rows = Array.from(dom.productModalBody.querySelectorAll('tr'));
        const selectedRows = rows.filter(row => {
            const checkbox = row.querySelector('.cleaning-product-row-select');
            return checkbox && checkbox.checked;
        });

        if (!selectedRows.length) {
            alert('Selecione pelo menos um produto para adicionar.');
            return;
        }

        selectedRows.forEach(row => {
            const checkbox = row.querySelector('.cleaning-product-row-select');
            const qtyInput = row.querySelector('.cleaning-product-row-quantity');
            const unitSelect = row.querySelector('.cleaning-product-row-unit');

            const productName = checkbox?.dataset.productName?.trim();
            const unit = unitSelect?.value?.trim();
            const quantity = parseFloat(qtyInput?.value);

            if (!productName || !unit || !Number.isFinite(quantity) || quantity <= 0) {
                return;
            }

            const existingIndex = state.items.findIndex(item => item.product === productName && item.unit === unit);
            if (existingIndex >= 0) {
                state.items[existingIndex].quantity = parseFloat((state.items[existingIndex].quantity + quantity).toFixed(2));
            } else {
                state.items.push({
                    product: productName,
                    quantity: parseFloat(quantity.toFixed(2)),
                    unit
                });
            }
        });

        renderItems();
        closeModal(dom.productModal);
    }

    function handleRemoveItem(event) {
        const target = event.target;
        if (!target.classList.contains('btn-delete')) return;
        const index = Number(target.dataset.index);
        if (Number.isNaN(index)) return;
        state.items.splice(index, 1);
        renderItems();
    }

    function handleInlineItemEdit(event) {
        const target = event.target;
        if (target.classList.contains('cleaning-order-edit-quantity')) {
            const index = Number(target.dataset.index);
            if (Number.isInteger(index) && state.items[index]) {
                const value = parseFloat(target.value);
                if (Number.isFinite(value) && value > 0) {
                    state.items[index].quantity = parseFloat(value.toFixed(2));
                }
            }
            return;
        }
        if (target.classList.contains('cleaning-order-edit-unit')) {
            const index = Number(target.dataset.index);
            if (Number.isInteger(index) && state.items[index]) {
                state.items[index].unit = target.value;
            }
        }
    }

    function clearOrder() {
        state.items = [];
        state.observations = '';
        state.activeHistoryEdit = null;
        if (dom.observationsInput) dom.observationsInput.value = '';
        renderItems();
    }

    function buildOrderPayload() {
        if (!state.selectedSchool) {
            alert('Selecione uma escola antes de gerar o PDF.');
            return null;
        }
        if (!state.items.length) {
            alert('Adicione ao menos um produto antes de gerar o PDF.');
            return null;
        }

        const now = new Date();
        const nowIso = now.toISOString();
        const baseLocalId = state.activeHistoryEdit?.localId ?? Date.now();
        const orderData = {
            id: state.activeHistoryEdit?.id ?? null,
            localId: baseLocalId,
            date: now.toLocaleDateString('pt-BR'),
            order_date: nowIso.split('T')[0],
            school: state.selectedSchool,
            items: state.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                unit: item.unit
            })),
            observations: state.observations || '',
            created_at: nowIso,
            localCreatedAt: state.activeHistoryEdit?.localCreatedAt || nowIso,
            pendingSync: state.activeHistoryEdit?.pendingSync ?? false,
            wasSynced: state.activeHistoryEdit?.wasSynced ?? false,
            lastSyncError: null
        };
        return orderData;
    }

    async function generatePdf(orderData) {
        if (!orderData.date) {
            orderData.date = formatHistoryDate(orderData.order_date || orderData.created_at || new Date().toISOString());
        }
        try {
            await window.PDF.generateOrderPdf(orderData, true);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Não foi possível gerar o PDF. Verifique o console para mais detalhes.');
        }
    }

    async function finalizeOrderOutput(orderData, outputType) {
        const { data: saved, error } = await persistCleaningOrder(orderData);
        if (error) {
            alert('Pedido preparado, mas houve falha ao salvar no servidor. Consulte o console.');
            orderData.pendingSync = true;
            orderData.wasSynced = false;
            orderData.lastSyncError = error.message || 'Erro desconhecido';
        } else if (saved?.id) {
            orderData.id = saved.id;
            orderData.order_date = saved.order_date;
            orderData.created_at = saved.created_at;
            orderData.pendingSync = false;
            orderData.wasSynced = true;
            orderData.lastSyncError = null;
        } else if (window.isSupabaseConfigured?.()) {
            orderData.pendingSync = false;
            orderData.wasSynced = true;
            orderData.lastSyncError = null;
        }

        if (!orderData.localCreatedAt) {
            const stamp = new Date().toISOString();
            orderData.localCreatedAt = stamp;
            orderData.created_at = orderData.created_at || stamp;
        }
        orderData.pendingSync = orderData.pendingSync ?? !window.isSupabaseConfigured?.();
        orderData.wasSynced = orderData.wasSynced ?? !orderData.pendingSync;

        state.activeHistoryEdit = null;
        upsertHistoryEntry(orderData);

        if (!orderData.date) {
            orderData.date = formatHistoryDate(orderData.order_date || orderData.created_at || new Date().toISOString());
        }

        if (outputType === 'print') {
            try {
                await window.PDF.printOrder(orderData);
            } catch (error) {
                console.error('Erro ao imprimir pedido:', error);
                alert('Não foi possível enviar o pedido para impressão.');
            }
        } else {
            await generatePdf(orderData);
        }
    }

    async function persistCleaningOrder(orderData) {
        if (!window.isSupabaseConfigured?.()) {
            return { data: null, error: null };
        }

        try {
            const result = await window.saveOrder(orderData);
            if (result?.error) {
                throw result.error;
            }
            return result;
        } catch (error) {
            console.error('Erro ao salvar pedido de limpeza:', error?.message || error, error);
            return { data: null, error };
        }
    }

    async function init() {
        queryDom();
        if (!dom.selectSchoolBtn || !dom.orderTableBody) return;

        loadFromLocalStorage();
        renderHistory();
        await fetchFromSupabase({ forceHistory: true });
        await syncPendingHistory();

        renderSchoolInfo();
        renderItems();
        renderHistory();
        if (dom.observationsInput) {
            dom.observationsInput.value = state.observations;
        }
        if (dom.historySearchInput) {
            dom.historySearchInput.value = state.historySearchTerm;
        }

        attachModalCloseHandlers();

        dom.configureProductsBtn?.addEventListener('click', () => {
            try {
                localStorage.setItem('ckpTargetPage', 'settings');
                localStorage.setItem('ckpTargetTab', 'products-settings');
                localStorage.setItem('ckpActiveRole', 'admin');
            } catch (_) {}
            window.location.href = 'index.html';
        });

        dom.selectSchoolBtn.addEventListener('click', () => {
            populateSectorOptions();
            populateSchoolOptions();
            openModal(dom.schoolModal);
        });

        dom.modalSectorSelect?.addEventListener('change', populateSchoolOptions);
        dom.schoolModalConfirmBtn?.addEventListener('click', handleConfirmSchool);

        dom.openProductModalBtn.addEventListener('click', () => {
            renderProductSelectionRows(dom.productModalSearch?.value || '');
            if (dom.productModalSelectAll) dom.productModalSelectAll.checked = false;
            openModal(dom.productModal);
        });

        dom.productModalApplyBtn?.addEventListener('click', handleAddSelectedProducts);
        if (dom.productModalSelectAll && dom.productModalBody) {
            dom.productModalSelectAll.addEventListener('change', () => {
                const checked = dom.productModalSelectAll.checked;
                dom.productModalBody.querySelectorAll('.cleaning-product-row-select').forEach(cb => {
                    cb.checked = checked;
                });
            });
        }
        dom.productModalSearch?.addEventListener('input', event => {
            renderProductSelectionRows(event.target.value);
            if (dom.productModalSelectAll) dom.productModalSelectAll.checked = false;
        });
        dom.historyTableBody?.addEventListener('click', handleHistoryAction);
        dom.orderTableBody.addEventListener('input', handleInlineItemEdit);
        dom.historySearchInput?.addEventListener('input', event => {
            state.historySearchTerm = event.target.value;
            renderHistory();
        });
        dom.historySearchBtn?.addEventListener('click', () => {
            state.historySearchTerm = dom.historySearchInput?.value || '';
            renderHistory();
        });
        dom.historyRefreshBtn?.addEventListener('click', async () => {
            if (dom.historyRefreshBtn.disabled) return;
            dom.historyRefreshBtn.disabled = true;
            try {
                await fetchFromSupabase({ forceHistory: true });
                renderHistory();
            } finally {
                dom.historyRefreshBtn.disabled = false;
            }
        });
        dom.orderTableBody.addEventListener('click', handleRemoveItem);
        dom.clearOrderBtn?.addEventListener('click', clearOrder);
        dom.printOrderBtn?.addEventListener('click', async () => {
            const orderData = buildOrderPayload();
            if (!orderData) return;
            await finalizeOrderOutput(orderData, 'print');
        });

        dom.generatePdfBtn?.addEventListener('click', async () => {
            const orderData = buildOrderPayload();
            if (!orderData) return;
            await finalizeOrderOutput(orderData, 'download');
        });
        dom.observationsInput?.addEventListener('input', event => {
            state.observations = event.target.value;
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();

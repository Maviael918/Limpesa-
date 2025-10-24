window.Events = {
    setupEventListeners: function() {
        console.log('Configurando event listeners para user_page...');

        // Navigation between sidebar pages
        if (domElements.navLinks && domElements.navLinks.length) {
            domElements.navLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const targetPage = this.dataset.page;
                    if (targetPage) {
                        window.UI.showPage(targetPage);
                    }
                });
            });
        }

        // Settings tabs
        if (domElements.tabLinks && domElements.tabLinks.length) {
            domElements.tabLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const tabId = this.dataset.tab;
                    if (tabId) {
                        window.UI.showTab(tabId);
                    }
                });
            });
        }

        const openKitConfiguration = () => {
            if (!domElements.kitConfigurationSection) return;
            domElements.kitConfigurationSection.style.display = 'block';
            requestAnimationFrame(() => domElements.kitConfigurationSection.classList.add('is-open'));
        };

        if (domElements.configureKitsBtn && domElements.kitConfigurationSection) {
            domElements.configureKitsBtn.addEventListener('click', openKitConfiguration);
        }

        if (domElements.configureKitsBtnSecondary && domElements.kitConfigurationSection) {
            domElements.configureKitsBtnSecondary.addEventListener('click', openKitConfiguration);
        }

        if (domElements.closeKitConfigBtns && domElements.kitConfigurationSection) {
            domElements.closeKitConfigBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    domElements.kitConfigurationSection.classList.remove('is-open');
                    setTimeout(() => {
                        domElements.kitConfigurationSection.style.display = 'none';
                    }, 220);
                });
            });
        }

        document.querySelectorAll('.kit-tab-link').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const tabId = this.dataset.kitTab;
                if (tabId) {
                    window.UI.showKitTab(tabId);
                }
            });
        });

        document.querySelectorAll('.add-product-to-kit-form').forEach(form => {
            form.addEventListener('submit', async function(event) {
                event.preventDefault();
                const kitType = this.dataset.kitType;
                await window.Events.handleAddProductToKit(this, kitType);
            });
        });

        // Schools form
        if (domElements.addSchoolForm) {
            domElements.addSchoolForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleAddOrUpdateSchool();
            });
        }

        // Products form
        if (domElements.addProductForm) {
            domElements.addProductForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleAddOrUpdateProduct();
            });
        }

        if (domElements.addFoodProductForm) {
            domElements.addFoodProductForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleAddOrUpdateFoodProduct();
            });
        }

        // Units form
        if (domElements.addUnitForm) {
            domElements.addUnitForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleAddOrUpdateUnit();
            });
        }

        // Stock form
        if (domElements.addToStockForm) {
            domElements.addToStockForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleAddToStock();
            });
        }

        if (domElements.editStockForm) {
            domElements.editStockForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                await window.Events.handleSaveStockEdit();
            });
        }

        if (domElements.closeEditStockModal) {
            domElements.closeEditStockModal.addEventListener('click', function() {
                window.Events.closeEditStockModal();
            });
        }

        // Unit conversions form
        if (domElements.addUnitConversionForm) {
            domElements.addUnitConversionForm.addEventListener('submit', function(event) {
                event.preventDefault();
                window.Events.handleAddUnitConversion();
            });
        }

        // Order Page Elements
        if (domElements.orderSectorFilter) {
            domElements.orderSectorFilter.addEventListener('change', function() {
                window.UI.populateOrderSchoolSelect();
                window.UI.updateOrderHeroSummary();
            });
        }

        if (domElements.orderSchoolSelect) {
            domElements.orderSchoolSelect.addEventListener('change', function() {
                window.UI.updateOrderHeroSummary();
            });
        }

        if (domElements.orderHistorySearchInput) {
            domElements.orderHistorySearchInput.addEventListener('input', function() {
                window.Events.handleOrderHistorySearch(this.value);
            });
            domElements.orderHistorySearchInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    window.Events.handleOrderHistorySearch(this.value);
                }
            });
        }

        if (domElements.orderHistorySearchBtn) {
            domElements.orderHistorySearchBtn.addEventListener('click', function() {
                const value = domElements.orderHistorySearchInput?.value || '';
                window.Events.handleOrderHistorySearch(value);
                domElements.orderHistorySearchInput?.focus();
            });
        }

        if (domElements.openProductsModalBtn) {
            domElements.openProductsModalBtn.addEventListener('click', function() {
                window.Modals.showProductsSelectionModal();
            });
        }

        if (domElements.saveOrderBtn) {
            domElements.saveOrderBtn.addEventListener('click', async function() {
                await window.Events.handleSaveOrderAndGeneratePdf();
            });
        }

        if (domElements.printOrderBtn) {
            domElements.printOrderBtn.addEventListener('click', async function() {
                await window.Events.handlePrintCurrentOrder();
            });
        }

        if (domElements.cancelEditBtn) {
            domElements.cancelEditBtn.addEventListener('click', function() {
                window.Events.cancelOrderEdit();
            });
        }

        // Quick Kit Selection Buttons
        if (domElements.selectKitPBtn) {
            domElements.selectKitPBtn.addEventListener('click', function() {
                console.log('Kit P selecionado');
                selectedKitProducts = [...kits.p];
                window.Modals.showQuickKitModal('Kit P', selectedKitProducts);
            });
        }

        if (domElements.selectKitMBtn) {
            domElements.selectKitMBtn.addEventListener('click', function() {
                console.log('Kit M selecionado');
                selectedKitProducts = [...kits.m];
                window.Modals.showQuickKitModal('Kit M', selectedKitProducts);
            });
        }

        if (domElements.selectKitGBtn) {
            domElements.selectKitGBtn.addEventListener('click', function() {
                console.log('Kit G selecionado');
                selectedKitProducts = [...kits.g];
                window.Modals.showQuickKitModal('Kit G', selectedKitProducts);
            });
        }

        // Modals
        if (domElements.modalCloseButton) {
            domElements.modalCloseButton.addEventListener('click', function() {
                domElements.schoolSelectionModal.style.display = 'none';
            });
        }

        if (domElements.confirmKitSchoolBtn) {
            domElements.confirmKitSchoolBtn.addEventListener('click', async function() {
                await window.Events.handleConfirmKitSchoolAndGeneratePdf();
            });
        }

        if (domElements.closePdfPreview) {
            domElements.closePdfPreview.addEventListener('click', function() {
                domElements.pdfPreviewModal.style.display = 'none';
            });
        }

        if (domElements.confirmProductsBtn) {
            domElements.confirmProductsBtn.addEventListener('click', function() {
                window.Modals.handleConfirmProductsSelection();
            });
        }

        if (domElements.addKitToOrderBtn) {
            domElements.addKitToOrderBtn.addEventListener('click', function() {
                window.Modals.handleAddQuickKitToOrder();
            });
        }

        if (domElements.confirmOrderBtn) {
            domElements.confirmOrderBtn.addEventListener('click', async function() {
                await window.Events.handleConfirmOrder();
            });
        }

        // Print actions
        const printPreviewBtn = document.getElementById('print-pdf-btn');
        if (printPreviewBtn) {
            printPreviewBtn.addEventListener('click', function() {
                window.PDF.printPreview();
            });
        }

        const printLatestBtn = document.getElementById('print-latest-order-btn');
        if (printLatestBtn) {
            printLatestBtn.addEventListener('click', async function() {
                await window.Events.handlePrintLatestOrder();
            });
        }

        if (domElements.saveOrderDetailsBtn) {
            domElements.saveOrderDetailsBtn.addEventListener('click', async function() {
                await window.Events.handleSaveOrderDetails();
            });
        }

        if (domElements.deleteOrderBtn) {
            domElements.deleteOrderBtn.addEventListener('click', function() {
                window.Modals.showDeleteOrderConfirmationModal(editingOrderId);
            });
        }

        if (domElements.confirmDeleteOrderBtn) {
            domElements.confirmDeleteOrderBtn.addEventListener('click', async function() {
                await window.Events.handleConfirmDeleteOrder();
            });
        }

        if (domElements.editLayoutBtn) {
            domElements.editLayoutBtn.addEventListener('click', function() {
                window.Modals.showLayoutEditorModal();
            });
        }

        if (domElements.closeLayoutEditor) {
            domElements.closeLayoutEditor.addEventListener('click', function() {
                domElements.layoutEditorModal.style.display = 'none';
            });
        }

        if (domElements.saveLayoutBtn) {
            domElements.saveLayoutBtn.addEventListener('click', function() {
                window.Modals.handleSaveLayout();
            });
        }

        if (domElements.cancelLayoutBtn) {
            domElements.cancelLayoutBtn.addEventListener('click', function() {
                domElements.layoutEditorModal.style.display = 'none';
            });
        }

        // Delegated events for dynamic content
        document.addEventListener('click', async function(event) {
            // Order actions
            if (event.target.classList.contains('btn-delete-order')) {
                const orderId = event.target.getAttribute('data-id');
                window.Modals.showDeleteOrderConfirmationModal(orderId);
            }
            if (event.target.classList.contains('btn-edit-order')) {
                const orderId = event.target.getAttribute('data-id');
                window.Events.editOrder(orderId);
            }
            if (event.target.classList.contains('btn-pdf')) {
                const orderId = event.target.getAttribute('data-id');
                await window.Events.handleGeneratePdfForOrder(orderId);
            }

            // Schools actions
            if (event.target.classList.contains('btn-edit-school')) {
                const index = parseInt(event.target.dataset.index, 10);
                window.Events.startEditSchool(index);
            }
            if (event.target.classList.contains('btn-delete-school')) {
                const index = parseInt(event.target.dataset.index, 10);
                await window.Events.handleDeleteSchool(index);
            }

            // Products actions
            if (event.target.classList.contains('btn-edit-product')) {
                const index = parseInt(event.target.dataset.index, 10);
                window.Events.startEditProduct(index);
            }
            if (event.target.classList.contains('btn-delete-product')) {
                const index = parseInt(event.target.dataset.index, 10);
                await window.Events.handleDeleteProduct(index);
            }

            if (event.target.classList.contains('btn-edit-food-product')) {
                const index = parseInt(event.target.dataset.index, 10);
                window.Events.startEditFoodProduct(index);
            }
            if (event.target.classList.contains('btn-delete-food-product')) {
                const index = parseInt(event.target.dataset.index, 10);
                await window.Events.handleDeleteFoodProduct(index);
            }

            // Units actions
            if (event.target.classList.contains('btn-edit-unit')) {
                const index = parseInt(event.target.dataset.index, 10);
                window.Events.startEditUnit(index);
            }
            if (event.target.classList.contains('btn-delete-unit')) {
                const index = parseInt(event.target.dataset.index, 10);
                await window.Events.handleDeleteUnit(index);
            }

            // Stock actions
            if (event.target.classList.contains('btn-edit-stock')) {
                const product = event.target.dataset.product;
                window.Events.openEditStockModal(product);
            }
            if (event.target.classList.contains('btn-delete-stock')) {
                const product = event.target.dataset.product;
                await window.Events.handleDeleteStock(product);
            }

            // Unit conversion actions
            if (event.target.classList.contains('btn-delete-conversion')) {
                const index = parseInt(event.target.dataset.index, 10);
                window.Events.handleDeleteUnitConversion(index);
            }

            if (event.target.classList.contains('btn-remove-kit-item')) {
                const kitType = event.target.dataset.kitType;
                const index = parseInt(event.target.dataset.index, 10);
                await window.Events.handleRemoveKitItem(kitType, index);
            }

            // Current order items
            if (event.target.classList.contains('btn-delete-order-item')) {
                const index = event.target.getAttribute('data-index');
                currentOrderProducts.splice(index, 1);
                window.UI.renderCurrentOrderProducts();
            }

            if (domElements.editStockModal && event.target === domElements.editStockModal) {
                window.Events.closeEditStockModal();
            }
        });

        console.log('Event listeners configurados para user_page');
    },
    
    handlePrintLatestOrder: async function() {
        if (!orders || orders.length === 0) {
            alert('Não há pedidos no histórico para imprimir.');
            return;
        }
        const sorted = window.UI.getSortedOrdersDescending?.();
        const latest = Array.isArray(sorted) && sorted.length > 0 ? sorted[0] : null;
        if (!latest) {
            alert('Não foi possível determinar o pedido mais recente.');
            return;
        }
        await window.PDF.printOrder(latest);
    },

    handleOrderHistorySearch: function(query) {
        const normalized = (query || '').trim();
        orderHistorySearchTerm = normalized;
        if (domElements.orderHistorySearchInput && domElements.orderHistorySearchInput.value !== normalized) {
            domElements.orderHistorySearchInput.value = normalized;
        }
        window.UI.renderOrders();
    },

    persistOrderToSupabase: async function(orderData) {
        if (!orderData) {
            return { data: null, error: null };
        }

        orderData.pendingSync = !!orderData.pendingSync;
        if (orderData.wasSynced === undefined) {
            orderData.wasSynced = !!(orderData.id && !orderData.pendingSync);
        }
        orderData.lastSyncError = null;

        if (!window.isSupabaseConfigured?.()) {
            orderData.pendingSync = true;
            orderData.lastSyncError = 'Supabase não configurado';
            window.StatusConsole?.setConnection?.('offline', 'Supabase não configurado');
            window.StatusConsole?.log?.('Supabase indisponível - mantendo histórico apenas no cache local', 'warning');
            return { data: null, error: null };
        }

        try {
            window.StatusConsole?.setSyncing?.('Sincronizando com o Supabase...');
            window.StatusConsole?.log?.('Sincronização do pedido iniciada', 'pending');

            const { data, error } = await window.saveOrder(orderData);
            if (error) throw error;

            if (data?.id) {
                orderData.id = data.id;
                orderData.order_date = data.order_date;
                orderData.created_at = data.created_at;
                orderData.pendingSync = false;
                orderData.wasSynced = true;
                orderData.syncedAt = new Date().toISOString();
                orderData.lastSyncError = null;
            }

            window.StatusConsole?.setConnection?.('online', 'Online');
            window.StatusConsole?.log?.('Pedido sincronizado com o Supabase', 'success');
            return { data, error: null };
        } catch (error) {
            console.error('Erro ao sincronizar pedido no Supabase:', error);
            orderData.pendingSync = true;
            orderData.lastSyncError = error?.message || 'Erro desconhecido';
            window.StatusConsole?.setConnection?.('degraded', 'Erro ao sincronizar com o Supabase');
            window.StatusConsole?.log?.(`Erro ao sincronizar com o Supabase: ${error.message || error}`, 'error');
            return { data: null, error };
        }
    },

    buildCleaningOrderPayload: function() {
        const schoolName = domElements.orderSchoolSelect?.value;
        const observations = domElements.orderObservationsInput?.value;

        if (!schoolName || currentOrderProducts.length === 0) {
            alert('Selecione uma escola e adicione produtos ao pedido.');
            return null;
        }

        const selectedSchool = schools.find(s => s.name === schoolName);
        if (!selectedSchool) {
            alert('Escola não encontrada.');
            return null;
        }

        const isEditing = editingOrderId !== null;
        const existingOrder = isEditing ? orders.find(o => o.id == editingOrderId) : null;
        const nowIso = new Date().toISOString();
        const localId = existingOrder?.localId || editingOrderId || Date.now();

        const orderData = {
            id: isEditing ? (existingOrder?.id ?? editingOrderId) : null,
            localId,
            date: new Date().toLocaleDateString('pt-BR'),
            order_date: nowIso.split('T')[0],
            school: selectedSchool,
            items: currentOrderProducts.map(item => ({ ...item })),
            observations,
            created_at: existingOrder?.created_at || null,
            pendingSync: existingOrder?.pendingSync ?? false,
            wasSynced: existingOrder?.wasSynced ?? false,
            lastSyncError: existingOrder?.lastSyncError ?? null,
            syncedAt: existingOrder?.syncedAt ?? null,
            localCreatedAt: existingOrder?.localCreatedAt || nowIso
        };

        return { orderData, isEditing, nowIso };
    },

    finalizeCleaningOrderOutput: async function(orderData, isEditing, nowIso, outputType) {
        const { data: savedOrder } = await this.persistOrderToSupabase(orderData);
        if (savedOrder?.id) {
            orderData.id = savedOrder.id;
            orderData.order_date = savedOrder.order_date;
            orderData.created_at = savedOrder.created_at;
            orderData.pendingSync = false;
            orderData.wasSynced = true;
            orderData.syncedAt = orderData.syncedAt || new Date().toISOString();
        } else if (!orderData.id) {
            orderData.id = Date.now();
            orderData.pendingSync = true;
            orderData.wasSynced = false;
        }

        if (!orderData.created_at) {
            orderData.created_at = nowIso;
        }
        if (!orderData.localCreatedAt) {
            orderData.localCreatedAt = nowIso;
        }

        if (isEditing) {
            const orderIndex = orders.findIndex(o => o.id == editingOrderId);
            if (orderIndex > -1) {
                orders[orderIndex] = orderData;
            } else if (editingOrderId !== null) {
                orders.push(orderData);
            }
            editingOrderId = null;
            if (domElements.saveOrderBtn) {
                domElements.saveOrderBtn.textContent = 'Salvar e Gerar PDF';
            }
            if (domElements.cancelEditBtn) {
                domElements.cancelEditBtn.style.display = 'none';
            }
        } else {
            orders.push(orderData);
        }

        window.Main.saveDataToLocalStorage();
        window.UI.renderOrders();
        if (outputType === 'print') {
            try {
                await window.PDF.printOrder(orderData);
            } catch (error) {
                console.error('Erro ao imprimir pedido:', error);
                alert('Não foi possível enviar o pedido para impressão.');
            }
        } else {
            try {
                await window.PDF.generateOrderPdf(orderData, true); // true para salvar
            } catch (error) {
                console.error('Erro ao gerar PDF do pedido:', error);
                alert('Não foi possível gerar o PDF. Verifique o console para detalhes.');
            }
        }

        return orderData;
    },

    handleSaveOrderAndGeneratePdf: async function() {
        const buildResult = this.buildCleaningOrderPayload();
        if (!buildResult) return;

        const { orderData, isEditing, nowIso } = buildResult;
        await this.finalizeCleaningOrderOutput(orderData, isEditing, nowIso, 'download');

        if (domElements.orderSchoolSelect) {
            domElements.orderSchoolSelect.value = '';
        }
        currentOrderProducts = [];
        window.UI.renderCurrentOrderProducts();
        if (domElements.orderObservationsInput) {
            domElements.orderObservationsInput.value = '';
        }
        window.UI.updateOrderHeroSummary();
    },

    handleConfirmKitSchoolAndGeneratePdf: async function() {
        const schoolName = domElements.modalSchoolSelect.value;
        if (!schoolName) {
            alert('Selecione uma escola para gerar o PDF do kit.');
            return;
        }

        const selectedSchool = schools.find(s => s.name === schoolName);
        if (!selectedSchool) {
            alert('Escola não encontrada.');
            return;
        }

        const nowIsoKit = new Date().toISOString();
        const kitOrder = {
            id: null,
            date: new Date().toLocaleDateString('pt-BR'),
            order_date: nowIsoKit.split('T')[0],
            school: selectedSchool,
            items: selectedKitProducts.map(item => ({ ...item })),
            observations: 'Kit pré-configurado',
            created_at: null,
            pendingSync: false,
            wasSynced: false,
            lastSyncError: null,
            syncedAt: null,
            localCreatedAt: nowIsoKit
        };

        const { data: savedOrder } = await this.persistOrderToSupabase(kitOrder);
        if (savedOrder?.id) {
            kitOrder.id = savedOrder.id;
            kitOrder.order_date = savedOrder.order_date;
            kitOrder.created_at = savedOrder.created_at;
            kitOrder.pendingSync = false;
            kitOrder.wasSynced = true;
            kitOrder.syncedAt = kitOrder.syncedAt || new Date().toISOString();
        } else {
            kitOrder.id = Date.now();
            kitOrder.pendingSync = true;
            kitOrder.wasSynced = false;
        }
        if (!kitOrder.created_at) {
            kitOrder.created_at = nowIsoKit;
        }

        // No stock check for user_page

        // Save kit order to orders list
        orders.push(kitOrder);
        window.Main.saveDataToLocalStorage();
        window.UI.renderOrders();

        // Generate PDF
        await window.PDF.generateOrderPdf(kitOrder, true); // true para salvar
        domElements.schoolSelectionModal.style.display = 'none';
    },

    handlePrintCurrentOrder: async function() {
        const buildResult = this.buildCleaningOrderPayload();
        if (!buildResult) return;

        const { orderData, isEditing, nowIso } = buildResult;
        await this.finalizeCleaningOrderOutput(orderData, isEditing, nowIso, 'print');
    },

    handleGeneratePdfForOrder: async function(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (order) {
            await window.PDF.generateOrderPdf(order, true); // true para salvar
        } else {
            alert('Pedido não encontrado para gerar PDF.');
        }
    },

    handleConfirmOrder: async function() {
        const schoolName = domElements.summarySchoolName.textContent;
        const observations = domElements.summaryObservations.textContent;
        const items = [];
        domElements.summaryProductsTbody.querySelectorAll('tr').forEach(row => {
            const product = row.children[0].textContent;
            const quantity = parseInt(row.children[1].textContent);
            const unit = row.children[2].textContent;
            items.push({ product, quantity, unit });
        });

        const selectedSchool = schools.find(s => s.name === schoolName);
        if (!selectedSchool) {
            alert('Escola não encontrada.');
            return;
        }

        const isEditing = editingOrderId !== null;
        const existingOrder = isEditing ? orders.find(o => o.id == editingOrderId) : null;
        const nowIso = new Date().toISOString();
        const orderData = {
            id: isEditing ? (existingOrder?.id ?? editingOrderId) : null,
            date: new Date().toLocaleDateString('pt-BR'),
            order_date: nowIso.split('T')[0],
            school: selectedSchool,
            items,
            observations,
            created_at: existingOrder?.created_at || null,
            pendingSync: existingOrder?.pendingSync ?? false,
            wasSynced: existingOrder?.wasSynced ?? false,
            lastSyncError: existingOrder?.lastSyncError ?? null,
            syncedAt: existingOrder?.syncedAt ?? null,
            localCreatedAt: existingOrder?.localCreatedAt || nowIso
        };

        const { data: savedOrder } = await this.persistOrderToSupabase(orderData);
        if (savedOrder?.id) {
            orderData.id = savedOrder.id;
            orderData.order_date = savedOrder.order_date;
            orderData.created_at = savedOrder.created_at;
            orderData.pendingSync = false;
            orderData.wasSynced = true;
            orderData.syncedAt = orderData.syncedAt || new Date().toISOString();
        } else if (!orderData.id) {
            orderData.id = Date.now();
            orderData.pendingSync = true;
            orderData.wasSynced = false;
        }
        if (!orderData.created_at) {
            orderData.created_at = nowIso;
        }

        if (isEditing) {
            const orderIndex = orders.findIndex(o => o.id == editingOrderId);
            if (orderIndex > -1) {
                orders[orderIndex] = orderData;
            }
            editingOrderId = null;
            domElements.saveOrderBtn.textContent = 'Salvar e Gerar PDF';
            domElements.cancelEditBtn.style.display = 'none';
        } else {
            orders.push(orderData);
        }

        window.Main.saveDataToLocalStorage();
        window.UI.renderOrders();
        
        // Reset form
        domElements.orderSchoolSelect.value = '';
        currentOrderProducts = [];
        window.UI.renderCurrentOrderProducts();
        domElements.orderObservationsInput.value = '';
        window.UI.updateOrderHeroSummary();

        window.Modals.closeModal('order-confirmation-modal');
        await window.PDF.generateOrderPdf(orderData, true); // true para salvar
    },

    handleSaveOrderDetails: async function() {
        const orderId = editingOrderId;
        if (!orderId) return;

        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];

        const schoolName = domElements.detailOrderSchool.value;
        const observations = domElements.detailOrderObservations.value;

        const selectedSchool = schools.find(s => s.name === schoolName);
        if (!selectedSchool) {
            alert('Escola não encontrada.');
            return;
        }

        // Update order details
        order.school = selectedSchool;
        order.observations = observations;
        order.order_date = order.order_date || new Date().toISOString().split('T')[0];

        // Update items from the table in the modal
        const updatedItems = [];
        domElements.detailProductsTbody.querySelectorAll('tr').forEach(row => {
            const product = row.querySelector('.detail-product-name').textContent;
            const quantity = parseInt(row.querySelector('.detail-quantity-input').value);
            const unit = row.querySelector('.detail-unit-select').value;
            updatedItems.push({ product, quantity, unit });
        });
        order.items = updatedItems;

        window.Main.saveDataToLocalStorage();
        window.UI.renderOrders();
        window.Modals.closeModal('order-details-modal');
        alert('Pedido atualizado com sucesso!');

        if (order.id) {
            const { data: savedOrder } = await this.persistOrderToSupabase(order);
            if (savedOrder?.id) {
                order.id = savedOrder.id;
                order.order_date = savedOrder.order_date;
                order.created_at = savedOrder.created_at;
                order.pendingSync = false;
                order.wasSynced = true;
                order.syncedAt = order.syncedAt || new Date().toISOString();
            }
            window.Main.saveDataToLocalStorage();
        } else {
            order.pendingSync = true;
            order.wasSynced = false;
            window.Main.saveDataToLocalStorage();
        }
    },

    handleConfirmDeleteOrder: async function() {
        const orderIdToDelete = editingOrderId;
        if (!orderIdToDelete) return;

        const orderIndex = orders.findIndex(o => o.id == orderIdToDelete);
        if (orderIndex > -1) {
            orders.splice(orderIndex, 1);
            window.Main.saveDataToLocalStorage();
            window.UI.renderOrders();
            window.Modals.closeModal('delete-order-confirmation-modal');
            window.Modals.closeModal('order-details-modal'); // Close details modal if open
            alert('Pedido excluído com sucesso!');

            if (window.isSupabaseConfigured?.()) {
                try {
                    const { error } = await window.deleteOrder(orderIdToDelete);
                    if (error) throw error;
                } catch (error) {
                    console.error('Erro ao excluir pedido no Supabase:', error);
                }
            }
        }
        editingOrderId = null; // Reset editing state
    },

    handleAddOrUpdateSchool: async function() {
        if (!domElements.addSchoolForm) return;
        const schoolData = {
            name: domElements.schoolNameInput?.value?.trim() || '',
            sector: domElements.schoolSectorInput?.value?.trim() || '',
            managerName: domElements.schoolManagerNameInput?.value?.trim() || '',
            address: domElements.schoolAddressInput?.value?.trim() || '',
            modality: domElements.schoolModalityInput?.value?.trim() || '',
            students: parseInt(domElements.schoolStudentsInput?.value, 10) || 0
        };

        if (!schoolData.name) {
            alert('Informe o nome da escola.');
            return;
        }

        const isEditing = editingSchoolIndex !== null;
        const originalName = isEditing ? schools[editingSchoolIndex]?.name : null;

        if (editingSchoolIndex !== null) {
            schools[editingSchoolIndex] = schoolData;
            editingSchoolIndex = null;
            const submitBtn = domElements.addSchoolForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Escola';
            if (domElements.addSchoolForm?.dataset) {
                domElements.addSchoolForm.dataset.editingOriginalSchool = '';
            }
        } else {
            schools.push(schoolData);
        }

        domElements.addSchoolForm.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (window.isSupabaseConfigured?.()) {
            try {
                if (isEditing && originalName && originalName !== schoolData.name) {
                    await window.deleteSchoolByName(originalName);
                }
                const { error } = await window.upsertSchool(schoolData);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao sincronizar escola com Supabase:', error);
            }
        }
    },

    startEditSchool: function(index) {
        if (!schools[index] || !domElements.addSchoolForm) return;
        const school = schools[index];
        editingSchoolIndex = index;
        domElements.schoolNameInput.value = school.name || '';
        domElements.schoolSectorInput.value = school.sector || '';
        domElements.schoolManagerNameInput.value = school.managerName || '';
        domElements.schoolAddressInput.value = school.address || '';
        domElements.schoolModalityInput.value = school.modality || '';
        domElements.schoolStudentsInput.value = school.students || '';
        const submitBtn = domElements.addSchoolForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Salvar Escola';
        if (domElements.addSchoolForm?.dataset) {
            domElements.addSchoolForm.dataset.editingOriginalSchool = school.name || '';
        }
        window.UI.showPage('settings');
        window.UI.showTab('schools');
    },

    handleDeleteSchool: async function(index) {
        if (index < 0 || index >= schools.length) return;
        if (!confirm('Deseja remover esta escola?')) return;
        const removed = schools.splice(index, 1)[0];
        const removedName = removed?.name || removed;
        if (editingSchoolIndex === index) {
            editingSchoolIndex = null;
            domElements.addSchoolForm?.reset();
            const submitBtn = domElements.addSchoolForm?.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Escola';
        } else if (editingSchoolIndex !== null && editingSchoolIndex > index) {
            editingSchoolIndex -= 1;
        }
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (removedName && window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.deleteSchoolByName(removedName);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao remover escola no Supabase:', error);
            }
        }
    },

    handleAddOrUpdateProduct: async function() {
        if (!domElements.addProductForm) return;
        const name = domElements.productNameInput?.value?.trim();
        if (!name) {
            alert('Informe o nome do produto.');
            return;
        }

        const data = { name };
        const isEditing = editingProductIndex !== null;
        const originalName = isEditing
            ? (domElements.addProductForm?.dataset.editingOriginalName || products[editingProductIndex]?.name || '')
            : null;

        if (editingProductIndex !== null) {
            if (originalName && originalName !== name && stock[originalName]) {
                stock[name] = stock[originalName];
                delete stock[originalName];
            }
            products[editingProductIndex] = data;
            editingProductIndex = null;
            const submitBtn = domElements.addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Produto';
            if (domElements.addProductForm?.dataset) {
                domElements.addProductForm.dataset.editingOriginalName = '';
            }
        } else {
            products.push(data);
        }

        domElements.addProductForm.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (window.isSupabaseConfigured?.()) {
            try {
                if (isEditing && originalName && originalName !== name) {
                    await window.deleteProductByName(originalName);
                }
                const { error } = await window.upsertProduct(data);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao sincronizar produto com Supabase:', error);
            }
        }
    },

    startEditProduct: function(index) {
        if (!products[index] || !domElements.addProductForm) return;
        const product = products[index];
        const name = typeof product === 'string' ? product : product.name;
        editingProductIndex = index;
        domElements.productNameInput.value = name || '';
        if (domElements.addProductForm?.dataset) {
            domElements.addProductForm.dataset.editingOriginalName = name || '';
        }
        const submitBtn = domElements.addProductForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Salvar Produto';
        window.UI.showPage('settings');
        window.UI.showTab('products-settings');
    },

    handleDeleteProduct: async function(index) {
        if (index < 0 || index >= products.length) return;
        if (!confirm('Deseja remover este produto?')) return;
        const removed = products.splice(index, 1)[0];
        const removedName = typeof removed === 'string' ? removed : removed?.name;
        if (editingProductIndex === index) {
            editingProductIndex = null;
            domElements.addProductForm?.reset();
            const submitBtn = domElements.addProductForm?.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Produto';
            if (domElements.addProductForm?.dataset) domElements.addProductForm.dataset.editingOriginalName = '';
        } else if (editingProductIndex !== null && editingProductIndex > index) {
            editingProductIndex -= 1;
        }
        if (removedName && stock[removedName]) {
            delete stock[removedName];
        }
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (removedName && window.isSupabaseConfigured?.()) {
            try {
                const [{ error: productError }, { error: stockError }] = await Promise.all([
                    window.deleteProductByName(removedName),
                    window.deleteStockItem(removedName)
                ]);
                if (productError) throw productError;
                if (stockError) throw stockError;
            } catch (error) {
                console.error('Erro ao remover produto/estoque no Supabase:', error);
            }
        }
    },

    handleAddOrUpdateFoodProduct: async function() {
        if (!domElements.addFoodProductForm) return;
        const name = domElements.foodProductNameInput?.value?.trim();
        if (!name) {
            alert('Informe o nome do produto de alimentação.');
            return;
        }

        const data = { name };
        const isEditing = editingFoodProductIndex !== null;
        const originalName = isEditing
            ? (domElements.addFoodProductForm?.dataset.editingOriginalFoodName || foodProducts[editingFoodProductIndex]?.name || '')
            : null;

        if (editingFoodProductIndex !== null) {
            foodProducts[editingFoodProductIndex] = data;
            editingFoodProductIndex = null;
            const submitBtn = domElements.addFoodProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Produto de Alimentação';
            if (domElements.addFoodProductForm?.dataset) {
                domElements.addFoodProductForm.dataset.editingOriginalFoodName = '';
            }
        } else {
            foodProducts.push(data);
        }

        domElements.addFoodProductForm.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (window.isSupabaseConfigured?.()) {
            try {
                if (isEditing && originalName && originalName !== name) {
                    await window.deleteFoodProductByName(originalName);
                }
                const { error } = await window.upsertFoodProduct(data);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao sincronizar produto de alimentação com Supabase:', error);
            }
        }
    },

    startEditFoodProduct: function(index) {
        if (!foodProducts[index] || !domElements.addFoodProductForm) return;
        const product = foodProducts[index];
        const name = typeof product === 'string' ? product : product.name;
        editingFoodProductIndex = index;
        domElements.foodProductNameInput.value = name || '';
        if (domElements.addFoodProductForm?.dataset) {
            domElements.addFoodProductForm.dataset.editingOriginalFoodName = name || '';
        }
        const submitBtn = domElements.addFoodProductForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Salvar Produto de Alimentação';
        window.UI.showPage('settings');
        window.UI.showTab('products-settings');
    },

    handleDeleteFoodProduct: async function(index) {
        if (index < 0 || index >= foodProducts.length) return;
        if (!confirm('Deseja remover este produto de alimentação?')) return;
        const removed = foodProducts.splice(index, 1)[0];
        const removedName = typeof removed === 'string' ? removed : removed?.name;
        if (editingFoodProductIndex === index) {
            editingFoodProductIndex = null;
            domElements.addFoodProductForm?.reset();
            const submitBtn = domElements.addFoodProductForm?.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Produto de Alimentação';
            if (domElements.addFoodProductForm?.dataset) domElements.addFoodProductForm.dataset.editingOriginalFoodName = '';
        } else if (editingFoodProductIndex !== null && editingFoodProductIndex > index) {
            editingFoodProductIndex -= 1;
        }

        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (removedName && window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.deleteFoodProductByName(removedName);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao remover produto de alimentação no Supabase:', error);
            }
        }
    },

    handleAddOrUpdateUnit: async function() {
        if (!domElements.addUnitForm) return;
        const name = domElements.unitNameInput?.value?.trim();
        if (!name) {
            alert('Informe o nome da unidade.');
            return;
        }

        const data = { name };
        const isEditing = editingUnitIndex !== null;
        const originalName = isEditing
            ? (domElements.addUnitForm?.dataset.editingOriginalUnit || units[editingUnitIndex]?.name || '')
            : null;

        if (editingUnitIndex !== null) {
            const storedOriginalName = domElements.addUnitForm?.dataset.editingOriginalUnit;
            if (storedOriginalName && storedOriginalName !== name && window.UnitConversions) {
                window.UnitConversions.conversions = (window.UnitConversions.conversions || []).map(conv => {
                    if (conv.sourceUnit === storedOriginalName) {
                        return { ...conv, sourceUnit: name };
                    }
                    if (conv.targetUnit === storedOriginalName) {
                        return { ...conv, targetUnit: name };
                    }
                    return conv;
                });
                window.UnitConversions.saveConversions();
            }
            units[editingUnitIndex] = data;
            editingUnitIndex = null;
            const submitBtn = domElements.addUnitForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Unidade';
            if (domElements.addUnitForm?.dataset) domElements.addUnitForm.dataset.editingOriginalUnit = '';
        } else {
            units.push(data);
        }

        domElements.addUnitForm.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (window.isSupabaseConfigured?.()) {
            try {
                if (isEditing && originalName && originalName !== name) {
                    await window.deleteUnitByName(originalName);
                }
                const { error } = await window.upsertUnit(data);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao sincronizar unidade no Supabase:', error);
            }
        }
    },

    startEditUnit: function(index) {
        if (!units[index] || !domElements.addUnitForm) return;
        const unit = units[index];
        const name = typeof unit === 'string' ? unit : unit.name;
        editingUnitIndex = index;
        domElements.unitNameInput.value = name || '';
        if (domElements.addUnitForm?.dataset) domElements.addUnitForm.dataset.editingOriginalUnit = name || '';
        const submitBtn = domElements.addUnitForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Salvar Unidade';
        window.UI.showPage('settings');
        window.UI.showTab('units');
    },

    handleDeleteUnit: async function(index) {
        if (index < 0 || index >= units.length) return;
        if (!confirm('Deseja remover esta unidade?')) return;
        const removed = units.splice(index, 1)[0];
        const removedName = typeof removed === 'string' ? removed : removed?.name;
        if (editingUnitIndex === index) {
            editingUnitIndex = null;
            domElements.addUnitForm?.reset();
            const submitBtn = domElements.addUnitForm?.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Adicionar Unidade';
        } else if (editingUnitIndex !== null && editingUnitIndex > index) {
            editingUnitIndex -= 1;
        }
        if (removedName && window.UnitConversions) {
            window.UnitConversions.conversions = (window.UnitConversions.conversions || []).filter(conv => conv.sourceUnit !== removedName && conv.targetUnit !== removedName);
            window.UnitConversions.saveConversions();
        }
        if (domElements.addUnitForm?.dataset) domElements.addUnitForm.dataset.editingOriginalUnit = '';
        window.Main.saveDataToLocalStorage();
        window.UI.reRenderUI();

        if (removedName && window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.deleteUnitByName(removedName);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao remover unidade no Supabase:', error);
            }
        }
    },

    handleAddToStock: async function() {
        const product = domElements.stockProductSelect?.value?.trim();
        const quantity = parseFloat(domElements.stockQuantityInput?.value);
        const unit = domElements.stockUnitSelect?.value?.trim();

        if (!product || isNaN(quantity) || quantity <= 0 || !unit) {
            alert('Informe produto, quantidade e unidade do estoque.');
            return;
        }

        if (!stock[product]) {
            stock[product] = { quantity: 0, unit };
        }
        stock[product].quantity = (stock[product].quantity || 0) + quantity;
        stock[product].unit = unit;

        domElements.addToStockForm.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.renderStockTable();

        if (window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.upsertStock({
                    product,
                    quantity: stock[product].quantity,
                    unit: stock[product].unit
                });
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao sincronizar estoque no Supabase:', error);
            }
        }
    },

    openEditStockModal: function(product) {
        if (!product || !stock[product] || !domElements.editStockModal) return;
        domElements.editStockProductName.value = product;
        domElements.editStockQuantityInput.value = stock[product].quantity || 0;
        domElements.editStockModal.style.display = 'flex';
        requestAnimationFrame(() => domElements.editStockModal.classList.add('is-open'));
    },

    handleSaveStockEdit: async function() {
        const product = domElements.editStockProductName?.value;
        const quantity = parseFloat(domElements.editStockQuantityInput?.value);
        if (!product || isNaN(quantity) || quantity < 0) {
            alert('Informe uma quantidade válida.');
            return;
        }
        if (!stock[product]) return;
        stock[product].quantity = quantity;
        window.Main.saveDataToLocalStorage();
        this.closeEditStockModal();
        window.UI.renderStockTable();

        if (window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.upsertStock({
                    product,
                    quantity: stock[product].quantity,
                    unit: stock[product].unit
                });
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao atualizar estoque no Supabase:', error);
            }
        }
    },

    handleDeleteStock: async function(product) {
        if (!product || !stock[product]) return;
        if (!confirm('Deseja remover este item do estoque?')) return;
        delete stock[product];
        window.Main.saveDataToLocalStorage();
        window.UI.renderStockTable();

        if (window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.deleteStockItem(product);
                if (error) throw error;
            } catch (error) {
                console.error('Erro ao remover estoque no Supabase:', error);
            }
        }
    },

    closeEditStockModal: function() {
        if (!domElements.editStockModal) return;
        domElements.editStockModal.classList.remove('is-open');
        setTimeout(() => {
            domElements.editStockModal.style.display = 'none';
        }, 220);
    },

    handleAddUnitConversion: function() {
        if (!window.UnitConversions) return;
        const source = domElements.conversionSourceUnitSelect?.value;
        const target = domElements.conversionTargetUnitSelect?.value;
        const quantity = parseFloat(domElements.conversionQuantityInput?.value);

        if (!source || !target || isNaN(quantity) || quantity <= 0) {
            alert('Informe unidades e quantidade para a conversão.');
            return;
        }
        if (source === target) {
            alert('Selecione unidades diferentes para converter.');
            return;
        }

        window.UnitConversions.conversions = window.UnitConversions.conversions || [];
        window.UnitConversions.conversions.push({ sourceUnit: source, targetUnit: target, quantity });
        window.UnitConversions.saveConversions();
        domElements.addUnitConversionForm.reset();
        window.UI.renderUnitConversionsTable();
    },

    handleDeleteUnitConversion: function(index) {
        if (!window.UnitConversions || index < 0) return;
        const conversions = window.UnitConversions.conversions || [];
        if (!conversions[index]) return;
        if (!confirm('Deseja remover esta conversão?')) return;
        conversions.splice(index, 1);
        window.UnitConversions.saveConversions();
        window.UI.renderUnitConversionsTable();
    },

    handleAddProductToKit: async function(form, kitType) {
        if (!kitType || !kits[kitType] || !form) return;
        const productSelect = form.querySelector('.kit-product-select');
        const quantityInput = form.querySelector('.kit-quantity');
        const unitSelect = form.querySelector('.kit-unit-select');

        const productName = productSelect?.value?.trim();
        const quantity = parseFloat(quantityInput?.value);
        const unit = unitSelect?.value?.trim();

        if (!productName || isNaN(quantity) || quantity <= 0 || !unit) {
            alert('Informe produto, quantidade e unidade válidos para o kit.');
            return;
        }

        const existingIndex = kits[kitType].findIndex(item => item.product === productName && item.unit === unit);
        if (existingIndex >= 0) {
            kits[kitType][existingIndex].quantity = quantity;
        } else {
            kits[kitType].push({ product: productName, quantity, unit });
        }

        form.reset();
        window.Main.saveDataToLocalStorage();
        window.UI.renderKitProducts(kitType);

        if (window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.syncKitType(kitType, kits[kitType]);
                if (error) throw error;
            } catch (error) {
                console.error(`Erro ao sincronizar kit ${kitType} no Supabase:`, error);
            }
        }
    },

    handleRemoveKitItem: async function(kitType, index) {
        if (!kitType || !kits[kitType] || index < 0) return;
        kits[kitType].splice(index, 1);
        window.Main.saveDataToLocalStorage();
        window.UI.renderKitProducts(kitType);

        if (window.isSupabaseConfigured?.()) {
            try {
                const { error } = await window.syncKitType(kitType, kits[kitType]);
                if (error) throw error;
            } catch (error) {
                console.error(`Erro ao sincronizar kit ${kitType} no Supabase:`, error);
            }
        }
    },

    deleteOrder: function(orderId) {
        // This function is now handled by the modal confirmation flow
        // It will be called by handleConfirmDeleteOrder
    },

    editOrder: function(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (order) {
            editingOrderId = orderId;
            window.Modals.showOrderDetailsModal(order);
        }
    },

    cancelOrderEdit: function() {
        editingOrderId = null;
        domElements.orderSchoolSelect.value = '';
        currentOrderProducts = [];
        window.UI.renderCurrentOrderProducts();
        domElements.orderObservationsInput.value = '';
        domElements.saveOrderBtn.textContent = 'Salvar e Gerar PDF';
        domElements.cancelEditBtn.style.display = 'none';
        window.UI.updateOrderHeroSummary();
    }
};

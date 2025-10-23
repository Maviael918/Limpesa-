window.Main = {
    loadDataFromLocalStorage: function() {
        try {
            schools = JSON.parse(localStorage.getItem('schools')) || [];
            products = JSON.parse(localStorage.getItem('products')) || [];
            units = JSON.parse(localStorage.getItem('units')) || [];
            stock = JSON.parse(localStorage.getItem('stock')) || {};
            kits = JSON.parse(localStorage.getItem('kits')) || { p: [], m: [], g: [] };
            orders = JSON.parse(localStorage.getItem('orders')) || [];
            pdfSettings = JSON.parse(localStorage.getItem('pdfSettings')) || {};
            console.log('Dados carregados do localStorage');
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage:', error);
            // Inicializar com arrays vazios em caso de erro
            schools = [];
            products = [];
            units = [];
            stock = {};
            kits = { p: [], m: [], g: [] };
            orders = [];
            pdfSettings = {};
        }
    },

    saveDataToLocalStorage: function() {
        try {
            localStorage.setItem('schools', JSON.stringify(schools));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('units', JSON.stringify(units));
            localStorage.setItem('stock', JSON.stringify(stock));
            localStorage.setItem('kits', JSON.stringify(kits));
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('pdfSettings', JSON.stringify(pdfSettings));
            console.log('Dados salvos no localStorage');
        } catch (error) {
            console.error('Erro ao salvar dados no localStorage:', error);
        }
    },

    initializeData: async function() {
        this.loadDataFromLocalStorage();
        try {
            const result = await window.SyncManager.syncInitialData({ forceRefresh: true });
            if (!result?.skipped) {
                this.loadDataFromLocalStorage(); // Recarrega dados atualizados
            }
        } catch (error) {
            console.error('Erro ao buscar dados iniciais do Supabase:', error);
            alert('Não foi possível buscar os dados iniciais do servidor. A aplicação pode não funcionar corretamente.');
        }
        window.UI.reRenderUI();
    },

    init: function() {
        console.log('Inicializando DOM elements...');
        
        // Inicializar elementos DOM
        domElements = {
            // Pages and Navigation
            pages: document.querySelectorAll('.page'),
            navLinks: document.querySelectorAll('.sidebar nav a[data-page]'),

            // Settings Tabs
            tabLinks: document.querySelectorAll('.tab-link'),
            tabContents: document.querySelectorAll('.tab-content'),

            // Order actions (admin)
            openProductsModalBtn: document.getElementById('open-products-modal-btn'),
            saveOrderBtn: document.getElementById('save-order-btn'),
            printOrderBtn: document.getElementById('print-order-btn'),
            cancelEditBtn: document.getElementById('cancel-edit-btn'),

            // School Selection Modal
            schoolSelectionModal: document.getElementById('school-selection-modal'),
            modalCloseButton: document.querySelector('#school-selection-modal .close-button'),
            modalSchoolSelect: document.getElementById('modal-school-select'),
            modalSectorSelect: document.getElementById('modal-sector-select'),
            confirmKitSchoolBtn: document.getElementById('confirm-kit-school-btn'),

            // Kit Configuration
            configureKitsBtn: document.getElementById('configure-kits-btn'),
            kitConfigurationSection: document.getElementById('kit-configuration'),
            closeKitConfigBtns: document.querySelectorAll('.close-kit-config'),
            kitTabLinks: document.querySelectorAll('.kit-tab-link'),
            kitTabContents: document.querySelectorAll('.kit-tab-content'),
            selectKitPBtn: document.getElementById('select-kit-p'),
            selectKitMBtn: document.getElementById('select-kit-m'),
            selectKitGBtn: document.getElementById('select-kit-g'),

            // Forms and Inputs - Schools
            addSchoolForm: document.getElementById('add-school-form'),
            schoolNameInput: document.getElementById('school-name'),
            schoolSectorInput: document.getElementById('school-sector'),
            schoolManagerNameInput: document.getElementById('school-manager-name'),
            schoolAddressInput: document.getElementById('school-address'),
            schoolModalityInput: document.getElementById('school-modality'),
            schoolStudentsInput: document.getElementById('school-students'),
            schoolsTable: document.getElementById('schools-table')?.querySelector('tbody'),
            
            // Forms and Inputs - Products
            addProductForm: document.getElementById('add-product-form'),
            productNameInput: document.getElementById('product-name'),
            productsTable: document.getElementById('products-table')?.querySelector('tbody'),

            // Forms and Inputs - Units
            addUnitForm: document.getElementById('add-unit-form'),
            unitNameInput: document.getElementById('unit-name'),
            unitsTable: document.getElementById('units-table')?.querySelector('tbody'),

            // Unit conversions
            addUnitConversionForm: document.getElementById('add-unit-conversion-form'),
            conversionSourceUnitSelect: document.getElementById('conversion-source-unit'),
            conversionTargetUnitSelect: document.getElementById('conversion-target-unit'),
            conversionQuantityInput: document.getElementById('conversion-quantity'),
            unitConversionsTable: document.getElementById('unit-conversions-table')?.querySelector('tbody'),

            // Forms and Inputs - Stock
            addToStockForm: document.getElementById('add-to-stock-form'),
            stockProductSelect: document.getElementById('stock-product-select'),
            stockQuantityInput: document.getElementById('stock-quantity'),
            stockUnitSelect: document.getElementById('stock-unit-select'),
            stockTable: document.getElementById('stock-table')?.querySelector('tbody'),
            
            // Stock Modal
            editStockModal: document.getElementById('edit-stock-modal'),
            editStockForm: document.getElementById('edit-stock-form'),
            editStockProductName: document.getElementById('edit-stock-product-name'),
            editStockQuantityInput: document.getElementById('edit-stock-quantity'),
            closeEditStockModal: document.querySelector('#edit-stock-modal .close-button'),

            // Orders
            newOrderForm: document.getElementById('new-order-form'),
            orderSchoolSelect: document.getElementById('order-school-select'),
            orderSectorFilter: document.getElementById('order-sector-filter'),
            orderObservationsInput: document.getElementById('order-observations'),
            addProductToOrderForm: document.getElementById('add-product-to-order-form'),
            orderProductSelect: document.getElementById('order-product-select'),
            orderQuantityInput: document.getElementById('order-quantity'),
            orderUnitSelect: document.getElementById('order-unit-select'),
            currentOrderTable: document.getElementById('current-order-table')?.querySelector('tbody'),
            ordersTable: document.getElementById('orders-table')?.querySelector('tbody'),
            emptyOrderMessage: document.getElementById('empty-order-message'),

            // PDF
            pdfSettingsForm: document.getElementById('pdf-settings-form'),
            previewPdfBtn: document.getElementById('preview-pdf-btn'),
            syncSupabaseBtn: document.getElementById('sync-supabase-btn'),
            
            // Layout Editor
            editLayoutBtn: document.getElementById('edit-layout-btn'),
            layoutEditorModal: document.getElementById('layout-editor-modal'),
            editorPageContainer: document.getElementById('editor-page-container'),
            closeLayoutEditor: document.getElementById('close-layout-editor'),
            saveLayoutBtn: document.getElementById('save-layout-btn'),
            cancelLayoutBtn: document.getElementById('cancel-layout-btn'),
            
            // PDF Preview
            pdfPreviewModal: document.getElementById('pdf-preview-modal'),
            closePdfPreview: document.getElementById('close-pdf-preview'),
            pdfPreviewIframe: document.getElementById('pdf-preview-iframe'),
            confirmProductsBtn: document.getElementById('confirm-products-btn'),
            productsSelectionModal: document.getElementById('products-selection-modal'),
            productsModalTbody: document.getElementById('products-modal-tbody'),
            addedProductsTbody: document.getElementById('added-products-tbody'),
            productSearchInput: document.getElementById('product-search-input'),
            noProductsMessage: document.getElementById('no-products-message'),
            quickKitModal: document.getElementById('quick-kit-modal'),
            addKitToOrderBtn: document.getElementById('add-kit-to-order-btn'),
            orderConfirmationModal: document.getElementById('order-confirmation-modal'),
            confirmOrderBtn: document.getElementById('confirm-order-btn'),
            summarySchoolName: document.getElementById('summary-school-name'),
            summarySchoolSector: document.getElementById('summary-school-sector'),
            summaryObservations: document.getElementById('summary-observations'),
            summaryProductsTbody: document.getElementById('summary-products-tbody'),
            summaryTotalItems: document.getElementById('summary-total-items'),
            detailOrderDate: document.getElementById('detail-order-date'),
            detailOrderSchool: document.getElementById('detail-order-school'),
            detailOrderObservations: document.getElementById('detail-order-observations'),
            detailProductsTbody: document.getElementById('detail-products-tbody'),
            saveOrderDetailsBtn: document.getElementById('save-order-details-btn'),
            deleteOrderBtn: document.getElementById('delete-order-btn'),
            deleteOrderConfirmationModal: document.getElementById('delete-order-confirmation-modal'),
            confirmDeleteOrderBtn: document.getElementById('confirm-delete-order-btn'),

            // Sync Panel
            pullFromSupabaseBtn: document.getElementById('pull-from-supabase'),
            pushToSupabaseBtn: document.getElementById('push-to-supabase'),
            fullSyncBtn: document.getElementById('full-sync'),
            checkSupabaseConnectionBtn: document.getElementById('check-supabase-connection'),
            exportBackupBtn: document.getElementById('export-backup'),
            importBackupInput: document.getElementById('import-backup'),
            resetSyncSettingsBtn: document.getElementById('reset-sync-settings'),
            syncStatus: document.getElementById('sync-status'),
            localStats: document.getElementById('local-stats'),
            syncResults: document.getElementById('sync-results'),
            syncResultsContent: document.getElementById('sync-results-content')
        };
        
        console.log('DOM elements inicializados:', Object.keys(domElements).length);
    }
};

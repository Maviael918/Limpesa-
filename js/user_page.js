// user_page.js - Lógica específica para a página de usuário simplificada

// Global data cache
let schools = [];
let products = [];
let units = [];
let kits = { p: [], m: [], g: [] };
let orders = [];
let pdfSettings = {};
let currentOrderProducts = [];
let editingOrderId = null;
let orderHistorySearchTerm = '';
let hasLoggedLocalLoad = false;

let domElements = {}; // Para armazenar referências aos elementos DOM

// Flag para controlar o re-render da UI
let isRendering = false;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado para user_page, inicializando aplicação...');
    
    try {
        window.Main.init();
        window.Events.setupEventListeners(); 
        await window.Main.initializeData();
        
        if (window.Modals) {
            window.Modals.setupEventListeners(); 
            console.log('Modais interativos inicializados com sucesso!');
        }
        
        if (window.UnitConversions) {
            window.UnitConversions.init();
            console.log('Módulo de conversões de unidades inicializado com sucesso!');
        }
        
        // A página de usuário sempre mostrará a seção de pedidos
        window.UI.showPage('orders'); 
        
        console.log('Aplicação de usuário inicializada com sucesso!');
    } catch (error) {
        console.error('Erro na inicialização da user_page:', error);
        alert('Erro ao inicializar a aplicação. Verifique o console para detalhes.');
    }
});

window.Main = {
    loadDataFromLocalStorage: function() {
        try {
            schools = JSON.parse(localStorage.getItem('schools')) || [];
            products = JSON.parse(localStorage.getItem('products')) || [];
            units = JSON.parse(localStorage.getItem('units')) || [];
            kits = JSON.parse(localStorage.getItem('kits')) || { p: [], m: [], g: [] };
            orders = JSON.parse(localStorage.getItem('orders')) || [];
            if (!Array.isArray(orders)) orders = [];
            orders = orders.map(order => {
                const fallbackCreated = order?.created_at || order?.order_date || new Date().toISOString();
                return {
                    ...order,
                    pendingSync: !!order?.pendingSync,
                    wasSynced: order?.wasSynced ?? (!!order?.id && !order?.pendingSync),
                    localCreatedAt: order?.localCreatedAt || fallbackCreated,
                    lastSyncError: order?.lastSyncError || null
                };
            });
            pdfSettings = window.PDF.loadPdfSettings(); // Load PDF settings via PDF module
            console.log('Dados carregados do cache local para user_page');
            if (!hasLoggedLocalLoad && window.StatusConsole) {
                window.StatusConsole.log('Dados carregados do cache local', 'info');
                hasLoggedLocalLoad = true;
            }
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage para user_page:', error);
            schools = [];
            products = [];
            units = [];
            kits = { p: [], m: [], g: [] };
            orders = [];
            pdfSettings = window.PDF.defaultPdfSettings; // Use default if error
        }
    },

    saveDataToLocalStorage: function() {
        try {
            localStorage.setItem('schools', JSON.stringify(schools));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('units', JSON.stringify(units));
            localStorage.setItem('kits', JSON.stringify(kits));
            localStorage.setItem('orders', JSON.stringify(orders));
            // pdfSettings are saved via window.PDF.savePdfSettings()
            console.log('Dados salvos no localStorage para user_page');
            window.StatusConsole?.log('Cache local atualizado (user_page)', 'info');
        } catch (error) {
            console.error('Erro ao salvar dados no localStorage para user_page:', error);
        }
    },

    initializeData: async function() {
        this.loadDataFromLocalStorage();
        try {
            const result = await window.SyncManager.syncInitialData({ forceRefresh: true });
            if (!result?.skipped) {
                this.loadDataFromLocalStorage(); // Recarrega os dados atualizados
            }
        } catch (error) {
            console.error('Erro ao buscar dados iniciais do Supabase para user_page:', error);
            alert('Não foi possível buscar os dados iniciais do servidor. A aplicação pode não funcionar corretamente.');
        }
        window.UI.reRenderUI(); // Re-renderiza a UI com os dados carregados
    },

    init: function() {
        console.log('Inicializando DOM elements para user_page...');
        
        domElements = {
            // Orders Page Elements
            orderSchoolSelect: document.getElementById('order-school-select'),
            orderSectorFilter: document.getElementById('order-sector-filter'),
            orderObservationsInput: document.getElementById('order-observations'),
            currentOrderTable: document.getElementById('current-order-table')?.querySelector('tbody'),
            emptyOrderMessage: document.getElementById('empty-order-message'),
            openProductsModalBtn: document.getElementById('open-products-modal-btn'),
            saveOrderBtn: document.getElementById('save-order-btn'),
            printOrderBtn: document.getElementById('print-order-btn'),
            cancelEditBtn: document.getElementById('cancel-edit-btn'),
            ordersTable: document.getElementById('orders-table')?.querySelector('tbody'),
            orderHistorySearchInput: document.getElementById('order-history-search-input'),
            orderHistorySearchBtn: document.getElementById('order-history-search-btn'),

            // Quick Kits Buttons
            selectKitPBtn: document.getElementById('select-kit-p'),
            selectKitMBtn: document.getElementById('select-kit-m'),
            selectKitGBtn: document.getElementById('select-kit-g'),
            
            // Modals (all modals are kept as they might be used for order/pdf flow)
            pdfPreviewModal: document.getElementById('pdf-preview-modal'),
            closePdfPreview: document.getElementById('close-pdf-preview'),
            pdfPreviewIframe: document.getElementById('pdf-preview-iframe'),
            editLayoutBtn: document.getElementById('edit-layout-btn'), 
            layoutEditorModal: document.getElementById('layout-editor-modal'),
            editorPageContainer: document.getElementById('editor-page-container'),
            closeLayoutEditor: document.getElementById('close-layout-editor'),
            saveLayoutBtn: document.getElementById('save-layout-btn'),
            cancelLayoutBtn: document.getElementById('cancel-layout-btn'),
            schoolSelectionModal: document.getElementById('school-selection-modal'),
            modalCloseButton: document.querySelector('#school-selection-modal .close-button'),
            modalSchoolSelect: document.getElementById('modal-school-select'),
            modalSectorSelect: document.getElementById('modal-sector-select'),
            confirmKitSchoolBtn: document.getElementById('confirm-kit-school-btn'),
            orderConfirmationModal: document.getElementById('order-confirmation-modal'),
            confirmOrderBtn: document.getElementById('confirm-order-btn'),
            quickKitModal: document.getElementById('quick-kit-modal'),
            addKitToOrderBtn: document.getElementById('add-kit-to-order-btn'),
            orderDetailsModal: document.getElementById('order-details-modal'),
            saveOrderDetailsBtn: document.getElementById('save-order-details-btn'),
            deleteOrderBtn: document.getElementById('delete-order-btn'),
            deleteOrderConfirmationModal: document.getElementById('delete-order-confirmation-modal'),
            confirmDeleteOrderBtn: document.getElementById('confirm-delete-order-btn'),
            productsSelectionModal: document.getElementById('products-selection-modal'),
            productSearchInput: document.getElementById('product-search-input'),
            productsModalTbody: document.getElementById('products-modal-tbody'),
            addedProductsTbody: document.getElementById('added-products-tbody'),
            noProductsMessage: document.getElementById('no-products-message'),
            confirmProductsBtn: document.getElementById('confirm-products-btn'),
            
            // Summary elements for order confirmation modal
            summarySchoolName: document.getElementById('summary-school-name'),
            summarySchoolSector: document.getElementById('summary-school-sector'),
            summaryObservations: document.getElementById('summary-observations'),
            summaryProductsTbody: document.getElementById('summary-products-tbody'),
            summaryTotalItems: document.getElementById('summary-total-items'),

            // Detail elements for order details modal
            detailOrderDate: document.getElementById('detail-order-date'),
            detailOrderSchool: document.getElementById('detail-order-school'),
            detailOrderObservations: document.getElementById('detail-order-observations'),
            detailProductsTbody: document.getElementById('detail-products-tbody'),
        };
        
        console.log('DOM elements inicializados para user_page:', Object.keys(domElements).length);
        window.StatusConsole?.init();
    }
};

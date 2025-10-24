// script.js - Código completo e corrigido
let isRendering = false;
let domElements = {};
let selectedKitProducts = [];

// Global data cache
let schools = [];
let products = [];
let foodProducts = [];
let units = [];
let stock = {};
let kits = { p: [], m: [], g: [] };
let orders = [];
let pdfSettings = {};
let currentOrderProducts = [];
let orderHistorySearchTerm = '';
let editingOrderId = null;
let editingSchoolIndex = null;
let editingProductIndex = null;
let editingFoodProductIndex = null;
let editingUnitIndex = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    try {
        window.Main.init();
        window.Events.setupEventListeners();
        await window.Main.initializeData(); // Changed this line
        
        // Inicializar modais interativos
        if (window.Modals) {
            window.Modals.setupEventListeners();
            console.log('Modais interativos inicializados com sucesso!');
        }
        
        // Inicializar módulo de conversões de unidades
        if (window.UnitConversions) {
            window.UnitConversions.init();
            console.log('Módulo de conversões de unidades inicializado com sucesso!');
            window.UI.renderUnitConversionsTable();
        }

        // Show requested page/tab or default orders
        const targetPage = localStorage.getItem('ckpTargetPage') || 'orders';
        window.UI.showPage(targetPage);
        const targetTab = localStorage.getItem('ckpTargetTab');
        if (targetTab) {
            window.UI.showTab(targetTab);
        }

        // Limpar direcionamento após uso
        try {
            localStorage.removeItem('ckpTargetPage');
            localStorage.removeItem('ckpTargetTab');
        } catch (_) {}
        
        console.log('Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        alert('Erro ao inicializar a aplicação. Verifique o console para detalhes.');
    }
});

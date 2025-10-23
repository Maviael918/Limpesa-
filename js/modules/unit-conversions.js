// unit-conversions.js - Gerenciador de Conversões de Unidades de Medida (para user_page)

window.UnitConversions = {
    conversions: [],

    // Carregar conversões do localStorage
    loadConversions: function() {
        try {
            this.conversions = JSON.parse(localStorage.getItem('unitConversions')) || [];
            console.log('Conversões de unidades carregadas para user_page:', this.conversions);
        } catch (error) {
            console.error('Erro ao carregar conversões para user_page:', error);
            this.conversions = [];
        }
    },

    // Salvar conversões no localStorage (apenas se houver alguma alteração via admin, não pela user_page)
    saveConversions: function() {
        try {
            localStorage.setItem('unitConversions', JSON.stringify(this.conversions));
            console.log('Conversões de unidades salvas para user_page');
        } catch (error) {
            console.error('Erro ao salvar conversões para user_page:', error);
        }
    },

    // Converter quantidade entre unidades
    convertQuantity: function(quantity, fromUnit, toUnit) {
        // Se as unidades são iguais, retornar a quantidade original
        if (fromUnit === toUnit) {
            return quantity;
        }

        // Procurar conversão direta
        const directConversion = this.conversions.find(c => 
            c.sourceUnit === fromUnit && c.targetUnit === toUnit
        );

        if (directConversion) {
            return quantity * directConversion.quantity;
        }

        // Procurar conversão inversa
        const inverseConversion = this.conversions.find(c => 
            c.sourceUnit === toUnit && c.targetUnit === fromUnit
        );

        if (inverseConversion) {
            return quantity / inverseConversion.quantity;
        }

        // Se não houver conversão, retornar a quantidade original
        console.warn(`Nenhuma conversão encontrada de ${fromUnit} para ${toUnit} na user_page`);
        return quantity;
    },

    // Inicializar o módulo
    init: function() {
        this.loadConversions();
        console.log('Módulo de conversões de unidades inicializado para user_page');
    }
};

console.log('Unit Conversions module loaded successfully for user_page');
// supabase.js - Cliente e funções utilitárias para sincronização automática

const SUPABASE_LOG_PREFIX = '[Supabase]';
const ORDER_HISTORY_TABLE = 'order_history';

function isSupabaseConfigured() {
    return typeof window !== 'undefined' &&
        window.supabaseClient &&
        typeof window.supabaseClient.from === 'function';
}

function getClientOrError(operationName) {
    if (!isSupabaseConfigured()) {
        const error = new Error('Supabase não configurado');
        console.warn(`${SUPABASE_LOG_PREFIX} ${operationName}: ${error.message}`);
        window.StatusConsole?.setConnection?.('offline', 'Supabase não configurado');
        window.StatusConsole?.log?.(`Supabase não configurado (${operationName})`, 'warning');
        return { client: null, error };
    }
    return { client: window.supabaseClient, error: null };
}

function normalizeOrderDate(orderData) {
    if (!orderData) return new Date().toISOString().split('T')[0];

    const rawDate = orderData.order_date || orderData.date;
    if (!rawDate) {
        return new Date().toISOString().split('T')[0];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return rawDate;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
        const [day, month, year] = rawDate.split('/');
        return `${year}-${month}-${day}`;
    }

    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
}

async function upsertSchool(schoolData) {
    const { client, error: configError } = getClientOrError('Upsert escola');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const payload = {
            name: schoolData.name,
            sector: schoolData.sector,
            manager_name: schoolData.managerName,
            address: schoolData.address,
            modality: schoolData.modality,
            students: schoolData.students
        };

        const { data, error } = await client
            .from('schools')
            .upsert(payload, { onConflict: 'name' })
            .select()
            .single();

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Escola sincronizada`, data);
        return { data, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao sincronizar escola:`, error);
        return { data: null, error };
    }
}

async function deleteSchoolByName(name) {
    const { client, error: configError } = getClientOrError('Remover escola');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error } = await client
            .from('schools')
            .delete()
            .eq('name', name);

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Escola removida`, name);
        return { data: true, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao remover escola:`, error);
        return { data: null, error };
    }
}

async function upsertProduct(productData) {
    const { client, error: configError } = getClientOrError('Upsert produto');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { data, error } = await client
            .from('products')
            .upsert({ name: productData.name }, { onConflict: 'name' })
            .select()
            .single();

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Produto sincronizado`, data);
        return { data, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao sincronizar produto:`, error);
        return { data: null, error };
    }
}

async function deleteProductByName(name) {
    const { client, error: configError } = getClientOrError('Remover produto');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error } = await client
            .from('products')
            .delete()
            .eq('name', name);

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Produto removido`, name);
        return { data: true, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao remover produto:`, error);
        return { data: null, error };
    }
}

async function upsertUnit(unitData) {
    const { client, error: configError } = getClientOrError('Upsert unidade');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { data, error } = await client
            .from('units')
            .upsert({ name: unitData.name }, { onConflict: 'name' })
            .select()
            .single();

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Unidade sincronizada`, data);
        return { data, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao sincronizar unidade:`, error);
        return { data: null, error };
    }
}

async function deleteUnitByName(name) {
    const { client, error: configError } = getClientOrError('Remover unidade');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error } = await client
            .from('units')
            .delete()
            .eq('name', name);

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Unidade removida`, name);
        return { data: true, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao remover unidade:`, error);
        return { data: null, error };
    }
}

async function upsertStock(stockData) {
    const { client, error: configError } = getClientOrError('Upsert estoque');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const payload = {
            product: stockData.product,
            quantity: Number(stockData.quantity) || 0,
            unit: stockData.unit
        };

        const { data, error } = await client
            .from('stock')
            .upsert(payload, { onConflict: 'product' })
            .select()
            .single();

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Estoque sincronizado`, data);
        return { data, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao sincronizar estoque:`, error);
        return { data: null, error };
    }
}

async function deleteStockItem(productName) {
    const { client, error: configError } = getClientOrError('Remover item de estoque');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error } = await client
            .from('stock')
            .delete()
            .eq('product', productName);

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Estoque removido para`, productName);
        return { data: true, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao remover item de estoque:`, error);
        return { data: null, error };
    }
}

async function replaceKitItems(kitType, items) {
    const { client, error: configError } = getClientOrError(`Sincronizar kit ${kitType}`);
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error: deleteError } = await client
            .from('kits')
            .delete()
            .eq('kit_type', kitType);

        if (deleteError) throw deleteError;

        if (!items || items.length === 0) {
            console.log(`${SUPABASE_LOG_PREFIX} Kit ${kitType} limpo (sem itens)`);
            return { data: [], error: null };
        }

        const payload = items.map(item => ({
            kit_type: kitType,
            product: item
        }));

        const { data, error } = await client
            .from('kits')
            .insert(payload)
            .select();

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Kit ${kitType} sincronizado com ${data.length} itens`);
        return { data, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao sincronizar kit ${kitType}:`, error);
        return { data: null, error };
    }
}

async function saveOrder(orderData) {
    const { client, error: configError } = getClientOrError('Salvar pedido');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const isUpdate = !!(orderData?.id) && !!orderData?.wasSynced && !orderData?.pendingSync;
        const orderDate = normalizeOrderDate(orderData);
        const payload = {
            order_date: orderDate,
            school_data: orderData.school,
            items_data: orderData.items,
            observations: orderData.observations ?? null
        };

        let response;

        if (isUpdate) {
            response = await client
                .from(ORDER_HISTORY_TABLE)
                .update(payload)
                .eq('id', orderData.id)
                .select()
                .maybeSingle();
        } else {
            response = await client
                .from(ORDER_HISTORY_TABLE)
                .insert(payload)
                .select()
                .maybeSingle();
        }

        if (response.error) throw response.error;

        const saved = response.data || null;
        console.log(`${SUPABASE_LOG_PREFIX} Pedido ${isUpdate ? 'atualizado' : 'criado'}`, saved);
        return { data: saved, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao salvar pedido:`, error);
        return { data: null, error };
    }
}

async function deleteOrder(orderId) {
    const { client, error: configError } = getClientOrError('Remover pedido');
    if (configError) {
        return { data: null, error: configError };
    }

    try {
        const { error } = await client
            .from(ORDER_HISTORY_TABLE)
            .delete()
            .eq('id', orderId);

        if (error) throw error;

        console.log(`${SUPABASE_LOG_PREFIX} Pedido removido`, orderId);
        return { data: true, error: null };
    } catch (error) {
        console.error(`${SUPABASE_LOG_PREFIX} Erro ao remover pedido:`, error);
        return { data: null, error };
    }
}

// Export globals para o restante da aplicação
window.isSupabaseConfigured = isSupabaseConfigured;
window.upsertSchool = upsertSchool;
window.deleteSchoolByName = deleteSchoolByName;
window.upsertProduct = upsertProduct;
window.deleteProductByName = deleteProductByName;
window.upsertUnit = upsertUnit;
window.deleteUnitByName = deleteUnitByName;
window.upsertStock = upsertStock;
window.deleteStockItem = deleteStockItem;
window.syncKitType = replaceKitItems;
window.upsertKit = replaceKitItems; // compatibilidade com chamadas existentes
window.saveOrder = saveOrder;
window.insertOrder = saveOrder; // compatibilidade retroativa
window.deleteOrder = deleteOrder;
window.ORDER_HISTORY_TABLE = ORDER_HISTORY_TABLE;

console.log(`${SUPABASE_LOG_PREFIX} Módulo carregado`);

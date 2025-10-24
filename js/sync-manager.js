// sync-manager.js - Sincronização automática de leitura com Supabase (user_page)

class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.lastSync = null;
        this.syncStatus = 'idle'; // idle, syncing, success, error
    }

    // Verificar se o Supabase está configurado
    isSupabaseConfigured() {
        const configured = !!(window.supabaseClient && window.supabaseClient.from);
        console.log('Supabase configured:', configured);
        return configured;
    }

    async syncInitialData(options = {}) {
        const { forceRefresh = false } = options;

        if (this.isSyncing) {
            console.log('🔁 Sincronização já em andamento, aguardando conclusão...');
        }

        if (!forceRefresh && this.lastSync) {
            const elapsed = Date.now() - this.lastSync.getTime();
            // Evita sincronizações em sequência caso o usuário reabra a aba rapidamente
            if (elapsed < 5000) {
                console.log('⏭️ Ignorando sincronização: última execução ocorreu há menos de 5 segundos.');
                window.StatusConsole?.setConnection?.('online', 'Sincronização recente reaproveitada');
                window.StatusConsole?.log?.('Sincronização recente reaproveitada', 'info');
                return { success: true, skipped: true, message: 'Sincronização recente reutilizada.' };
            }
        }

        return await this.pullFromSupabase();
    }

    async pushPendingOrders(results) {
        const globalOrders = Array.isArray(window.orders) ? window.orders : [];
        const pendingOrders = globalOrders.filter(order => order?.pendingSync);
        if (!pendingOrders.length) {
            return { total: 0, successCount: 0, failureCount: 0 };
        }

        const total = pendingOrders.length;

        window.StatusConsole?.log?.(`Sincronizando ${total} pedido(s) pendentes`, 'pending');

        let successCount = 0;
        let failureCount = 0;

        for (const order of pendingOrders) {
            const isRemote = !!order?.wasSynced && !!order?.id;
            const payload = { ...order, pendingSync: !isRemote };

            try {
                const { data, error } = await window.saveOrder(payload);
                if (error || !data?.id) throw error || new Error('Resposta inválida do Supabase');

                order.id = data.id;
                order.order_date = data.order_date;
                order.created_at = data.created_at;
                order.pendingSync = false;
                order.wasSynced = true;
                order.syncedAt = new Date().toISOString();
                order.lastSyncError = null;
                successCount++;
            } catch (err) {
                console.error('Erro ao sincronizar pedido pendente:', err);
                order.pendingSync = true;
                order.lastSyncError = err?.message || 'Erro desconhecido';
                failureCount++;
            }
        }

        if (pendingOrders.length > 0) {
            window.Main?.saveDataToLocalStorage?.();
            window.UI?.renderOrders?.();
        }

        if (successCount > 0) {
            window.StatusConsole?.log?.(`${successCount} pedido(s) pendentes sincronizados`, 'success');
        }

        if (failureCount > 0) {
            window.StatusConsole?.setConnection?.('degraded', 'Alguns pedidos continuam pendentes');
            window.StatusConsole?.log?.(`${failureCount} pedido(s) permaneceram pendentes`, 'warning');
        }

        return { total, successCount, failureCount };
    }

    // ========== SINCRONIZAÇÃO AUTOMÁTICA - PUXAR DO SUPABASE ==========
    async pullFromSupabase() {
        if (!this.isSupabaseConfigured()) {
            window.StatusConsole?.setConnection?.('offline', 'Supabase não configurado');
            window.StatusConsole?.log?.('Supabase não configurado - utilizando dados do cache local', 'warning');
            throw new Error('Supabase não está configurado. Verifique as credenciais.');
        }

        this.isSyncing = true;
        this.syncStatus = 'syncing';
        // No updateSyncUI() for user_page
        window.StatusConsole?.setSyncing?.('Sincronizando dados com o Supabase...');
        window.StatusConsole?.log?.('Sincronização com o Supabase iniciada', 'pending');

        try {
            console.log('🔄 Iniciando sincronização inicial com o Supabase (user_page)...');

            const results = {
                schools: { count: 0, success: true },
                products: { count: 0, success: true },
                units: { count: 0, success: true },
                kits: { count: 0, success: true },
                stock: { count: 0, success: true },
                orders: { count: 0, success: true }
            };

            const pendingSyncResult = await this.pushPendingOrders(results);

            // 1. Puxar Escolas
            try {
                const { data: schoolsData, error: schoolsError } = await window.supabaseClient
                    .from('schools')
                    .select('*')
                    .order('name');

                if (schoolsError) throw schoolsError;
                console.log('Supabase schools data:', schoolsData);
                
                if (schoolsData && schoolsData.length > 0) {
                    const formattedSchools = schoolsData.map(school => ({
                        name: school.name,
                        sector: school.sector,
                        managerName: school.manager_name,
                        address: school.address,
                        modality: school.modality,
                        students: school.students
                    }));
                    
                    localStorage.setItem('schools', JSON.stringify(formattedSchools));
                    results.schools.count = formattedSchools.length;
                    console.log(`✅ ${formattedSchools.length} escolas carregadas`);
                } else {
                    console.log('ℹ️ Nenhuma escola encontrada no Supabase');
                }
            } catch (error) {
                results.schools.success = false;
                console.error('❌ Erro ao carregar escolas:', error);
            }

            // 2. Puxar Produtos
            try {
                const { data: productsData, error: productsError } = await window.supabaseClient
                    .from('products')
                    .select('*')
                    .order('name');

                if (productsError) throw productsError;
                console.log('Supabase products data:', productsData);
                
                if (productsData && productsData.length > 0) {
                    const formattedProducts = productsData.map(product => ({
                        name: product.name
                    }));
                    
                    localStorage.setItem('products', JSON.stringify(formattedProducts));
                    results.products.count = formattedProducts.length;
                    console.log(`✅ ${formattedProducts.length} produtos carregados`);
                } else {
                    console.log('ℹ️ Nenhum produto encontrado no Supabase');
                }
            } catch (error) {
                results.products.success = false;
                console.error('❌ Erro ao carregar produtos:', error);
            }

            // 3. Puxar Unidades
            try {
                const { data: unitsData, error: unitsError } = await window.supabaseClient
                    .from('units')
                    .select('*')
                    .order('name');

                if (unitsError) throw unitsError;
                console.log('Supabase units data:', unitsData);
                
                if (unitsData && unitsData.length > 0) {
                    const formattedUnits = unitsData.map(unit => ({
                        name: unit.name
                    }));
                    
                    localStorage.setItem('units', JSON.stringify(formattedUnits));
                    results.units.count = formattedUnits.length;
                    console.log(`✅ ${formattedUnits.length} unidades carregadas`);
                } else {
                    console.log('ℹ️ Nenhuma unidade encontrada no Supabase');
                }
            } catch (error) {
                results.units.success = false;
                console.error('❌ Erro ao carregar unidades:', error);
            }

            // 4. Puxar Kits (agrupados por tipo)
            try {
                const { data: kitsData, error: kitsError } = await window.supabaseClient
                    .from('kits')
                    .select('*')
                    .order('kit_type', { ascending: true })
                    .order('created_at', { ascending: true });

                if (kitsError) throw kitsError;
                console.log('Supabase kits data:', kitsData);

                const groupedKits = { p: [], m: [], g: [] };
                if (kitsData && kitsData.length > 0) {
                    kitsData.forEach(item => {
                        const rawType = (item.kit_type || '').toLowerCase();
                        const kitType = ['p', 'm', 'g'].includes(rawType) ? rawType : 'p';
                        if (!groupedKits[kitType]) {
                            groupedKits[kitType] = [];
                        }

                        const kitEntry = item.product || {};
                        const normalizedEntry = {
                            product: kitEntry.product || kitEntry.name || '',
                            quantity: Number(kitEntry.quantity) || 0,
                            unit: kitEntry.unit || ''
                        };

                        if (normalizedEntry.product) {
                            groupedKits[kitType].push(normalizedEntry);
                        }
                    });

                    localStorage.setItem('kits', JSON.stringify(groupedKits));
                    results.kits.count = Object.values(groupedKits).reduce((acc, arr) => acc + arr.length, 0);
                    console.log(`✅ Kits sincronizados (${results.kits.count} itens no total)`);
                } else {
                    // Garante que localStorage tenha estrutura vazia consistente
                    localStorage.setItem('kits', JSON.stringify(groupedKits));
                    console.log('ℹ️ Nenhum kit cadastrado no Supabase, inicializando estrutura vazia');
                }
            } catch (error) {
                results.kits.success = false;
                console.error('❌ Erro ao carregar kits:', error);
            }

            // 5. Puxar Estoque
            try {
                const { data: stockData, error: stockError } = await window.supabaseClient
                    .from('stock')
                    .select('*')
                    .order('product');

                if (stockError) throw stockError;
                console.log('Supabase stock data:', stockData);

                const formattedStock = {};
                if (stockData && stockData.length > 0) {
                    stockData.forEach(item => {
                        if (!item?.product) return;
                        formattedStock[item.product] = {
                            quantity: Number(item.quantity) || 0,
                            unit: item.unit || ''
                        };
                    });

                    localStorage.setItem('stock', JSON.stringify(formattedStock));
                    results.stock.count = Object.keys(formattedStock).length;
                    console.log(`✅ ${results.stock.count} itens de estoque carregados`);
                } else {
                    localStorage.setItem('stock', JSON.stringify({}));
                    console.log('ℹ️ Nenhum item de estoque encontrado no Supabase');
                }
            } catch (error) {
                results.stock.success = false;
                console.error('❌ Erro ao carregar estoque:', error);
            }

            // 6. Puxar Histórico de Pedidos (todos os registros para pesquisa)
            try {
                const { data: ordersData, error: ordersError } = await window.supabaseClient
                    .from('order_history')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (ordersError) throw ordersError;
                console.log('Supabase orders data:', ordersData);

                const existingOrders = Array.isArray(window.orders) ? window.orders : [];
                const pendingLocal = existingOrders.filter(order => order?.pendingSync);

                if (ordersData && ordersData.length > 0) {
                    const formattedOrders = ordersData.map(order => ({
                        id: order.id,
                        date: order.order_date,
                        school: order.school_data,
                        items: order.items_data,
                        observations: order.observations,
                        created_at: order.created_at,
                        pendingSync: false,
                        wasSynced: true,
                        lastSyncError: null,
                        syncedAt: new Date().toISOString(),
                        localCreatedAt: order.created_at || order.order_date || new Date().toISOString()
                    }));

                    const mergedOrders = [...formattedOrders];
                    const indexById = new Map();
                    mergedOrders.forEach((order, index) => {
                        if (order?.id !== undefined && order?.id !== null) {
                            indexById.set(String(order.id), index);
                        }
                    });

                    pendingLocal.forEach(pending => {
                        const key = pending?.id !== undefined && pending?.id !== null ? String(pending.id) : null;
                        if (key && indexById.has(key)) {
                            const idx = indexById.get(key);
                            mergedOrders[idx] = { ...mergedOrders[idx], ...pending };
                        } else {
                            mergedOrders.push(pending);
                        }
                    });

                    localStorage.setItem('orders', JSON.stringify(mergedOrders));
                    if (Array.isArray(window.orders)) {
                        window.orders.length = 0;
                        mergedOrders.forEach(order => window.orders.push(order));
                    }
                    window.UI?.renderOrders?.();

                    results.orders.count = formattedOrders.length;
                    console.log(`✅ ${formattedOrders.length} pedidos carregados`);
                } else {
                    if (pendingLocal.length > 0) {
                        localStorage.setItem('orders', JSON.stringify(existingOrders));
                    }
                    console.log('ℹ️ Nenhum pedido encontrado no Supabase');
                    results.orders.count = 0;
                }
            } catch (error) {
                results.orders.success = false;
                console.error('❌ Erro ao carregar pedidos:', error);
            }

            this.lastSync = new Date();
            this.syncStatus = 'success';
            // No updateSyncUI() for user_page

            console.log('✅ Sincronização inicial concluída com sucesso para user_page!', results);
            const pendingSyncFailures = pendingSyncResult?.failureCount > 0;
            const successMessage = `Dados sincronizados com o Supabase às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

            if (pendingSyncFailures) {
                window.StatusConsole?.log?.('Sincronização concluída, mas ainda existem pedidos pendentes', 'warning');
            } else {
                window.StatusConsole?.setConnection?.('online', successMessage);
                window.StatusConsole?.log?.('Dados atualizados a partir do Supabase', 'success');
            }
            return {
                success: true,
                message: 'Dados puxados do Supabase com sucesso!',
                results: results,
                pendingSync: pendingSyncResult,
                timestamp: this.lastSync
            };

        } catch (error) {
            this.syncStatus = 'error';
            // No updateSyncUI() for user_page
            
            console.error('❌ Erro na sincronização inicial para user_page:', error);
            window.StatusConsole?.setConnection?.('degraded', 'Erro ao sincronizar com o Supabase');
            window.StatusConsole?.log?.(`Erro ao sincronizar com o Supabase: ${error.message || error}`, 'error');
            return {
                success: false,
                message: 'Erro ao puxar dados do Supabase: ' + error.message,
                error: error
            };
        } finally {
            this.isSyncing = false;
            // No updateSyncUI() for user_page
        }
    }
}

// Criar instância global
window.SyncManager = new SyncManager();

console.log('✅ SyncManager carregado e pronto para uso para user_page!');

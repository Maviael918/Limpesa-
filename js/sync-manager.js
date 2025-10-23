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
                return { success: true, skipped: true, message: 'Sincronização recente reutilizada.' };
            }
        }

        return await this.pullFromSupabase();
    }

    // ========== SINCRONIZAÇÃO AUTOMÁTICA - PUXAR DO SUPABASE ==========
    async pullFromSupabase() {
        if (!this.isSupabaseConfigured()) {
            throw new Error('Supabase não está configurado. Verifique as credenciais.');
        }

        this.isSyncing = true;
        this.syncStatus = 'syncing';
        // No updateSyncUI() for user_page

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

            // 6. Puxar Pedidos (apenas para histórico, não para edição)
            try {
                const { data: ordersData, error: ordersError } = await window.supabaseClient
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (ordersError) throw ordersError;
                console.log('Supabase orders data:', ordersData);
                
                if (ordersData && ordersData.length > 0) {
                    const formattedOrders = ordersData.map(order => ({
                        id: order.id,
                        date: order.order_date,
                        school: order.school_data,
                        items: order.items_data,
                        observations: order.observations
                    }));
                    
                    localStorage.setItem('orders', JSON.stringify(formattedOrders));
                    results.orders.count = formattedOrders.length;
                    console.log(`✅ ${formattedOrders.length} pedidos carregados`);
                } else {
                    console.log('ℹ️ Nenhum pedido encontrado no Supabase');
                }
            } catch (error) {
                results.orders.success = false;
                console.error('❌ Erro ao carregar pedidos:', error);
            }

            this.lastSync = new Date();
            this.syncStatus = 'success';
            // No updateSyncUI() for user_page

            console.log('✅ Sincronização inicial concluída com sucesso para user_page!', results);
            return {
                success: true,
                message: 'Dados puxados do Supabase com sucesso!',
                results: results,
                timestamp: this.lastSync
            };

        } catch (error) {
            this.syncStatus = 'error';
            // No updateSyncUI() for user_page
            
            console.error('❌ Erro na sincronização inicial para user_page:', error);
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

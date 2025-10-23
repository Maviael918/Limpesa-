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

    async syncInitialData() {
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

            // 4. Puxar Pedidos (apenas para histórico, não para edição)
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

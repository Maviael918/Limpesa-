document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorMessage.style.display = 'none';

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!window.supabaseClient) {
            errorMessage.textContent = 'Supabase client not initialized. Check supabase-config.js';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const supa = window.supabaseClient;
            if (!supa) {
                console.error('Supabase client indisponível no login.');
            }
            console.debug('Iniciando signInWithPassword para', email);
            const { data, error } = await supa.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Supabase signIn error:', { code: error.code, message: error.message, name: error.name, status: error.status });
                throw error;
            }

            // After successful login, fetch user's role and redirect
            const user = data.user;
            if (user) {
                // Try to fetch profile; if missing, create a default role
                console.debug('Login OK. Buscando perfil para', user.id);
                const { data: profile, error: profileError, status } = await supa
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profileError && status !== 406) {
                    console.error('Erro ao buscar perfil:', { code: profileError.code, message: profileError.message, status });
                    throw profileError;
                }

                let role = profile?.role;
                if (!role) {
                    // Create default profile with role 'limpeza'
                    console.debug('Perfil inexistente. Criando padrão com role limpeza.');
                    const { error: insertError } = await supa
                        .from('profiles')
                        .insert({ id: user.id, role: 'limpeza' });
                    if (insertError) {
                        console.error('Erro ao criar perfil padrão:', { code: insertError.code, message: insertError.message });
                        errorMessage.textContent = 'Perfil não encontrado e não foi possível criar. Contate o suporte.';
                        errorMessage.style.display = 'block';
                        await supa.auth.signOut();
                        return;
                    }
                    role = 'limpeza';
                }
                redirectToPage(role);
            } else {
                errorMessage.textContent = 'Login failed: No user data.';
                errorMessage.style.display = 'block';
            }

        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
            errorMessage.style.display = 'block';
        }
    });

    function redirectToPage(role) {
        if (!role) {
            errorMessage.textContent = 'Perfil sem papel definido. Contate o suporte.';
            errorMessage.style.display = 'block';
            window.supabaseClient.auth.signOut();
            return;
        }

        try {
            localStorage.setItem('ckpActiveRole', role);
        } catch (_) {}

        const portalUrl = new URL('portal.html', window.location.origin);
        portalUrl.searchParams.set('role', role);
        window.location.href = portalUrl.pathname + portalUrl.search;
    }

    // Check if user is already logged in
    // This part needs to be careful not to cause an infinite redirect loop
    // if the user is on the login page but already logged in.
    // It should only redirect if the current page is login.html
    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('/')) {
        window.supabaseClient.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error) {
                console.error('Erro ao obter sessão no login:', error);
            }
            if (session) {
                // User is logged in, fetch role and redirect
                try {
                    const { data: profile, error: profileError } = await window.supabaseClient
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    if (!profileError && profile?.role) {
                        redirectToPage(profile.role);
                    }
                } catch (e) {
                    console.warn('Falha ao buscar perfil na verificação de sessão:', e);
                }
            }
        });
    }
});

/* ========================================
   DESTINO ESPANHA — Authentication System
   Handles login, logout, route protection,
   and role-based access (admin vs cliente)
   ======================================== */

// Corrige a tela travada ao usar o botão "voltar" do navegador.
// Se a página foi restaurada do back-forward cache (bfcache), recarregamos:
// isso reinicializa o Supabase/auth do zero e evita o lock de autenticação
// que fica preso quando a página volta de um estado congelado.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

const Auth = {
    // Current user data (populated after login)
    currentUser: null,
    userData: null,

    // ==============================
    // INITIALIZE AUTH LISTENER
    // ==============================
    init(requiredRole = null) {
        return new Promise(async (resolve, reject) => {
            if (typeof supabase === 'undefined' || !supabase || !supabase.auth) {
                console.error('Supabase SDK não inicializado ou bloqueado por AdBlock/Brave.');
                resolve(null);
                return;
            }

            try {
                // Fetch current user/session from supabase
                const { data: { session } } = await supabase.auth.getSession();
                const user = session ? session.user : null;
                
                const handleUser = async (user) => {
                    if (user) {
                        Auth.currentUser = user;
                        try {
                            // Fetch user profile from database
                            const { data, error } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', user.id)
                                .single();
                                
                            if (data && !error) {
                                Auth.userData = data;

                                // Check role if required
                                if (requiredRole && Auth.userData.role !== requiredRole) {
                                    Auth.redirectByRole(Auth.userData.role);
                                    return;
                                 }

                                resolve(Auth.userData);
                            } else {
                                console.error('User profile not found in Supabase:', error);
                                Auth.logout();
                                reject(new Error('Perfil não encontrado'));
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                            reject(error);
                        }
                    } else {
                        Auth.currentUser = null;
                        Auth.userData = null;
                        const currentPage = window.location.pathname.toLowerCase();
                        if (!currentPage.includes('login') && !currentPage.includes('index') && currentPage !== '/') {
                            window.location.href = Auth.getBasePath() + 'login.html';
                        }
                        resolve(null);
                    }
                };

                // Run initially
                await handleUser(user);

                // Listen for changes
                supabase.auth.onAuthStateChange((event, session) => {
                    const newUser = session ? session.user : null;
                    if (event === 'SIGNED_OUT') {
                        Auth.currentUser = null;
                        Auth.userData = null;
                        const currentPage = window.location.pathname.toLowerCase();
                        if (!currentPage.includes('login') && !currentPage.includes('index') && currentPage !== '/') {
                            window.location.href = Auth.getBasePath() + 'login.html';
                        }
                    } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                        // Only trigger if state changed to avoid infinite loops or duplicate loads
                        if (!Auth.currentUser || Auth.currentUser.id !== newUser?.id) {
                            // IMPORTANTE: NUNCA usar await em chamadas do Supabase aqui dentro.
                            // O callback do onAuthStateChange segura o lock interno do GoTrue (auth);
                            // se a gente await numa query (que também precisa do lock), trava tudo —
                            // e as consultas seguintes (ex.: carregar clientes) ficam penduradas pra sempre.
                            // Por isso adiamos com setTimeout, pra rodar FORA do lock.
                            setTimeout(() => handleUser(newUser), 0);
                        }
                    }
                });
            } catch (err) {
                console.error('Erro ao ler sessão do Supabase:', err);
                resolve(null);
            }
        });
    },

    // ==============================
    // LOGIN
    // ==============================
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            if (profileError || !profile) {
                await supabase.auth.signOut();
                throw new Error('Perfil não encontrado. Contacte o administrador.');
            }
            
            Auth.redirectByRole(profile.role);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            let message = '';
            if (typeof error === 'string') {
                message = error;
            } else if (error && error.message && error.message !== '{}') {
                message = error.message;
            } else if (error && error.error_description) {
                message = error.error_description;
            } else if (error && error.msg) {
                message = error.msg;
            } else {
                message = 'E-mail ou senha incorretos. Verifique seus dados.';
            }
            if (message.includes('Invalid login credentials')) {
                message = 'E-mail ou senha incorretos.';
            }
            return { success: false, error: message };
        }
    },

    // ==============================
    // LOGOUT
    // ==============================
    async logout() {
        try {
            await supabase.auth.signOut();
            window.location.href = Auth.getBasePath() + 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // ==============================
    // PASSWORD RESET
    // ==============================
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + Auth.getBasePath() + 'login.html'
            });
            if (error) throw error;
            return { success: true, message: 'E-mail de redefinição enviado! Verifique sua caixa de entrada.' };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message || 'Erro ao enviar e-mail.' };
        }
    },

    // ==============================
    // CREATE CLIENT ACCOUNT (Admin only)
    // ==============================
    async createClientAccount(clientData) {
        if (!Auth.userData || Auth.userData.role !== 'admin') {
            throw new Error('Apenas administradores podem criar contas.');
        }

        try {
            const tempPassword = 'Destino2026!'; // senha padrão fixa para novos clientes (cliente troca no 1º acesso via "Esqueci a senha")
            
            // Invoke the SECURE postgres function we created
            const { data: newUserId, error } = await supabase.rpc('admin_create_user', {
                email: clientData.email,
                password: tempPassword,
                nome: clientData.nome,
                telefone: clientData.telefone || '',
                plano: clientData.plano || 'diagnostico',
                tipo_visto: clientData.tipoVisto || null,
                fase: clientData.fase || 'lead',
                valor_total: clientData.valorTotal || 0,
                valor_pago: clientData.valorPago || 0,
                notas_internas: clientData.notasInternas ? `[Senha Inicial: ${tempPassword}]\n${clientData.notasInternas}` : `[Senha Inicial: ${tempPassword}]`
            });

            if (error) throw error;
            if (!newUserId) throw new Error('Não foi possível obter o ID do novo usuário.');

            // Create default documents for the new client
            await Auth.createDefaultDocuments(newUserId, clientData.tipoVisto, clientData.plano);

            return {
                success: true,
                uid: newUserId,
                tempPassword: tempPassword,
                message: `Conta criada! Senha temporária: ${tempPassword}`
            };
        } catch (error) {
            console.error('Error creating client:', error);
            let message = error.message || 'Erro ao criar conta.';
            if (message.includes('unique constraint') || message.includes('users_email_key')) {
                message = 'Este e-mail já está cadastrado.';
            }
            return { success: false, error: message };
        }
    },

    // ==============================
    // DEFAULT DOCUMENTS BY VISA TYPE
    // ==============================
    async createDefaultDocuments(uid, tipoVisto, plano) {
        const baseDocs = [
            { nome: 'Passaporte Válido (Original e Cópia A4 das páginas de dados)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'RG ou RNE/RNM (Original e Cópia A4 - Não CNH)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'Comprovante de Residência da Jurisdição SP/PR/MS (Água, Luz, Gás, Internet Fixa ou Contrato de Locação)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'Formulário de Visto Nacional (Preenchido e Assinado)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'Fotografia Biométrica Recente (Fundo claro, padrão passaporte)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'Certidão de Nascimento (Inteiro Teor - Apostilada e Traduzida)', obrigatorio: false, categoria: 'pessoal' },
            { nome: 'Certidão de Casamento / União Estável (Apostilada e Traduzida)', obrigatorio: false, categoria: 'pessoal' },
            { nome: 'Antecedentes Criminais da Polícia Federal (Apostilada, Traduzida e constando o Nº do Passaporte)', obrigatorio: true, categoria: 'pessoal' },
            { nome: 'Atestado Médico (Modelo Bilíngue RSI 2005 - Firma Reconhecida em Cartório e Apostilado)', obrigatorio: true, categoria: 'saude' },
            { nome: 'Seguro Saúde Espanhol (Adeslas, Sanitas ou ASISA - Sem Copago/Franquia e Sem Carência)', obrigatorio: true, categoria: 'saude' },
            { nome: 'Declaração de Imposto de Renda (IRPF Completa com Recibo de Entrega)', obrigatorio: true, categoria: 'financeiro' },
            { nome: 'Extratos Bancários (Últimos 3 meses - Originais, Assinados e Carimbados pelo Gerente da Conta)', obrigatorio: true, categoria: 'financeiro' },
            { nome: 'Comprovantes de Rendimento Recorrente (3 últimos Holerites ou Pró-Labore/Contrato Social)', obrigatorio: true, categoria: 'financeiro' },
            { nome: 'Termo de Responsabilidade Financeira (Sponsor) - Se financiado por terceiros (Firma reconhecida e Apostilado)', obrigatorio: false, categoria: 'financeiro' },
        ];

        const vistoSpecific = {
            estudo_cap: [
                { nome: 'Carta de Aceitação / Matrícula (Carga horária mínima > 20h/semana e quitação do curso)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'Diploma de Escolaridade Anterior (Apostilado e Traduzido)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'Comprovante de Pagamento da Matrícula/Curso', obrigatorio: true, categoria: 'estudo' },
            ],
            estudo_cap_validacao: [
                { nome: 'Carta de Aceitação / Matrícula (Autoescola - CAP e quitação)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'Diploma de Escolaridade (Apostilado e Traduzido)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'CNH Categoria E (Brasil) - Original e Cópia', obrigatorio: true, categoria: 'trabalho' },
                { nome: 'Prontuário de Habilitação do DETRAN (Apostilado e Traduzido)', obrigatorio: true, categoria: 'trabalho' },
                { nome: 'Comprovante de Pagamento da Autoescola', obrigatorio: true, categoria: 'estudo' },
            ],
            estudo_cap_transicao: [
                { nome: 'Carta de Aceitação / Matrícula (Autoescola - CAP e quitação)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'Diploma de Escolaridade (Apostilado e Traduzido)', obrigatorio: true, categoria: 'estudo' },
                { nome: 'CNH Categoria B (Brasil) - Original e Cópia', obrigatorio: true, categoria: 'trabalho' },
                { nome: 'Comprovante de Pagamento da Autoescola', obrigatorio: true, categoria: 'estudo' },
            ],
            nao_lucrativa: [
                { nome: 'Comprovantes de Renda Passiva Recorrente (Investimentos, Locação, Aposentadoria)', obrigatorio: true, categoria: 'financeiro' },
                { nome: 'Comprovante de Alojamento na Espanha (Escritura ou Contrato de Aluguel de 1 ano)', obrigatorio: true, categoria: 'moradia' },
            ],
            nomade: [
                { nome: 'Contrato de Trabalho Remoto (com mais de 3 meses de vigência e declaração de autorização de trabalho na Espanha)', obrigatorio: true, categoria: 'trabalho' },
                { nome: 'Comprovantes de Recebimento de Renda Remota (3 últimos extratos e notas fiscais)', obrigatorio: true, categoria: 'financeiro' },
                { nome: 'Registro da Empresa no Brasil / CNPJ (se profissional autônomo)', obrigatorio: false, categoria: 'trabalho' },
            ],
            arraigo: [
                { nome: 'Comprovantes de Permanência Contínua na Espanha por 3 anos (Empadronamiento Histórico, Notas Médicas, etc.)', obrigatorio: true, categoria: 'residencia' },
                { nome: 'Pré-Contrato de Trabalho na Espanha (assinado pelo empregador)', obrigatorio: false, categoria: 'trabalho' },
                { nome: 'Informe de Inserção Social (Arraigo Municipal)', obrigatorio: true, categoria: 'residencia' },
            ],
            reagrupamento: [
                { nome: 'NIE/TIE e Passaporte do Familiar Reagrupante na Espanha', obrigatorio: true, categoria: 'familiar' },
                { nome: 'Comprovantes de Meios Financeiros do Reagrupante (Contrato de Trabalho e 3 últimas Nóminas)', obrigatorio: true, categoria: 'financeiro' },
                { nome: 'Informe de Habitação Adequada (emitido pela Comunidade Autônoma)', obrigatorio: true, categoria: 'moradia' },
                { nome: 'Certidão de Vínculo Familiar / Casamento / Nascimento (Apostilada e Traduzida)', obrigatorio: true, categoria: 'familiar' },
            ]
        };

        const docs = [...baseDocs, ...(vistoSpecific[tipoVisto] || [])];
        
        const payload = docs.map(doc => ({
            userId: uid,
            nome: doc.nome,
            obrigatorio: doc.obrigatorio,
            categoria: doc.categoria,
            status: 'pendente',
            arquivoUrl: null,
            dataEnvio: null,
            comentarioAdmin: ''
        }));

        const { error } = await supabase.from('documentos').insert(payload);
        if (error) {
            console.error('Error creating default documents:', error);
            throw error;
        }
    },

    // ==============================
    // HELPERS
    // ==============================
    redirectByRole(role) {
        const basePath = Auth.getBasePath();
        if (role === 'admin') {
            window.location.href = basePath + 'admin/dashboard.html';
        } else {
            window.location.href = basePath + 'cliente/painel.html';
        }
    },

    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/admin/') || path.includes('/cliente/')) {
            return '../';
        }
        return './';
    },

    generateTempPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    // Format helpers
    formatDate(timestamp) {
        if (!timestamp) return '—';
        const date = (typeof timestamp === 'string') ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(value || 0);
    },

    // Plan/Phase labels
    planoLabels: {
        diagnostico: 'Diagnóstico Estratégico',
        documentacao: 'Documentação Brasil',
        vistos: 'Assessoria de Vistos',
        aterragem: 'Aterragem Espanha',
        premium: 'Premium Família VIP',
        avulso: 'Serviço Avulso'
    },

    faseLabels: {
        lead: 'Novo Lead',
        diagnostico: 'Diagnóstico',
        documentacao: 'Documentação',
        visto: 'Visto',
        aterragem: 'Aterragem',
        concluido: 'Concluído'
    },

    vistoLabels: {
        estudo_cap: 'Estudo (CAP)',
        estudo_cap_validacao: 'Estudo (CAP + Validação CNH E)',
        estudo_cap_transicao: 'Estudo (CAP + Habilitação C do Zero)',
        nao_lucrativa: 'Residência Não Lucrativa',
        nomade: 'Nômade Digital',
        arraigo: 'Arraigo',
        reagrupamento: 'Reagrupamento Familiar'
    },

    faseOrder: ['lead', 'diagnostico', 'documentacao', 'visto', 'aterragem', 'concluido'],

    getFaseIndex(fase) {
        return Auth.faseOrder.indexOf(fase);
    },

    getFaseProgress(fase) {
        const index = Auth.getFaseIndex(fase);
        return Math.round((index / (Auth.faseOrder.length - 1)) * 100);
    }
};

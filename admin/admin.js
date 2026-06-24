/* ========================================
   DESTINO ESPANHA — Admin JavaScript
   Dashboard, Client Management, PDF Gen
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {

    // ==============================
    // AUTH CHECK
    // ==============================
    try {
        const userData = await Auth.init('admin');
        if (!userData) return;

        // Update sidebar user info
        const avatarEl = document.getElementById('user-avatar');
        const nameEl = document.getElementById('user-name');
        const emailEl = document.getElementById('user-email');
        if (avatarEl) avatarEl.textContent = (userData.nome || 'A').charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = userData.nome || 'Admin';
        if (emailEl) emailEl.textContent = userData.email || '';

    } catch (error) {
        console.error('Auth error:', error);
        return;
    }

    // ==============================
    // COMMON: Sidebar + Logout
    // ==============================
    setupSidebar();
    setupLogout();

    const page = window.location.pathname.split('/').pop().toLowerCase().replace('.html', '');

    if (page === 'dashboard' || page === '' || page === 'admin') {
        initDashboard();
    } else if (page === 'cliente-detalhe') {
        initClienteDetalhe();
    } else if (page === 'gerar-pdf') {
        initGerarPDF();
    }
});

// ==============================
// SIDEBAR
// ==============================
function setupSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }
    }
}

function setupLogout() {
    const btn = document.getElementById('btn-logout');
    if (btn) {
        btn.addEventListener('click', () => Auth.logout());
    }
}

// ==============================
// DASHBOARD
// ==============================
async function initDashboard() {
    const filterPlano = document.getElementById('filter-plano');
    const filterFase = document.getElementById('filter-fase');

    let allClients = [];

    // Load clients
    async function loadClients() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'cliente')
                .order('criadoEm', { ascending: false });

            if (error) throw error;
            allClients = data || [];

            updateMetrics(allClients);
            renderClients(allClients);
            await loadPendingRequests(allClients);
        } catch (error) {
            console.error('Error loading clients:', error);
            document.getElementById('clients-tbody').innerHTML = `
                <tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">Erro ao carregar clientes</div>
                <div class="empty-state-sub">${error.message}</div></div></td></tr>`;
        }
    }

    async function loadPendingRequests(clients) {
        try {
            const { data, error } = await supabase
                .from('solicitacoes')
                .select('*, users(nome)')
                .eq('status', 'pendente_pagamento');
            
            if (error) throw error;

            const allRequests = (data || []).map(req => ({
                id: req.id,
                clientId: req.userId,
                clientName: req.users?.nome || 'Cliente',
                ...req
            }));

            const container = document.getElementById('pending-requests-container');
            const list = document.getElementById('pending-requests-list');

            if (allRequests.length === 0) {
                container.style.display = 'none';
                return;
            }

            // Sort descending by date
            allRequests.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

            list.innerHTML = allRequests.map(req => {
                const dateStr = req.data ? new Date(req.data).toLocaleString('pt-BR') : 'Data desconhecida';
                return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--bg-white); border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                        <div>
                            <div style="font-weight: 700; color: var(--primary); font-size: 1.05rem;">
                                ${req.clientName} solicitou ${req.planoNome}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                                ${dateStr} · <strong>${(req.metodoPagamento || '').toUpperCase()}</strong> · Valor: ${req.valor?.toLocaleString('pt-BR')}€
                            </div>
                            ${req.notes ? `<div style="font-size: 0.82rem; color: var(--text-light); margin-top: 6px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 4px;"><em>"${req.notes}"</em></div>` : ''}
                        </div>
                        <div>
                            <a href="cliente-detalhe.html?id=${req.clientId}" class="btn-portal btn-primary btn-small">Ver Cliente</a>
                        </div>
                    </div>
                `;
            }).join('');

            container.style.display = 'block';
        } catch (error) {
            console.error('Error loading pending requests:', error);
        }
    }

    function updateMetrics(clients) {
        const total = clients.length;
        const active = clients.filter(c => c.fase !== 'concluido' && c.fase !== 'lead').length;
        const done = clients.filter(c => c.fase === 'concluido').length;
        const revenue = clients.reduce((sum, c) => sum + (c.valorPago || 0), 0);

        document.getElementById('metric-total').textContent = total;
        document.getElementById('metric-active').textContent = active;
        document.getElementById('metric-done').textContent = done;
        document.getElementById('metric-revenue').textContent = revenue.toLocaleString('pt-BR') + '€';
    }

    function renderClients(clients) {
        const planoFilter = filterPlano?.value || '';
        const faseFilter = filterFase?.value || '';

        let filtered = clients;
        if (planoFilter) filtered = filtered.filter(c => c.plano === planoFilter);
        if (faseFilter) filtered = filtered.filter(c => c.fase === faseFilter);

        const tbody = document.getElementById('clients-tbody');

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6"><div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">Nenhum cliente encontrado</div>
                    <div class="empty-state-sub">Clique em "Novo Cliente" para adicionar.</div>
                </div></td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(client => `
            <tr onclick="window.location.href='cliente-detalhe.html?id=${client.id}'">
                <td>
                    <div style="font-weight: 600;">${client.nome || '—'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${client.email || ''}</div>
                </td>
                <td><span style="font-size: 0.85rem;">${Auth.planoLabels[client.plano] || client.plano}</span></td>
                <td><span class="status-badge status-${client.fase}">${Auth.faseLabels[client.fase] || client.fase}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-light);">—</td>
                <td style="font-weight: 600;">${(client.valorTotal || 0).toLocaleString('pt-BR')}€</td>
                <td style="font-size: 0.85rem; color: var(--text-light);">${Auth.formatDate(client.criadoEm)}</td>
            </tr>
        `).join('');
    }

    // Filters
    if (filterPlano) filterPlano.addEventListener('change', () => renderClients(allClients));
    if (filterFase) filterFase.addEventListener('change', () => renderClients(allClients));

    // New Client Modal
    const btnNew = document.getElementById('btn-new-client');
    const modal = document.getElementById('modal-new-client');
    const modalClose = document.getElementById('modal-close-new');
    const btnCancel = document.getElementById('btn-cancel-new');

    function openNewModal() { modal.classList.add('show'); }
    function closeNewModal() { modal.classList.remove('show'); }

    if (btnNew) btnNew.addEventListener('click', openNewModal);
    if (modalClose) modalClose.addEventListener('click', closeNewModal);
    if (btnCancel) btnCancel.addEventListener('click', closeNewModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeNewModal(); });

    // Auto-fill valor based on plano
    const planoSelect = document.getElementById('nc-plano');
    const valorInput = document.getElementById('nc-valor');
    const planoValores = { diagnostico: 50, documentacao: 350, vistos: 750, aterragem: 600, premium: 2000, avulso: 0 };
    if (planoSelect && valorInput) {
        planoSelect.addEventListener('change', () => {
            valorInput.value = planoValores[planoSelect.value] || '';
        });
        valorInput.value = planoValores[planoSelect.value] || '';
    }

    // Submit new client
    const form = document.getElementById('form-new-client');
    const errorEl = document.getElementById('new-client-error');
    const successEl = document.getElementById('new-client-success');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.classList.remove('show');
            successEl.classList.remove('show');

            const btnSave = document.getElementById('btn-save-client');
            btnSave.disabled = true;
            btnSave.innerHTML = '<span>⏳</span> Criando...';

            const clientData = {
                nome: document.getElementById('nc-nome').value.trim(),
                email: document.getElementById('nc-email').value.trim(),
                telefone: document.getElementById('nc-telefone').value.trim(),
                plano: document.getElementById('nc-plano').value,
                tipoVisto: document.getElementById('nc-visto').value || null,
                valorTotal: parseFloat(document.getElementById('nc-valor').value) || 0,
                fase: document.getElementById('nc-fase').value,
                notasInternas: document.getElementById('nc-notas').value.trim()
            };

            const result = await Auth.createClientAccount(clientData);

            if (result.success) {
                successEl.innerHTML = `
                    <div style="margin-bottom: 8px; font-weight: bold;">✅ Cliente criado com sucesso!</div>
                    <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>E-mail (Login):</strong> <code>${clientData.email}</code></div>
                    <div style="margin: 8px 0; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong>Senha temporária:</strong> 
                        <span id="temp-pwd-text" style="font-family: monospace; font-size: 1.1em; background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 4px; color: #fff; border: 1px solid rgba(255,255,255,0.2); user-select: all;">${result.tempPassword}</span>
                        <button type="button" id="btn-copy-temp-pwd" style="padding: 4px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;">📋 Copiar</button>
                    </div>
                    <small style="color: rgba(255,255,255,0.7); display: block; margin-top: 4px; font-size: 0.78rem;">A senha provisória também foi salva no campo 'Notas Internas' do cliente.</small>
                    <button type="button" id="btn-close-success" style="margin-top: 14px; width: 100%; padding: 8px; background: #fff; color: #1e293b; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Fechar Janela</button>
                `;
                successEl.classList.add('show');
                form.reset();
                loadClients();

                // Adiciona o evento de copiar
                document.getElementById('btn-copy-temp-pwd').addEventListener('click', () => {
                    navigator.clipboard.writeText(result.tempPassword);
                    const btn = document.getElementById('btn-copy-temp-pwd');
                    btn.innerHTML = '✅ Copiado!';
                    setTimeout(() => btn.innerHTML = '📋 Copiar', 2000);
                });

                // Adiciona o evento de fechar
                document.getElementById('btn-close-success').addEventListener('click', () => {
                    successEl.classList.remove('show');
                    closeNewModal();
                });
            } else {
                errorEl.textContent = result.error;
                errorEl.classList.add('show');
            }

            btnSave.disabled = false;
            btnSave.innerHTML = '<span>💾</span> Criar Cliente';
        });
    }

    // Initial load
    await loadClients();
}

// ==============================
// CLIENT DETAIL
// ==============================
async function initClienteDetalhe() {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');

    if (!clientId) {
        window.location.href = 'dashboard.html';
        return;
    }

    let clientData = null;

    // Load client
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', clientId)
            .single();

        if (error || !data) {
            alert('Cliente não encontrado.');
            window.location.href = 'dashboard.html';
            return;
        }
        clientData = data;
    } catch (error) {
        console.error('Error loading client:', error);
        return;
    }

    // Populate page
    document.getElementById('page-title').textContent = clientData.nome || 'Cliente';
    document.getElementById('client-name').textContent = clientData.nome || '—';
    document.getElementById('client-email').textContent = clientData.email || '—';
    document.getElementById('client-telefone').textContent = clientData.telefone || '—';
    document.getElementById('client-plano-label').textContent = Auth.planoLabels[clientData.plano] || clientData.plano;
    document.getElementById('client-visto').textContent = Auth.vistoLabels[clientData.tipoVisto] || 'Não definido';
    document.getElementById('client-valor').textContent = (clientData.valorTotal || 0).toLocaleString('pt-BR') + '€';
    document.getElementById('client-pago').textContent = (clientData.valorPago || 0).toLocaleString('pt-BR') + '€';
    document.getElementById('client-total').textContent = (clientData.valorTotal || 0).toLocaleString('pt-BR') + '€';
    document.getElementById('client-notas').value = clientData.notasInternas || '';

    // Popula Controle Financeiro / Pagamento
    document.getElementById('fin-valor-total').value = clientData.valorTotal || 0;
    document.getElementById('fin-valor-pago').value = clientData.valorPago || 0;
    document.getElementById('fin-data-segunda').value = clientData.segundoPagamentoData || '';
    document.getElementById('fin-status-segunda').value = clientData.segundoPagamentoStatus || 'pendente';
    
    const calcRestante = () => {
        const total = parseFloat(document.getElementById('fin-valor-total').value) || 0;
        const pago = parseFloat(document.getElementById('fin-valor-pago').value) || 0;
        const restante = total - pago;
        const restanteEl = document.getElementById('fin-valor-restante');
        if (restanteEl) {
            restanteEl.textContent = restante.toLocaleString('pt-BR') + '€';
            restanteEl.style.color = restante > 0 ? 'var(--accent-red)' : 'var(--accent-green)';
        }
    };
    calcRestante();
    document.getElementById('fin-valor-total').addEventListener('input', calcRestante);
    document.getElementById('fin-valor-pago').addEventListener('input', calcRestante);

    // Phase badge
    const faseBadge = document.getElementById('client-fase-badge');
    faseBadge.textContent = Auth.faseLabels[clientData.fase] || clientData.fase;
    faseBadge.className = `status-badge status-${clientData.fase}`;

    // Progress bar
    const progress = Auth.getFaseProgress(clientData.fase);
    document.getElementById('progress-fill').style.width = progress + '%';

    // Phase buttons
    const faseButtonsContainer = document.getElementById('fase-buttons');
    faseButtonsContainer.innerHTML = Auth.faseOrder.map(fase => {
        const isActive = fase === clientData.fase;
        const btnClass = isActive ? 'btn-primary' : 'btn-secondary';
        return `<button class="btn-portal btn-small ${btnClass}" data-fase="${fase}" ${isActive ? 'disabled' : ''}>${Auth.faseLabels[fase]}</button>`;
    }).join('');

    // Phase button clicks
    faseButtonsContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newFase = btn.dataset.fase;
            try {
                const newHistory = [...(clientData.historico || [])];
                newHistory.push({
                    data: new Date().toISOString(),
                    acao: `Fase alterada para "${Auth.faseLabels[newFase]}"`,
                    por: Auth.userData.nome || 'Admin'
                });

                const { error } = await supabase
                    .from('users')
                    .update({
                        fase: newFase,
                        historico: newHistory
                    })
                    .eq('id', clientId);

                if (error) throw error;
                window.location.reload();
            } catch (error) {
                console.error('Error updating phase:', error);
                alert('Erro ao atualizar fase.');
            }
        });
    });

    // Load documents
    loadDocuments(clientId);

    // Load and manage client's Invoice (Nota Fiscal)
    loadNotaFiscal(clientId);

    // History
    renderHistory(clientData.historico || []);

    // Important dates
    renderDates(clientData.datasImportantes || []);

    // Save notes
    document.getElementById('btn-save-notes').addEventListener('click', async () => {
        const notas = document.getElementById('client-notas').value;
        try {
            const { error } = await supabase
                .from('users')
                .update({ notasInternas: notas })
                .eq('id', clientId);

            if (error) throw error;
            const btn = document.getElementById('btn-save-notes');
            btn.textContent = '✅ Salvo!';
            setTimeout(() => btn.textContent = 'Salvar Notas', 2000);
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    });

    // Save payment / financial info
    document.getElementById('btn-save-financeiro').addEventListener('click', async () => {
        const valorTotal = parseFloat(document.getElementById('fin-valor-total').value) || 0;
        const valorPago = parseFloat(document.getElementById('fin-valor-pago').value) || 0;
        const segundoPagamentoData = document.getElementById('fin-data-segunda').value || null;
        const segundoPagamentoStatus = document.getElementById('fin-status-segunda').value;

        try {
            const btn = document.getElementById('btn-save-financeiro');
            btn.disabled = true;
            btn.textContent = '⏳ Salvando...';

            // Gerencia no array datasImportantes
            let newDates = [...(clientData.datasImportantes || [])];
            const tituloParc = "Vencimento da 2ª Parcela (Consulado)";
            
            if (segundoPagamentoData) {
                const existingDateIdx = newDates.findIndex(d => d.titulo === tituloParc);
                if (existingDateIdx > -1) {
                    newDates[existingDateIdx].data = segundoPagamentoData;
                    newDates[existingDateIdx].concluida = (segundoPagamentoStatus === 'pago');
                } else {
                    newDates.push({
                        titulo: tituloParc,
                        data: segundoPagamentoData,
                        concluida: (segundoPagamentoStatus === 'pago')
                    });
                }
            } else {
                newDates = newDates.filter(d => d.titulo !== tituloParc);
            }

            const newHistory = [...(clientData.historico || [])];
            newHistory.push({
                data: new Date().toISOString(),
                acao: `Informações financeiras atualizadas (Total: ${valorTotal}€, Pago: ${valorPago}€)`,
                por: Auth.userData.nome || 'Admin'
            });

            const { error } = await supabase
                .from('users')
                .update({
                    valorTotal: valorTotal,
                    valorPago: valorPago,
                    segundoPagamentoData: segundoPagamentoData,
                    segundoPagamentoStatus: segundoPagamentoStatus,
                    datasImportantes: newDates,
                    historico: newHistory
                })
                .eq('id', clientId);

            if (error) throw error;
            
            btn.textContent = '✅ Salvo!';
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error saving financial info:', error);
            alert('Erro ao salvar informações de pagamento.');
            const btn = document.getElementById('btn-save-financeiro');
            btn.disabled = false;
            btn.textContent = 'Salvar Pagamento';
        }
    });

    // Add date modal
    const modalDate = document.getElementById('modal-add-date');
    document.getElementById('btn-add-date').addEventListener('click', () => modalDate.classList.add('show'));
    document.getElementById('modal-close-date').addEventListener('click', () => modalDate.classList.remove('show'));
    document.getElementById('btn-cancel-date').addEventListener('click', () => modalDate.classList.remove('show'));
    modalDate.addEventListener('click', (e) => { if (e.target === modalDate) modalDate.classList.remove('show'); });

    document.getElementById('btn-save-date').addEventListener('click', async () => {
        const titulo = document.getElementById('date-titulo').value.trim();
        const data = document.getElementById('date-data').value;
        if (!titulo || !data) return;

        try {
            const newDates = [...(clientData.datasImportantes || [])];
            newDates.push({ titulo, data, concluida: false });

            const newHistory = [...(clientData.historico || [])];
            newHistory.push({
                data: new Date().toISOString(),
                acao: `Data importante adicionada: "${titulo}" (${data})`,
                por: Auth.userData.nome || 'Admin'
            });

            const { error } = await supabase
                .from('users')
                .update({
                    datasImportantes: newDates,
                    historico: newHistory
                })
                .eq('id', clientId);

            if (error) throw error;
            modalDate.classList.remove('show');
            window.location.reload();
        } catch (error) {
            console.error('Error adding date:', error);
        }
    });

    // Generate PDF button
    document.getElementById('btn-gen-pdf').addEventListener('click', () => {
        window.location.href = `gerar-pdf.html?client=${clientId}`;
    });

    // Delete Client button
    const btnDelete = document.getElementById('btn-delete-client');
    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            if (confirm(`Deseja realmente excluir o cliente "${clientData.nome || 'este cliente'}" de forma permanente? Esta ação não pode ser desfeita.`)) {
                try {
                    btnDelete.disabled = true;
                    btnDelete.innerHTML = '<span>⏳</span> Excluindo...';
                    
                    const { error } = await supabase
                        .from('users')
                        .delete()
                        .eq('id', clientId);

                    if (error) throw error;
                    alert('Cliente excluído com sucesso!');
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    console.error('Error deleting client:', error);
                    alert('Erro ao excluir cliente: ' + error.message);
                    btnDelete.disabled = false;
                    btnDelete.innerHTML = '<span>🗑️</span> Excluir Cliente';
                }
            }
        });
    }

    // ==============================
    // DIAGNÓSTICO E ANÁLISE DE PERFIL
    // ==============================
    const diagObjetivo = document.getElementById('diag-objetivo');
    const diagIdadeTitular = document.getElementById('diag-idade-titular');
    const diagOrigem = document.getElementById('diag-origem');
    const diagProfissao = document.getElementById('diag-profissao');
    const diagIdioma = document.getElementById('diag-idioma');
    const diagCnh = document.getElementById('diag-cnh');
    const diagMembros = document.getElementById('diag-membros');
    const diagMotivacao = document.getElementById('diag-motivacao');
    const diagFinanceiro = document.getElementById('diag-financeiro');
    const diagRenda = document.getElementById('diag-renda');
    const diagEstrategiaIda = document.getElementById('diag-estrategia-ida');
    const diagPrazo = document.getElementById('diag-prazo');
    const diagPrefRegiao = document.getElementById('diag-pref-regiao');
    const diagPrefMoradia = document.getElementById('diag-pref-moradia');
    const diagNotas = document.getElementById('diag-notas');
    const diagResultado = document.getElementById('diag-resultado');
    const promptPreview = document.getElementById('diag-prompt-preview');
    
    // Load existing profile analysis data if available
    if (clientData.analisePerfil) {
        const ap = clientData.analisePerfil;
        if (diagObjetivo && ap.objetivo) diagObjetivo.value = ap.objetivo;
        if (diagIdadeTitular && ap.idadeTitular) diagIdadeTitular.value = ap.idadeTitular;
        if (diagOrigem && ap.origem) diagOrigem.value = ap.origem;
        if (diagProfissao && ap.profissao) diagProfissao.value = ap.profissao;
        if (diagIdioma && ap.idioma) diagIdioma.value = ap.idioma;
        if (diagCnh && ap.cnh) diagCnh.value = ap.cnh;
        if (diagMembros && ap.membros) diagMembros.value = ap.membros;
        if (diagMotivacao && ap.motivacao) diagMotivacao.value = ap.motivacao;
        if (diagFinanceiro && ap.financeiro) diagFinanceiro.value = ap.financeiro;
        if (diagRenda && ap.renda) diagRenda.value = ap.renda;
        if (diagEstrategiaIda && ap.estrategiaIda) diagEstrategiaIda.value = ap.estrategiaIda;
        if (diagPrazo && ap.prazo) diagPrazo.value = ap.prazo;
        if (diagPrefRegiao && ap.prefRegiao) diagPrefRegiao.value = ap.prefRegiao;
        if (diagPrefMoradia && ap.prefMoradia) diagPrefMoradia.value = ap.prefMoradia;
        if (diagNotas && ap.notas) diagNotas.value = ap.notas;
        if (diagResultado && ap.resultadoPesquisa) diagResultado.value = ap.resultadoPesquisa;
    } else {
        // Fallbacks from general profile if questionnaire is empty
        if (diagObjetivo && clientData.tipoVisto) {
            diagObjetivo.value = clientData.tipoVisto;
        }
    }

    // Function to generate the prompt text
    function updatePromptPreview() {
        if (!promptPreview) return;
        const nome = clientData.nome || 'Cliente';
        const objText = diagObjetivo ? diagObjetivo.options[diagObjetivo.selectedIndex].text : '';
        const idade = diagIdadeTitular ? diagIdadeTitular.value : '';
        const origem = diagOrigem ? diagOrigem.value.trim() : '';
        const prof = diagProfissao ? diagProfissao.value.trim() : '';
        const idiomaText = diagIdioma ? diagIdioma.options[diagIdioma.selectedIndex].text : '';
        const cnh = diagCnh ? diagCnh.value.trim() : '';
        const membros = diagMembros ? diagMembros.value.trim() : '';
        const motivacao = diagMotivacao ? diagMotivacao.value.trim() : '';
        const fin = diagFinanceiro ? diagFinanceiro.value.trim() : '';
        const renda = diagRenda ? diagRenda.value.trim() : '';
        const estText = diagEstrategiaIda ? diagEstrategiaIda.options[diagEstrategiaIda.selectedIndex].text : '';
        const prazo = diagPrazo ? diagPrazo.value.trim() : '';
        const regiaoText = diagPrefRegiao ? diagPrefRegiao.options[diagPrefRegiao.selectedIndex].text : '';
        const moradia = diagPrefMoradia ? diagPrefMoradia.value.trim() : '';
        const notas = diagNotas ? diagNotas.value.trim() : '';

        const prompt = `Você é um assessor sênior especialista em imigração para a Espanha (Destino Espanha). Analise o seguinte perfil familiar coletado em uma sessão de diagnóstico de 1h15m para estruturar o Plano de Ação Estratégico ideal:

- Nome do Cliente Titular: ${nome}
- Idade do Titular: ${idade || 'Não especificado'} anos
- Origem no Brasil: ${origem || 'Não especificado'}
- Objetivo de Imigração: ${objText}
- Qualificação Profissional do Titular: ${prof || 'Não especificado'}
- Nível de Espanhol do Titular: ${idiomaText}
- Possui CNH brasileira: ${cnh || 'Não especificado'}
- Composição Familiar (Membros & Idades): ${membros || 'Apenas o titular'}
- Motivação para Imigrar: ${motivacao || 'Não especificado'}
- Reserva Financeira Declarada: ${fin || 'Não especificado'}
- Renda Mensal recorrente no Brasil / Remota: ${renda || 'Não declarada'}
- Estratégia de Viagem: ${estText}
- Prazo Estimado para Viagem: ${prazo || 'Não especificado'}
- Preferência de Clima/Região na Espanha: ${regiaoText}
- Expectativa de Moradia & Estilo de Vida: ${moradia || 'Não especificado'}
- Observações e Detalhes Extras: ${notas || 'Nenhuma'}

Gere um relatório estruturado em português usando cabeçalhos simples (ex: ### Título, **Negrito** e listas com hífens '-'). O relatório DEVE conter as seguintes seções:

### ROTA MIGRATÓRIA E ESTRATÉGIA RECOMENDADA
A fundamentação da melhor rota para o perfil familiar (explicar se a rota de estudo com CAP, residência não lucrativa, nômade, ou visto de trabalho/arraigo se adequa). Avaliar e justificar a estratégia de ida (ir toda a família junta ou o titular na frente por economia/preparação do terreno) com base na reserva financeira declarada.

### ANÁLISE DE REGIÕES RECOMENDADAS E CLIMA
Recomendar as melhores províncias ou regiões na Espanha que se alinham com a origem deles no Brasil (ex: considerando se vivem em clima frio/quente no Sul do Brasil, como Uruguaiana) e com as expectativas do casal (próximo à praia, centro do país, polos industriais ou grandes centros).

### CRITÉRIO DE FUNDOS (IPREM) E CUSTO DE VIDA
Fazer o cálculo matemático e detalhamento do montante exato necessário de comprovação de meios financeiros sob a lei de estrangeira. Lembre-se de calcular proporcionalmente para a família inteira: titular exige 100% do IPREM (~600€/mês), e cada dependente adicional exige 50% do IPREM (~300€/mês). Estimar também a expectativa de custo de aluguel e despesas mensais para a região recomendada.

### TIMELINE E PASSO A PASSO
Roteiro temporal ordenado com as etapas de preparação no Brasil e os primeiros trâmites obrigatórios pós-aterragem na Espanha (NIE, Empadronamiento, etc.).

### CHECKLIST DETALHADO DE DOCUMENTOS DO BRASIL
Lista exata de documentos exigidos que eles precisam emitir no Brasil, indicando expressamente quais necessitam de Apostila de Haia e Tradução Juramentada (especialmente diplomas/históricos, certidões de nascimento/casamento de inteiro teor e antecedentes criminais da PF).

### VALIDAÇÃO DE QUALIFICAÇÕES (Se aplicável)
Instruções diretas sobre como validar ou homologar diplomas profissionais (ex: CRM, COREN, autoescola na Espanha/canje DGT) adequados ao perfil.`;

        promptPreview.textContent = prompt;
    }

    // Bind event listeners to update prompt preview in real time
    [
        diagObjetivo, diagIdadeTitular, diagOrigem, diagProfissao, diagIdioma,
        diagCnh, diagMembros, diagMotivacao, diagFinanceiro, diagRenda,
        diagEstrategiaIda, diagPrazo, diagPrefRegiao, diagPrefMoradia, diagNotas
    ].forEach(input => {
        if (input) input.addEventListener('input', updatePromptPreview);
        if (input) input.addEventListener('change', updatePromptPreview);
    });

    // Initial update
    updatePromptPreview();

    // Copy prompt button
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');
    if (btnCopyPrompt) {
        btnCopyPrompt.addEventListener('click', () => {
            const textToCopy = promptPreview.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const oldText = btnCopyPrompt.textContent;
                btnCopyPrompt.innerHTML = '✅ Copiado!';
                btnCopyPrompt.style.background = 'var(--accent-green)';
                btnCopyPrompt.style.color = '#fff';
                setTimeout(() => {
                    btnCopyPrompt.innerHTML = '📋 Copiar Prompt';
                    btnCopyPrompt.style.background = '';
                    btnCopyPrompt.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text:', err);
                alert('Erro ao copiar prompt. Selecione manualmente o texto e copie.');
            });
        });
    }

    // Save diagnostic data
    const btnSaveDiag = document.getElementById('btn-save-diagnostico');
    if (btnSaveDiag) {
        btnSaveDiag.addEventListener('click', async () => {
            btnSaveDiag.disabled = true;
            btnSaveDiag.innerHTML = '<span>⏳</span> Salvando...';
            
            const analisePerfil = {
                objetivo: diagObjetivo ? diagObjetivo.value : '',
                idadeTitular: diagIdadeTitular ? diagIdadeTitular.value : '',
                origem: diagOrigem ? diagOrigem.value.trim() : '',
                profissao: diagProfissao ? diagProfissao.value.trim() : '',
                idioma: diagIdioma ? diagIdioma.value : '',
                cnh: diagCnh ? diagCnh.value.trim() : '',
                membros: diagMembros ? diagMembros.value.trim() : '',
                motivacao: diagMotivacao ? diagMotivacao.value.trim() : '',
                financeiro: diagFinanceiro ? diagFinanceiro.value.trim() : '',
                renda: diagRenda ? diagRenda.value.trim() : '',
                estrategiaIda: diagEstrategiaIda ? diagEstrategiaIda.value : '',
                prazo: diagPrazo ? diagPrazo.value.trim() : '',
                prefRegiao: diagPrefRegiao ? diagPrefRegiao.value : '',
                prefMoradia: diagPrefMoradia ? diagPrefMoradia.value.trim() : '',
                notas: diagNotas ? diagNotas.value.trim() : '',
                resultadoPesquisa: diagResultado ? diagResultado.value.trim() : '',
                dataAtualizacao: new Date().toISOString()
            };

            try {
                const newHistory = [...(clientData.historico || [])];
                newHistory.push({
                    data: new Date().toISOString(),
                    acao: `Diagnóstico e análise de perfil atualizados`,
                    por: Auth.userData.nome || 'Admin'
                });

                const { error } = await supabase
                    .from('users')
                    .update({
                        analisePerfil,
                        tipoVisto: analisePerfil.objective,
                        fase: 'diagnostico',
                        historico: newHistory
                    })
                    .eq('id', clientId);

                if (error) throw error;

                btnSaveDiag.innerHTML = '<span>✅</span> Salvo com sucesso!';
                btnSaveDiag.style.background = 'var(--accent-green)';
                btnSaveDiag.style.color = '#fff';
                
                setTimeout(() => {
                    btnSaveDiag.disabled = false;
                    btnSaveDiag.innerHTML = '<span>💾</span> Salvar Dados da Análise';
                    btnSaveDiag.style.background = '';
                    btnSaveDiag.style.color = '';
                    window.location.reload();
                }, 1500);

            } catch (err) {
                console.error('Error saving diagnostic analysis:', err);
                alert('Erro ao salvar dados de diagnóstico: ' + err.message);
                btnSaveDiag.disabled = false;
                btnSaveDiag.innerHTML = '<span>💾</span> Salvar Dados da Análise';
            }
        });
    }

    // Generate diagnostic PDF button
    const btnGenDiagPdf = document.getElementById('btn-generate-diag-pdf');
    if (btnGenDiagPdf) {
        btnGenDiagPdf.addEventListener('click', () => {
            window.location.href = `gerar-pdf.html?client=${clientId}&type=plano_acao`;
        });
    }
}

async function loadDocuments(clientId) {
    try {
        const { data: snapshot, error } = await supabase
            .from('documentos')
            .select('*')
            .eq('userId', clientId);

        if (error) throw error;
        const docs = snapshot || [];

        const approved = docs.filter(d => d.status === 'aprovado').length;
        const total = docs.length;
        document.getElementById('docs-count').textContent = `${approved}/${total}`;

        const container = document.getElementById('docs-list-body');

        if (docs.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding: 30px;"><div class="empty-state-text">Nenhum documento cadastrado.</div></div>';
            return;
        }

        container.innerHTML = docs.map(doc => {
            const statusIcons = { pendente: '⬜', enviado: '🟡', aprovado: '✅', revisar: '❌' };
            return `
                <div class="doc-item" data-doc-id="${doc.id}" style="cursor: pointer;">
                    <div class="doc-icon">${statusIcons[doc.status] || '⬜'}</div>
                    <div class="doc-info">
                        <div class="doc-name">${doc.nome}</div>
                        <div class="doc-category">${doc.categoria || 'geral'} ${doc.obrigatorio ? '· Obrigatório' : ''}</div>
                        ${doc.comentarioAdmin ? `<div class="doc-comment">📝 ${doc.comentarioAdmin}</div>` : ''}
                    </div>
                    <div class="doc-actions">
                        <span class="doc-status ${doc.status}">${doc.status}</span>
                        ${doc.arquivoUrl ? `<a href="${doc.arquivoUrl}" target="_blank" class="btn-icon" title="Ver arquivo" onclick="event.stopPropagation()">📎</a>` : ''}
                        <button class="btn-icon btn-delete-doc" data-id="${doc.id}" title="Excluir documento" onclick="event.stopPropagation()" style="color: var(--accent-red); margin-left: 8px;">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Click to change status
        container.querySelectorAll('.doc-item').forEach(item => {
            item.addEventListener('click', () => {
                const docId = item.dataset.docId;
                const doc = docs.find(d => d.id === docId);
                if (!doc) return;

                const modal = document.getElementById('modal-doc-status');
                document.getElementById('modal-doc-title').textContent = doc.nome;
                document.getElementById('doc-status-select').value = doc.status;
                document.getElementById('doc-comment').value = doc.comentarioAdmin || '';
                modal.classList.add('show');

                document.getElementById('modal-close-doc').onclick = () => modal.classList.remove('show');
                document.getElementById('btn-cancel-doc').onclick = () => modal.classList.remove('show');
                modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };

                document.getElementById('btn-save-doc-status').onclick = async () => {
                    const newStatus = document.getElementById('doc-status-select').value;
                    const comment = document.getElementById('doc-comment').value.trim();

                    try {
                        const { error: docError } = await supabase
                            .from('documentos')
                            .update({
                                status: newStatus,
                                comentarioAdmin: comment
                            })
                            .eq('id', docId);

                        if (docError) throw docError;

                        const newHistory = [...(clientData.historico || [])];
                        newHistory.push({
                            data: new Date().toISOString(),
                            acao: `Documento "${doc.nome}" → ${newStatus}`,
                            por: Auth.userData.nome || 'Admin'
                        });

                        const { error: userError } = await supabase
                            .from('users')
                            .update({ historico: newHistory })
                            .eq('id', clientId);

                        if (userError) throw userError;

                        modal.classList.remove('show');
                        loadDocuments(clientId);
                    } catch (error) {
                        console.error('Error updating doc:', error);
                    }
                };
            });
        });

        // Delete document
        container.querySelectorAll('.btn-delete-doc').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if(!confirm('Tem certeza que deseja excluir este documento do checklist?')) return;
                
                const docId = btn.dataset.id;
                try {
                    const { error } = await supabase
                        .from('documentos')
                        .delete()
                        .eq('id', docId);

                    if (error) throw error;
                    loadDocuments(clientId);
                } catch(err) {
                    console.error('Error deleting document:', err);
                    alert('Erro ao excluir documento.');
                }
            });
        });

        // Modal Add Custom Document Logic
        const btnAddDoc = document.getElementById('btn-add-doc');
        const modalCustomDoc = document.getElementById('modal-add-custom-doc');
        
        if (btnAddDoc && modalCustomDoc) {
            btnAddDoc.onclick = () => modalCustomDoc.classList.add('show');
            document.getElementById('modal-close-custom-doc').onclick = () => modalCustomDoc.classList.remove('show');
            document.getElementById('btn-cancel-custom-doc').onclick = () => modalCustomDoc.classList.remove('show');
            
            document.getElementById('btn-save-custom-doc').onclick = async () => {
                const name = document.getElementById('custom-doc-name').value.trim();
                const category = document.getElementById('custom-doc-category').value;
                const isMandatory = document.getElementById('custom-doc-mandatory').value === 'true';
                const deadline = document.getElementById('custom-doc-deadline').value;
                
                if(!name) {
                    alert('Por favor, informe o nome do documento.');
                    return;
                }
                
                try {
                    document.getElementById('btn-save-custom-doc').disabled = true;
                    
                    const { error: docError } = await supabase
                        .from('documentos')
                        .insert({
                            userId: clientId,
                            nome: name,
                            categoria: category,
                            obrigatorio: isMandatory,
                            status: 'pendente'
                        });

                    if (docError) throw docError;
                    
                    const newHistory = [...(clientData.historico || [])];
                    newHistory.push({
                        data: new Date().toISOString(),
                        acao: `Novo documento solicitado: "${name}"`,
                        por: Auth.userData.nome || 'Admin'
                    });

                    const { error: userError } = await supabase
                        .from('users')
                        .update({ historico: newHistory })
                        .eq('id', clientId);

                    if (userError) throw userError;
                    
                    document.getElementById('custom-doc-name').value = '';
                    document.getElementById('custom-doc-deadline').value = '';
                    modalCustomDoc.classList.remove('show');
                    
                    loadDocuments(clientId);
                } catch (err) {
                    console.error('Error adding custom doc:', err);
                    alert('Erro ao adicionar documento.');
                } finally {
                    document.getElementById('btn-save-custom-doc').disabled = false;
                }
            };
        }

    } catch (error) {
        console.error('Error loading docs:', error);
    }
}

function renderHistory(historico) {
    const container = document.getElementById('history-list');
    if (!historico || historico.length === 0) {
        container.innerHTML = '<li class="timeline-item"><div class="timeline-dot"></div><div><div class="timeline-text" style="color: var(--text-muted);">Nenhum registro ainda.</div></div></li>';
        return;
    }

    // Sort by date descending
    const sorted = [...historico].sort((a, b) => new Date(b.data) - new Date(a.data));

    container.innerHTML = sorted.map(item => `
        <li class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
                <div class="timeline-text">${item.acao}</div>
                <div class="timeline-date">${new Date(item.data).toLocaleDateString('pt-BR')} às ${new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · por ${item.por || 'Sistema'}</div>
            </div>
        </li>
    `).join('');
}

function renderDates(dates) {
    const container = document.getElementById('dates-list');
    if (!dates || dates.length === 0) {
        container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted);">Nenhuma data cadastrada.</div>';
        return;
    }

    container.innerHTML = dates.map(d => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.03);">
            <span style="font-size: 1.1rem;">${d.concluida ? '✅' : '📅'}</span>
            <div style="flex: 1;">
                <div style="font-size: 0.88rem; font-weight: 600;">${d.titulo}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${d.data}</div>
            </div>
        </div>
    `).join('');
}

// ==============================
// PDF GENERATOR
// ==============================
async function initGerarPDF() {
    const typeSelect = document.getElementById('pdf-type');
    const clientSelect = document.getElementById('pdf-client-select');
    const reciboFields = document.getElementById('recibo-fields');
    const planoAcaoFields = document.getElementById('plano-acao-fields');
    const preparacaoDocsFields = document.getElementById('preparacao-docs-fields');
    const profissaoSelect = document.getElementById('pdf-profissao');
    const idiomaCheckbox = document.getElementById('pdf-idioma-requisito');

    const planoSelect = document.getElementById('pdf-plano');
    const pessoasSelect = document.getElementById('pdf-pessoas');
    const valorInput = document.getElementById('pdf-valor');

    function recarregarPrecoAutomatico() {
        const plano = planoSelect?.value;
        const pessoas = parseInt(pessoasSelect?.value) || 1;
        if (plano && PDFTemplates.precosFamiliares && PDFTemplates.precosFamiliares[plano]) {
            valorInput.value = PDFTemplates.precosFamiliares[plano][pessoas] || '';
        }
    }

    if (planoSelect && pessoasSelect && valorInput) {
        planoSelect.addEventListener('change', recarregarPrecoAutomatico);
        pessoasSelect.addEventListener('change', recarregarPrecoAutomatico);
    }

    // Show/hide conditional fields
    typeSelect.addEventListener('change', () => {
        const type = typeSelect.value;
        reciboFields.style.display = type === 'recibo' ? 'block' : 'none';
        planoAcaoFields.style.display = type === 'plano_acao' ? 'block' : 'none';
        preparacaoDocsFields.style.display = type === 'preparacao_docs' ? 'block' : 'none';
    });

    // Handle profession change (autofill language checkbox)
    if (profissaoSelect && idiomaCheckbox) {
        profissaoSelect.addEventListener('change', () => {
            const prof = profissaoSelect.value;
            if (prof === 'medicina') {
                idiomaCheckbox.checked = true;
                idiomaCheckbox.disabled = true;
            } else if (prof === 'enfermagem') {
                idiomaCheckbox.checked = true;
                idiomaCheckbox.disabled = false;
            } else {
                idiomaCheckbox.checked = false;
                idiomaCheckbox.disabled = false;
            }
        });
    }

    // Load clients for dropdown
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'cliente');

        if (error) throw error;

        (data || []).forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = `${profile.nome} (${Auth.planoLabels[profile.plano] || profile.plano})`;
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clients for PDF:', error);
    }

    // Pre-select client and type from URL
    const params = new URLSearchParams(window.location.search);
    const preselectedClient = params.get('client');
    if (preselectedClient) {
        clientSelect.value = preselectedClient;
        fillFromClient(preselectedClient);
    }
    const preselectedType = params.get('type');
    if (preselectedType) {
        typeSelect.value = preselectedType;
        typeSelect.dispatchEvent(new Event('change'));
    }

    // Client select change
    clientSelect.addEventListener('change', () => {
        const clientId = clientSelect.value;
        if (clientId) {
            fillFromClient(clientId);
        }
    });

    async function fillFromClient(clientId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', clientId)
                .single();

            if (error) throw error;
            if (data) {
                document.getElementById('pdf-nome').value = data.nome || '';
                document.getElementById('pdf-email').value = data.email || '';
                document.getElementById('pdf-telefone').value = data.telefone || '';
                document.getElementById('pdf-plano').value = data.plano || 'vistos';
                document.getElementById('pdf-visto').value = data.tipoVisto || 'estudo_cap';
                document.getElementById('pdf-valor').value = data.valorTotal || '';
            }
        } catch (error) {
            console.error('Error filling client data:', error);
        }
    }

    // Gather form data
    function getFormData() {
        return {
            nome: document.getElementById('pdf-nome').value.trim(),
            email: document.getElementById('pdf-email').value.trim(),
            telefone: document.getElementById('pdf-telefone').value.trim(),
            passaporte: document.getElementById('pdf-passaporte').value.trim(),
            plano: document.getElementById('pdf-plano').value,
            pessoas: parseInt(document.getElementById('pdf-pessoas').value) || 1,
            tipoVisto: document.getElementById('pdf-visto').value,
            valorCustom: parseFloat(document.getElementById('pdf-valor').value) || undefined,
            valor: parseFloat(document.getElementById('pdf-valor').value) || 0,
            // Recibo specific
            metodoPagamento: document.getElementById('pdf-metodo')?.value,
            pago: document.getElementById('pdf-pago')?.checked,
            // Plano de Ação specific
            justificativa: document.getElementById('pdf-justificativa')?.value?.trim(),
            observacoes: document.getElementById('pdf-observacoes')?.value?.trim(),
            // Preparação de Documentos specific
            profissao: document.getElementById('pdf-profissao')?.value,
            idiomaRequisito: document.getElementById('pdf-idioma-requisito')?.checked,
            instrucoesExtra: document.getElementById('pdf-instrucoes-extra')?.value?.trim(),
        };
    }

    // Preview
    document.getElementById('btn-preview').addEventListener('click', async () => {
        const type = typeSelect.value;
        const data = getFormData();
        const previewContainer = document.getElementById('pdf-preview');

        try {
            let clientProfile = null;
            if (clientSelect.value) {
                const { data: profile, error: profileErr } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', clientSelect.value)
                    .single();

                if (profileErr) throw profileErr;
                clientProfile = profile;
            }

            // For checklist, load docs from client
            if (type === 'checklist' && clientSelect.value) {
                const { data: docs, error: docsErr } = await supabase
                    .from('documentos')
                    .select('*')
                    .eq('userId', clientSelect.value);

                if (docsErr) throw docsErr;
                data.documentos = docs || [];
            }

            // For plano_acao, load custom analysis if client is selected
            if (type === 'plano_acao' && clientProfile) {
                if (clientProfile.analisePerfil) {
                    data.resultadoAnalise = clientProfile.analisePerfil.resultadoPesquisa;
                    data.idade = clientProfile.analisePerfil.idadeTitular;
                    data.origem = clientProfile.analisePerfil.origem;
                    data.profissao = clientProfile.analisePerfil.profissao;
                    data.idioma = clientProfile.analisePerfil.idioma;
                    data.cnh = clientProfile.analisePerfil.cnh;
                    data.membros = clientProfile.analisePerfil.membros;
                    data.motivacao = clientProfile.analisePerfil.motivacao;
                    data.financeiro = clientProfile.analisePerfil.financeiro;
                    data.renda = clientProfile.analisePerfil.renda;
                    data.estrategiaIda = clientProfile.analisePerfil.estrategiaIda;
                    data.prazo = clientProfile.analisePerfil.prazo;
                    data.prefRegiao = clientProfile.analisePerfil.prefRegiao;
                    data.prefMoradia = clientProfile.analisePerfil.prefMoradia;
                }
            }

            const html = await PDFTemplates.generate(type, data, { preview: true });
            previewContainer.innerHTML = html;
            previewContainer.style.background = '#fff';
        } catch (error) {
            console.error('Preview error:', error);
            previewContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Erro ao gerar preview</div><div class="empty-state-sub">${error.message}</div></div>`;
        }
    });

    // Save to Portal UI toggle
    const savePortalContainer = document.getElementById('save-portal-container');
    const savePortalCheckbox = document.getElementById('pdf-save-portal');

    function toggleSavePortalCheckbox() {
        if (clientSelect && savePortalContainer) {
            if (clientSelect.value) {
                savePortalContainer.style.display = 'block';
            } else {
                savePortalContainer.style.display = 'none';
                if (savePortalCheckbox) savePortalCheckbox.checked = false;
            }
        }
    }

    if (clientSelect) {
        clientSelect.addEventListener('change', toggleSavePortalCheckbox);
        toggleSavePortalCheckbox();
    }

    // Generate PDF
    document.getElementById('btn-generate').addEventListener('click', async () => {
        const type = typeSelect.value;
        const data = getFormData();
        const btn = document.getElementById('btn-generate');

        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> Gerando...';

        try {
            let clientProfile = null;
            if (clientSelect.value) {
                const { data: profile, error: profileErr } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', clientSelect.value)
                    .single();

                if (profileErr) throw profileErr;
                clientProfile = profile;
            }

            if (type === 'checklist' && clientSelect.value) {
                const { data: docs, error: docsErr } = await supabase
                    .from('documentos')
                    .select('*')
                    .eq('userId', clientSelect.value);

                if (docsErr) throw docsErr;
                data.documentos = docs || [];
            }

            // For plano_acao, load custom analysis if client is selected
            if (type === 'plano_acao' && clientProfile) {
                if (clientProfile.analisePerfil) {
                    data.resultadoAnalise = clientProfile.analisePerfil.resultadoPesquisa;
                    data.idade = clientProfile.analisePerfil.idadeTitular;
                    data.origem = clientProfile.analisePerfil.origem;
                    data.profissao = clientProfile.analisePerfil.profissao;
                    data.idioma = clientProfile.analisePerfil.idioma;
                    data.cnh = clientProfile.analisePerfil.cnh;
                    data.membros = clientProfile.analisePerfil.membros;
                    data.motivacao = clientProfile.analisePerfil.motivacao;
                    data.financeiro = clientProfile.analisePerfil.financeiro;
                    data.renda = clientProfile.analisePerfil.renda;
                    data.estrategiaIda = clientProfile.analisePerfil.estrategiaIda;
                    data.prazo = clientProfile.analisePerfil.prazo;
                    data.prefRegiao = clientProfile.analisePerfil.prefRegiao;
                    data.prefMoradia = clientProfile.analisePerfil.prefMoradia;
                }
            }

            // 1. Download for admin
            await PDFTemplates.generate(type, data);

            // 2. Save to portal if selected
            if (clientSelect.value && savePortalCheckbox && savePortalCheckbox.checked && clientProfile) {
                btn.innerHTML = '<span>⏳</span> Salvando no portal...';
                
                // Generate as blob
                const blob = await PDFTemplates.generate(type, data, { blob: true });
                
                // Upload to Storage
                const filename = `${type}_${Date.now()}.pdf`;
                const storagePath = `${clientSelect.value}/${filename}`;
                
                const { data: uploadData, error: uploadErr } = await supabase.storage
                    .from('contratos')
                    .upload(storagePath, blob);

                if (uploadErr) throw uploadErr;

                // Get public URL
                const { data: { publicUrl: downloadUrl } } = supabase.storage
                    .from('contratos')
                    .getPublicUrl(storagePath);
                
                // Create document in user's 'contratos' table
                const { error: insertErr } = await supabase.from('contratos').insert({
                    userId: clientSelect.value,
                    tipo: type,
                    plano: data.plano || '',
                    dataGeracao: new Date().toISOString(),
                    arquivoUrl: downloadUrl,
                    status: 'ativo'
                });

                if (insertErr) throw insertErr;

                // Update user history
                const typeLabels = { contrato: 'Contrato', plano_acao: 'Plano de Ação', checklist: 'Checklist', recibo: 'Recibo', proposta: 'Proposta', preparacao_docs: 'Guia de Preparação de Documentos' };
                const docLabel = typeLabels[type] || type;

                const newHistory = [...(clientProfile.historico || [])];
                newHistory.push({
                    data: new Date().toISOString(),
                    acao: `Documento gerado e salvo no portal: "${docLabel}"`,
                    por: Auth.userData.nome || 'Admin'
                });

                const { error: histErr } = await supabase
                    .from('users')
                    .update({ historico: newHistory })
                    .eq('id', clientSelect.value);

                if (histErr) throw histErr;

                alert('PDF baixado e salvo com sucesso no Portal do Cliente!');
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Erro ao gerar PDF: ' + error.message);
        }

        btn.disabled = false;
        btn.innerHTML = '<span>📥</span> Baixar PDF';
    });
}

async function loadNotaFiscal(clientId) {
    const statusContainer = document.getElementById('nf-status-container');
    const fileInput = document.getElementById('nf-file-input');
    const uploadBtn = document.getElementById('btn-upload-nf');

    if (!statusContainer || !fileInput || !uploadBtn) return;

    // Fetch the client data to retrieve history correctly
    let clientData = null;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', clientId)
            .single();
        if (!error && data) {
            clientData = data;
        }
    } catch (e) {
        console.error('Error fetching client details for NF history:', e);
    }

    // Habilita o botão quando escolhe arquivo
    fileInput.addEventListener('change', () => {
        uploadBtn.disabled = fileInput.files.length === 0;
        if (fileInput.files.length > 0) {
            uploadBtn.classList.remove('btn-secondary');
            uploadBtn.classList.add('btn-primary');
        } else {
            uploadBtn.classList.remove('btn-primary');
            uploadBtn.classList.add('btn-secondary');
        }
    });

    const renderNF = async () => {
        try {
            statusContainer.innerHTML = '<span style="color: var(--text-muted);">Buscando nota fiscal...</span>';
            const { data, error } = await supabase
                .from('contratos')
                .select('*')
                .eq('userId', clientId)
                .eq('tipo', 'nota_fiscal');

            if (error) throw error;
            
            const nf = data && data.length > 0 ? data[0] : null;

            if (nf) {
                statusContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.18);">
                        <div style="flex: 1; min-width: 0; padding-right: 8px;">
                            <span style="color: var(--accent-green); font-weight: 700; display: inline-flex; align-items: center; gap: 4px; font-size: 0.82rem;">🧾 Nota Fiscal Ativa</span>
                            <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Enviada em ${new Date(nf.dataGeracao).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div style="display: flex; gap: 6px; flex-shrink: 0;">
                            <a href="${nf.arquivoUrl}" target="_blank" class="btn-portal btn-secondary btn-small" style="padding: 4px 8px; font-size: 0.72rem; display: flex; align-items: center; gap: 2px;" title="Visualizar arquivo">👁️ Ver</a>
                            <button class="btn-portal btn-small btn-delete-nf" data-nf-id="${nf.id}" data-nf-url="${nf.arquivoUrl}" style="padding: 4px 8px; font-size: 0.72rem; background: rgba(239, 68, 68, 0.1); color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 2px;" title="Excluir arquivo">🗑️ Excluir</button>
                        </div>
                    </div>
                `;

                // Adiciona o click para excluir
                statusContainer.querySelector('.btn-delete-nf').addEventListener('click', async (e) => {
                    if (!confirm('Tem certeza que deseja excluir esta nota fiscal do cliente?')) return;
                    
                    const nfId = e.currentTarget.dataset.nfId;
                    const nfUrl = e.currentTarget.dataset.nfUrl;

                    try {
                        e.currentTarget.disabled = true;
                        e.currentTarget.textContent = '⏳...';

                        // 1. Deleta da tabela contratos
                        const { error: deleteErr } = await supabase
                            .from('contratos')
                            .delete()
                            .eq('id', nfId);

                        if (deleteErr) throw deleteErr;

                        // 2. Tenta extrair o path do storage e excluir do storage
                        try {
                            const storagePath = nfUrl.split('/storage/v1/object/public/contratos/').pop();
                            if (storagePath) {
                                await supabase.storage.from('contratos').remove([decodeURIComponent(storagePath)]);
                            }
                        } catch (stErr) {
                            console.error('Error removing file from storage:', stErr);
                        }

                        // 3. Registra no histórico
                        const newHistory = [...((clientData && clientData.historico) || [])];
                        newHistory.push({
                            data: new Date().toISOString(),
                            acao: 'Nota Fiscal removida do portal',
                            por: Auth.userData.nome || 'Admin'
                        });

                        await supabase
                            .from('users')
                            .update({ historico: newHistory })
                            .eq('id', clientId);

                        window.location.reload();
                    } catch (err) {
                        console.error('Error deleting NF:', err);
                        alert('Erro ao excluir nota fiscal.');
                        renderNF();
                    }
                });
            } else {
                statusContainer.innerHTML = '<span style="color: var(--text-light);">Nenhuma nota fiscal emitida ainda.</span>';
            }
        } catch (err) {
            console.error('Error loading NF status:', err);
            statusContainer.innerHTML = '<span style="color: var(--accent-red);">Erro ao carregar nota fiscal.</span>';
        }
    };

    // Executa inicialmente
    await renderNF();

    // Event listener para o botão de upload
    uploadBtn.addEventListener('click', async () => {
        if (fileInput.files.length === 0) return;
        const file = fileInput.files[0];

        try {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span>⏳</span> Enviando...';

            // 1. Upload do arquivo para o bucket contratos
            const ext = file.name.split('.').pop();
            const filename = `nf_${Date.now()}.${ext}`;
            const storagePath = `${clientId}/${filename}`;

            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('contratos')
                .upload(storagePath, file);

            if (uploadErr) throw uploadErr;

            // Get public URL
            const { data: { publicUrl: downloadUrl } } = supabase.storage
                .from('contratos')
                .getPublicUrl(storagePath);

            // 2. Insere registro na tabela contratos
            const { error: insertErr } = await supabase
                .from('contratos')
                .insert({
                    userId: clientId,
                    tipo: 'nota_fiscal',
                    dataGeracao: new Date().toISOString(),
                    arquivoUrl: downloadUrl,
                    status: 'ativo'
                });

            if (insertErr) throw insertErr;

            // 3. Registra no histórico
            const newHistory = [...((clientData && clientData.historico) || [])];
            newHistory.push({
                data: new Date().toISOString(),
                acao: 'Nota Fiscal emitida e enviada para o portal',
                por: Auth.userData.nome || 'Admin'
            });

            await supabase
                .from('users')
                .update({ historico: newHistory })
                .eq('id', clientId);

            window.location.reload();
        } catch (err) {
            console.error('Error uploading NF:', err);
            alert('Erro ao enviar arquivo da nota fiscal.');
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<span>📤</span> Enviar Nota Fiscal';
        }
    });
}

/* ========================================
   DESTINO ESPANHA — Client Portal JavaScript
   Dashboard, Documents Upload, Contracts
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {

    // ==============================
    // AUTH CHECK
    // ==============================
    let userData = null;
    try {
        userData = await Auth.init('cliente');
        if (!userData) return;

        // Update sidebar
        const avatarEl = document.getElementById('user-avatar');
        const nameEl = document.getElementById('user-name');
        const emailEl = document.getElementById('user-email');
        if (avatarEl) avatarEl.textContent = (userData.nome || 'C').charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = userData.nome || 'Cliente';
        if (emailEl) emailEl.textContent = userData.email || '';

        // Update pending docs badge
        updatePendingBadge();

    } catch (error) {
        console.error('Auth error:', error);
        return;
    }

    // ==============================
    // COMMON
    // ==============================
    setupSidebar();
    setupLogout();

    // ==============================
    // ROUTE
    // ==============================
    const page = window.location.pathname.split('/').pop();

    if (page === 'painel.html' || page === '') {
        initPainel(userData);
    } else if (page === 'documentos.html') {
        initDocumentos(userData);
    } else if (page === 'contratos.html') {
        initContratos(userData);
    } else if (page === 'servicos.html') {
        initServicos(userData);
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

        // Insere o botão de alterar senha dinamicamente acima do botão de logout
        const changePwdBtn = document.createElement('button');
        changePwdBtn.className = 'btn-logout';
        changePwdBtn.id = 'btn-change-pwd';
        changePwdBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        changePwdBtn.style.color = '#fff';
        changePwdBtn.style.marginBottom = '8px';
        changePwdBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        changePwdBtn.style.display = 'flex';
        changePwdBtn.style.alignItems = 'center';
        changePwdBtn.style.gap = '8px';
        changePwdBtn.innerHTML = '<span>🔑</span> Alterar Senha';

        changePwdBtn.addEventListener('click', async () => {
            const novaSenha = prompt('Digite sua nova senha (mínimo de 6 caracteres):');
            if (novaSenha === null) return; // Clicou em cancelar

            if (novaSenha.trim().length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            try {
                const { error } = await supabase.auth.updateUser({ password: novaSenha.trim() });
                if (error) throw error;
                alert('Senha atualizada com sucesso!');
            } catch (err) {
                alert('Erro ao atualizar a senha: ' + (err.message || err));
            }
        });

        btn.parentNode.insertBefore(changePwdBtn, btn);
    }
}

async function updatePendingBadge() {
    try {
        const uid = auth.currentUser.id;
        const { data, error } = await supabase
            .from('documentos')
            .select('id')
            .eq('userId', uid)
            .in('status', ['pendente', 'revisar']);
        
        if (error) throw error;
        const count = data?.length || 0;
        const badge = document.getElementById('docs-pending-badge');
        if (badge && count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        }
    } catch (e) { /* ignore */ }
}

// ==============================
// PAINEL (Dashboard)
// ==============================
async function initPainel(userData) {
    // Greeting
    const firstName = (userData.nome || 'Cliente').split(' ')[0];
    document.getElementById('greeting-name').textContent = firstName;
    document.getElementById('greeting-plano').textContent = `${Auth.planoLabels[userData.plano] || 'Assessoria'} · ${Auth.faseLabels[userData.fase] || 'Em andamento'}`;

    // Progress
    const progress = Auth.getFaseProgress(userData.fase);
    document.getElementById('progress-pct').textContent = progress + '%';
    document.getElementById('progress-fill').style.width = progress + '%';

    // Progress Steps
    const stepsContainer = document.getElementById('progress-steps');
    const currentFaseIdx = Auth.getFaseIndex(userData.fase);

    stepsContainer.innerHTML = Auth.faseOrder.map((fase, i) => {
        let stateClass = '';
        let icon = i + 1;
        if (i < currentFaseIdx) {
            stateClass = 'completed';
            icon = '✓';
        } else if (i === currentFaseIdx) {
            stateClass = 'active';
        }
        return `
            <div class="progress-step ${stateClass}">
                <div class="progress-step-dot">${icon}</div>
                <div class="progress-step-label">${Auth.faseLabels[fase]}</div>
            </div>
        `;
    }).join('');

    // Visa type
    document.getElementById('card-visto').textContent = Auth.vistoLabels[userData.tipoVisto] || 'Não definido';

    // Documents count
    try {
        const { data: docsSnap, error } = await supabase
            .from('documentos')
            .select('status')
            .eq('userId', userData.id);

        if (error) throw error;
        let total = 0, approved = 0;
        (docsSnap || []).forEach(d => {
            total++;
            if (d.status === 'aprovado') approved++;
        });
        document.getElementById('card-docs').textContent = `${approved} de ${total} aprovados`;
    } catch (e) {
        document.getElementById('card-docs').textContent = '—';
    }

    // Next step / dates
    if (userData.datasImportantes && userData.datasImportantes.length > 0) {
        const upcoming = userData.datasImportantes
            .filter(d => !d.concluida && new Date(d.data) >= new Date())
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        if (upcoming.length > 0) {
            document.getElementById('card-next').textContent = `${upcoming[0].titulo} — ${upcoming[0].data}`;
        }

        // Dates list
        const datesContainer = document.getElementById('dates-list');
        datesContainer.innerHTML = userData.datasImportantes.map(d => {
            const isPast = new Date(d.data) < new Date();
            return `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.03);">
                    <span style="font-size: 1.1rem;">${d.concluida ? '✅' : isPast ? '⏰' : '📅'}</span>
                    <div style="flex: 1;">
                        <div style="font-size: 0.88rem; font-weight: 600; ${isPast && !d.concluida ? 'color: var(--accent-red);' : ''}">${d.titulo}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${d.data}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // History
    const historyContainer = document.getElementById('history-list');
    if (userData.historico && userData.historico.length > 0) {
        const sorted = [...userData.historico].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 8);
        historyContainer.innerHTML = sorted.map(item => `
            <li class="timeline-item">
                <div class="timeline-dot"></div>
                <div>
                    <div class="timeline-text">${item.acao}</div>
                    <div class="timeline-date">${new Date(item.data).toLocaleDateString('pt-BR')} às ${new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </li>
        `).join('');
    } else {
        historyContainer.innerHTML = '<li class="timeline-item"><div class="timeline-dot"></div><div><div class="timeline-text" style="color: var(--text-muted);">Nenhuma atividade registrada ainda.</div></div></li>';
    }
}

// ==============================
// DOCUMENTOS (Upload)
// ==============================
async function initDocumentos(userData) {
    const uid = userData.id;
    let documents = [];
    const isDiagnostico = userData.plano === 'diagnostico';

    if (isDiagnostico) {
        const bannerTitle = document.getElementById('docs-banner-title');
        const bannerDesc = document.getElementById('docs-banner-desc');
        if (bannerTitle) bannerTitle.textContent = 'Autogestão do Checklist';
        if (bannerDesc) bannerDesc.textContent = 'Como você está no plano de Diagnóstico Estrutúrgico, este checklist é de autogestão pessoal. Marque os documentos que já possui ou providenciou para acompanhar a sua própria preparação. Não é necessário fazer o envio de arquivos ou aguardar validação da assessoria.';
    }

    async function loadDocs() {
        try {
            const { data, error } = await supabase
                .from('documentos')
                .select('*')
                .eq('userId', uid);

            if (error) throw error;
            documents = data || [];

            const total = documents.length;
            const approved = documents.filter(d => d.status === 'aprovado').length;
            const pending = documents.filter(d => d.status === 'pendente' || d.status === 'revisar').length;
            const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

            document.getElementById('docs-summary').textContent = isDiagnostico ? `${approved}/${total} providenciados · ${pending} restantes` : `${approved}/${total} aprovados · ${pending} pendentes`;
            document.getElementById('docs-progress-fill').style.width = pct + '%';
            document.getElementById('docs-progress-text').textContent = pct + '%';

            renderDocs();
        } catch (error) {
            console.error('Error loading docs:', error);
        }
    }

    function renderDocs() {
        const container = document.getElementById('docs-list-body');
        const statusIcons = { pendente: '⬜', enviado: '🟡', aprovado: '✅', revisar: '❌' };
        const statusLabels = { pendente: 'Pendente', enviado: 'Enviado — Aguardando análise', aprovado: 'Aprovado ✓', revisar: 'Revisão necessária' };

        if (documents.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-state-icon">📄</div><div class="empty-state-text">Nenhum documento cadastrado ainda.</div><div class="empty-state-sub">Aguarde a configuração do seu assessor.</div></div>';
            return;
        }

        // Group by category
        const grouped = {};
        documents.forEach(doc => {
            const cat = doc.categoria || 'geral';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(doc);
        });

        const catLabels = {
            pessoal: '📄 Documentos Pessoais',
            saude: '🏥 Saúde',
            financeiro: '💰 Comprovação Financeira',
            estudo: '🎓 Estudo',
            trabalho: '💼 Trabalho',
            moradia: '🏠 Moradia',
            residencia: '📋 Residência',
            familiar: '👨‍👩‍👧 Familiar',
            geral: '📁 Outros'
        };

        let html = '';
        Object.entries(grouped).forEach(([cat, docs]) => {
            html += `<div style="padding: 12px 24px; background: var(--bg-section); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted);">${catLabels[cat] || cat}</div>`;
            docs.forEach(doc => {
                const isApproved = doc.status === 'aprovado';
                
                let docIconHtml = '';
                let docActionsHtml = '';
                let docCategoryHtml = '';

                if (isDiagnostico) {
                    docIconHtml = `<input type="checkbox" class="self-check-doc" data-doc-id="${doc.id}" ${isApproved ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--gold-dark); margin-right: 4px;">`;
                    docCategoryHtml = `
                        ${isApproved ? 'Possuo' : 'Pendente'}
                        ${doc.dataLimite ? `&nbsp;·&nbsp;<strong style="color: var(--accent-red);">Prazo: ${new Date(doc.dataLimite + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>` : ''}
                    `;
                    docActionsHtml = `<span style="font-size: 0.82rem; font-weight: 600; color: ${isApproved ? 'var(--accent-green)' : 'var(--text-light)'};">${isApproved ? 'Possuo ✓' : 'Pendente'}</span>`;
                } else {
                    const canUpload = doc.status !== 'aprovado';
                    docIconHtml = statusIcons[doc.status] || '⬜';
                    docCategoryHtml = `
                        ${statusLabels[doc.status] || doc.status}
                        ${doc.dataLimite ? `&nbsp;·&nbsp;<strong style="color: var(--accent-red);">Prazo: ${new Date(doc.dataLimite + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>` : ''}
                    `;
                    docActionsHtml = `
                        ${doc.arquivoUrl ? `<a href="${doc.arquivoUrl}" target="_blank" class="btn-icon" title="Ver arquivo enviado" onclick="event.stopPropagation()">📎</a>` : ''}
                        ${canUpload ? `<button class="btn-portal btn-primary btn-small btn-upload-doc" data-doc-id="${doc.id}" data-doc-name="${doc.nome}">📤 Enviar</button>` : '<span style="color: var(--accent-green); font-size: 0.82rem; font-weight: 600;">✓ OK</span>'}
                    `;
                }

                html += `
                    <div class="doc-item" style="${isDiagnostico ? 'display: flex; align-items: center;' : ''}">
                        <div class="doc-icon" style="${isDiagnostico ? 'display: flex; align-items: center; justify-content: center;' : ''}">${docIconHtml}</div>
                        <div class="doc-info" style="${isDiagnostico ? 'flex: 1; margin-left: 8px;' : ''}">
                            <div class="doc-name">${doc.nome} ${doc.obrigatorio ? '<span style="color: var(--accent-red);">*</span>' : ''}</div>
                            <div class="doc-category">
                                ${docCategoryHtml}
                            </div>
                            ${doc.comentarioAdmin ? `<div class="doc-comment">💬 ${doc.comentarioAdmin}</div>` : ''}
                        </div>
                        <div class="doc-actions">
                            ${docActionsHtml}
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;

        if (isDiagnostico) {
            // Checkbox change clicks
            container.querySelectorAll('.self-check-doc').forEach(chk => {
                chk.addEventListener('change', async (e) => {
                    const docId = chk.dataset.docId;
                    const isChecked = chk.checked;
                    const newStatus = isChecked ? 'aprovado' : 'pendente';
                    
                    try {
                        chk.disabled = true;
                        const { error } = await supabase
                            .from('documentos')
                            .update({
                                status: newStatus,
                                dataEnvio: new Date().toISOString()
                            })
                            .eq('id', docId);

                        if (error) throw error;

                        await loadDocs();
                    } catch (error) {
                        console.error('Error updating self-managed document:', error);
                        alert('Erro ao atualizar documento.');
                        chk.checked = !isChecked; // Revert checkbox state
                        chk.disabled = false;
                    }
                });
            });
        } else {
            // Upload button clicks
            container.querySelectorAll('.btn-upload-doc').forEach(btn => {
                btn.addEventListener('click', () => {
                    openUploadModal(btn.dataset.docId, btn.dataset.docName);
                });
            });
        }
    }

    // Upload Modal
    let currentDocId = null;
    let selectedFile = null;

    function openUploadModal(docId, docName) {
        currentDocId = docId;
        selectedFile = null;
        document.getElementById('upload-doc-title').textContent = `Enviar: ${docName}`;
        document.getElementById('upload-file-info').style.display = 'none';
        document.getElementById('upload-error').classList.remove('show');
        document.getElementById('upload-success').classList.remove('show');
        document.getElementById('btn-submit-upload').disabled = true;
        document.getElementById('upload-input').value = '';
        document.getElementById('modal-upload').classList.add('show');
    }

    function closeUploadModal() {
        document.getElementById('modal-upload').classList.remove('show');
        currentDocId = null;
        selectedFile = null;
    }

    document.getElementById('modal-close-upload')?.addEventListener('click', closeUploadModal);
    document.getElementById('btn-cancel-upload')?.addEventListener('click', closeUploadModal);
    document.getElementById('modal-upload')?.addEventListener('click', (e) => { if (e.target.id === 'modal-upload') closeUploadModal(); });

    // Upload zone
    const uploadZone = document.getElementById('upload-zone');
    const uploadInput = document.getElementById('upload-input');

    if (uploadZone) {
        uploadZone.addEventListener('click', () => uploadInput.click());
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });
    }

    if (uploadInput) {
        uploadInput.addEventListener('change', () => {
            if (uploadInput.files.length > 0) handleFile(uploadInput.files[0]);
        });
    }

    function handleFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            document.getElementById('upload-error').textContent = 'Arquivo muito grande. Máximo: 10MB.';
            document.getElementById('upload-error').classList.add('show');
            return;
        }
        selectedFile = file;
        document.getElementById('upload-file-name').textContent = file.name;
        document.getElementById('upload-file-size').textContent = formatFileSize(file.size);
        document.getElementById('upload-file-info').style.display = 'block';
        document.getElementById('btn-submit-upload').disabled = false;
        document.getElementById('upload-error').classList.remove('show');
    }

    document.getElementById('upload-remove')?.addEventListener('click', () => {
        selectedFile = null;
        document.getElementById('upload-file-info').style.display = 'none';
        document.getElementById('btn-submit-upload').disabled = true;
        document.getElementById('upload-input').value = '';
    });

    // Submit upload
    document.getElementById('btn-submit-upload')?.addEventListener('click', async () => {
        if (!selectedFile || !currentDocId) return;

        const btn = document.getElementById('btn-submit-upload');
        const errorEl = document.getElementById('upload-error');
        const successEl = document.getElementById('upload-success');
        errorEl.classList.remove('show');
        successEl.classList.remove('show');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> Enviando...';

        try {
            // Upload to Supabase Storage
            const ext = selectedFile.name.split('.').pop();
            const storagePath = `${uid}/${currentDocId}_${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('documentos')
                .upload(storagePath, selectedFile);

            if (uploadErr) throw uploadErr;

            // Get public URL
            const { data: { publicUrl: downloadUrl } } = supabase.storage
                .from('documentos')
                .getPublicUrl(storagePath);

            // Update in public.documentos
            const { error: docErr } = await supabase
                .from('documentos')
                .update({
                    status: 'enviado',
                    arquivoUrl: downloadUrl,
                    dataEnvio: new Date().toISOString()
                })
                .eq('id', currentDocId);

            if (docErr) throw docErr;

            // Add to history
            const docData = documents.find(d => d.id === currentDocId);
            const newHistory = [...(userData.historico || [])];
            newHistory.push({
                data: new Date().toISOString(),
                acao: `Documento enviado: "${docData?.nome || 'documento'}"`,
                por: userData.nome || 'Cliente'
            });

            const { error: userErr } = await supabase
                .from('users')
                .update({ historico: newHistory })
                .eq('id', uid);

            if (userErr) throw userErr;

            successEl.textContent = '✅ Documento enviado com sucesso! Aguarde a análise da equipe.';
            successEl.classList.add('show');

            setTimeout(() => {
                closeUploadModal();
                loadDocs();
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            errorEl.textContent = 'Erro ao enviar arquivo. Tente novamente.';
            errorEl.classList.add('show');
        }

        btn.disabled = false;
        btn.innerHTML = '<span>📤</span> Enviar';
    });

    // Initial load
    await loadDocs();
}

// ==============================
// CONTRATOS
// ==============================
async function initContratos(userData) {
    const uid = userData.id;

    try {
        const { data, error } = await supabase
            .from('contratos')
            .select('*')
            .eq('userId', uid);

        if (error) throw error;
        const allDocs = data || [];

        const contracts = allDocs.filter(d => d.tipo === 'contrato' || d.tipo === 'plano_acao' || d.tipo === 'proposta' || d.tipo === 'checklist' || d.tipo === 'preparacao_docs');
        const receipts = allDocs.filter(d => d.tipo === 'recibo');

        // Render contracts
        const contractsContainer = document.getElementById('contracts-list');
        if (contracts.length === 0) {
            contractsContainer.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-state-icon">📝</div><div class="empty-state-text">Nenhum contrato disponível ainda.</div><div class="empty-state-sub">Seus contratos aparecerão aqui quando gerados pelo assessor.</div></div>';
        } else {
            contractsContainer.innerHTML = contracts.map(c => {
                const typeLabels = { contrato: '📝 Contrato', plano_acao: '📋 Plano de Ação', proposta: '📊 Proposta', checklist: '✅ Checklist', preparacao_docs: '📂 Guia de Preparação de Documentos' };
                const statusLabels = { ativo: 'Ativo', pendente: 'Pendente', concluido: 'Concluído' };
                return `
                    <div class="doc-item">
                        <div class="doc-icon">${typeLabels[c.tipo]?.charAt(0) || '📄'}</div>
                        <div class="doc-info">
                            <div class="doc-name">${typeLabels[c.tipo] || c.tipo} — ${Auth.planoLabels[c.plano] || c.plano || ''}</div>
                            <div class="doc-category">Gerado em ${Auth.formatDate(c.dataGeracao)} · ${statusLabels[c.status] || c.status}</div>
                        </div>
                        <div class="doc-actions">
                            ${c.arquivoUrl ? `<a href="${c.arquivoUrl}" target="_blank" class="btn-portal btn-secondary btn-small">📥 Baixar PDF</a>` : '<span style="font-size: 0.82rem; color: var(--text-muted);">Em preparação</span>'}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render receipts
        const receiptsContainer = document.getElementById('receipts-list');
        if (receipts.length === 0) {
            receiptsContainer.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-state-icon">💰</div><div class="empty-state-text">Nenhum recibo disponível.</div><div class="empty-state-sub">Seus recibos de pagamento aparecerão aqui.</div></div>';
        } else {
            receiptsContainer.innerHTML = receipts.map(r => `
                <div class="doc-item">
                    <div class="doc-icon">💰</div>
                    <div class="doc-info">
                        <div class="doc-name">Recibo — ${(r.valor || 0).toLocaleString('pt-BR')}€</div>
                        <div class="doc-category">Emitido em ${Auth.formatDate(r.dataGeracao)}</div>
                    </div>
                    <div class="doc-actions">
                        ${r.arquivoUrl ? `<a href="${r.arquivoUrl}" target="_blank" class="btn-portal btn-secondary btn-small">📥 Baixar PDF</a>` : ''}
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading contracts:', error);
        document.getElementById('contracts-list').innerHTML = '<div class="empty-state" style="padding: 30px;"><div class="empty-state-text">Erro ao carregar.</div></div>';
        document.getElementById('receipts-list').innerHTML = '<div class="empty-state" style="padding: 30px;"><div class="empty-state-text">Erro ao carregar.</div></div>';
    }
}

// ==============================
// HELPERS
// ==============================
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ==============================
// SERVIÇOS (Services Showcase + Purchase)
// ==============================
async function initServicos(userData) {
    const uid = userData.id;

    // Plan definitions
    const plans = [
        {
            key: 'diagnostico',
            icon: '🧭',
            name: 'Diagnóstico Estratégico',
            price: 150,
            desc: 'A bússola inicial. Ideal para entender qual o melhor visto para sua família.',
            features: ['Videochamada de 60-90 min', 'Análise de perfil completa', 'Plano de Ação em PDF', '15 dias de suporte WhatsApp'],
            popular: false
        },
        {
            key: 'documentacao',
            icon: '📁',
            name: 'Documentação Brasil',
            price: 350,
            desc: 'Organizamos toda a papelada para evitar erros fatais no Consulado.',
            features: ['Checklist personalizado', 'Apoio certidões e apostilas', 'Coordenação de traduções', 'Revisão final do dossiê'],
            popular: false
        },
        {
            key: 'vistos',
            icon: '🛂',
            name: 'Assessoria de Vistos',
            price: 750,
            desc: 'Cuidamos de todo o processo do visto: CAP, Não Lucrativa ou Nômade.',
            features: ['Tudo do "Documentação Brasil"', 'Agendamento no Consulado', 'Treinamento de entrevista', 'Seguro Saúde Obrigatório*'],
            popular: true
        },
        {
            key: 'aterragem',
            icon: '🇪🇸',
            name: 'Aterragem Espanha',
            price: 600,
            desc: 'Chegou? Ajudamos com toda a burocracia local para começar rápido.',
            features: ['Suporte NIE/TIE e banco', 'Empadronamiento rápido', 'Busca segura de moradia', 'Matrícula escolar dos filhos'],
            popular: false
        },
        {
            key: 'premium',
            icon: '👑',
            name: 'Premium Família VIP',
            price: 2000,
            desc: 'O acompanhamento definitivo de ponta a ponta. Zero preocupações.',
            features: ['Diagnóstico + Documentação completa', 'Assessoria de Visto + Seguro', 'Passagens Aéreas + Reserva de retorno', 'Aterragem + Moradia + Escola', 'Suporte prioritário ilimitado'],
            popular: false,
            premium: true
        }
    ];

    // Avulso services definitions
    const avulsos = [
        { icon: '📜', name: 'Busca de Certidões', desc: 'Localizamos e solicitamos certidões em cartórios de todo o Brasil.', price: 'Sob consulta', wa: 'Busca de Certidões' },
        { icon: '🏥', name: 'Seguro Saúde Espanhol', desc: 'Cotação e emissão da apólice obrigatória exigida pelo consulado.', price: 'A partir de 40€/mês', wa: 'Seguro Saúde Obrigatório' },
        { icon: '🎓', name: 'Homologação de Diploma', desc: 'Trâmite de revalidação de diplomas de ensino superior na Espanha.', price: 'Sob consulta', wa: 'Homologação de Diploma' },
        { icon: '🎫', name: 'Reserva de Retorno', desc: 'Comprovante de voo de volta oficial, verificado em sistemas aéreos.', price: '25€', wa: 'Reserva de Retorno' },
        { icon: '📋', name: 'Suporte em Cita Previa', desc: 'Assistência administrativa manual para agendamentos na Espanha.', price: 'A partir de 50€', wa: 'Suporte em Cita Previa' },
        { icon: '⚖️', name: 'Recurso de Visto Negado', desc: 'Levantamento documental e intermediação com advogados parceiros.', price: 'Sob consulta', wa: 'Recurso de Visto Negado' }
    ];

    const currentPlan = userData.plano;
    const currentValue = userData.valorTotal || 0;

    // --- Render current plan banner ---
    document.getElementById('current-plan-label').textContent =
        `Plano atual: ${Auth.planoLabels[currentPlan] || currentPlan}`;
    document.getElementById('current-plan-name').textContent =
        Auth.planoLabels[currentPlan] || 'Não definido';
    document.getElementById('current-plan-value').textContent =
        currentValue.toLocaleString('pt-BR') + '€';

    // --- Render plan cards ---
    const plansGrid = document.getElementById('plans-grid');
    plansGrid.innerHTML = plans.map(plan => {
        const isCurrent = plan.key === currentPlan;
        const classes = ['svc-card'];
        if (isCurrent) classes.push('is-current');
        if (plan.popular && !isCurrent) classes.push('is-popular');
        if (plan.premium) classes.push('is-premium');

        let badge = '';
        if (isCurrent) {
            badge = '<div class="svc-card-badge svc-badge-current">✅ Seu Plano Atual</div>';
        } else if (plan.popular) {
            badge = '<div class="svc-card-badge svc-badge-popular">⚡ Mais Escolhido</div>';
        }

        let actionBtn = '';
        if (isCurrent) {
            actionBtn = `<button class="btn-portal btn-secondary" disabled><span>✅</span> Plano Ativo</button>`;
        } else {
            const isUpgrade = plans.findIndex(p => p.key === currentPlan) < plans.findIndex(p => p.key === plan.key);
            const label = isUpgrade ? '⬆️ Fazer Upgrade' : '🛒 Contratar Este Pacote';
            const btnClass = plan.premium ? 'btn-primary' : (isUpgrade ? 'btn-primary' : 'btn-secondary');
            actionBtn = `<button class="btn-portal ${btnClass} btn-purchase" data-plan="${plan.key}"><span></span> ${label}</button>`;
        }

        return `
            <div class="${classes.join(' ')}">
                ${badge}
                <div class="svc-card-icon">${plan.icon}</div>
                <div class="svc-card-name">${plan.name}</div>
                <div class="svc-card-price">
                    <span class="svc-card-price-from">A partir de</span><br>
                    <span class="svc-card-price-value">${plan.price.toLocaleString('pt-BR')}€</span>
                </div>
                <div class="svc-card-desc">${plan.desc}</div>
                <ul class="svc-card-features">
                    ${plan.features.map(f => `<li class="svc-card-feature">${f}</li>`).join('')}
                </ul>
                ${actionBtn}
            </div>
        `;
    }).join('');

    // --- Render avulso cards ---
    const avulsosGrid = document.getElementById('avulsos-grid');
    avulsosGrid.innerHTML = avulsos.map(svc => {
        const waLink = `https://wa.me/34642874197?text=${encodeURIComponent(`Olá! Sou cliente e gostaria de contratar o serviço de ${svc.wa}.`)}`;
        return `
            <div class="svc-avulso-card">
                <div class="svc-avulso-icon">${svc.icon}</div>
                <div class="svc-avulso-name">${svc.name}</div>
                <div class="svc-avulso-desc">${svc.desc}</div>
                <div class="svc-avulso-price">${svc.price}</div>
                <a href="${waLink}" target="_blank" class="svc-avulso-link">Solicitar →</a>
            </div>
        `;
    }).join('');

    // --- Purchase Modal Logic ---
    const modal = document.getElementById('modal-purchase');
    const btnConfirm = document.getElementById('btn-confirm-purchase');
    const btnCancel = document.getElementById('btn-cancel-purchase');
    const btnClose = document.getElementById('modal-close-purchase');
    const errorEl = document.getElementById('purchase-error');
    const successEl = document.getElementById('purchase-success');
    const summaryEl = document.getElementById('purchase-summary');
    const modalBody = document.getElementById('purchase-modal-body');

    let selectedPlan = null;

    function openPurchaseModal(planKey) {
        const plan = plans.find(p => p.key === planKey);
        if (!plan) return;
        selectedPlan = plan;

        errorEl.classList.remove('show');
        successEl.classList.remove('show');
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = '<span>✅</span> Confirmar Aquisição';
        modalBody.style.display = 'block';

        const isUpgrade = plans.findIndex(p => p.key === currentPlan) < plans.findIndex(p => p.key === planKey);

        document.getElementById('purchase-modal-title').textContent =
            isUpgrade ? `Upgrade para ${plan.name}` : `Contratar ${plan.name}`;

        // Show visto select only for plans that need it
        const vistoGroup = document.getElementById('purchase-visto').closest('.form-group');
        if (planKey === 'vistos' || planKey === 'premium') {
            vistoGroup.style.display = 'block';
            document.getElementById('purchase-visto').value = userData.tipoVisto || '';
        } else {
            vistoGroup.style.display = 'none';
        }

        let upgradeNote = '';
        if (isUpgrade && currentValue > 0) {
            upgradeNote = `
                <div class="svc-purchase-upgrade-note">
                    💡 Como você já investiu <strong>${currentValue.toLocaleString('pt-BR')}€</strong> no plano atual,
                    o valor a complementar será ajustado pela equipe. Entraremos em contato para confirmar.
                </div>
            `;
        }

        summaryEl.innerHTML = `
            <div class="svc-purchase-plan-name">${plan.icon} ${plan.name}</div>
            <div class="svc-purchase-plan-price">${plan.price.toLocaleString('pt-BR')}€</div>
            <div class="svc-purchase-plan-features">
                ${plan.features.map(f => `✓ ${f}`).join('<br>')}
            </div>
            ${upgradeNote}
        `;

        modal.classList.add('show');
    }

    function closePurchaseModal() {
        modal.classList.remove('show');
        selectedPlan = null;
    }

    // Event listeners
    btnCancel.addEventListener('click', closePurchaseModal);
    btnClose.addEventListener('click', closePurchaseModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closePurchaseModal(); });

    // Purchase button clicks on cards
    plansGrid.querySelectorAll('.btn-purchase').forEach(btn => {
        btn.addEventListener('click', () => openPurchaseModal(btn.dataset.plan));
    });

    // Auto-open from URL parameter (admin sends link like servicos.html?upgrade=premium)
    const params = new URLSearchParams(window.location.search);
    const autoUpgrade = params.get('upgrade');
    if (autoUpgrade && plans.find(p => p.key === autoUpgrade) && autoUpgrade !== currentPlan) {
        setTimeout(() => openPurchaseModal(autoUpgrade), 500);
    }

    // Confirm purchase
    btnConfirm.addEventListener('click', async () => {
        if (!selectedPlan) return;
        errorEl.classList.remove('show');
        successEl.classList.remove('show');
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = '<span>⏳</span> Processando...';

        try {
            const metodo = document.getElementById('purchase-metodo').value;
            const visto = document.getElementById('purchase-visto').value || userData.tipoVisto || null;
            const notas = document.getElementById('purchase-notas').value.trim();

            // 1. Update user plan data
            const newHistory = [...(userData.historico || [])];
            newHistory.push({
                data: new Date().toISOString(),
                acao: `Plano adquirido/atualizado: "${selectedPlan.name}" (${selectedPlan.price}€) via ${metodo.toUpperCase()}`,
                por: userData.nome || 'Cliente'
            });

            const updateData = {
                plano: selectedPlan.key,
                valorTotal: selectedPlan.price,
                fase: selectedPlan.key === 'diagnostico' ? 'diagnostico' : 'documentacao',
                historico: newHistory
            };

            if (visto) updateData.tipoVisto = visto;

            const { error: userUpdateErr } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', uid);

            if (userUpdateErr) throw userUpdateErr;

            // 2. Create a purchase record in solicitacoes table
            const { error: solErr } = await supabase
                .from('solicitacoes')
                .insert({
                    userId: uid,
                    tipo: 'compra_plano',
                    plano: selectedPlan.key,
                    planoNome: selectedPlan.name,
                    valor: selectedPlan.price,
                    tipoVisto: visto || null,
                    metodoPagamento: metodo,
                    notas: notas || '',
                    status: 'pendente_pagamento',
                    planoAnterior: currentPlan || '',
                    valorAnterior: currentValue || 0
                });

            if (solErr) throw solErr;

            // 3. Regenerate default documents for new plan
            await Auth.createDefaultDocuments(uid, visto || userData.tipoVisto, selectedPlan.key);

            // 4. Show success
            modalBody.style.display = 'none';
            btnConfirm.style.display = 'none';
            btnCancel.textContent = 'Fechar';

            const paymentInstructions = {
                pix: '📱 Chave PIX e dados serão enviados por WhatsApp em instantes.',
                transferencia: '🏦 IBAN e dados bancários serão enviados por WhatsApp em instantes.',
                bizum: '📲 Número do Bizum será enviado por WhatsApp em instantes.',
                paypal: '💳 Link do PayPal será enviado por WhatsApp em instantes.'
            };

            successEl.innerHTML = `
                <strong>✅ Plano "${selectedPlan.name}" ativado com sucesso!</strong><br><br>
                ${paymentInstructions[metodo] || ''}<br><br>
                <strong>Próximos passos:</strong><br>
                1. Realize o pagamento conforme instruções que receberá<br>
                2. Seus novos documentos já foram gerados na aba "Documentos"<br>
                3. Entraremos em contato para iniciar o processo<br><br>
                <em style="font-size: 0.82rem; color: var(--text-muted);">A página será recarregada em 5 segundos...</em>
            `;
            successEl.classList.add('show');

            setTimeout(() => window.location.reload(), 5000);

        } catch (error) {
            console.error('Purchase error:', error);
            errorEl.textContent = 'Erro ao processar aquisição: ' + error.message;
            errorEl.classList.add('show');
            btnConfirm.disabled = false;
            btnConfirm.innerHTML = '<span>✅</span> Confirmar Aquisição';
        }
    });
}

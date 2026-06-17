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

    const page = window.location.pathname.split('/').pop().toLowerCase().replace('.html', '');

    if (page === 'painel' || page === '' || page === 'cliente') {
        initPainel(userData);
    } else if (page === 'documentos') {
        initDocumentos(userData);
    } else if (page === 'contratos') {
        initContratos(userData);
    } else if (page === 'servicos') {
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

            // Ajuste dinâmico para a Jurisdição de Porto Alegre (SC / RS)
            const isPortoAlegre = userData && (userData.email === 'davidbateracwb@gmail.com' || 
                                  (documents && documents.some(d => d.nome.toLowerCase().includes('porto alegre'))));

            if (isPortoAlegre) {
                // 1. Atualiza explicação de Passagem Aérea para Porto Alegre
                const contentPassagem = document.getElementById('passagem-info-content');
                if (contentPassagem) {
                    contentPassagem.innerHTML = `
                        O Consulado-Geral da Espanha em Porto Alegre <strong>não exige a apresentação de passagens aéreas (nem de ida, nem de volta)</strong> para a concessão de Visto de Estudante (Visto Nacional de longa duração, superior a 90 dias).<br><br>
                        <strong>⚠️ Recomendação Oficial do Consulado:</strong> Não compre passagens aéreas antes de ter o visto aprovado e o passaporte em mãos. O tempo de processamento pode variar, e comprar voos antecipadamente pode gerar prejuízos com multas, taxas de remarcação ou cancelamentos.<br><br>
                        <em>Nota: A exigência de passagem de ida e volta marcada aplica-se somente a viagens de turismo (estadias de curta duração de até 90 dias).</em>
                    `;
                }

                // 2. Atualiza os Alertas Vitais do Consulado para Porto Alegre
                const contentRegras = document.getElementById('regras-info-content');
                if (contentRegras) {
                    contentRegras.innerHTML = `
                        <div>
                            <strong style="color: var(--primary);">1. Apresente Originais + Cópias Simples A4 de TUDO:</strong><br>
                            O consulado de Porto Alegre exige a apresentação da via original acompanhada de uma cópia simples de todas as páginas de cada documento. <strong>Atenção:</strong> Isso inclui tirar cópia de <strong>todas as páginas do passaporte (capa a capa, incluindo as páginas em branco)</strong>, do verso da folha (onde o cartório cola o selo da Apostila de Haia) e de todas as páginas das traduções juramentadas. Se for sem cópias impressas, o dossiê pode ser recusado.
                        </div>
                        <div>
                            <strong style="color: var(--primary);">2. Regra do Duplo Apostilamento (Traduções no Brasil):</strong><br>
                            Primeiro, você deve apostilar o documento original em português. Em seguida, envia-o para o tradutor juramentado. Se a tradução for feita por um tradutor no Brasil, <strong>a assinatura do tradutor também precisa ser apostilada</strong> em cartório. A única forma de evitar esse segundo apostilamento é contratar um tradutor jurado na Espanha (Traductor Jurado).
                        </div>
                        <div>
                            <strong style="color: var(--primary);">3. Taxa Consular de Visto Nacional (R$ 433,00):</strong><br>
                            Você deverá pagar a taxa consular, que custa aproximadamente R$ 433,00 (sujeita a alteração cambial sutil). O consulado de Porto Alegre exige que o pagamento seja feito conforme as orientações de agendamento (geralmente via <strong>depósito bancário identificado em agência física do Banco do Brasil</strong>). Guarde o comprovante original do depósito para apresentar no dia da entrevista.
                        </div>
                        <!-- Bloco dinâmico para motoristas profissionais (CAP) -->
                        <div id="regras-cap-warning" style="display: none; border-top: 1px dashed rgba(245, 158, 11, 0.3); padding-top: 12px; margin-top: 4px; background: rgba(212, 168, 83, 0.05); padding: 10px; border-radius: 6px;">
                            <strong style="color: var(--gold-dark); display: inline-flex; align-items: center; gap: 4px;">🚚 Importante para Motoristas (Visto CAP):</strong><br>
                            Não se esqueça de levar a sua <strong>CNH brasileira original</strong> para a Espanha, <strong>devidamente apostilada no Brasil e com tradução juramentada</strong>. Embora o consulado não exija a CNH para aprovar o visto, ela será obrigatória para iniciar o processo de <em>Canje</em> (troca de carteira de motorista) nas províncias espanholas e matrícula final na autoescola.
                        </div>
                    `;
                    // Re-aplica visibilidade do lembrete de motorista se for o caso
                    const capWarning = document.getElementById('regras-cap-warning');
                    if (capWarning && userData.tipoVisto && userData.tipoVisto.toLowerCase().includes('cap')) {
                        capWarning.style.display = 'block';
                    }
                }

                // 3. Adiciona o Banner "Por que Porto Alegre?" se não existir
                if (!document.getElementById('porto-alegre-explanation-banner')) {
                    const progressBarContainer = document.querySelector('.progress-bar-track')?.closest('div');
                    if (progressBarContainer) {
                        const poaBanner = document.createElement('div');
                        poaBanner.id = 'porto-alegre-explanation-banner';
                        poaBanner.style.cssText = 'background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.18); border-radius: var(--radius-md); padding: 18px 24px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px;';
                        poaBanner.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none;" id="toggle-poa-info">
                                <span style="font-size: 1.3rem;">📍</span>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                                        <span>Por que meu visto é processado em Porto Alegre se moro em Santa Catarina?</span>
                                        <span style="font-size: 0.75rem; color: #10b981; font-weight: 500; text-decoration: underline; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">Clique para ver a explicação</span>
                                    </div>
                                </div>
                                <span id="poa-info-arrow" style="font-size: 0.8rem; transition: transform 0.3s; color: var(--text-light); font-weight: bold; margin-left: 8px;">▼</span>
                            </div>
                            <div id="poa-info-content" style="display: none; font-size: 0.82rem; color: var(--text-light); line-height: 1.5; border-top: 1px solid rgba(16, 185, 129, 0.15); padding-top: 12px; margin-top: 4px;">
                                Existem Consulados Honorários da Espanha em Santa Catarina (localizados em Florianópolis e Blumenau). No entanto, esses escritórios honorários servem apenas para assistência básica a cidadãos espanhóis e <strong>não processam vistos</strong>.<br><br>
                                O trâmite de solicitação de vistos (como o de estudante) para quem mora em Santa Catarina deve ser feito <strong>obrigatoriamente no Consulado-Geral da Espanha em Porto Alegre</strong>, que é o órgão central com jurisdição oficial sobre todo o estado de Santa Catarina e Rio Grande do Sul.
                            </div>
                        `;
                        progressBarContainer.parentNode.insertBefore(poaBanner, progressBarContainer);

                        const togglePoa = document.getElementById('toggle-poa-info');
                        const contentPoa = document.getElementById('poa-info-content');
                        const arrowPoa = document.getElementById('poa-info-arrow');
                        if (togglePoa && contentPoa) {
                            togglePoa.addEventListener('click', () => {
                                const isHidden = contentPoa.style.display === 'none' || contentPoa.style.display === '';
                                contentPoa.style.display = isHidden ? 'block' : 'none';
                                if (arrowPoa) {
                                    arrowPoa.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                                }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading docs:', error);
        }
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

                const exp = getDocExplanation(doc.nome, userData);
                let helpBtnHtml = '';
                let helpDrawerHtml = '';
                if (exp) {
                    helpBtnHtml = `
                        <button class="btn-doc-help" data-doc-id="${doc.id}" style="background: none; border: none; color: var(--gold-dark); font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 4px 0; margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; transition: color 0.2s;">
                            <span>💡</span> Como preparar / Evitar rejeição (Consulado)
                        </button>
                    `;
                    helpDrawerHtml = `
                        <div class="doc-help-drawer" id="help-${doc.id}" style="display: none; margin-top: 8px; padding: 14px; background: rgba(212, 168, 83, 0.05); border-left: 3px solid var(--gold); border-radius: 8px; font-size: 0.82rem; line-height: 1.5; color: var(--text-main); text-align: left;">
                            <div style="margin-bottom: 8px; color: var(--text-main);">
                                <strong style="color: var(--gold-dark);">📋 Como preparar:</strong><br>
                                <span style="color: var(--text-light);">${exp.preparar}</span>
                            </div>
                            <div style="color: var(--text-main);">
                                <strong style="color: var(--accent-red); display: inline-flex; align-items: center; gap: 4px;">⚠️ O que o consulado NÃO aceita (Evite erros):</strong><br>
                                <span style="color: var(--text-light);">${exp.naoEnviar}</span>
                            </div>
                        </div>
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
                            ${helpBtnHtml}
                            ${helpDrawerHtml}
                        </div>
                        <div class="doc-actions">
                            ${docActionsHtml}
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;

        // Help drawer toggle clicks
        container.querySelectorAll('.btn-doc-help').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const docId = btn.dataset.docId;
                const drawer = container.querySelector(`#help-${docId}`);
                if (drawer) {
                    const isOpen = drawer.style.display === 'block';
                    drawer.style.display = isOpen ? 'none' : 'block';
                    btn.innerHTML = isOpen 
                        ? '<span>💡</span> Como preparar / Evitar rejeição (Consulado)' 
                        : '<span>💡</span> Ocultar explicações de preparação';
                }
            });
        });

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

    // Passagem info banner toggle
    const togglePassagem = document.getElementById('toggle-passagem-info');
    const contentPassagem = document.getElementById('passagem-info-content');
    const arrowPassagem = document.getElementById('passagem-info-arrow');
    if (togglePassagem && contentPassagem) {
        togglePassagem.addEventListener('click', () => {
            const isHidden = contentPassagem.style.display === 'none' || contentPassagem.style.display === '';
            contentPassagem.style.display = isHidden ? 'block' : 'none';
            if (arrowPassagem) {
                arrowPassagem.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // Regras Consulado banner toggle
    const toggleRegras = document.getElementById('toggle-regras-consulado');
    const contentRegras = document.getElementById('regras-info-content');
    const arrowRegras = document.getElementById('regras-info-arrow');
    if (toggleRegras && contentRegras) {
        toggleRegras.addEventListener('click', () => {
            const isHidden = contentRegras.style.display === 'none' || contentRegras.style.display === '';
            contentRegras.style.display = isHidden ? 'flex' : 'none';
            if (arrowRegras) {
                arrowRegras.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // Lembrete CNH/CAP condicional
    const capWarning = document.getElementById('regras-cap-warning');
    if (capWarning && userData.tipoVisto && userData.tipoVisto.toLowerCase().includes('cap')) {
        capWarning.style.display = 'block';
    }
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

function getDocExplanation(nome, userData) {
    const nomeLower = nome.toLowerCase();
    const isDavid = userData && userData.email === 'davidbateracwb@gmail.com';
    
    if (nomeLower.includes('certidão de nascimento')) {
        return {
            preparar: 'Solicite a certidão de nascimento em Inteiro Teor em cartório no Brasil. Em seguida, ela deve ser apostilada em cartório e traduzida por tradutor juramentado para o espanhol.',
            naoEnviar: 'Certidões em modelo simples (breve relato) não são aceitas pelo consulado. Não envie a certidão sem a devida tradução juramentada e o apostilamento.'
        };
    }
    if (nomeLower.includes('certidão de casamento') || nomeLower.includes('união estável')) {
        return {
            preparar: 'Certidão de casamento ou escritura pública de união estável emitida em cartório no Brasil. Deve ser apostilada em cartório e traduzida por tradutor juramentado para o espanhol.',
            naoEnviar: 'Declarações informais de convivência sem registro ou certidões antigas desatualizadas. O consulado rejeita qualquer documento familiar sem apostilamento e tradução juramentada.'
        };
    }
    
    if (nomeLower.includes('passagem') || nomeLower.includes('reserva de voo') || nomeLower.includes('reserva de retorno') || nomeLower.includes('voo')) {
        return {
            preparar: 'Se o consulado ou a assessoria solicitar especificamente, nós providenciaremos a reserva temporária garantida (Onward Ticket) para o dia da sua imigração. Não compre passagem real de ida/volta.',
            naoEnviar: '<strong>NÃO compre passagens aéreas definitivas antes de ter o visto colado em mãos!</strong> O consulado não exige a passagem para vistos de longa duração e adverte de forma contundente contra a compra prévia devido ao risco de atrasos.'
        };
    }
    
    if (nomeLower.includes('passaporte')) {
        return {
            preparar: isDavid 
                ? 'Cópia colorida, completa e nítida em PDF de <strong>absolutamente todas as páginas do passaporte</strong> (capa a capa, inclusive as páginas em branco), conforme exigência do Consulado de Porto Alegre. O passaporte deve estar válido para todo o período da estadia.' 
                : 'Cópia colorida e nítida em PDF ou imagem da página de dados (com sua foto e dados) e da página de assinatura.',
            naoEnviar: isDavid
                ? 'Enviar apenas a página de dados (Porto Alegre exige todas as páginas!). Evite também fotos com reflexo de flash, desfocadas ou cortando as bordas das páginas.'
                : 'Fotos com reflexo de flash, desfocadas, cortando as bordas do passaporte, ou passaporte com validade inferior à sua estadia total na Espanha.'
        };
    }
    if (nomeLower.includes('rg ou cnh') || (nomeLower.includes('rg') && nomeLower.includes('cnh'))) {
        return {
            preparar: 'Cópia frente e verso nítida e colorida do seu RG brasileiro ou da sua CNH (ambos emitidos há menos de 10 anos) para comprovação de identidade secundária no Consulado de Porto Alegre.',
            naoEnviar: 'Documentos vencidos, fotos desfocadas ou cópias ilegíveis/rasuradas.'
        };
    }
    if (nomeLower.includes('rg ou rne')) {
        return {
            preparar: 'Cópia frente e verso nítida e colorida do seu RG brasileiro (emitido há menos de 10 anos) ou do seu RNE/RNM de residente.',
            naoEnviar: '<strong>A CNH (Carteira de Habilitação) NÃO é aceita como substituta do RG pelo consulado de São Paulo!</strong> Também não envie carteiras de conselhos de classe (OAB, CREA, etc.) como identificação principal.'
        };
    }
    if (nomeLower.includes('taxa consular') || nomeLower.includes('pagamento da taxa')) {
        return {
            preparar: isDavid
                ? 'O comprovante de depósito identificado referente à taxa consular (aproximadamente R$ 433,00), que deve ser pago em agência física do Banco do Brasil conforme as instruções oficiais de agendamento do Consulado de Porto Alegre.'
                : 'O comprovante de pagamento da taxa de visto correspondente (aproximadamente R$ 433,00). O pagamento é feito presencialmente no dia da entrevista. No Consulado de São Paulo, o pagamento é feito via PIX ou dinheiro com valor exato. No Consulado de Porto Alegre, siga as orientações específicas fornecidas no agendamento.',
            naoEnviar: 'Comprovantes de transferências bancárias comuns não autorizadas pelo consulado.'
        };
    }
    if (nomeLower.includes('comprovante de residência') || nomeLower.includes('residência da jurisdição')) {
        return {
            preparar: isDavid
                ? 'Fatura de serviços fixos (Água, Luz, Gás Canalizado, Internet Banda Larga Fixa) ou Contrato de Locação registrado em cartório em Santa Catarina (jurisdição de Porto Alegre), emitido nos últimos 90 dias em seu nome ou de seus pais (provando filiação).'
                : 'Fatura de serviços fixos (Água, Luz, Gás Canalizado, Internet Banda Larga Fixa) ou Contrato de Locação registrado em cartório, emitido nos últimos 90 dias em seu nome ou no nome dos pais (neste caso, comprovando filiação).',
            naoEnviar: '<strong>Fatura de celular (telefone móvel) é expressamente REJEITADA!</strong> Extratos bancários simples, boletos de compras ou faturas de cartão de crédito não servem como comprovante de endereço.'
        };
    }
    if (nomeLower.includes('formulário')) {
        return {
            preparar: 'Preencha o formulário oficial de Visto Nacional em espanhol (letras de forma legíveis), assinale os campos corretos e assine à caneta de forma idêntica ao passaporte.',
            naoEnviar: 'Formulários com campos obrigatórios em branco (use "N/A" ou risque se não aplicar), assinaturas rasuradas ou divergentes do passaporte original.'
        };
    }
    if (nomeLower.includes('fotografia')) {
        return {
            preparar: 'Foto colorida recente (menos de 6 meses), fundo branco, enquadramento focado de frente, com ombros e rosto nítidos.',
            naoEnviar: 'Selfies, fotos com óculos de sol, sorrindo, com sombras no rosto, fundo colorido ou fotos impressas em papel comum (deve ser papel fotográfico).'
        };
    }
    if (nomeLower.includes('antecedentes criminais')) {
        return {
            preparar: 'Emita a Certidão de Antecedentes Criminais no portal da Polícia Federal. <strong>O número do seu passaporte deve estar escrito no corpo da certidão</strong>. O documento precisa ser apostilado em cartório e traduzido por tradutor juramentado.',
            naoEnviar: '<strong>Certidões emitidas pela Polícia Civil estadual ou secretarias estaduais não são aceitas!</strong> Não envie sem o número do passaporte ou sem o apostilamento.'
        };
    }
    if (nomeLower.includes('atestado médico')) {
        return {
            preparar: 'Atestado emitido por médico (CRM ativo) com a frase exata: <i>"não padece de nenhuma das enfermidades que podem ter graves repercussões na saúde pública em conformidade com o RSI 2005"</i>. Reconheça a firma da assinatura do médico em cartório antes de apostilar.',
            naoEnviar: 'Atestados genéricos (como de aptidão física simples) sem a menção ao RSI 2005. Atestados sem reconhecimento de firma em cartório ou com mais de 90 dias de emissão.'
        };
    }
    if (nomeLower.includes('seguro saúde') || nomeLower.includes('seguro de saúde')) {
        return {
            preparar: 'Apólice de seguro médico de companhia espanhola autorizada (ex: Adeslas, Sanitas, ASISA). Deve ter cobertura integral na Espanha, repatriação, franquia zero (sem copago) e nenhuma carência (sin carencias).',
            naoEnviar: '<strong>Seguro viagem internacional padrão (como os do cartão de crédito, Mastercard, Assist Card, GTA, etc.) é sumariamente REJEITADO!</strong> Seguros com coparticipação (onde você paga uma parte da consulta) também são negados.'
        };
    }
    if (nomeLower.includes('extratos bancários')) {
        return {
            preparar: isDavid
                ? 'Extratos bancários originais de conta corrente/investimentos dos últimos 3 a 4 meses demonstrando saldo mínimo de 7.200€ (<strong>recomendado ter de 8.000€ a 10.000€</strong> como margem de segurança no Consulado de Porto Alegre). Todas as páginas devem estar assinadas e carimbadas a caneta pelo gerente da sua agência física.'
                : 'Extratos bancários originais de conta corrente/investimentos dos últimos 3 meses. <strong>Todas as páginas devem estar assinadas e carimbadas a caneta pelo gerente da sua agência física.</strong>',
            naoEnviar: isDavid
                ? 'Saldos insuficientes, extratos da internet sem assinatura/carimbo do gerente físico, e depósitos expressivos sem origem comprovada feitos às vésperas da aplicação (ballooning). A patrocinadora deve injetar a diferença com antecedência.'
                : '<strong>Prints de aplicativos móveis ou PDFs simples baixados diretamente da internet (sem assinatura física e carimbo do gerente) são REJEITADOS!</strong> Depósitos expressivos e sem origem comprovada feitos às vésperas (ballooning) levam a indeferimento por suspeita de fraude.'
        };
    }
    if (nomeLower.includes('imposto de renda')) {
        return {
            preparar: 'Cópia da Declaração de IRPF completa do ano corrente, acompanhada obrigatoriamente do Recibo de Entrega à Receita Federal.',
            naoEnviar: 'Declaração simplificada incompleta ou sem o recibo de entrega oficial.'
        };
    }
    if (nomeLower.includes('rendimento recorrente') || nomeLower.includes('holerites')) {
        return {
            preparar: '3 últimos holerites (se empregado CLT), comprovantes de pró-labore com contrato social (se empresário/autônomo), ou comprovantes de recebimento de pensão/aposentadoria.',
            naoEnviar: 'Transferências informais sem holerite correspondente ou sem documentação de vínculo formal.'
        };
    }
    if (nomeLower.includes('termo de responsabilidade') || nomeLower.includes('sponsor')) {
        return {
            preparar: isDavid
                ? 'Termo de Responsabilidade Financeira (Sponsor) assinado por sua amiga patrocinadora por meio de escritura pública (Acta de Manifestaciones) em cartório, com assinatura reconhecida por autenticidade e Apostila de Haia, acompanhado das comprovações de renda dela. Nota: O consulado é extremamente rigoroso com patrocinadores não familiares.'
                : 'Declaração formal ou escritura pública lavrada em cartório com assinatura reconhecida por autenticidade e apostilada, onde o patrocinador assume as despesas do aluno, acompanhada das provas financeiras dele.',
            naoEnviar: isDavid
                ? 'Declarações simples sem escritura pública ou sem reconhecimento por autenticidade. Para mitigar o alto risco de recusa do consulado por ser patrocinadora amiga, a estratégia recomendada é a transferência prévia de todo o dinheiro do IPREM para a conta do David.'
                : 'Declarações simples sem reconhecimento de assinatura em cartório ou de patrocinadores que não tenham comprovação de renda robusta.'
        };
    }
    if (nomeLower.includes('carta de aceitação') || nomeLower.includes('matrícula')) {
        return {
            preparar: isDavid
                ? 'Carta de matrícula/aceitação oficial da escola de espanhol em Madrid credenciada pelo Instituto Cervantes, constando estudos em tempo integral (mínimo de 20h/semana) e quitação das taxas.'
                : 'Carta de matrícula/aceitação oficial da escola espanhola constando estudos em tempo integral (mínimo de 20h/semana) e quitação das taxas. Escolas de espanhol devem ser credenciadas pelo Instituto Cervantes.',
            naoEnviar: isDavid
                ? '<strong>ALERTA JURÍDICO (Trabalho 30h):</strong> Sob o novo Regulamento de Estrangeiria da Espanha (Real Decreto 1155/2024), vistos de idiomas <strong>não dão mais o direito automático ao trabalho</strong>. O foco deve ser estritamente o estudo. Não conte com renda de trabalho no planejamento financeiro inicial.'
                : 'E-mails simples de confirmação de interesse, ou matrículas em cursos com menos de 20 horas semanais de aula.'
        };
    }
    if (nomeLower.includes('diploma')) {
        return {
            preparar: 'Cópia do diploma do último grau acadêmico concluído no Brasil, apostilado em cartório e traduzido por tradutor juramentado.',
            naoEnviar: 'Apenas históricos escolares sem a apresentação do diploma correspondente.'
        };
    }
    if (nomeLower.includes('pagamento da matrícula') || nomeLower.includes('pagamento do curso')) {
        return {
            preparar: 'Comprovante oficial de remessa internacional (SWIFT, Wise ou recibo oficial da escola) comprovando a quitação da taxa do curso.',
            naoEnviar: 'Comprovantes de agendamento bancário ou capturas de tela sem confirmação de envio.'
        };
    }
    if (nomeLower.includes('alojamento') || nomeLower.includes('hospedagem') || nomeLower.includes('acomodação')) {
        return {
            preparar: isDavid
                ? 'Declaração formal de alojamento assinada pela sua amiga (proprietária/inquilina do imóvel em Madrid) acompanhada de cópia da escritura da propriedade ou contrato de aluguel de longa duração, documento de identidade (TIE) dela e empadronamiento atualizado do imóvel.'
                : 'Comprovante de reserva de alojamento oficial, contrato de aluguel ou declaração de acolhimento (invitación/alojamento) com firma reconhecida do proprietário.',
            naoEnviar: 'Reservas temporárias de curta duração (Airbnb/Hotéis) com menos de 90 dias se o seu visto for de longa duração, ou declarações de acolhimento sem documentos comprobatórios do imóvel.'
        };
    }
    
    return null;
}

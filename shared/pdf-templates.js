/* ========================================
   DESTINO ESPANHA — PDF Templates Engine
   Generates 5 types of PDFs:
   1. Contrato de Serviço
   2. Plano de Ação Pós-Diagnóstico
   3. Checklist de Documentos
   4. Recibo / Fatura
   5. Proposta Comercial
   ======================================== */

const PDFTemplates = {

    precosFamiliares: {
        diagnostico: { 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50 },
        documentacao: { 1: 350, 2: 500, 3: 600, 4: 700, 5: 800, 6: 900 },
        vistos: { 1: 750, 2: 1100, 3: 1350, 4: 1600, 5: 1850, 6: 2100 },
        aterragem: { 1: 600, 2: 800, 3: 1000, 4: 1150, 5: 1300, 6: 1450 },
        premium: { 1: 2000, 2: 2900, 3: 3500, 4: 4100, 5: 4700, 6: 5300 }
    },

    // ==============================
    // COMMON ELEMENTS
    // ==============================
    header(docType = '') {
        const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        return `
            <div class="pdf-header">
                <div class="pdf-logo">✈ Destino<span>Espanha</span></div>
                <div class="pdf-header-info">
                    Assessoria de Imigração<br>
                    ${docType}<br>
                    ${today}
                </div>
            </div>
        `;
    },

    footer() {
        return `
            <div class="pdf-footer">
                Destino Espanha Assessoria · destinoespanha.com<br>
                Os serviços prestados são de assessoria administrativa. A decisão final sobre vistos é das autoridades espanholas.
            </div>
        `;
    },

    clientBox(data) {
        return `
            <div class="pdf-client-box">
                <h4>Dados do Cliente</h4>
                <div class="pdf-client-row">
                    <div class="pdf-client-field"><strong>Nome:</strong> <span>${data.nome || '—'}</span></div>
                    <div class="pdf-client-field"><strong>E-mail:</strong> <span>${data.email || '—'}</span></div>
                </div>
                <div class="pdf-client-row">
                    <div class="pdf-client-field"><strong>Telefone:</strong> <span>${data.telefone || '—'}</span></div>
                    <div class="pdf-client-field"><strong>Passaporte:</strong> <span>${data.passaporte || '—'}</span></div>
                </div>
                ${data.pessoas && parseInt(data.pessoas) > 1 ? `<div class="pdf-client-row"><div class="pdf-client-field"><strong>Quantidade de Pessoas Cobertas:</strong> <span>${data.pessoas} Pessoas</span></div></div>` : (data.membros ? `<div class="pdf-client-row"><div class="pdf-client-field"><strong>Membros da família:</strong> <span>${data.membros}</span></div></div>` : '')}
            </div>
        `;
    },

    // ==============================
    // 1. CONTRATO DE SERVIÇO
    // ==============================
    contrato(data) {
        const planos = {
            diagnostico: {
                nome: 'Diagnóstico Estratégico',
                valor: 50,
                itens: [
                    'Videochamada de 60 a 90 minutos de sessão estratégica',
                    'Análise completa de perfil migratório familiar',
                    'Plano de Ação personalizado estruturado em PDF',
                    '15 dias de suporte via WhatsApp limitado exclusivamente ao esclarecimento de dúvidas sobre a interpretação do Plano de Ação',
                    'Valor 100% dedutível em contratações futuras de Assessoria Integral (Documentação, Vistos ou Premium)'
                ],
                exclusoes: [
                    'Busca, emissão, organização, revisão ou envio de certidões/documentos',
                    'Preenchimento de formulários de visto ou agendamentos consulares',
                    'Serviços locais ou de relocation na Espanha',
                    'Suporte a processos migratórios já ativos ou novas consultas fora do escopo do Plano de Ação'
                ]
            },
            documentacao: {
                nome: 'Documentação Brasil',
                valor: 350,
                itens: [
                    'Checklist personalizado de documentos necessários no Brasil',
                    'Orientação técnica sobre emissão de certidões brasileiras e apostilamento de Haia',
                    'Coordenação direta e orçamento com tradutores juramentados credenciados parceiros',
                    'Revisão técnica minuciosa de todo o dossiê final para evitar erros e riscos de indeferimento consular',
                    'Suporte via WhatsApp em dias úteis e horário comercial (segunda a sexta, das 09h às 18h) durante a vigência contratual'
                ],
                exclusoes: [
                    'Custos diretos de traduções juramentadas (pagos diretamente ao profissional responsável)',
                    'Taxas de cartório, certidões de inteiro teor e emolumentos de apostilamento de Haia',
                    'Agendamento consular, preenchimento de formulários ou acompanhamento de vistos',
                    'Qualquer taxa governamental brasileira ou espanhola'
                ]
            },
            vistos: {
                nome: 'Assessoria de Vistos',
                valor: 750,
                itens: [
                    'Tudo incluso no pacote "Documentação Brasil"',
                    'Preenchimento completo dos formulários oficiais de solicitação de visto da Espanha',
                    'Monitoramento operacional e suporte manual no agendamento de datas (citas) no Consulado espanhol',
                    'Treinamento prévio e simulação individual para a entrevista consular',
                    'Indicação e suporte na cotação de seguros de saúde espanhóis obrigatórios e homologados (sem copago)',
                    'Acompanhamento das etapas e suporte operacional completo até a decisão consular final',
                    'Suporte via WhatsApp em dias úteis e horário comercial (segunda a sexta, das 09h às 18h)'
                ],
                exclusoes: [
                    'Taxa Consular do Visto (paga diretamente pelo contratante ao Consulado da Espanha, aprox. 80€ por pessoa)',
                    'Custo da contratação da apólice do Seguro Saúde Espanhol',
                    'Custos com passagens aéreas e reservas de viagem',
                    'Traduções juramentadas, buscas ou apostilamentos cartoriais no Brasil',
                    'Serviços de aterragem, NIE/TIE locais ou instalação na Espanha'
                ]
            },
            aterragem: {
                nome: 'Aterragem Espanha',
                valor: 600,
                itens: [
                    'Busca segura de moradia na Espanha (limitada à curadoria e análise de até 3 imóveis e análise jurídica do contrato de aluguel por advogados parceiros)',
                    'Agendamento e suporte nos trâmites presenciais para emissão de NIE/TIE na Espanha',
                    'Agendamento e orientação para o Empadronamiento municipal',
                    'Suporte e orientação para abertura de conta em banco espanhol (remoto ou presencial)',
                    'Orientação e auxílio no processo de matrícula escolar pública ou privada de filhos menores',
                    'Suporte presencial ou remoto para esclarecimento de trâmites básicos de instalação local (30 dias)'
                ],
                exclusoes: [
                    'Custos mensais de aluguel de imóveis, depósito de caução (fianças) ou taxas de corretagem de imobiliárias espanholas',
                    'Despesas de transporte físico, alimentação, passagens ou hotelaria do contratante',
                    'Defesas jurídicas complexas contra negativas, recursos administrativos em tribunais espanhóis ou regularizações judiciais',
                    'Taxas governamentais obrigatórias (ex: taxa modelo 790 para emissão física do cartão TIE)'
                ]
            },
            premium: {
                nome: 'Premium Família VIP',
                valor: 2000,
                itens: [
                    'Diagnóstico Estratégico completo com Plano de Ação',
                    'Documentação Brasil integral (apoio, revisão, orçamento e coordenação)',
                    'Assessoria de Visto, Reagrupamento Consular ou Arraigo de forma completa',
                    'Seguro Saúde Espanhol obrigatório (primeiro ano incluso para o contratante titular)',
                    'Assessoria personalizada de logística e curadoria de passagens aéreas',
                    'Busca de moradia na Espanha (curadoria abrangente, com até 5 visitas em vídeo efetuadas pela assessoria e análise de contrato)',
                    'Aterragem completa na Espanha (NIE/TIE, Empadronamiento, Conta Bancária e matrícula escolar)',
                    'Suporte prioritário via WhatsApp com tempo de resposta estendido (segunda a domingo)'
                ],
                exclusoes: [
                    'Taxas consulares cobradas individualmente pelo Consulado espanhol (aprox. 80€ por pessoa)',
                    'Valores diretos de passagens aéreas do contratante e familiares',
                    'Custos mensais de aluguel de imóveis, taxas administrativas de imobiliárias ou fianças da moradia',
                    'Custos de cartórios e taxas de apostilamentos de Haia no Brasil',
                    'Custos de traduções juramentadas'
                ]
            }
        };

        const pessoas = parseInt(data.pessoas) || 1;
        const planoId = data.plano || 'diagnostico';
        const plano = planos[planoId] || planos.diagnostico;
        const valorPadrao = (PDFTemplates.precosFamiliares[planoId] && PDFTemplates.precosFamiliares[planoId][pessoas]) || plano.valor;
        const valor = data.valorCustom || valorPadrao;
        
        const planoNomeFormatado = pessoas > 1 ? `${plano.nome} (${pessoas} Pessoas)` : plano.nome;
        const today = new Date();
        const contratoNum = `DE-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`;

        return `
            <div class="pdf-document">
                ${this.header('Contrato de Prestação de Serviços')}

                <div class="pdf-title">Contrato de Prestação de Serviços</div>
                <div class="pdf-subtitle">Contrato nº ${contratoNum}</div>

                ${this.clientBox(data)}

                <div class="pdf-plan-box">
                    <h3>${planoNomeFormatado}</h3>
                    <div class="pdf-plan-price">${valor.toLocaleString('pt-BR')}€</div>
                    <ul class="pdf-plan-features">
                        ${plano.itens.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>

                <div class="pdf-section-title">Termos e Condições</div>
                <div class="pdf-clauses">
                    <div class="pdf-clause"><strong>CONTRATANTE:</strong> ${data.nome || '[Nome do Cliente]'}, portador(a) do passaporte nº ${data.passaporte || '[Nº Passaporte]'}, residente em ${data.endereco || '[Endereço]'}, doravante denominado(a) CONTRATANTE.</div>

                    <div class="pdf-clause"><strong>CONTRATADA:</strong> Destino Espanha Assessoria, doravante denominada CONTRATADA, representada neste ato por seu responsável legal.</div>

                    <div class="pdf-clause"><strong>OBJETO E NATUREZA DOS SERVIÇOS:</strong> A CONTRATADA se compromete a prestar os serviços de assessoria migratória e relocation descritos no plano <strong>"${plano.nome}"</strong>. Fica expressamente estabelecido que a CONTRATADA atua estritamente na esfera de assessoria administrativa e suporte de relocation. Quaisquer atos legais privativos de advocacia (como defesas judiciais ou interposição de recursos contra negativas consulares em instâncias superiores) serão contratados e assinados por intermédio de escritórios de advocacia parceiros (Abogados) devidamente habilitados na Espanha, sob coordenação da CONTRATADA para mitigar riscos de intrusismo.</div>

                    <div class="pdf-clause"><strong>VALOR, PAGAMENTO E RETENÇÃO:</strong> O valor total dos serviços é de <strong>${valor.toLocaleString('pt-BR')}€</strong> (${PDFTemplates.valorPorExtenso(valor)}), a ser pago ${data.formaPagamento || 'conforme acordado entre as partes'}. ${data.parcelas ? `Parcelado em ${data.parcelas}x de ${(valor/data.parcelas).toFixed(2)}€.` : ''} Fica convencionado que a liberação dos materiais consolidados (dossiê final formatado, apólices de seguro e simulados preparatórios para a entrevista consular) fica retida e condicionada à quitação de no mínimo 50% (cinquenta por cento) do valor total deste contrato pelo CONTRATANTE.</div>

                    <div class="pdf-clause"><strong>AGENDAMENTO DE CITAS (DATAS):</strong> A CONTRATADA prestará suporte acessório e manual na busca de agendamento de datas (citas previas) nos órgãos governamentais espanhóis (como TIE, NIE e Empadronamiento) como um serviço de conveniência de secretaria de apoio integrado ao plano contratado. A CONTRATADA não comercializa vagas de agendamento público e não se responsabiliza por indisponibilidades, bloqueios ou atrasos inerentes aos sistemas de agendamento do governo espanhol.</div>

                    <div class="pdf-clause"><strong>O QUE NÃO ESTÁ INCLUSO:</strong> ${plano.exclusoes.join('; ')}.</div>

                    <div class="pdf-clause"><strong>PRAZO:</strong> Este contrato entra em vigor na data de assinatura e permanece vigente até a conclusão dos serviços contratados ou por um período máximo de ${data.plano === 'premium' ? '12' : '6'} meses, o que ocorrer primeiro.</div>

                    <div class="pdf-clause"><strong>OBRIGAÇÕES DO CONTRATANTE:</strong> Fornecer documentos e informações solicitadas dentro dos prazos indicados; comparecer a reuniões e compromissos agendados; efetuar os pagamentos conforme acordado.</div>

                    <div class="pdf-clause"><strong>OBRIGAÇÕES DA CONTRATADA:</strong> Prestar os serviços descritos com diligência e profissionalismo; manter o CONTRATANTE informado sobre o andamento do processo; manter sigilo sobre os dados pessoais fornecidos.</div>

                    <div class="pdf-clause"><strong>CANCELAMENTO:</strong> Em caso de desistência pelo CONTRATANTE, aplica-se: até 7 dias da contratação — reembolso integral; de 8 a 30 dias — reembolso de 50% do valor; após 30 dias ou início efetivo dos serviços — sem reembolso. Os custos de terceiros já incorridos não são reembolsáveis.</div>

                    <div class="pdf-clause"><strong>LIMITAÇÃO DE RESPONSABILIDADE:</strong> A CONTRATADA atua exclusivamente como assessoria administrativa. A aprovação ou negação de vistos é competência exclusiva das autoridades espanholas, não podendo ser garantida pela CONTRATADA.</div>

                    <div class="pdf-clause"><strong>PROTEÇÃO DE DADOS:</strong> Os dados pessoais do CONTRATANTE serão utilizados exclusivamente para a prestação dos serviços contratados, em conformidade com a legislação aplicável de proteção de dados (LGPD/RGPD).</div>
                </div>

                <div class="pdf-signatures">
                    <div class="pdf-signature-block">
                        <div class="pdf-signature-line"></div>
                        <div class="pdf-signature-name">${data.nome || 'Contratante'}</div>
                        <div class="pdf-signature-role">Contratante</div>
                    </div>
                    <div class="pdf-signature-block">
                        <div class="pdf-signature-line"></div>
                        <div class="pdf-signature-name">Destino Espanha</div>
                        <div class="pdf-signature-role">Contratada</div>
                    </div>
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // 2. PLANO DE AÇÃO PÓS-DIAGNÓSTICO
    // ==============================
    planoAcao(data) {
        const vistoInfo = {
            estudo_cap: { nome: 'Visto de Estudo (CAP)', desc: 'Visto baseado em curso combinado de Autoescola homologada (Permiso C/C+E + CAP Inicial). Permite morar e estudar legalmente, com meios de subsistência proporcionais à duração real do curso.' },
            nao_lucrativa: { nome: 'Residência Não Lucrativa', desc: 'Para quem tem renda passiva suficiente e não pretende trabalhar na Espanha. Ideal para aposentados ou investidores.' },
            nomade: { nome: 'Nômade Digital', desc: 'Para profissionais que trabalham remotamente para empresas fora da Espanha. Requer comprovação de renda mínima.' },
            arraigo: { nome: 'Regularização por Arraigo', desc: 'Para quem já está na Espanha e deseja regularizar sua situação. Existem modalidades: Social, Familiar, Sociolaboral e Socioformativo.' },
            reagrupamento: { nome: 'Reagrupamento Familiar', desc: 'Para trazer familiares quando um membro já tem residência legal na Espanha.' }
        };

        const visto = vistoInfo[data.tipoVisto] || vistoInfo.estudo_cap;

        // Se tiver resultado da pesquisa (Gemini), renderiza o relatório dinâmico formatado
        if (data.resultadoAnalise) {
            const estLabels = {
                todos_juntos: "Toda a família viaja junto",
                titular_na_frente: "Titular vai na frente para preparar terreno",
                estrategia_economia: "Titular vai na frente por economia",
                personalizada: "Outra estratégia personalizada"
            };
            const regLabels = {
                litoral_praia: "Próximo à praia / Litoral",
                interior_centro: "Centro do país / Interior (ex: Madrid)",
                norte_verde: "Norte da Espanha (Frio/Verde)",
                sul_quente: "Sul da Espanha (Quente)",
                indiferente: "Sem preferência"
            };
            const idiomaLabels = {
                nenhum: "Nenhum conhecimento",
                basico: "Básico / Iniciante",
                intermediario: "Intermediário",
                avancado: "Avançado / Fluente",
                dele_b2: "Certificado DELE/SIELE B2"
            };

            return `
                <div class="pdf-document">
                    ${this.header('Plano de Ação e Diagnóstico')}

                    <div class="pdf-title">Relatório de Diagnóstico Estratégico</div>
                    <div class="pdf-subtitle">Planejamento Personalizado de Imigração</div>

                    ${this.clientBox(data)}

                    <div class="pdf-section-title">Resumo do Perfil Familiar</div>
                    <table class="pdf-table" style="margin-bottom: 24px; font-size: 8.5pt;">
                        <tbody>
                            <tr>
                                <td style="width: 22%; font-weight: 600; background: #f8fafc;">Objetivo Principal:</td>
                                <td style="width: 28%;">${visto.nome}</td>
                                <td style="width: 22%; font-weight: 600; background: #f8fafc;">Idade do Titular:</td>
                                <td style="width: 28%;">${data.idade || '—'} anos</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Origem no Brasil:</td>
                                <td>${data.origem || '—'}</td>
                                <td style="font-weight: 600; background: #f8fafc;">Profissão / Área:</td>
                                <td>${data.profissao || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Nível de Espanhol:</td>
                                <td>${idiomaLabels[data.idioma] || data.idioma || '—'}</td>
                                <td style="font-weight: 600; background: #f8fafc;">Habilitação (CNH):</td>
                                <td>${data.cnh || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Reserva Financeira:</td>
                                <td>${data.financeiro || '—'}</td>
                                <td style="font-weight: 600; background: #f8fafc;">Renda Mensal:</td>
                                <td>${data.renda || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Estratégia de Ida:</td>
                                <td>${estLabels[data.estrategiaIda] || data.estrategiaIda || '—'}</td>
                                <td style="font-weight: 600; background: #f8fafc;">Prazo Estimado:</td>
                                <td>${data.prazo || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Preferência de Clima:</td>
                                <td>${regLabels[data.prefRegiao] || data.prefRegiao || '—'}</td>
                                <td style="font-weight: 600; background: #f8fafc;">Expectativa de Moradia:</td>
                                <td>${data.prefMoradia || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Composição Familiar:</td>
                                <td colspan="3">${data.membros || '—'}</td>
                            </tr>
                            ${data.motivacao ? `
                            <tr>
                                <td style="font-weight: 600; background: #f8fafc;">Motivação para Imigrar:</td>
                                <td colspan="3">${data.motivacao}</td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>

                    <div class="pdf-section-title">Análise de Rota & Planejamento Detalhado</div>
                    <div style="font-size: 9.5pt; color: #374151; line-height: 1.6;">
                        ${this.formatMarkdown(data.resultadoAnalise)}
                    </div>

                    ${data.observacoes ? `
                        <div class="pdf-section-title">Notas Finais do Assessor</div>
                        <p style="font-size: 9pt; color: #374151; line-height: 1.5;">${data.observacoes.replace(/\n/g, '<br>')}</p>
                    ` : ''}

                    <div class="pdf-cta-box" style="margin-top: 30px; page-break-inside: avoid;">
                        <h3>Próximo Passo</h3>
                        <p>Agora que você tem o seu diagnóstico, o ideal é avançar para a fase de documentação o quanto antes para garantir os melhores prazos.</p>
                        <div class="cta-contact">📲 Fale conosco no WhatsApp para continuar</div>
                    </div>

                    ${this.footer()}
                </div>
            `;
        }

        // Layout estático padrão
        return `
            <div class="pdf-document">
                ${this.header('Plano de Ação')}

                <div class="pdf-title">Plano de Ação Personalizado</div>
                <div class="pdf-subtitle">Preparado exclusivamente para ${data.nome || 'o cliente'}</div>

                ${this.clientBox(data)}

                <div class="pdf-section-title">Rota Migratória Recomendada</div>
                <div class="pdf-plan-box">
                    <h3>${visto.nome}</h3>
                    <p style="font-size: 9pt; color: rgba(255,255,255,0.8); margin-top: 8px;">${visto.desc}</p>
                    ${data.justificativa ? `<p style="font-size: 9pt; color: rgba(255,255,255,0.7); margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);"><strong style="color: #f0d68a;">Por que esta rota:</strong> ${data.justificativa}</p>` : ''}
                </div>

                <div class="pdf-section-title">Timeline do Processo</div>
                <div class="pdf-timeline">
                    ${(data.etapas || PDFTemplates.defaultEtapas(data.tipoVisto)).map((etapa, i) => `
                        <div class="pdf-timeline-item">
                            <div class="pdf-timeline-step">Etapa ${i+1} · ${etapa.prazo || ''}</div>
                            <div class="pdf-timeline-title">${etapa.titulo}</div>
                            <div class="pdf-timeline-desc">${etapa.descricao}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="pdf-section-title">Documentos Necessários</div>
                <ul class="pdf-checklist">
                    ${(data.documentos || PDFTemplates.defaultDocs(data.tipoVisto)).map(doc => `
                        <li>
                            <div class="pdf-checkbox"></div>
                            <div>
                                <div>${doc.nome}</div>
                                ${doc.nota ? `<div class="pdf-checklist-note">${doc.nota}</div>` : ''}
                            </div>
                        </li>
                    `).join('')}
                </ul>

                <div class="pdf-section-title">Estimativa de Custos</div>
                <table class="pdf-table">
                    <thead>
                        <tr><th>Item</th><th>Estimativa</th></tr>
                    </thead>
                    <tbody>
                        ${(data.custos || PDFTemplates.defaultCustos(data.tipoVisto)).map(c => `
                            <tr><td>${c.item}</td><td style="font-weight: 600;">${c.valor}</td></tr>
                        `).join('')}
                    </tbody>
                </table>

                ${data.observacoes ? `
                    <div class="pdf-section-title">Observações e Notas</div>
                    <p style="font-size: 9pt; color: #374151;">${data.observacoes}</p>
                ` : ''}

                <div class="pdf-cta-box" style="margin-top: 30px;">
                    <h3>Próximo Passo</h3>
                    <p>Agora que você tem o seu plano, o ideal é avançar para a fase de documentação o quanto antes para garantir os melhores prazos.</p>
                    <div class="cta-contact">📲 Fale conosco no WhatsApp para continuar</div>
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // 3. CHECKLIST DE DOCUMENTOS
    // ==============================
    checklist(data) {
        const categorias = {
            pessoal: { titulo: '📄 Documentos Pessoais', docs: [] },
            saude: { titulo: '🏥 Saúde', docs: [] },
            financeiro: { titulo: '💰 Comprovação Financeira', docs: [] },
            estudo: { titulo: '🎓 Documentos de Estudo', docs: [] },
            trabalho: { titulo: '💼 Documentos de Trabalho', docs: [] },
            moradia: { titulo: '🏠 Moradia', docs: [] },
            residencia: { titulo: '📋 Residência', docs: [] },
            familiar: { titulo: '👨‍👩‍👧 Documentos Familiares', docs: [] }
        };

        // Group docs by category
        (data.documentos || []).forEach(doc => {
            const cat = doc.categoria || 'pessoal';
            if (categorias[cat]) {
                categorias[cat].docs.push(doc);
            }
        });

        return `
            <div class="pdf-document">
                ${this.header('Checklist de Documentos')}

                <div class="pdf-title">Checklist de Documentos</div>
                <div class="pdf-subtitle">${Auth.vistoLabels[data.tipoVisto] || 'Geral'} · ${data.nome || 'Cliente'}</div>

                ${this.clientBox(data)}

                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 9pt;">
                    <strong style="color: #92400e;">⚠️ Importante:</strong> Todos os documentos emitidos em português devem ser <strong>Traduzidos por Tradutor Juramentado</strong> após receberem a Apostila de Haia.
                </div>

                ${Object.entries(categorias).filter(([_, cat]) => cat.docs.length > 0).map(([_, cat]) => `
                    <div class="pdf-section-title">${cat.titulo}</div>
                    <ul class="pdf-checklist">
                        ${cat.docs.map(doc => `
                            <li>
                                <div class="pdf-checkbox ${doc.status === 'aprovado' ? 'checked' : ''}"></div>
                                <div>
                                    <div>${doc.nome} ${doc.obrigatorio ? '<span style="color: #dc2626; font-weight: 700;">*</span>' : '<span style="color: #9ca3af; font-size: 8pt;">(se aplicável)</span>'}</div>
                                    ${doc.nota ? `<div class="pdf-checklist-note">${doc.nota}</div>` : ''}
                                    ${doc.comentarioAdmin ? `<div class="pdf-checklist-note" style="color: #dc2626;">📝 ${doc.comentarioAdmin}</div>` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                `).join('')}

                <div style="margin-top: 30px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 8pt; color: #6b7280;">
                    <strong>Legenda:</strong> <span style="color: #dc2626;">*</span> Obrigatório · ☐ Pendente · ☑ Entregue/Aprovado<br>
                    <strong>Dica:</strong> Faça a tradução juramentada apenas DEPOIS que o documento original já tiver a Apostila de Haia.
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // 4. RECIBO / FATURA
    // ==============================
    recibo(data) {
        const today = new Date();
        const reciboNum = data.numero || `REC-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`;

        return `
            <div class="pdf-document">
                ${data.pago ? '<div class="pdf-watermark">PAGO</div>' : ''}
                ${this.header('Recibo de Pagamento')}

                <div class="pdf-title">Recibo de Pagamento</div>
                <div class="pdf-subtitle">Nº ${reciboNum} · ${today.toLocaleDateString('pt-BR')}</div>

                ${this.clientBox(data)}

                <div class="pdf-section-title">Detalhes do Serviço</div>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Qtd</th>
                            <th style="text-align: right;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(data.itens || [{ descricao: Auth.planoLabels[data.plano] || data.plano, qtd: 1, valor: data.valor || 0 }]).map(item => `
                            <tr>
                                <td>${item.descricao}</td>
                                <td>${item.qtd || 1}</td>
                                <td style="text-align: right; font-weight: 600;">${(item.valor || 0).toLocaleString('pt-BR')}€</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="pdf-receipt-total">
                    <div class="total-label">Total</div>
                    <div class="total-value">${(data.valor || 0).toLocaleString('pt-BR')}€</div>
                    ${data.pago ? '<div class="pdf-receipt-paid">✓ PAGO</div>' : ''}
                </div>

                ${data.metodoPagamento ? `
                    <div class="pdf-section-title">Informações de Pagamento</div>
                    <div class="pdf-client-box">
                        <div class="pdf-client-row">
                            <div class="pdf-client-field"><strong>Método:</strong> <span>${data.metodoPagamento}</span></div>
                            <div class="pdf-client-field"><strong>Data:</strong> <span>${data.dataPagamento || today.toLocaleDateString('pt-BR')}</span></div>
                        </div>
                        ${data.referencia ? `<div class="pdf-client-row"><div class="pdf-client-field"><strong>Referência:</strong> <span>${data.referencia}</span></div></div>` : ''}
                    </div>
                ` : ''}

                <div class="pdf-signatures" style="margin-top: 60px;">
                    <div class="pdf-signature-block">
                        <div class="pdf-signature-line"></div>
                        <div class="pdf-signature-name">Destino Espanha Assessoria</div>
                        <div class="pdf-signature-role">Emitente</div>
                    </div>
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // 5. PROPOSTA COMERCIAL
    // ==============================
    proposta(data) {
        const planos = {
            diagnostico: {
                nome: 'Diagnóstico Estratégico',
                valor: 50,
                itens: [
                    'Videochamada de 60 a 90 minutos de sessão estratégica',
                    'Análise completa de perfil migratório familiar',
                    'Plano de Ação personalizado estruturado em PDF',
                    '15 dias de suporte via WhatsApp limitado exclusivamente ao esclarecimento de dúvidas sobre a interpretação do Plano de Ação',
                    'Valor 100% dedutível em contratações futuras de Assessoria Integral (Documentação, Vistos ou Premium)'
                ]
            },
            documentacao: {
                nome: 'Documentação Brasil',
                valor: 350,
                itens: [
                    'Checklist personalizado de documentos necessários no Brasil',
                    'Orientação técnica sobre emissão de certidões brasileiras e apostilamento de Haia',
                    'Coordenação direta e orçamento com tradutores juramentados credenciados parceiros',
                    'Revisão técnica minuciosa de todo o dossiê final para evitar erros e riscos de indeferimento consular',
                    'Suporte via WhatsApp em dias úteis e horário comercial (segunda a sexta, das 09h às 18h) durante a vigência contratual'
                ]
            },
            vistos: {
                nome: 'Assessoria de Vistos',
                valor: 750,
                itens: [
                    'Tudo incluso no pacote "Documentação Brasil"',
                    'Preenchimento completo dos formulários oficiais de solicitação de visto da Espanha',
                    'Monitoramento operacional e suporte manual no agendamento de datas (citas) no Consulado espanhol',
                    'Treinamento prévio e simulação individual para a entrevista consular',
                    'Indicação e suporte na cotação de seguros de saúde espanhóis obrigatórios e homologados (sem copago)',
                    'Acompanhamento das etapas e suporte operacional completo até a decisão consular final',
                    'Suporte via WhatsApp em dias úteis e horário comercial (segunda a sexta, das 09h às 18h)'
                ]
            },
            aterragem: {
                nome: 'Aterragem Espanha',
                valor: 600,
                itens: [
                    'Busca segura de moradia na Espanha (limitada à curadoria e análise de até 3 imóveis e análise jurídica do contrato de aluguel por advogados parceiros)',
                    'Agendamento e suporte nos trâmites presenciais para emissão de NIE/TIE na Espanha',
                    'Agendamento e orientação para o Empadronamiento municipal',
                    'Suporte e orientação para abertura de conta em banco espanhol (remoto ou presencial)',
                    'Orientação e auxílio no processo de matrícula escolar pública ou privada de filhos menores',
                    'Suporte presencial ou remoto para esclarecimento de trâmites básicos de instalação local (30 dias)'
                ]
            },
            premium: {
                nome: 'Premium Família VIP',
                valor: 2000,
                itens: [
                    'Diagnóstico Estratégico completo com Plano de Ação',
                    'Documentação Brasil integral (apoio, revisão, orçamento e coordenação)',
                    'Assessoria de Visto, Reagrupamento Consular ou Arraigo de forma completa',
                    'Seguro Saúde Espanhol obrigatório (primeiro ano incluso para o contratante titular)',
                    'Assessoria personalizada de logística e curadoria de passagens aéreas',
                    'Busca de moradia na Espanha (curadoria abrangente, com até 5 visitas em vídeo efetuadas pela assessoria e análise de contrato)',
                    'Aterragem completa na Espanha (NIE/TIE, Empadronamiento, Conta Bancária e matrícula escolar)',
                    'Suporte prioritário via WhatsApp com tempo de resposta estendido (segunda a domingo)'
                ]
            }
        };

        const pessoas = parseInt(data.pessoas) || 1;
        const planoId = data.plano || 'vistos';
        const pac = planos[planoId] || planos.vistos;
        const valorPadrao = (PDFTemplates.precosFamiliares[planoId] && PDFTemplates.precosFamiliares[planoId][pessoas]) || pac.valor;
        const valor = data.valorCustom || valorPadrao;
        const planoNomeFormatado = pessoas > 1 ? `${pac.nome} (${pessoas} Pessoas)` : pac.nome;

        return `
            <div class="pdf-document">
                ${this.header('Proposta Comercial')}

                <div class="pdf-title">Proposta Personalizada</div>
                <div class="pdf-subtitle">Preparada para ${data.nome || 'você'}</div>

                <div class="pdf-section-title">Quem Somos</div>
                <p style="font-size: 9.5pt; color: #374151; margin-bottom: 20px;">
                    A <strong>Destino Espanha</strong> é uma assessoria especializada em imigração para famílias brasileiras. 
                    Com mais de 4 anos de experiência vivendo na Europa, passamos por Portugal e Espanha — e transformamos 
                    toda essa vivência em um serviço que pega na sua mão no Brasil e só solta quando você estiver instalado na Espanha.
                </p>

                <div class="pdf-section-title">Sem Assessoria vs. Com Assessoria</div>
                <div class="pdf-comparison">
                    <div class="pdf-compare-col bad">
                        <h4>❌ Sem Assessoria</h4>
                        <ul>
                            <li>Informações soltas de vídeos no YouTube</li>
                            <li>Risco de documentos errados ou incompletos</li>
                            <li>Visto negado por erro técnico</li>
                            <li>Meses perdidos com retrabalho</li>
                            <li>Gastos com advogados para corrigir erros</li>
                            <li>Estresse e insegurança constante</li>
                        </ul>
                    </div>
                    <div class="pdf-compare-col good">
                        <h4>✓ Com Destino Espanha</h4>
                        <ul>
                            <li>Rota migratória definida por especialista</li>
                            <li>Dossiê perfeito para o consulado</li>
                            <li>Treinamento para entrevista</li>
                            <li>Timeline clara com prazos</li>
                            <li>Suporte humano e dedicado</li>
                            <li>Tranquilidade de ponta a ponta</li>
                        </ul>
                    </div>
                </div>

                <div class="pdf-section-title">O Pacote Recomendado para Você</div>
                <div class="pdf-plan-box">
                    <h3>${planoNomeFormatado}</h3>
                    <div class="pdf-plan-price">${valor.toLocaleString('pt-BR')}€</div>
                    <ul class="pdf-plan-features">
                        ${pac.itens.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>

                ${data.condicoes ? `
                    <div class="pdf-section-title">Condições de Pagamento</div>
                    <p style="font-size: 9.5pt; color: #374151;">${data.condicoes}</p>
                ` : `
                    <div class="pdf-section-title">Condições de Pagamento</div>
                    <p style="font-size: 9.5pt; color: #374151;">
                        Pagamento via PIX, transferência bancária ou cartão de crédito. 
                        Parcelamento em até 3x sem juros disponível.
                    </p>
                `}

                ${data.depoimento ? `
                    <div class="pdf-section-title">O Que Nossos Clientes Dizem</div>
                    <div style="background: #f8fafc; border-left: 3px solid #d4a853; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                        <p style="font-size: 9.5pt; color: #374151; font-style: italic;">"${data.depoimento.texto}"</p>
                        <p style="font-size: 8pt; color: #6b7280; margin-top: 8px;">— ${data.depoimento.autor}</p>
                    </div>
                ` : `
                    <div class="pdf-section-title">O Que Nossos Clientes Dizem</div>
                    <div style="background: #f8fafc; border-left: 3px solid #d4a853; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                        <p style="font-size: 9.5pt; color: #374151; font-style: italic;">"Planejar uma mudança em família parecia impossível. Com o suporte da Destino Espanha, conseguimos a matrícula no CAP, organizamos toda a papelada e nos preparamos para a entrevista consular. Hoje estamos morando legalmente na Espanha e muito felizes!"</p>
                        <p style="font-size: 8pt; color: #6b7280; margin-top: 8px;">— Família B. (Porto Alegre - RS) · Aprovados em 2024 · Visto CAP</p>
                    </div>
                `}

                <div class="pdf-cta-box">
                    <h3>Vamos começar a sua jornada?</h3>
                    <p>Fale com a gente no WhatsApp e agende o seu primeiro passo — a análise é gratuita e sem compromisso.</p>
                    <div class="cta-contact">📲 WhatsApp: +55 (99) 99999-9999</div>
                </div>

                <div style="text-align: center; margin-top: 20px; font-size: 8pt; color: #9ca3af;">
                    Proposta válida por 15 dias. Valores sujeitos a alteração.
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // 6. PREPARAÇÃO DE DOCUMENTOS (PROFISSÕES)
    // ==============================
    preparacaoDocs(data) {
        const profissoes = {
            enfermagem: {
                titulo: 'Enfermagem (Enfermeiro/a)',
                area: 'Saúde / Profissão Regulamentada',
                desc: 'A enfermagem é uma profissão regulamentada na Espanha. Para exercer a profissão, é obrigatório homologar o seu diploma de graduação brasileiro junto ao Ministério de Universidades da Espanha e, posteriormente, registrar-se no Colegio Oficial de Enfermería da província onde irá residir e trabalhar.',
                checklist: [
                    { nome: 'Diploma de Graduação em Enfermagem', nota: 'Original + Cópia autenticada e apostilada + Tradução Juramentada' },
                    { nome: 'Histórico Escolar Acadêmico Detalhado', nota: 'Apresentando carga horária total e por matéria, notas e créditos + Apostilado + Traduzido' },
                    { nome: 'Ementas e Conteúdo Programático das Disciplinas', nota: 'Detalhamento das disciplinas cursadas, assinado e carimbado pela instituição + Apostilado + Traduzido' },
                    { nome: 'Certidão de Regularidade Profissional (Good Standing)', nota: 'Certidão de registro ativo e ausência de sanções éticas emitida pelo COREN + Apostilada + Traduzida (Validade de 90 dias)' },
                    { nome: 'Documento de Identificação (Passaporte)', nota: 'Cópia simples e legível de todas as páginas ou página de identificação' }
                ],
                passos: [
                    { titulo: 'Emissão e Apostilamento no Brasil', desc: 'Solicitar todos os documentos acadêmicos e do COREN. Realizar o apostilamento físico de todos em cartório no Brasil.' },
                    { titulo: 'Tradução Juramentada', desc: 'Realizar a tradução de todas as certidões, diplomas e históricos por um tradutor juramentado habilitado.' },
                    { titulo: 'Protocolo da Homologação (Ministério de Universidades)', desc: 'Envio telemático da solicitação através da sede eletrônica oficial e pagamento da Tasa 790 correspondente.' },
                    { titulo: 'Acompanhamento e Resolução', desc: 'O trâmite pode levar de 9 a 18 meses. O governo pode exigir provas de aptidão complementares se detectar lacunas na carga horária.' },
                    { titulo: 'Colegiatura Oficial na Espanha', desc: 'Com o título homologado em mãos, realizar a inscrição obrigatória no Colegio de Enfermería local para ser autorizado a trabalhar.' }
                ]
            },
            medicina: {
                titulo: 'Medicina (Médico/a)',
                area: 'Saúde / Profissão Regulamentada',
                desc: 'A medicina é altamente regulamentada na Espanha. O trâmite exige a homologação do título de graduação pelo Ministério de Universidades. Para nacionais de países não hispanofalantes (como o Brasil), é obrigatório apresentar o Certificado de Proficiência em Língua Espanhola nível B2 (DELE ou SIELE) para que a homologação seja aprovada.',
                checklist: [
                    { nome: 'Diploma de Graduação em Medicina', nota: 'Original + Cópia autenticada e apostilada + Tradução Juramentada' },
                    { nome: 'Histórico Escolar Acadêmico Detalhado', nota: 'Com notas, disciplinas e carga horária total detalhada + Apostilado + Traduzido' },
                    { nome: 'Planos de Ensino / Conteúdo Programático', nota: 'Conteúdo descritivo das matérias, assinado e carimbado pela Faculdade + Apostilado + Traduzido' },
                    { nome: 'Certificado de Regularidade Profissional (Good Standing)', nota: 'Emitido pelo CRM regional comprovando registro ativo e conduta ética + Apostilado + Traduzido' },
                    { nome: 'Certificado de Proficiência em Espanhol (B2)', nota: 'Exame DELE ou SIELE oficial de nível B2 ou superior. Requisito legal indispensável.' },
                    { nome: 'Documento de Identificação (Passaporte)', nota: 'Cópia nítida do passaporte válido' }
                ],
                passos: [
                    { titulo: 'Aprovação no Exame de Espanhol B2', desc: 'Recomendamos obter o DELE ou SIELE B2 antes de protocolar ou durante os primeiros meses do processo para evitar atrasos na homologação.' },
                    { titulo: 'Emissão e Apostilamento no Brasil', desc: 'Solicitar a documentação acadêmica e o certificado de regularidade do CRM. Apostilar todos os documentos em cartório brasileiro.' },
                    { titulo: 'Tradução Juramentada', desc: 'Contratar tradutor juramentado habilitado para traduzir o dossiê (diploma, histórico, CRM, etc.).' },
                    { titulo: 'Solicitação Telemática de Homologação', desc: 'Submeter o processo na sede online do Ministério de Universidades e pagar a Tasa 790 correspondente.' },
                    { titulo: 'Inscrição no Colegio de Médicos', desc: 'Após o deferimento da homologação, efetivar a inscrição no Colegio de Médicos da província onde residirá.' },
                    { titulo: 'Preparação MIR (Se aplicável)', desc: 'Caso queira exercer especialização médica na Espanha, iniciar os estudos para o exame MIR (Médico Interno Residente).' }
                ]
            },
            soldador: {
                titulo: 'Soldador (Área Técnica)',
                area: 'Indústria / Trabalho Técnico',
                desc: 'A profissão de soldador possui alta demanda de mão de obra qualificada na Espanha. A validação das competências é feita através de certificações práticas e comprovação da experiência profissional no Brasil (CLT/Contratos) para facilitar a obtenção de vistos de trabalho ou autorizações de residência por arraigo.',
                checklist: [
                    { nome: 'Diplomas/Certificados de Cursos Profissionalizantes de Solda', nota: 'Certificados emitidos pelo SENAI ou escolas técnicas credenciadas + Apostilado + Traduzido' },
                    { nome: 'Carteira de Trabalho (CTPS) ou Contratos de Trabalho', nota: 'Comprovando experiência prática mínima na função de soldador + Tradução Juramentada das seções pertinentes' },
                    { nome: 'Cartas de Recomendação e Referência de Empregadores', nota: 'Papel timbrado detalhando os processos de soldagem dominados (TIG, MIG-MAG, Eletrodo, Oxigás, etc.) e período trabalhado + Traduzidas' },
                    { nome: 'Certificados de Qualificação de Soldador (AWS/ASME/ISO)', nota: 'Certificados de homologação de solda ativos + Tradução Juramentada' },
                    { nome: 'Documento de Identificação (Passaporte)', nota: 'Cópia do passaporte válido com mais de 1 ano de vigência' }
                ],
                passos: [
                    { titulo: 'Montagem do Portfólio de Qualificação', desc: 'Reunir todos os certificados de cursos, testes de solda e referências profissionais que comprovam sua senioridade técnica.' },
                    { titulo: 'Emissão e Reconhecimento de Firmas', desc: 'Reconhecer firma dos signatários das cartas de referência e apostilar os diplomas de cursos técnicos.' },
                    { titulo: 'Tradução do Dossiê Profissional', desc: 'Traduzir a carteira de trabalho, cartas de recomendação e certificados técnicos relevantes para o espanhol.' },
                    { titulo: 'Curso de Prevenção de Riscos Laborais (PRL)', desc: 'Ao chegar na Espanha, realizar o curso obrigatório de segurança de 20h para a área de metal/solda para estar apto ao trabalho.' },
                    { titulo: 'Certificação por Entidade Espanha (Opcional)', desc: 'Se necessário, realizar testes de solda práticos na Espanha para obter a homologação de normas europeias (UNE-EN ISO).' }
                ]
            },
            motorista: {
                titulo: 'Motorista Profissional (DGT / CAP)',
                area: 'Transporte de Cargas e Passageiros',
                desc: 'Para atuar como motorista profissional na Espanha, é necessário obter a habilitação espanhola e a certificação obrigatória CAP (Certificado de Aptidão Profissional) realizando formação teórica e prática em autoescola espanhola homologada.',
                checklist: [
                    { nome: 'CNH Categoria D ou E (Física e ativa)', nota: 'Habilitação brasileira original. Deve ter sido emitida antes de você fixar residência na Espanha.' },
                    { nome: 'Prontuário de Habilitação do DETRAN', nota: 'Certidão oficial do DETRAN detalhando histórico e data de primeira emissão + Apostilado + Traduzido' },
                    { nome: 'Certificado de Escolaridade (Ensino Fundamental ou Médio)', nota: 'Histórico escolar e diploma do maior grau obtido, necessários para a matrícula no curso CAP + Apostilados + Traduzidos' },
                    { nome: 'Documento de Identificação (Passaporte)', nota: 'Cópia simples de passaporte brasileiro válido' }
                ],
                passos: [
                    { titulo: 'NIE e Empadronamiento', desc: 'Fixar residência legal na Espanha, obter o NIE de estudante/residente e realizar o registro de moradia (Empadronamiento).' },
                    { titulo: 'Matrícula no CAP Inicial (140h)', desc: 'Realizar a inscrição no curso integrado em autoescola espanhola autorizada pela DGT.' },
                    { titulo: 'Exame Psicotécnico', desc: 'Realizar a prova de aptidão física e mental em um Centro de Reconhecimento de Condutores (CRC) na Espanha.' },
                    { titulo: 'Provas e Emissão de Documentos', desc: 'Prestar as provas teórica e prática da DGT para emissão da habilitação espanhola correspondente e cartão CAP.' }
                ]
            },
            geral: {
                titulo: 'Profissões Gerais / Homologação Acadêmica',
                area: 'Homologação e Validação de Títulos',
                desc: 'Guia geral para validação, homologação ou equivalência de diplomas de ensino superior ou técnico no Ministério de Universidades espanhol, preparando o dossiê básico exigido para imigração acadêmica ou profissional.',
                checklist: [
                    { nome: 'Diploma de Graduação ou Técnico', nota: 'Original + Cópia autenticada e apostilada + Tradução Juramentada' },
                    { nome: 'Histórico Escolar Completo', nota: 'Detalhamento das disciplinas cursadas, notas e carga horária + Apostilado + Traduzido' },
                    { nome: 'Ementas das Disciplinas / Planos de Ensino', nota: 'Ementário descritivo fornecido e assinado pela faculdade/escola (necessário para homologações de equivalência) + Apostilado + Traduzido' },
                    { nome: 'Registro em Conselho de Classe no Brasil (Se aplicável)', nota: 'Comprovante de registro profissional regular + Apostilado + Traduzido' },
                    { nome: 'Documento de Identificação (Passaporte)', nota: 'Cópia legível do passaporte válido' }
                ],
                passos: [
                    { titulo: 'Reunião e Apostilamento no Brasil', desc: 'Reunir toda a documentação acadêmica original e efetuar o apostilamento de Haia em cartório brasileiro.' },
                    { titulo: 'Tradução Juramentada', desc: 'Contratar tradutor oficial para traduzir o diploma, histórico e certidões.' },
                    { titulo: 'Protocolo e Pagamento da Taxa', desc: 'Cadastrar a solicitação online no Ministério correspondente na Espanha e efetuar o pagamento da taxa administrativa (Tasa 790).' },
                    { titulo: 'Acompanhamento', desc: 'Monitorar o status do expediente no portal eletrônico e responder a eventuais requerimentos adicionais de documentação.' }
                ]
            }
        };

        const profKey = data.profissao || 'geral';
        const prof = profissoes[profKey] || profissoes.geral;

        return `
            <div class="pdf-document">
                ${this.header('Preparação de Documentos de Homologação')}

                <div class="pdf-title">Guia de Preparação e Validação</div>
                <div class="pdf-subtitle">Área Profissional: <strong>${prof.titulo}</strong></div>

                ${this.clientBox(data)}

                <div class="pdf-section-title">Diretrizes da Profissão</div>
                <div class="pdf-plan-box" style="margin-bottom: 24px;">
                    <h3>${prof.area}</h3>
                    <p style="font-size: 9pt; color: rgba(255,255,255,0.9); margin-top: 8px; line-height: 1.5;">${prof.desc}</p>
                </div>

                ${data.idiomaRequisito ? `
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 9pt; display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 1.2rem; margin-top: -2px;">🗣️</span>
                        <div>
                            <strong style="color: #92400e;">Proficiência em Língua Espanhola Exigida (Nível B2):</strong>
                            <div style="color: #78350f; margin-top: 2px;">Para esta área profissional, é obrigatória a apresentação de certificado de nível B2 em espanhol (exame oficial DELE ou SIELE) junto ao Ministério de Universidades para que a validação seja aprovada.</div>
                        </div>
                    </div>
                ` : ''}

                <div class="pdf-section-title">Checklist de Documentos a Emitir no Brasil</div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 8.5pt; color: #475569;">
                    💡 <strong>Orientações de Validação:</strong> 
                    Todos os documentos abaixo devem ser emitidos, ter firma reconhecida (se aplicável), receber a <strong>Apostila de Haia</strong> em cartório e ser traduzidos por <strong>Tradutor Juramentado</strong> no espanhol.
                </div>
                <ul class="pdf-checklist" style="margin-bottom: 24px;">
                    ${prof.checklist.map(doc => `
                        <li>
                            <div class="pdf-checkbox"></div>
                            <div>
                                <div style="font-weight: 600;">${doc.nome}</div>
                                <div class="pdf-checklist-note">${doc.nota}</div>
                            </div>
                        </li>
                    `).join('')}
                </ul>

                <div class="pdf-section-title">Fluxo de Validação e Homologação na Espanha</div>
                <div class="pdf-timeline">
                    ${prof.passos.map((passo, idx) => `
                        <div class="pdf-timeline-item">
                            <div class="pdf-timeline-step">Etapa ${idx + 1}</div>
                            <div class="pdf-timeline-title">${passo.titulo}</div>
                            <div class="pdf-timeline-desc">${passo.desc}</div>
                        </div>
                    `).join('')}
                </div>

                ${data.instrucoesExtra ? `
                    <div class="pdf-section-title">Instruções Extras e Observações Personalizadas</div>
                    <div style="background: #fdfaf2; border-left: 3px solid #d4a853; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 9pt; color: #374151; line-height: 1.5; margin-top: 15px;">
                        ${data.instrucoesExtra.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}

                <div class="pdf-cta-box" style="margin-top: 30px;">
                    <h3>Dúvidas na emissão do dossiê?</h3>
                    <p>Entre em contato com nossa equipe pelo WhatsApp para orientações adicionais ou indicação de tradutores juramentados credenciados na Espanha.</p>
                    <div class="cta-contact">📲 Fale conosco no WhatsApp para continuar</div>
                </div>

                ${this.footer()}
            </div>
        `;
    },

    // ==============================
    // DEFAULT DATA HELPERS
    // ==============================
    defaultEtapas(tipoVisto) {
        const common = [
            { titulo: 'Diagnóstico e Planejamento', descricao: 'Análise de perfil e definição da rota migratória ideal.', prazo: 'Semana 1' },
            { titulo: 'Coleta de Documentos', descricao: 'Emissão de certidões, apostilamentos e tradução juramentada.', prazo: 'Semanas 2-6' },
            { titulo: 'Montagem do Dossiê', descricao: 'Revisão final e preparação do dossiê completo para apresentação.', prazo: 'Semana 7' },
        ];

        const specific = {
            estudo_cap: [
                { titulo: 'Matrícula no CAP', descricao: 'Inscrição e pagamento em centro de formação espanhol autorizado.', prazo: 'Semanas 3-5' },
                { titulo: 'Agendamento no Consulado', descricao: 'Cita consular + treinamento para entrevista.', prazo: 'Semanas 8-10' },
                { titulo: 'Aprovação e Viagem', descricao: 'Recebimento do visto, passagens aéreas e preparação para chegada.', prazo: 'Semanas 11-14' },
            ],
            estudo_cap_validacao: [
                { titulo: 'Matrícula na Autoescola (CAP + C/C+E)', descricao: 'Matrícula no pacote combinado profissional (CAP + Carteiras C/C+E) em Múrcia/Península.', prazo: 'Semanas 3-5' },
                { titulo: 'Consulado e Visto', descricao: 'Agendamento no Consulado espanhol no Brasil, simulação de entrevista e emissão do visto.', prazo: 'Semanas 8-10' },
                { titulo: 'Aterragem e Trâmites DGT', descricao: 'Chegada na Espanha, NIE, Empadronamiento e abertura de prontuário na DGT.', prazo: 'Semanas 11-13' },
                { titulo: 'Exames e Carteira Espanhola', descricao: 'Aulas e realização das provas teórica e prática na DGT para emitir a habilitação espanhola e obter o CAP.', prazo: 'Semanas 14-20' }
            ],
            estudo_cap_transicao: [
                { titulo: 'Matrícula na Autoescola (CAP + Permiso C)', descricao: 'Matrícula na formação integrada para caminhão rígido (Permiso C) + CAP Inicial Acelerado.', prazo: 'Semanas 3-5' },
                { titulo: 'Consulado e Visto', descricao: 'Preparação do dossiê de fundos proporcionais, agendamento consular e emissão do visto.', prazo: 'Semanas 8-10' },
                { titulo: 'Formação Inicial na Espanha', descricao: 'Aterragem e início das aulas teóricas/práticas para obtenção do Permiso C e CAP Inicial.', prazo: 'Semanas 11-15' },
                { titulo: 'Plano de Carreira e C+E', descricao: 'Aprovação na DGT, início de inserção em vagas para caminhão rígido e planejamento para futura habilitação C+E (carreta).', prazo: 'Semanas 16-24' }
            ],
            nao_lucrativa: [
                { titulo: 'Comprovação Financeira', descricao: 'Organização de extratos, investimentos e provas de renda passiva.', prazo: 'Semanas 3-5' },
                { titulo: 'Agendamento no Consulado', descricao: 'Cita consular + treinamento para entrevista.', prazo: 'Semanas 8-10' },
                { titulo: 'Aprovação e Viagem', descricao: 'Recebimento do visto e planejamento da mudança.', prazo: 'Semanas 11-16' },
            ],
            nomade: [
                { titulo: 'Documentação de Trabalho Remoto', descricao: 'Preparação de contrato, comprovantes de renda e registro profissional.', prazo: 'Semanas 3-5' },
                { titulo: 'Agendamento no Consulado', descricao: 'Cita consular + treinamento para entrevista.', prazo: 'Semanas 8-10' },
                { titulo: 'Aprovação e Viagem', descricao: 'Recebimento do visto e planejamento da mudança.', prazo: 'Semanas 11-14' },
            ],
        };

        return [...common, ...(specific[tipoVisto] || specific.estudo_cap)];
    },

    defaultDocs(tipoVisto) {
        const base = [
            { nome: 'Passaporte válido (validade > 1 ano)', nota: 'Para todos os membros da família' },
            { nome: 'Certidão de Nascimento (Inteiro Teor)', nota: 'Emitida há menos de 90 dias + Apostila de Haia' },
            { nome: 'Certidão de Casamento/União Estável', nota: 'Se aplicável + Apostila de Haia' },
            { nome: 'Antecedentes Criminais (Polícia Federal)', nota: 'Emitido há menos de 3-6 meses + Apostila de Haia' },
            { nome: 'Atestado Médico (RSI 2005)', nota: 'Modelo específico — fornecemos o texto correto' },
            { nome: 'Seguro Saúde Internacional', nota: 'Cobertura mínima de 30.000€ no Espaço Schengen' },
            { nome: 'Declaração de Imposto de Renda', nota: 'Completa com recibo de entrega' },
            { nome: 'Comprovação de Meios de Subsistência', nota: 'Exige-se 100% do IPREM por mês de estadia (aprox. 600€/mês). O saldo mínimo líquido exigido é proporcional à duração do curso descrita na matrícula da autoescola (ex: 3 meses = ~1.800€, 6 meses = ~3.600€).' },
        ];

        const specific = {
            estudo_cap: [
                { nome: 'Carta de Aceitação / Matrícula', nota: 'Curso CAP Inicial em centro homologado' },
                { nome: 'Diploma de Escolaridade', nota: 'Histórico e Diploma de ensino médio ou superior apostilados' },
                { nome: 'Comprovante de Pagamento do Curso', nota: 'Recibo oficial emitido pela instituição na Espanha' },
            ],
            estudo_cap_validacao: [
                { nome: 'Carta de Aceitação / Matrícula (Autoescola)', nota: 'Pacote combinado (Permiso C/C+E + CAP 140h)' },
                { nome: 'Diploma de Escolaridade', nota: 'Histórico e Diploma de maior grau apostilados' },
                { nome: 'CNH Categoria E (Brasil) física', nota: 'Deve estar válida (histórico de condutor)' },
                { nome: 'Prontuário de Habilitação do DETRAN', nota: 'Certidão oficial detalhando data de obtenção (deve ser anterior à residência na Espanha) + apostilada' },
                { nome: 'Comprovante de Pagamento da Autoescola', nota: 'Recibo do pagamento da matrícula/reserva do curso' },
            ],
            estudo_cap_transicao: [
                { nome: 'Carta de Aceitação / Matrícula (Autoescola)', nota: 'Curso integrado Permiso C + CAP Inicial' },
                { nome: 'Diploma de Escolaridade', nota: 'Histórico e Diploma de maior grau apostilados' },
                { nome: 'CNH Categoria B (Brasil) física', nota: 'Habilitação de carro ativa e regularizada' },
                { nome: 'Comprovante de Pagamento da Autoescola', nota: 'Recibo oficial de matrícula' },
            ],
            nao_lucrativa: [
                { nome: 'Comprovantes de Renda Passiva', nota: 'Aluguéis, investimentos, aposentadoria ou dividendos' },
                { nome: 'Comprovante de Alojamento na Espanha', nota: 'Escritura de imóvel ou contrato de aluguel de longa duração' },
            ],
            nomade: [
                { nome: 'Contrato de Trabalho Remoto', nota: 'Comprovando vínculo de no mínimo 3 meses com empresa estrangeira' },
                { nome: 'Comprovantes de Renda (últimos 3 meses)', nota: 'Extratos e contracheques' },
            ]
        };

        return [...base, ...(specific[tipoVisto] || specific.estudo_cap)];
    },

    defaultCustos(tipoVisto) {
        const common = [
            { item: 'Assessoria Destino Espanha', valor: 'A definir' },
            { item: 'Taxa Consular de Visto', valor: '80€' },
            { item: 'Apostilamentos de Documentos no Brasil', valor: '50–150€' },
        ];

        const specific = {
            estudo_cap_validacao: [
                { item: 'Curso CAP Inicial Acelerado + Práticas DGT (Autoescola)', valor: '600–1.200€' },
                { item: 'Taxa 2.1 da DGT (Canje Profissional)', valor: '94,05€' },
                { item: 'Exame Psicotécnico no CRC (Espanha)', valor: '40–60€' },
                { item: 'Seguro Saúde Espanhol Anual (Sem Copago)', valor: '500–600€' },
                { item: 'Tradução Juramentada de Prontuário/Certidões', valor: '150–300€' },
                { item: 'Reserva Financeira Mínima (IPREM - 3 meses)', valor: 'Aprox. 1.800€' }
            ],
            estudo_cap_transicao: [
                { item: 'Curso Integrado Permiso C + CAP Inicial (Autoescola)', valor: '1.200–2.500€' },
                { item: 'Taxa DGT (Direito a exames da Classe C)', valor: '94,05€' },
                { item: 'Exame Psicotécnico no CRC (Espanha)', valor: '40–60€' },
                { item: 'Seguro Saúde Espanhol Anual (Sem Copago)', valor: '500–600€' },
                { item: 'Reserva para Aulas Práticas Extras (DGT)', valor: '100–300€ por reprovação' },
                { item: 'Tradução Juramentada de Diplomas e Certidões', valor: '150–250€' },
                { item: 'Reserva Financeira Mínima (IPREM - 6 meses)', valor: 'Aprox. 3.600€' }
            ],
            nao_lucrativa: [
                { item: 'Seguro Saúde Espanhol Anual (Sem Copago)', valor: '600–900€' },
                { item: 'Traduções Juramentadas', valor: '200–500€' },
                { item: 'Reserva para Instalação (Aluguel + Fiança)', valor: '3.000–5.000€' }
            ],
            nomade: [
                { item: 'Seguro Saúde Espanhol Anual', valor: '500–800€' },
                { item: 'Traduções Juramentadas de Contratos', valor: '200–400€' },
            ]
        };

        const list = specific[tipoVisto] || [
            { item: 'Traduções Juramentadas (estimativa)', valor: '200–500€' },
            { item: 'Seguro Saúde Anual', valor: '500–900€' },
            { item: 'Passagens Aéreas (estimativa)', valor: '1.500–3.000€' },
            { item: 'Reserva para Instalação (Aluguel + Fiança)', valor: '3.000–5.000€' }
        ];

        return [...common, ...list];
    },

    valorPorExtenso(valor) {
        // Simple approximation for common values
        const extensos = {
            150: 'cento e cinquenta euros',
            350: 'trezentos e cinquenta euros',
            500: 'quinhentos euros',
            600: 'seiscentos euros',
            700: 'setecentos euros',
            750: 'setecentos e cinquenta euros',
            800: 'oitocentos euros',
            900: 'novecentos euros',
            1000: 'mil euros',
            1100: 'mil e cem euros',
            1150: 'mil cento e cinquenta euros',
            1300: 'mil e trezentos euros',
            1350: 'mil trezentos e cinquenta euros',
            1450: 'mil quatrocentos e cinquenta euros',
            1600: 'mil e seiscentos euros',
            1850: 'mil oitocentos e cinquenta euros',
            2000: 'dois mil euros',
            2100: 'dois mil e cem euros',
            2900: 'dois mil e novecentos euros',
            3500: 'três mil e quinhentos euros',
            4100: 'quatro mil e cem euros',
            4700: 'quatro mil e setecentos euros',
            5300: 'cinco mil e trezentos euros'
        };
        return extensos[valor] || `${valor} euros`;
    },

    // ==============================
    // PDF GENERATION
    // ==============================
    async generate(type, data, options = {}) {
        // Build HTML
        let html = '';
        switch(type) {
            case 'contrato': html = this.contrato(data); break;
            case 'plano_acao': html = this.planoAcao(data); break;
            case 'checklist': html = this.checklist(data); break;
            case 'recibo': html = this.recibo(data); break;
            case 'proposta': html = this.proposta(data); break;
            case 'preparacao_docs': html = this.preparacaoDocs(data); break;
            default: throw new Error(`Template '${type}' não encontrado.`);
        }

        // Create container
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        // Generate PDF with html2pdf.js
        const filename = options.filename || `${type}_${data.nome || 'documento'}_${new Date().toISOString().slice(0,10)}.pdf`;

        const pdfOptions = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true 
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            },
            pagebreak: { mode: 'avoid-all' }
        };

        try {
            if (options.preview) {
                // Return HTML for preview
                document.body.removeChild(container);
                return html;
            }

            if (options.blob) {
                // Return blob (for Firebase upload)
                const blob = await html2pdf().set(pdfOptions).from(container.firstElementChild).outputPdf('blob');
                document.body.removeChild(container);
                return blob;
            }

            // Download directly
            await html2pdf().set(pdfOptions).from(container.firstElementChild).save();
            document.body.removeChild(container);
            return true;
        } catch (error) {
            document.body.removeChild(container);
            console.error('PDF generation error:', error);
            throw error;
        }
    },

    formatMarkdown(text) {
        if (!text) return '';
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const lines = html.split('\n');
        let inList = false;
        const formattedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('###')) {
                const closeList = inList ? '</ul>' : '';
                inList = false;
                return closeList + '<h4 style="font-family: \'Playfair Display\', serif; font-size: 11pt; color: #0a0f1a; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">' + trimmed.slice(3).trim() + '</h4>';
            }
            if (trimmed.startsWith('##')) {
                const closeList = inList ? '</ul>' : '';
                inList = false;
                return closeList + '<h3 style="font-family: \'Playfair Display\', serif; font-size: 12pt; color: #0a0f1a; margin-top: 22px; margin-bottom: 10px;">' + trimmed.slice(2).trim() + '</h3>';
            }
            if (trimmed.startsWith('#')) {
                const closeList = inList ? '</ul>' : '';
                inList = false;
                return closeList + '<h2 style="font-family: \'Playfair Display\', serif; font-size: 14pt; color: #0a0f1a; margin-top: 26px; margin-bottom: 12px;">' + trimmed.slice(1).trim() + '</h2>';
            }
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const liContent = trimmed.slice(1).trim();
                if (!inList) {
                    inList = true;
                    return '<ul style="list-style-type: none; padding-left: 0; margin-bottom: 12px;">' + 
                           '<li style="position: relative; padding-left: 16px; font-size: 9pt; margin-bottom: 4px; color: #374151; line-height: 1.5;">' +
                           '<span style="position: absolute; left: 0; color: #d4a853;">•</span>' + liContent + '</li>';
                }
                return '<li style="position: relative; padding-left: 16px; font-size: 9pt; margin-bottom: 4px; color: #374151; line-height: 1.5;">' +
                       '<span style="position: absolute; left: 0; color: #d4a853;">•</span>' + liContent + '</li>';
            }
            if (trimmed === '') {
                if (inList) {
                    inList = false;
                    return '</ul>';
                }
                return '';
            }
            const closeList = inList ? '</ul>' : '';
            inList = false;
            return closeList + '<p style="font-size: 9pt; color: #374151; margin-bottom: 8px; line-height: 1.5;">' + trimmed + '</p>';
        });
        let result = formattedLines.join('\n');
        if (inList) {
            result += '</ul>';
        }
        return result;
    }
};

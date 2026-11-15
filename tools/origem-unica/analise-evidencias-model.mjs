// Browser contract for the read-only Londrina analysis; no provider output is trusted here.
const FACT_IDS = ['snhis', 'fundo', 'conselho', 'adesao', 'plhis', 'mcmv'];
const STATUSES = ['REGULAR', 'PENDENTE', 'NÃO VERIFICADO'];
const text = (value, limit = 1000) => typeof value === 'string' && value.length > 0 && value.length <= limit;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const invalid = () => {throw new Error('Resposta de análise inválida. O painel oficial continua disponível.');};

export function validateAnalysis(data) {
  if (!data || !['DEMO', 'AI'].includes(data.mode) || data.municipality?.ibge !== '4113700' ||
      data.municipality?.name !== 'Londrina' || data.municipality?.uf !== 'PR' ||
      !Array.isArray(data.evidence) || data.evidence.length !== FACT_IDS.length) invalid();
  const ids = new Set();
  for (const fact of data.evidence) {
    if (!fact || !FACT_IDS.includes(fact.id) || ids.has(fact.id) || !text(fact.label, 200) ||
        !Array.isArray(fact.dates) || fact.dates.length < 1 || fact.dates.length > 8 ||
        !fact.dates.every(validDate) || !text(fact.url, 480)) invalid();
    let url;
    try {url = new URL(fact.url);} catch {invalid();}
    if (url.protocol !== 'https:' || url.hostname !== 'www.gov.br' || url.username || url.password) invalid();
    if (fact.id === 'mcmv' ? !Number.isSafeInteger(fact.value) || fact.value < 1 :
      !STATUSES.includes(fact.value) || (fact.id === 'snhis' && fact.value === 'NÃO VERIFICADO')) invalid();
    ids.add(fact.id);
  }
  for (const [section, min, max] of [['summary', 2, 4], ['limitations', 2, 2], ['next_steps', 1, 2]]) {
    const items = data[section];
    if (!Array.isArray(items) || items.length < min || items.length > max) invalid();
    for (const item of items) {
      if (!item || !text(item.text) || !Array.isArray(item.fact_ids) || item.fact_ids.length < 1 ||
          item.fact_ids.length > ids.size || new Set(item.fact_ids).size !== item.fact_ids.length ||
          item.fact_ids.some(id => !ids.has(id))) invalid();
    }
  }
  const summaryIds = new Set(data.summary.flatMap(item => item.fact_ids));
  if (!summaryIds.has('snhis') || !summaryIds.has('mcmv')) invalid();
  return data;
}

export const analysisModeLabel = mode => mode === 'AI' ?
  'Assistência automatizada por IA' : 'Demonstração determinística · sem chamada de IA';

export function analysisFailure(status, detail) {
  if (status === 401) return 'Código de acesso inválido ou ausente. Solicite o código ao responsável pelo modo online.';
  if (status === 429) return 'Cota ou intervalo mínimo atingido. Aguarde e confira o limite com o responsável antes de tentar novamente.';
  if (status === 504) return 'O serviço de IA excedeu o tempo limite. O painel oficial continua disponível.';
  if (status === 503 && detail === 'O provedor de IA atingiu um limite de uso ou cota. Consulte o responsável antes de tentar novamente.') return detail;
  if (status === 503 && detail === 'Controle de orçamento indisponível.') return 'Controle de orçamento indisponível. Solicite a verificação ao responsável antes de repetir a análise.';
  if (status === 503 && detail === 'Análise desativada.') return 'Análise desativada neste ambiente. Consulte as evidências no painel de Habitação.';
  if (status === 502 && detail === 'Falha de conexão com o serviço de IA.') return 'Não foi possível conectar ao serviço de IA. O painel oficial continua disponível; nenhuma nova tentativa será feita automaticamente.';
  if (status === 503) return 'Análise indisponível. Confira se as duas fontes oficiais carregaram; o painel de Habitação continua disponível.';
  if (status === 502) return 'Não foi possível validar a análise. Consulte as evidências no painel de Habitação.';
  return 'Análise indisponível. Consulte o painel de Habitação.';
}

export function analysisReport(data, generatedAt = new Date().toISOString()) {
  validateAnalysis(data);
  const lines = ['ORIGEM ÚNICA — RELATÓRIO DE CONFERÊNCIA', 'Município: Londrina/PR · IBGE 4113700',
    'Modo: ' + analysisModeLabel(data.mode), 'Relatório gerado em: ' + generatedAt,
    'Uso: apoio a analistas e gestores públicos. Requer conferência humana.',
    'Snapshots históricos não certificam a situação atual. Nenhuma decisão administrativa foi executada.', ''];
  for (const [title, items] of [['RESUMO', data.summary], ['LIMITAÇÕES', data.limitations], ['PRÓXIMOS PASSOS HUMANOS', data.next_steps]]) {
    lines.push(title, ...items.map(item => '- ' + item.text + ' [' + item.fact_ids.join(', ') + ']'), '');
  }
  lines.push('EVIDÊNCIAS E FONTES');
  for (const fact of data.evidence) lines.push(`[${fact.id}] ${fact.label}: ${fact.value}`,
    'Referência da fonte: ' + fact.dates.join(', '), 'Fonte: ' + fact.url, '');
  return lines.join('\n');
}

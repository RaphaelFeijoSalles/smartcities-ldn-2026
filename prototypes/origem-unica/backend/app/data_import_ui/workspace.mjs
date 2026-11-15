const byId = (id) => document.getElementById(id)
const form = byId('import-form')
const controls = byId('upload-controls')
const feedback = byId('feedback')
const nature = byId('nature')
const analysis = byId('analysis')
const reviewButton = byId('review')
const download = byId('download')
const pageSize = 25
const maxDecisions = 256
const fields = {
  street_registry: { codlog: 'Código do logradouro', name: 'Nome', locality: 'Localidade', law: 'Lei de denominação' },
  housing_status: { ibge_code: 'Código IBGE', municipality: 'Município', uf: 'UF', status: 'Situação declarada' },
}
const classifications = {
  synthetic: 'Sintética',
  unverified: 'Não verificada',
  official_claimed: 'Oficial declarada · verificação oficial indisponível',
}
const metrics = {
  match: 'Correspondências exatas',
  conflict: 'Divergências de valor',
  incomplete: 'Pares com valores ausentes',
  only_left: 'Somente na fonte A',
  only_right: 'Somente na fonte B',
  ambiguous: 'Identificadores duplicados',
  missing_key: 'Linhas sem identificador',
  invalid_key: 'Linhas com identificador inválido',
}
const rules = {
  INCOMPLETE_KEY: 'Identificadores ausentes',
  DUPLICATE_KEY: 'Identificadores duplicados',
  MISSING_CELLS: 'Células vazias',
  HEADER_COLLISION: 'Cabeçalhos equivalentes',
  INVALID_IBGE_CODE_FORMAT: 'Código IBGE fora do formato',
  MISSING_IDENTITY: 'Identificador ausente',
  INVALID_IDENTITY_FORMAT: 'Identificador fora do formato',
  DUPLICATE_IDENTITY_NO_PAIRING: 'Identificador duplicado, sem pareamento',
  UNPAIRED_IDENTITY: 'Identificador presente em uma única fonte',
  EXACT_VALUE_DIFFERENCE: 'Valores diferentes no mesmo identificador',
  MISSING_COMPARISON_VALUE: 'Valor ausente para comparação',
  SOURCE_QUALITY_ISSUES: 'Ocorrências no perfil da fonte',
}
const resolutions = {
  ACKNOWLEDGED_DIFFERENCE: 'Registrar ciência da ocorrência',
  REQUEST_SOURCE_CHECK: 'Solicitar conferência na fonte',
  DEFERRED: 'Deixar para revisão posterior',
}
const errors = {
  ambiguous_column_mapping_requires_explicit_choice: 'Há mais de um cabeçalho possível. Abra a opção de indicar cabeçalhos na fonte e informe os nomes exatos das colunas.',
  invalid_column_mapping: 'Confira se o cabeçalho informado existe no arquivo e está escrito exatamente como aparece na tabela.',
  mapping_reuses_column: 'Use uma coluna diferente para cada campo mapeado.',
  required_identity_column_missing: 'A coluna de identificação é obrigatória. Informe o cabeçalho correspondente.',
  synthetic_and_non_synthetic_must_not_be_compared: 'Use duas fontes sintéticas ou duas fontes públicas não sintéticas na mesma comparação.',
  no_common_comparison_fields: 'Mapeie pelo menos um campo compartilhado além do identificador.',
  invalid_source_url: 'Use uma URL HTTPS de referência sem credenciais ou fragmento.',
  stale_or_different_report: 'Os arquivos ou o relatório mudaram. Compare as fontes novamente antes de revisar.',
  local_import_quota: 'A área local atingiu o limite de processamento. Aguarde alguns segundos e tente novamente.',
  local_import_upload_timeout: 'O envio do arquivo demorou demais. Tente novamente.',
  request_size_limit: 'O tamanho total da solicitação excedeu o limite.',
  file_size_limit: 'O arquivo excedeu o limite de 1 MiB.',
  invalid_csv_encoding: 'Salve o CSV com codificação UTF-8.',
  invalid_xls_or_resource_limit: 'Confira se o XLS tem uma única planilha e está dentro dos limites informados.',
  personal_or_sensitive_columns_not_supported: 'A tabela possui um cabeçalho associado a dados pessoais.',
}
let report
let comparison
let receipt
let page = 0
let busy = false
const decisions = new Map()

function element(tag, value) {
  const node = document.createElement(tag)
  if (value !== undefined) node.textContent = value
  return node
}

const sources = ['A', 'B'].map((letter) => {
  const source = byId('source-template').content.firstElementChild.cloneNode(true)
  source.querySelector('legend').textContent = `Fonte ${letter}`
  byId('sources').append(source)
  return source
})

function renderMapping() {
  for (const source of sources) {
    const entries = Object.entries(fields[nature.value]).map(([field, title]) => {
      const label = element('label', title)
      const input = element('input')
      input.dataset.field = field
      input.maxLength = 2048
      label.append(input)
      return label
    })
    source.querySelector('[data-mapping]').replaceChildren(...entries)
  }
}
renderMapping()

function clearReceipt() {
  receipt = undefined
  byId('receipt').textContent = ''
  download.hidden = true
}

function clearReport() {
  if (analysis.hidden) return
  report = comparison = undefined
  decisions.clear()
  clearReceipt()
  analysis.hidden = true
  byId('queue').replaceChildren()
  byId('provenance').replaceChildren()
  byId('metrics').replaceChildren()
  feedback.textContent = 'Fontes ou critérios alterados. Gere um novo relatório para continuar.'
}

form.addEventListener('input', clearReport)
form.addEventListener('change', clearReport)
nature.addEventListener('change', renderMapping)

function checkedSource(source) {
  const inputs = Object.fromEntries([...source.querySelectorAll('[data-input]')].map((node) => [node.dataset.input, node]))
  const { file, ...metadata } = inputs
  const selected = file.files[0]
  if (!selected || selected.size === 0 || selected.size > 1_048_576 ||
      !/\.(csv|xls)$/i.test(selected.name) || selected.name.length > 128) {
    file.setCustomValidity('Selecione um CSV ou XLS de até 1 MiB com nome de até 128 caracteres.')
    file.reportValidity()
    file.setCustomValidity('')
    return null
  }
  for (const input of Object.values(metadata)) {
    if (input.value.trim()) {
      if (!input.reportValidity()) return null
      continue
    }
    input.setCustomValidity('Preencha este campo para gerar o relatório.')
    input.reportValidity()
    input.setCustomValidity('')
    return null
  }
  const provenance = Object.fromEntries(Object.entries(metadata).map(([key, node]) => [key, node.value.trim()]))
  provenance.nature = nature.value
  provenance.namespace = byId('namespace').value.trim()
  const mapping = Object.fromEntries([...source.querySelectorAll('[data-field]')]
    .filter((node) => node.value !== '').map((node) => [node.dataset.field, node.value]))
  return { selected, provenance, mapping }
}

async function encodeSource({ selected, provenance, mapping }) {
  const bytes = new Uint8Array(await selected.arrayBuffer())
  const chunks = []
  for (let start = 0; start < bytes.length; start += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(start, start + 8192)))
  }
  return { filename: selected.name, content_base64: btoa(chunks.join('')), provenance, mapping }
}

async function post(operation, data) {
  const response = await fetch(`/api/data-import/${operation}`, {
    method: 'POST', credentials: 'same-origin', redirect: 'error',
    headers: { 'Content-Type': 'application/json', 'X-Public-Data': 'confirmed' },
    body: JSON.stringify(data),
  })
  const payload = await response.json()
  if (!response.ok) {
    const label = errors[payload.detail]
    const detail = typeof payload.detail === 'string' && /^[a-z0-9_]+$/.test(payload.detail) ? ` · ${payload.detail}` : ''
    throw new Error(label || `A solicitação foi recusada (HTTP ${response.status}${detail}). Confira os arquivos e tente novamente.`)
  }
  return payload
}

function definitions(list, entries) {
  list.replaceChildren(...entries.flatMap(([key, value]) => [element('dt', key), element('dd', value)]))
}

function provenanceCard(source, index) {
  const metadata = source.provenance
  const card = element('article')
  const list = element('dl')
  const mapping = Object.entries(source.field_mapping).map(([key, header]) => `${fields[metadata.nature][key]} → ${header}`)
  const diagnostics = source.review_queue.map((item) => `${rules[item.rule] || item.rule} (${item.count})`)
  definitions(list, [
    ['Proveniência', classifications[metadata.classification]],
    ['Referência', metadata.reference_date],
    ['Versão', metadata.version],
    ['URL declarada', metadata.url],
    ['Formato', metadata.format.toUpperCase()],
    ['Linhas e colunas', `${source.profile.row_count} linhas · ${source.profile.column_count} colunas`],
    ['Colunas adotadas', mapping.join(' · ')],
    ['Qualidade do perfil', source.quality_status],
    ['Ocorrências', diagnostics.join(' · ') || 'Nenhuma'],
  ])
  const identifiers = element('dl')
  definitions(identifiers, [
    ['SHA-256 do arquivo', metadata.sha256],
    ['ID do perfil', source.report_id],
  ])
  const details = element('details')
  details.append(element('summary', 'Identificadores da fonte'), identifiers)
  card.append(element('h3', `Fonte ${index === 0 ? 'A' : 'B'} · ${metadata.name}`), list, details)
  return card
}

function updateReviewButton() {
  reviewButton.disabled = busy || decisions.size === 0
}

function renderQueue() {
  const items = report.review_queue
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const cards = items.slice(page * pageSize, (page + 1) * pageSize).map((item) => {
    const card = element('article')
    card.append(element('h4', rules[item.rule] || item.rule))
    if (item.count !== undefined) card.append(element('p', `Ocorrências: ${item.count}`))
    for (const [key, source] of [['left_rows', 'A'], ['right_rows', 'B']]) {
      if (item[key]?.length) card.append(element('p', `Fonte ${source} · linhas ${item[key].join(', ')}`))
    }
    if (item.side) card.append(element('p', `Fonte ${item.side === 'left' ? 'A' : 'B'} · perfil ${item.source_report_id}`))
    const presentFields = (keys) => keys.map((key) => fields[nature.value][key] || key).join(', ')
    if (item.fields?.length) card.append(element('p', `Campos: ${presentFields(item.fields)}`))
    if (item.missing_fields?.length) card.append(element('p', `Campos vazios: ${presentFields(item.missing_fields)}`))
    if (comparison) {
      const label = element('label', 'Decisão de revisão')
      const select = element('select')
      select.add(new Option('Sem decisão', ''))
      for (const [key, value] of Object.entries(resolutions)) select.add(new Option(value, key))
      select.value = decisions.get(item.item_id) || ''
      select.addEventListener('change', () => {
        if (select.value && !decisions.has(item.item_id) && decisions.size >= maxDecisions) {
          select.value = ''
          feedback.textContent = 'O recibo aceita até 256 decisões. Desmarque um item para incluir outro.'
          return
        }
        if (select.value) decisions.set(item.item_id, select.value)
        else decisions.delete(item.item_id)
        clearReceipt()
        updateReviewButton()
        feedback.textContent = `${decisions.size} decisões selecionadas.`
      })
      label.append(select)
      card.append(label)
    }
    return card
  })
  byId('queue').replaceChildren(...(cards.length ? cards : [element('p', 'Nenhuma ocorrência para revisar.')]))
  byId('pager').hidden = pages === 1
  byId('page-label').textContent = `Página ${page + 1} de ${pages}`
  byId('previous').disabled = page === 0
  byId('next').disabled = page + 1 >= pages
}

function showReport() {
  const columns = report.compared_fields?.map((field) => fields[nature.value][field] || field)
  byId('quality').textContent = `Qualidade: ${report.quality_status} · Validade oficial: desconhecida · Nenhum dado alterado.`
  byId('provenance').replaceChildren(...(report.sources || [report]).map(provenanceCard))
  const results = report.metrics ? Object.entries(metrics).map(([key, label]) => [label, report.metrics[key]]) : []
  if (columns) results.push(['Campos comparados', columns.join(', ')])
  results.push(['ID do relatório', report.report_id])
  definitions(byId('metrics'), results)
  byId('review-note').textContent = comparison
    ? 'As linhas incluem o cabeçalho e excluem linhas vazias. As decisões são declaradas, sem identidade verificada, e ficam disponíveis somente para exportação.'
    : 'O perfil agrega ocorrências por arquivo. Compare duas fontes para registrar decisões.'
  page = 0
  renderQueue()
  reviewButton.hidden = !comparison || report.review_queue.length === 0
  updateReviewButton()
  analysis.hidden = false
  byId('report-heading').focus()
}

for (const [id, offset] of [['previous', -1], ['next', 1]]) {
  byId(id).addEventListener('click', () => {
    page += offset
    renderQueue()
    if (byId(id).disabled) byId(offset === 1 ? 'previous' : 'next').focus()
  })
}

async function run(message, task) {
  if (busy) return
  busy = true
  controls.disabled = true
  analysis.inert = true
  updateReviewButton()
  feedback.textContent = message
  try {
    await task()
    return true
  } catch (error) {
    feedback.textContent = error instanceof TypeError || error instanceof SyntaxError
      ? 'Não foi possível comunicar com a API local. Confirme se o servidor está ativo e tente novamente.'
      : error.message
  } finally {
    busy = false
    controls.disabled = false
    analysis.inert = false
    updateReviewButton()
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (![byId('namespace'), byId('public-data')].every((input) => input.reportValidity())) return
  const operation = event.submitter?.value || 'profile'
  const sourceA = checkedSource(sources[0])
  if (!sourceA) return
  const sourceB = operation === 'compare' ? checkedSource(sources[1]) : null
  if (operation === 'compare' && !sourceB) return
  const complete = await run('Processando os arquivos na API local…', async () => {
    const left = await encodeSource(sourceA)
    const pair = sourceB ? { left, right: await encodeSource(sourceB) } : undefined
    const result = await post(operation, pair || { document: left })
    comparison = pair
    report = result
    decisions.clear()
    clearReceipt()
    feedback.textContent = 'Relatório concluído.'
  })
  if (complete) showReport()
})

reviewButton.addEventListener('click', async () => {
  if (!comparison || !decisions.size) return
  const complete = await run('Gerando o recibo na API local…', async () => {
    const result = await post('review', {
      ...comparison, report_id: report.report_id,
      decisions: [...decisions].map(([item_id, resolution]) => ({ item_id, resolution })),
    })
    receipt = result.review_receipt
    const summary = result.review_summary
    byId('receipt').textContent = `Recibo ${receipt.receipt_id} · ${summary.acknowledged} com ciência · ${summary.pending} pendentes.`
    download.hidden = false
    feedback.textContent = 'Recibo concluído. Exporte o JSON para guardá-lo.'
  })
  if (complete) download.focus()
})

download.addEventListener('click', () => {
  if (!receipt) return
  const anchor = element('a')
  const url = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2) + '\n'], { type: 'application/json' }))
  anchor.href = url
  anchor.download = `origem-unica-revisao-${receipt.receipt_id}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})

/* Smoke against a running, loopback-only FastAPI workspace. All inputs are fictitious. */
import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const modulePath = process.env.UX_PLAYWRIGHT
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright')
const origin = 'http://127.0.0.1:8011'
const screenshots = resolve(process.env.IMPORT_SCREENSHOTS || '/tmp/origem-unica-data-import')
const browser = await chromium.launch({ executablePath: process.env.IMPORT_CHROMIUM })
await mkdir(screenshots, { recursive: true })

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 375, height: 812 }]) {
    const page = await browser.newPage({ viewport })
    const consoleErrors = []
    const requests = []
    page.on('pageerror', (error) => consoleErrors.push(error.message))
    page.on('console', (entry) => {
      if (entry.type() === 'error' && !entry.text().includes('422')) consoleErrors.push(entry.text())
    })
    page.on('request', (request) => requests.push(request))
    await page.goto(origin + '/data-import')
    await page.getByLabel('Escopo do identificador').fill('qa:codlog')
    const fixtureRows = Array.from({ length: 26 }, (_, index) => {
      const name = `Rua Fictícia ${index}`
      return `${100 + index},${name},${name}\n`
    }).join('')
    const fixtures = [
      ['A', 'codlog,nome,logradouro\n01,Rua Alfa,Rua Alfa\n02,Rua Gama,Rua Gama\n' + fixtureRows],
      ['B', 'codlog,nome\n01,Rua Beta\n02,Rua Gama\n'],
    ]
    for (const [letter, csv] of fixtures) {
      const source = page.getByRole('group', { name: 'Fonte ' + letter })
      await source.getByLabel('Arquivo CSV ou XLS').setInputFiles({
        name: `fixture-${letter}.csv`, mimeType: 'text/csv', buffer: Buffer.from(csv),
      })
      await source.getByLabel('Nome da fonte').fill('Fonte sintética ' + letter)
      await source.getByLabel('URL de referência').fill('https://example.invalid/' + letter)
      await source.getByLabel('Data de referência').fill('2026-01-01')
      await source.getByLabel('Versão').fill('qa')
      await source.getByLabel('Classificação declarada').selectOption('synthetic')
    }
    const feedback = page.locator('#feedback')
    const profile = page.getByRole('button', { name: 'Gerar perfil da fonte A' })
    await profile.click()
    assert.equal(requests.filter((request) => request.method() === 'POST').length, 0)
    await page.getByRole('checkbox', { name: /Confirmo que os arquivos/ }).check()
    const ambiguous = page.waitForResponse(origin + '/api/data-import/profile')
    await profile.click()
    assert.equal((await ambiguous).status(), 422)
    await feedback.getByText(/Há mais de um cabeçalho possível/).waitFor()
    const sourceA = page.getByRole('group', { name: 'Fonte A' })
    await sourceA.getByText('Indicar cabeçalhos explicitamente').click()
    await sourceA.getByLabel('Nome', { exact: true }).fill('logradouro')
    const profileResponse = page.waitForResponse(origin + '/api/data-import/profile')
    await profile.focus()
    await page.keyboard.press('Enter')
    const response = await profileResponse
    assert.equal(response.status(), 200)
    assert.equal((await response.json()).field_mapping.name, 'logradouro')
    await page.locator('#quality').getByText(/Qualidade: PASS/).waitFor()
    const heading = page.getByRole('heading', { name: 'Relatório de conferência' })
    assert.equal(await page.evaluate(() => document.activeElement.id), 'report-heading')
    await page.getByText('28 linhas · 3 colunas').waitFor()

    const compared = page.waitForResponse(origin + '/api/data-import/compare')
    await page.getByRole('button', { name: 'Comparar fontes' }).click()
    const result = await compared
    assert.equal(result.status(), 200)
    const report = await result.json()
    assert.equal(report.metrics.conflict, 1)
    assert.equal(report.metrics.match, 1)
    assert.equal(report.metrics.only_left, 26)
    assert.equal(report.official_validity, 'UNKNOWN')
    await page.locator('#quality').getByText(/Qualidade: FAIL.*Validade oficial: desconhecida/).waitFor()
    await page.getByText('Fonte A · linhas 2', { exact: true }).waitFor()
    await page.getByText('Fonte B · linhas 2', { exact: true }).waitFor()
    assert.equal(await page.locator('#provenance dd').getByText('Sintética', { exact: true }).count(), 2)
    const decision = page.getByRole('combobox', { name: 'Decisão de revisão' }).first()
    await decision.selectOption('ACKNOWLEDGED_DIFFERENCE')
    await page.getByRole('button', { name: 'Próxima página' }).click()
    await page.getByText('Página 2 de 2').waitFor()
    await page.getByRole('button', { name: 'Página anterior' }).click()
    assert.equal(await decision.inputValue(), 'ACKNOWLEDGED_DIFFERENCE')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await heading.evaluate((node) => node.scrollIntoView({ block: 'start' }))
    await page.screenshot({ path: resolve(screenshots, `comparacao-${viewport.width}.jpg`), quality: 82 })

    const reviewed = page.waitForResponse(origin + '/api/data-import/review')
    await page.getByRole('button', { name: 'Gerar recibo de revisão' }).click()
    const review = await reviewed
    assert.equal(review.status(), 200)
    const reviewBody = await review.json()
    assert.equal(reviewBody.review_summary.acknowledged, 1)
    assert.equal(reviewBody.review_summary.pending, 26)
    assert.equal(reviewBody.quality_status, report.quality_status)
    assert.equal(reviewBody.writes_performed, false)
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Exportar recibo JSON' }).click()
    const saved = await download
    assert.deepEqual(JSON.parse(await readFile(await saved.path(), 'utf8')), reviewBody.review_receipt)
    assert.equal(reviewBody.review_receipt.report_id, report.report_id)
    assert.equal(reviewBody.review_receipt.actor_identity_verified, false)
    assert.equal(reviewBody.review_receipt.persistence, 'NONE_EXPORT_ONLY')
    await page.getByLabel('Escopo do identificador').fill('qa:outro')
    assert.equal(await page.locator('#analysis').isHidden(), true)
    assert.equal(await page.getByRole('button', { name: 'Exportar recibo JSON' }).isHidden(), true)
    for (const request of requests) {
      assert.ok(request.url().startsWith(origin + '/'), request.url())
      assert.equal((await request.allHeaders()).authorization, undefined)
    }
    assert.deepEqual(consoleErrors, [])
    await page.close()
    console.log(`PASS ${viewport.width}×${viewport.height} · HTTP 422, 200, 200, 200 · recibo ${reviewBody.review_receipt.receipt_id}`)
  }
} finally {
  await browser.close()
}

/* Offline browser contract/smoke for the IA panel. All API responses are intercepted.
 * AI_PLAYWRIGHT=/path/to/playwright-core/index.mjs node tests/origem-unica/analysis-browser.mjs
 * Fixtures intentionally include synthetic MCMV rows, never evidence of a real download/live call.
 */
import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const {chromium} = await import(process.env.AI_PLAYWRIGHT ? pathToFileURL(process.env.AI_PLAYWRIGHT).href : 'playwright');
const output = resolve(process.env.AI_SCREENSHOTS || '/tmp/origem-unica-ai-smoke');
await mkdir(output, {recursive:true});
const fixture = JSON.parse(await readFile(resolve(repo, 'tests/origem-unica/analysis-synthetic.fixture.json')));
const snhis = JSON.parse(await readFile(resolve(repo, 'prototypes/origem-unica/backend/HABITACAO_CONTRACT.json')));
const mcmv = {mode:'SNAPSHOT', nivel_verificacao:'OFFICIAL_SNAPSHOT',
  fonte:{url:'https://www.gov.br/cidades/SINTETICO-teste.zip', downloaded_at:'2026-11-15T03:00:00Z'},
  items:Array.from({length:42}, (_,i) => ({codigo_municipio_fonte:'411370', cod_operacao:`SINTETICO-${i}`,
    txt_nome_empreendimento:`SINTÉTICO: linha ${i+1}`, data_referencia:'2026-06-30', qtd_uh:null}))};
const origin = 'http://127.0.0.1:4173';
const mime = {'.html':'text/html', '.mjs':'text/javascript', '.js':'text/javascript', '.css':'text/css'};
const browser = await chromium.launch({executablePath:process.env.AI_CHROMIUM || '/usr/bin/google-chrome',
  args:JSON.parse(process.env.AI_CHROMIUM_ARGS || '[]')});
try {
  for (const [width,height] of [[1440,900],[1366,768],[768,1024],[375,812],[320,720]]) {
    const page = await browser.newPage({viewport:{width,height},acceptDownloads:true});
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    page.setDefaultTimeout(5000);
    let mode='DEMO', failure=0, requests=0;
    await page.route('**/*',async route => {
      const request = route.request();
      const url = new URL(request.url());
      const headers = {'access-control-allow-origin':origin, 'access-control-allow-headers':'Authorization'};
      if (url.pathname.endsWith('/analise')) {
        if (request.method() === 'OPTIONS') return route.fulfill({status:204,headers});
        requests++;
        assert.equal(request.method(),'POST');
        assert.equal(request.postData(),null);
        assert.ok(!request.headers().authorization || request.headers().authorization === 'Bearer synthetic-browser-access');
        if (failure) return route.fulfill({status:failure,json:{detail:'synthetic-secret-upstream'},headers});
        return route.fulfill({json:{...fixture,mode},headers});
      }
      if (url.pathname.endsWith('/municipios/4113700')) return route.fulfill({json:snhis,headers});
      if (url.pathname.endsWith('/empreendimentos')) return route.fulfill({json:mcmv,headers});
      if (url.origin === origin) {
        const file=resolve(repo,'.'+url.pathname);
        if (!file.startsWith(repo)) return route.abort();
        const contentType=mime[extname(file)];
        if (contentType) return route.fulfill({body:await readFile(file),contentType});
      }
      // Fonts and every other external request stay offline.
      return route.fulfill({status:204,body:''});
    });
    await page.goto(origin+'/tools/origem-unica/index.html');
    await page.locator('#analysis-panel').waitFor({state:'visible'});
    await page.evaluate(() => {
      const banner=document.createElement('p');
      banner.textContent='QA LOCAL · MCMV SINTÉTICO · AI INTERCEPTADA · SEM CHAMADA AO PROVEDOR';
      banner.style.cssText='background:#fff6e4;color:#543900;padding:12px;font-weight:bold';
      document.querySelector('#analysis-panel').prepend(banner);
    });
    const kpis=async () => Promise.all(['status-value','requirements-count','enterprise-count'].map(id=>page.locator('#'+id).innerText()));
    assert.deepEqual(await kpis(),['CONFIRMADO','3 / 3','42']);
    const button=page.getByRole('button',{name:'Analisar evidências',exact:true});
    await button.click();
    await page.getByRole('heading',{name:'Demonstração determinística · sem chamada de IA',exact:true}).waitFor();
    assert.equal(await page.locator('#analysis-result ol > li').count(),6);
    assert.match(await page.locator('#analysis-result').innerText(),/20\/10\/2026/);
    assert.match(await page.locator('#analysis-result').innerText(),/30\/06\/2026/);
    assert.deepEqual(await kpis(),['CONFIRMADO','3 / 3','42']);
    const download=page.waitForEvent('download');
    const exportButton=page.getByRole('button',{name:'Baixar relatório de conferência (.txt)',exact:true});
    await exportButton.focus();
    await page.keyboard.press('Enter');
    const file=await download;
    const report=await readFile(await file.path(),'utf8');
    assert.match(report,/sem chamada de IA/);
    assert.match(report,/MCMV: 42/);
    assert.match(report,/2026-06-30/);
    assert.doesNotMatch(report,/synthetic-browser-access|synthetic-secret-upstream/);
    await page.locator('#analysis-panel').screenshot({path:resolve(output,`demo-${width}.png`)});
    mode='AI';
    await page.locator('#analysis-access').fill('synthetic-browser-access');
    await button.click();
    await page.getByRole('heading',{name:'Assistência automatizada por IA',exact:true}).waitFor();
    assert.equal(await page.locator('#analysis-access').inputValue(),'');
    for (const status of [401,429,502,503,504]) {
      failure=status;
      const previous=requests;
      await button.click();
      await page.waitForFunction(() => !document.querySelector('#analysis-form button').disabled);
      assert.equal(requests,previous+1);
      assert.equal(await page.locator('#analysis-result').isVisible(),false);
      assert.doesNotMatch(await page.locator('#analysis-status').innerText(),/synthetic-secret-upstream/);
      assert.deepEqual(await kpis(),['CONFIRMADO','3 / 3','42']);
    }
    await page.locator('#situation').selectOption('PENDENTE');
    assert.equal(await page.locator('#status-value').innerText(),'CONFIRMADO');
    await page.getByRole('button',{name:'Limpar filtros'}).click();
    await page.locator('#demo-toggle').click();
    assert.equal(await page.locator('#analysis-panel').isVisible(),false);
    await page.locator('#demo-toggle').click();
    assert.equal(await page.locator('#analysis-panel').isVisible(),true);
    const overflow=await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth+1);
    assert.equal(overflow,false,`horizontal overflow at ${width}`);
    assert.deepEqual(errors,[]);
    console.log(`PASS ${width}x${height}: DEMO, AI interceptada, relatório, 5 falhas, panorama, filtros e cenário sintético`);
    await page.close();
  }
} finally {await browser.close();}

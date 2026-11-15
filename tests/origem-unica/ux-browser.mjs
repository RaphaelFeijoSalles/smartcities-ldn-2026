/* Optional desktop/mobile smoke. Supply Playwright from a local dev installation. */
import assert from "node:assert/strict";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const repo=fileURLToPath(new URL("../../",import.meta.url));
const suite=process.env.UX_SUITE||"habitacao";
const root=resolve(process.env.UX_ROOT||repo);
const screenshots=resolve(process.env.UX_SCREENSHOTS||"/tmp/origem-unica-ux");
const modulePath=process.env.UX_PLAYWRIGHT;
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:"playwright");
const origin="http://127.0.0.1:4173";
const api="https://origem-unica-api.onrender.com";
const mime={".html":"text/html",".mjs":"text/javascript",".js":"text/javascript",".css":"text/css"};
const json=async path=>JSON.parse(await readFile(path,"utf8"));
const crossOrigin={"access-control-allow-origin":origin};
await mkdir(screenshots,{recursive:true});

const run={
  async habitacao(page){
    const [snhis,mcmv]=await Promise.all([json(process.env.UX_SNHIS),json(process.env.UX_MCMV)]);
    let fail=false;
    await page.route(api+"/api/habitacao/municipios/4113700",r=>r.fulfill({json:snhis,headers:crossOrigin}));
    await page.route(api+"/api/habitacao/empreendimentos?municipio=411370",r=>r.fulfill({status:fail?503:200,json:fail?{}:mcmv,headers:crossOrigin}));
    await page.goto(origin+"/tools/origem-unica/index.html");
    await page.locator("#sync-pill").getByText("Snapshot oficial").waitFor();
    assert.deepEqual(await Promise.all(["status-value","requirements-count","enterprise-count"]
      .map(id=>page.locator("#"+id).innerText())),["CONFIRMADO","3 / 3","42"]);
    const nav=page.getByRole("navigation",{name:"Casos de uso"});
    assert.equal(await nav.getByRole("link").count(),3);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),"Pular para o conteúdo");
    await page.keyboard.press("Enter");
    await page.locator("#situation").selectOption("PENDENTE");
    assert.match(await page.locator("#filter-feedback").innerText(),/Nenhum resultado/);
    assert.equal(await page.locator("#status-value").innerText(),"CONFIRMADO");
    await page.getByRole("button",{name:"Limpar filtros"}).click();
    assert.equal(await page.locator("#enterprise-rows tr").count(),10);
    await page.getByRole("button",{name:"Mostrar todos os registros"}).click();
    assert.equal(await page.locator("#enterprise-rows tr").count(),42);
    await page.locator("#export").focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(()=>document.activeElement.id),"enterprise-table-wrap");
    assert.equal(await page.locator("#enterprise-table-wrap").evaluate(element=>getComputedStyle(element).outlineStyle),"solid");
    await capture(page,".summary-grid");
    fail=true;
    await page.reload();
    await page.locator("#sync-pill").getByText("Parcialmente disponível").waitFor();
    assert.equal(await page.locator("#status-value").innerText(),"CONFIRMADO");
    assert.equal(await page.locator("#enterprise-count").innerText(),"—");
  },
  async saude(page){
    const fixture=await json(resolve(repo,"tests/origem-unica/records-contract.fixture.json"));
    const data=structuredClone(fixture);
    data.items[0].name="UBS São João Exemplo";
    let request=0;
    await page.route(api+"/api/records",route=>{
      request+=1;
      if(request===3)return route.fulfill({status:503,json:{},headers:crossOrigin});
      if(request===4)data.items[0].sources[0].address="Rua das Flores, 170";
      for(const item of data.items)for(const source of item.sources)source.fetched_at="2026-11-14T00:00:0"+request+"Z";
      return route.fulfill({json:data,headers:crossOrigin});
    });
    await page.goto(origin+"/tools/origem-unica/saude.html");
    await page.locator("#sync-status").getByText(/API sincronizada/).waitFor();
    await page.getByRole("button",{name:/^Conciliação/}).filter({visible:true}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),"main");
    const search=page.getByRole("searchbox",{name:"Pesquisar registros"});
    await search.fill("sao joao");
    assert.match(await page.locator("#list-count").innerText(),/^1 /);
    const record=page.locator("#records button");
    await record.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(()=>document.activeElement.id),"details");
    const action=page.getByRole("combobox",{name:"Escolha uma ação de revisão (simulada)"});
    assert.ok(await page.getByRole("button",{name:/Registrar decisão/}).isDisabled());
    await action.selectOption("PREVIEW_A");
    await page.getByRole("button",{name:/Registrar decisão/}).click();
    assert.match(await page.locator("#details").innerText(),/Decisão registrada/);
    await capture(page,"#details");
    const exportDownload=page.waitForEvent("download");
    await page.locator("#export").click();
    const contents=await readFile(await (await exportDownload).path(),"utf8");
    assert.equal(contents.trim().split(/\r?\n/).length,2);
    assert.match(contents,/UBS São João Exemplo/);
    await search.fill("nenhuma correspondência");
    assert.match(await page.locator("#details").innerText(),/Nenhum registro disponível/);
    assert.ok(await page.locator("#export").isDisabled());
    await page.getByRole("button",{name:"Limpar filtros"}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),"search");

    const navigate=async name=>page.getByRole("button",{name}).filter({visible:true}).click();
    await navigate(/^Fontes/);
    await page.locator("#sync").click();
    await page.locator("#sync-status").getByText(/API sincronizada/).waitFor();
    await page.locator("#sync").click();
    await page.locator("#sync-status").getByText(/Mantendo dados da API/).waitFor();
    assert.match(await page.locator("#data-mode").innerText(),/API · MOCK/);
    await navigate(/^Conciliação/);
    await search.fill("sao joao");
    assert.match(await page.locator("#details").innerText(),/Decisão registrada/);
    await navigate(/^Fontes/);
    await page.locator("#sync").click();
    await page.locator("#sync-status").getByText(/API sincronizada/).waitFor();
    await navigate(/^Conciliação/);
    assert.match(await page.locator("#details").innerText(),/Rua das Flores, 170/);
    assert.doesNotMatch(await page.locator("#details").innerText(),/Decisão registrada/);
    assert.equal(request,4);
    // Synthetic transport simulation: exercises the LIVE label, not a live source.
    data.mode="LIVE";
    await navigate(/^Fontes/);
    await page.locator("#sync").click();
    await page.locator("#data-mode").getByText(/API · LIVE/).waitFor();
    data.mode="MOCK";
    await page.locator("#sync").click();
    await page.locator("#data-mode").getByText(/API · MOCK/).waitFor();
  },
  async logradouros(page){
    await page.goto(origin+"/tools/origem-unica/logradouros.html");
    assert.match(await page.getByRole("navigation",{name:"Casos de uso"}).innerText(),/Saúde × CNES/);
    await page.getByRole("searchbox",{name:"Pesquisar nome ou código"}).fill("102 sao");
    assert.equal(await page.locator("#records tr").count(),2);
    assert.match(await page.locator("#matches h3").innerText(),/CODLOG 102/);
    assert.match(await page.locator("#street-status").innerText(),/1 com pendências/);
    await capture(page,"#logradouro-main section");
    const pending=page.waitForEvent("download");
    await page.getByRole("button",{name:"Exportar pendências em CSV"}).click();
    const contents=await readFile(await (await pending).path(),"utf8");
    assert.equal(contents.trim().split(/\r?\n/).length,2);
    assert.match(contents,/Secretaria \(MOCK\)/);
    assert.doesNotMatch(contents,/"A1"/);
    await page.getByRole("searchbox",{name:"Pesquisar nome ou código"}).fill("inexistente");
    assert.match(await page.locator("#street-status").innerText(),/Nenhum registro/);
    assert.ok(await page.locator("#export").isDisabled());
    await page.getByRole("button",{name:"Limpar filtros"}).click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),"query");
    assert.equal(await page.locator("#records tr").count(),8);
  }
};

async function capture(page,selector){
  const width=page.viewportSize().width;
  await page.locator(selector).first().screenshot({path:resolve(screenshots,suite+"-"+width+".png"),animations:"disabled"});
}

for(const [width,height] of [[1366,768],[375,812],[320,720]]){
  const browser=await chromium.launch({
    executablePath:process.env.UX_CHROMIUM,
    args:JSON.parse(process.env.UX_CHROMIUM_ARGS||"[]"),
  });
  try {
    const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,acceptDownloads:true});
    page.setDefaultTimeout(8000);
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.route(origin+"/tools/origem-unica/**",async route=>{
      const file=new URL(route.request().url()).pathname;
      const contentType=mime[extname(file)];
      if(!contentType)return route.fulfill({status:204});
      await route.fulfill({body:await readFile(resolve(root,"."+file)),contentType});
    });
    await page.route("https://fonts.googleapis.com/**",route=>route.fulfill({body:"",contentType:"text/css"}));
    await run[suite](page);
    const viewport=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth,document.documentElement.clientWidth]);
    assert.equal(viewport[0],width);
    assert.ok(viewport[1]<=viewport[2]+1,"Overflow horizontal: "+viewport);
    assert.deepEqual(errors,[]);
    console.log("PASS",suite,width,height,JSON.stringify(viewport));
  } finally {
    await browser.close();
  }
}

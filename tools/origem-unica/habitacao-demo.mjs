/* Entirely fictional municipality and housing records for a local product walkthrough. */
export const HOUSING_DEMO={
  mode:"MOCK",generated_at:null,
  municipalities:[{
    ibge_code:"DEMO-001",name:"Município Exemplo · SINTÉTICO",uf:null,
    snhis:{status:"PENDENTE",source_name:"Cenário sintético local",data_origin:"MOCK: situação inventada para demonstrar fluxo",freshness:"UNVERIFIED"},
    requirements:{
      fundo:{status:"CONFIRMADO",source_name:"Cenário sintético local",data_origin:"MOCK: documento fictício",freshness:"UPDATED",note:"Exemplo sem documento real"},
      conselho:{status:"PENDENTE",source_name:"Cenário sintético local",data_origin:"MOCK: pendência fictícia",freshness:"STALE",note:"Exemplo sem consulta oficial"},
      plhis:{status:"NÃO VERIFICADO",source_name:"Cenário sintético local",data_origin:"MOCK: informação não simulada",freshness:"UNVERIFIED"}
    },
    enterprises:[{id:"DEMO-MCMV-01",name:"Residencial Exemplo · SINTÉTICO",units:42,status:"Exemplo de acompanhamento",source_name:"Cenário sintético MCMV",data_origin:"MOCK: empreendimento e 42 unidades inventados",freshness:"UNVERIFIED"}]
  }]
};

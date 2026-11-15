import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateGroups, selectStreets, streetsCsv} from './logradouros-model.mjs';

const street = (id, attributes = {}) => ({id, name:'Avenida São João', type:'AV', locality:'LONDRINA',
  source:'SIGLON (MOCK)', codlog:'102', law:'Lei 100/2001', scenario:'naming', ...attributes});

test('busca tolera acentos, abreviações e ordem dos termos', () => {
  const rows=[street('A1'),street('A2',{name:'Rua das Flores',type:'RUA',scenario:'missing'})];
  assert.deepEqual(selectStreets(rows,'naming','102 av. sao').map(row=>row.id),['A1']);
  assert.deepEqual(selectStreets(rows,'missing','São'),[]);
  assert.deepEqual(selectStreets(rows,'all','inexistente'),[]);
});

test('CODLOG prevalece e nome ambíguo não junta códigos diferentes', () => {
  const sameCode=[street('A1'),street('A2',{name:'Rua com outra grafia',source:'Secretaria (MOCK)'})];
  assert.deepEqual(candidateGroups(sameCode)[0][1].map(row=>row.id),['A1','A2']);
  assert.deepEqual(candidateGroups([street('A1'),street('A2')]),[]);
  assert.deepEqual(candidateGroups([street('A1'),street('A2',{codlog:'203'}),
    street('A3',{codlog:null})]),[]);
  assert.deepEqual(candidateGroups([street('A1'),street('A2',{codlog:null,source:'Secretaria (MOCK)'})])[0][1].map(row=>row.id),['A1','A2']);
  assert.deepEqual(candidateGroups([street('A1',{codlog:null,type:'RUA'}),street('A2',{codlog:null})]),[]);
});

test('CSV preserva origem MOCK e inclui apenas pendências da seleção', () => {
  const selected=selectStreets([street('ok'),street('exportar',{law:null}),street('fora',{law:null,scenario:'missing'})],
    'naming','sao');
  const csv=streetsCsv(selected);
  assert.match(csv,/exportar.*SIGLON \(MOCK\).*LEI_NAO_INFORMADA/);
  assert.doesNotMatch(csv,/"ok"|"fora"/);
});

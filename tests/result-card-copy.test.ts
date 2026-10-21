import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resultCardAddress,resultCardCopy} from '../src/lib/result-card-copy';
test('losses and retirement deficits receive neutral copy rather than humor',()=>{
 for(const id of ['investment','retirement'])assert.match(resultCardCopy(id,'required',{}, {metrics:[{label:'Projected surplus / shortfall',value:-100}]}).tagline,/consider your next step/);
 assert.match(resultCardCopy('marriage-tax','compare',{}, {metrics:[]}).tagline,/clarity/);
 assert.match(resultCardCopy('percentage','percent',{}, {metrics:[]}).tagline,/heavy lifting/);
});
test('card address strips all inputs and labels local previews',()=>{
 const x=resultCardAddress('http://localhost:3000/loan-calculator.html?principal=999#calc=private');assert.equal(x.url,'http://localhost:3000/loan-calculator.html');assert.match(x.label,/LOCAL PREVIEW/);
 const y=resultCardAddress('https://example.org/loan-calculator.html#private');assert.equal(y.url,'https://example.org/loan-calculator.html');assert.match(y.label,/example.org/);
});
test('multiple IRR explanation stays explicit and unknown models get no invented explanation',()=>{
 assert.match(resultCardCopy('irr','irr',{}, {metrics:[{label:'IRR 1',value:10},{label:'IRR 2',value:20}]}).interpretation!,/multiple/);
 assert.equal(resultCardCopy('unknown','unknown',{}, {metrics:[]}).interpretation,null);
});

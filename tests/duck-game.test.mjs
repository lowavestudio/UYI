import test from 'node:test'
import assert from 'node:assert/strict'
import {createRound,advanceRound,shoot,ROUND_SECONDS} from '../src/utils/duckGame.ts'
const running=()=>({...createRound(),status:'playing'})
test('A complete round finishes after 30 seconds and cannot accept late shots',()=>{let r=running();for(let i=0;i<301;i++)r=advanceRound(r,.1,()=>.5);assert.equal(r.status,'finished');assert.equal(r.remaining,0);assert.deepEqual(r.ducks,[]);assert.deepEqual(shoot(r,1),r);assert.equal(ROUND_SECONDS,30)})
test('Pausing freezes both ducks and the clock; resuming preserves the score',()=>{let r=advanceRound(running(),1,()=>.4);r=shoot(r,r.ducks[0].id);r={...r,status:'paused'};assert.deepEqual(advanceRound(r,20),r);const resumed=advanceRound({...r,status:'playing'},1,()=>.4);assert.equal(resumed.hits,1);assert.equal(resumed.remaining,r.remaining-1)})
test('Each duck can score once; misses count as shots',()=>{let r=advanceRound(running(),.5,()=>.5);const id=r.ducks[0].id;r=shoot(r,id);assert.equal(r.hits,1);assert.equal(r.shots,1);r=shoot(r,id);assert.equal(r.hits,1);assert.equal(r.shots,2);r=shoot(r,null);assert.equal(r.hits,1);assert.equal(r.shots,3)})
test('A long round never produces more than three live targets or invalid coordinates',()=>{let r=running();for(let i=0;i<900;i++){r=advanceRound(r,1/30,()=>.5);assert.ok(r.ducks.length<=3);for(const d of r.ducks){assert.ok(Number.isFinite(d.x)&&Number.isFinite(d.y));assert.ok(d.y>=18&&d.y<=61)}}})
test('New rounds clear previous results and start with the full timer',()=>{const a=createRound(),b=createRound();assert.notEqual(a,b);assert.equal(b.shots,0);assert.equal(b.hits,0);assert.equal(b.remaining,30);assert.equal(b.status,'ready')})

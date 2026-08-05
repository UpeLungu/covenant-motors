import assert from "node:assert/strict";

const accounts=[
 {id:"cash",type:"Cash",openingBalance:1000},
 {id:"bank",type:"Bank",openingBalance:5000},
 {id:"mobile",type:"Mobile Money",openingBalance:200},
];
const entries=[];
const post=(accountId,type,amount)=>{const incoming=["Customer Payment","Capital","Other Income"].includes(type);entries.push({accountId,moneyIn:incoming?amount:0,moneyOut:incoming?0:amount})};
const balance=id=>accounts.find(a=>a.id===id).openingBalance+entries.filter(e=>e.accountId===id).reduce((s,e)=>s+e.moneyIn-e.moneyOut,0);

post("cash","Customer Payment",3000);
assert.equal(balance("cash"),4000);
assert.equal(balance("bank"),5000);
assert.equal(balance("mobile"),200);

post("bank","Supplier Payment",1200);
assert.equal(balance("bank"),3800);
assert.equal(balance("cash"),4000);

post("mobile","General Expense",50);
assert.equal(balance("mobile"),150);
assert.equal(balance("cash"),4000);
assert.equal(balance("bank"),3800);

const sale={sellingPriceZmw:10000,amountPaidZmw:2500,balanceZmw:7500};
const payment=3000;
sale.amountPaidZmw=Math.min(sale.sellingPriceZmw,sale.amountPaidZmw+payment);
sale.balanceZmw=Math.max(0,sale.sellingPriceZmw-sale.amountPaidZmw);
assert.equal(sale.amountPaidZmw,5500);
assert.equal(sale.balanceZmw,4500);

console.log("Finance posting regression passed");
console.log({cash:balance("cash"),bank:balance("bank"),mobile:balance("mobile"),customerBalance:sale.balanceZmw});

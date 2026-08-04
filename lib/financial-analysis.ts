import type {Vehicle} from "./types";
import type {VehicleExpense} from "./ledger-store";
import type {Sale} from "./sales-store";
import {CurrencyTotals,emptyCurrencyTotals,normalizeCurrency} from "./currency";

export function vehicleCostTotals(vehicle:Vehicle,expenses:VehicleExpense[]):CurrencyTotals{
 const totals=emptyCurrencyTotals();
 const purchaseCurrency=normalizeCurrency(vehicle.purchaseCurrency);
 const purchaseAmount=Number(vehicle.originalPurchasePrice??vehicle.purchasePrice??0);
 totals[purchaseCurrency]+=purchaseAmount;
 expenses.filter(x=>x.vehicleId===vehicle.id).forEach(x=>{totals[normalizeCurrency(x.currency)]+=Number(x.amount||0)});
 return totals;
}

export function stockValueTotals(vehicles:Vehicle[],expenses:VehicleExpense[]):CurrencyTotals{
 return vehicles.filter(v=>v.status!=="Sold").reduce((all,v)=>{
  const cost=vehicleCostTotals(v,expenses);
  all.ZMW+=cost.ZMW;all.USD+=cost.USD;return all;
 },emptyCurrencyTotals());
}

export function saleProfitAnalysis(sale:Sale,vehicle:Vehicle|undefined,expenses:VehicleExpense[]){
 const currency=normalizeCurrency(sale.currency);
 if(!vehicle)return {currency,profit:0,mixed:true,cost:0};
 const costs=vehicleCostTotals(vehicle,expenses);
 const otherCurrency=currency==="ZMW"?"USD":"ZMW";
 const mixed=costs[otherCurrency]!==0;
 const cost=costs[currency];
 return {currency,profit:mixed?0:Number(sale.sellingPrice||0)-cost,mixed,cost};
}

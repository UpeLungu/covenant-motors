import type {Vehicle} from "./types";
import type {VehicleExpense} from "./ledger-store";
import type {Sale} from "./sales-store";
import {CurrencyTotals,emptyCurrencyTotals,toZmw} from "./currency";

export function vehicleCostZmw(vehicle:Vehicle,expenses:VehicleExpense[]):number{
 const purchase=Number(vehicle.purchasePriceZmw??toZmw(Number(vehicle.originalPurchasePrice??vehicle.purchasePrice??0),vehicle.purchaseCurrency||"ZMW",vehicle.purchaseExchangeRate));
 const localExpenses=expenses.filter(x=>x.vehicleId===vehicle.id).reduce((sum,x)=>sum+Number(x.amount||0),0);
 return purchase+localExpenses;
}

export function vehicleCostTotals(vehicle:Vehicle,expenses:VehicleExpense[]):CurrencyTotals{
 return {ZMW:vehicleCostZmw(vehicle,expenses),USD:0};
}

export function stockCostTotals(vehicles:Vehicle[],expenses:VehicleExpense[]):CurrencyTotals{
 return {ZMW:vehicles.filter(v=>v.status!=="Sold").reduce((sum,v)=>sum+vehicleCostZmw(v,expenses),0),USD:0};
}

export function estimatedStockValueTotals(vehicles:Vehicle[]):CurrencyTotals{
 const ZMW=vehicles.filter(v=>v.status!=="Sold").reduce((sum,v)=>sum+toZmw(Number(v.estimatedSellingPrice||0),v.estimatedSellingCurrency||"ZMW",v.estimatedSellingExchangeRate),0);
 return {ZMW,USD:0};
}

export function saleProfitAnalysis(sale:Sale,vehicle:Vehicle|undefined,expenses:VehicleExpense[]){
 const costs=vehicle?vehicleCostZmw(vehicle,expenses):0;
 const revenue=Number(sale.sellingPriceZmw??toZmw(Number(sale.originalSellingPrice??sale.sellingPrice||0),sale.currency||"ZMW",sale.exchangeRate));
 return {currency:"ZMW" as const,profit:revenue-costs,mixed:false,cost:costs,costs:{ZMW:costs,USD:0},revenue};
}

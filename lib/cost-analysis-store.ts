"use client";
import type {Currency} from "./currency";

export type VehicleCostAnalysis={
 vehicleId:string;
 currency?:Currency;
 allocatedOverheads:number;
 salesCommission:number;
 financeCharges:number;
 taxCost:number;
 otherIndirectCosts:number;
 notes:string;
 updatedAt:string;
};

const KEY="cm_vehicle_cost_analysis_v1";

export function loadCostAnalyses():VehicleCostAnalysis[]{
 if(typeof window==="undefined")return[];
 const raw=localStorage.getItem(KEY);
 if(!raw)return[];
 try{return JSON.parse(raw)}catch{return[]}
}

export function saveCostAnalyses(items:VehicleCostAnalysis[]){
 localStorage.setItem(KEY,JSON.stringify(items));
}

export function totalIndirectCost(x?:VehicleCostAnalysis){
 return x?Number(x.allocatedOverheads||0)+Number(x.salesCommission||0)+Number(x.financeCharges||0)+Number(x.taxCost||0)+Number(x.otherIndirectCosts||0):0;
}

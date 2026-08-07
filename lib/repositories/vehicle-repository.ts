"use client";
import type {Vehicle} from "@/lib/types";
import {loadVehicles,saveVehicles,nextStockId} from "@/lib/vehicle-store";
import {getSupabaseBrowserClient,isSupabaseConfigured} from "@/lib/supabase/client";

const BUSINESS_ID="covenant-motors";

type VehicleRow={
 id:string;stock_id:string;vin:string;engine_number:string;registration_number:string|null;make:string;model:string;manufacture_year:number;colour:string|null;supplier_name:string;cost_price:number|string;total_cost:number|string;estimated_selling_price:number|string;current_location:string;status:Vehicle["status"];purchase_date:string;created_at:string;
};

const toVehicle=(r:VehicleRow):Vehicle=>({
 id:r.id,stockId:r.stock_id,vin:r.vin,engineNumber:r.engine_number,registrationNumber:r.registration_number||"",make:r.make,model:r.model,year:Number(r.manufacture_year),colour:r.colour||"",purchasePrice:Number(r.cost_price||0),purchaseCurrency:"ZMW",originalPurchasePrice:Number(r.cost_price||0),purchaseExchangeRate:1,purchasePriceZmw:Number(r.cost_price||0),totalCost:Number(r.total_cost||r.cost_price||0),estimatedSellingPrice:Number(r.estimated_selling_price||0),estimatedSellingCurrency:"ZMW",estimatedSellingExchangeRate:1,estimatedSellingPriceZmw:Number(r.estimated_selling_price||0),currentLocation:r.current_location,status:r.status,supplier:r.supplier_name,purchaseDate:r.purchase_date,createdAt:r.created_at
});

const toRow=(v:Vehicle)=>({
 id:v.id,business_id:BUSINESS_ID,stock_id:v.stockId,vin:v.vin,engine_number:v.engineNumber,registration_number:v.registrationNumber||null,make:v.make,model:v.model,manufacture_year:v.year,colour:v.colour||null,supplier_name:v.supplier,cost_price:Number(v.purchasePriceZmw??v.purchasePrice??0),total_cost:Number(v.totalCost??v.purchasePriceZmw??v.purchasePrice??0),estimated_selling_price:Number(v.estimatedSellingPriceZmw??v.estimatedSellingPrice??0),current_location:v.currentLocation,status:v.status,purchase_date:v.purchaseDate
});

function mirror(items:Vehicle[]){if(typeof window!=="undefined")saveVehicles(items);return items}

export async function listVehicles():Promise<Vehicle[]>{
 const fallback=loadVehicles();
 if(!isSupabaseConfigured()) return fallback;
 const client=getSupabaseBrowserClient();if(!client)return fallback;
 const {data,error}=await client.from("vehicles").select("id,stock_id,vin,engine_number,registration_number,make,model,manufacture_year,colour,supplier_name,cost_price,total_cost,estimated_selling_price,current_location,status,purchase_date,created_at").eq("business_id",BUSINESS_ID).order("created_at",{ascending:false});
 if(error||!data)return fallback;
 return mirror((data as VehicleRow[]).map(toVehicle));
}

export async function getVehicle(id:string):Promise<Vehicle|null>{
 const local=loadVehicles().find(v=>v.id===id)||null;
 if(!isSupabaseConfigured())return local;
 const client=getSupabaseBrowserClient();if(!client)return local;
 const {data,error}=await client.from("vehicles").select("id,stock_id,vin,engine_number,registration_number,make,model,manufacture_year,colour,supplier_name,cost_price,total_cost,estimated_selling_price,current_location,status,purchase_date,created_at").eq("business_id",BUSINESS_ID).eq("id",id).maybeSingle();
 if(error||!data)return local;
 const vehicle=toVehicle(data as VehicleRow);const next=[vehicle,...loadVehicles().filter(v=>v.id!==id)];mirror(next);return vehicle;
}

export async function createVehicle(vehicle:Vehicle):Promise<Vehicle>{
 const current=loadVehicles();
 if(isSupabaseConfigured()){
  const client=getSupabaseBrowserClient();
  if(client){const {data,error}=await client.from("vehicles").insert(toRow(vehicle)).select("id,stock_id,vin,engine_number,registration_number,make,model,manufacture_year,colour,supplier_name,cost_price,total_cost,estimated_selling_price,current_location,status,purchase_date,created_at").single();if(!error&&data){const saved=toVehicle(data as VehicleRow);mirror([saved,...current.filter(v=>v.id!==saved.id)]);return saved}}
 }
 mirror([vehicle,...current.filter(v=>v.id!==vehicle.id)]);return vehicle;
}

export async function updateVehicle(vehicle:Vehicle):Promise<Vehicle>{
 const current=loadVehicles();
 if(isSupabaseConfigured()){
  const client=getSupabaseBrowserClient();
  if(client){const row=toRow(vehicle);const {id,...changes}=row;const {data,error}=await client.from("vehicles").update(changes).eq("business_id",BUSINESS_ID).eq("id",id).select("id,stock_id,vin,engine_number,registration_number,make,model,manufacture_year,colour,supplier_name,cost_price,total_cost,estimated_selling_price,current_location,status,purchase_date,created_at").single();if(!error&&data){const saved=toVehicle(data as VehicleRow);mirror(current.map(v=>v.id===saved.id?saved:v));return saved}}
 }
 mirror(current.map(v=>v.id===vehicle.id?vehicle:v));return vehicle;
}

export async function allocateStockId():Promise<string>{
 const local=loadVehicles();
 if(!isSupabaseConfigured())return nextStockId(local);
 const client=getSupabaseBrowserClient();if(!client)return nextStockId(local);
 const {data,error}=await client.rpc("next_business_reference",{p_business_id:BUSINESS_ID,p_entity:"vehicle"});
 return !error&&typeof data==="string"?data:nextStockId(local);
}

export async function vinExists(vin:string,excludeId?:string){const items=await listVehicles();return items.some(v=>v.id!==excludeId&&v.vin.toUpperCase()===vin.toUpperCase())}

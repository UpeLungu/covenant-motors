import assert from "node:assert/strict";

const toZmw = (amount, currency, rate = 1) =>
  currency === "USD" ? amount * rate : amount;

const analyseVehicle = ({
  purchaseAmount,
  purchaseCurrency,
  purchaseRate = 1,
  expensesZmw,
  saleAmount,
  saleCurrency,
  saleRate = 1,
  paidAmount,
}) => {
  const purchaseCostZmw = toZmw(purchaseAmount, purchaseCurrency, purchaseRate);
  const landedCostZmw = purchaseCostZmw + expensesZmw;
  const saleRevenueZmw = toZmw(saleAmount, saleCurrency, saleRate);
  const paidZmw = toZmw(paidAmount, saleCurrency, saleRate);
  const balanceZmw = Math.max(0, saleRevenueZmw - paidZmw);
  const grossProfitZmw = saleRevenueZmw - landedCostZmw;

  return {
    purchaseCostZmw,
    landedCostZmw,
    saleRevenueZmw,
    paidZmw,
    balanceZmw,
    grossProfitZmw,
  };
};

const zmwVehicle = analyseVehicle({
  purchaseAmount: 200_000,
  purchaseCurrency: "ZMW",
  expensesZmw: 25_000,
  saleAmount: 300_000,
  saleCurrency: "ZMW",
  paidAmount: 220_000,
});

assert.deepEqual(zmwVehicle, {
  purchaseCostZmw: 200_000,
  landedCostZmw: 225_000,
  saleRevenueZmw: 300_000,
  paidZmw: 220_000,
  balanceZmw: 80_000,
  grossProfitZmw: 75_000,
});

const usdVehicle = analyseVehicle({
  purchaseAmount: 8_000,
  purchaseCurrency: "USD",
  purchaseRate: 28,
  expensesZmw: 20_000,
  saleAmount: 11_000,
  saleCurrency: "USD",
  saleRate: 29,
  paidAmount: 8_000,
});

assert.deepEqual(usdVehicle, {
  purchaseCostZmw: 224_000,
  landedCostZmw: 244_000,
  saleRevenueZmw: 319_000,
  paidZmw: 232_000,
  balanceZmw: 87_000,
  grossProfitZmw: 75_000,
});

console.log("Accounting regression passed: ZMW and USD-to-ZMW scenarios are correct.");

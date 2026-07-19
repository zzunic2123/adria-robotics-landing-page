const test = require("node:test");
const assert = require("node:assert/strict");

require("../config/data-source.js");
require("../config/fallback-data.js");
const { normalizeWebData } = require("../js/data-service.js");
const { recommendRobotCount, calculateRoi } = require("../js/roi-calculator.js");

const data = normalizeWebData(global.AR_FALLBACK_DATA.sheets);

test("recommends robot counts from the public ROI thresholds", () => {
  assert.equal(recommendRobotCount(1000, data.roiConfig), 1);
  assert.equal(recommendRobotCount(1001, data.roiConfig), 2);
  assert.equal(recommendRobotCount(3000, data.roiConfig), 2);
  assert.equal(recommendRobotCount(5000, data.roiConfig), 2);
  assert.equal(recommendRobotCount(10000, data.roiConfig), 3);
  assert.equal(recommendRobotCount(10001, data.roiConfig), 3);
  assert.equal(recommendRobotCount(14001, data.roiConfig), 5);
});

test("calculates the default MIRA Standard rental scenario without intermediate rounding", () => {
  const financing = data.financing.find((row) => row.productId === "gausium-mira");
  const result = calculateRoi({
    area: 5000,
    workdaysPerMonth: 26,
    shiftsPerDay: 2,
    employeesPerShift: 2,
    shiftHours: 8,
    employeeCostPerHour: 7.939655172413793,
    robotWorkShare: 0.7,
    robotCount: 2,
    selectedMonthlyFinancingRate: financing.rentStandard[36],
    selectedFinancingIsLease: false,
    leaseDownPaymentPerRobot: financing.leaseDownPaymentEur,
    fteHoursPerMonth: 174,
  });
  assert.equal(result.monthlyLaborHours, 832);
  assert.equal(result.replacedMonthlyHours, 582.4);
  assert.equal(result.robotCount, 2);
  assert.equal(result.leaseDownPaymentTotal, 0);
  assert.equal(result.paybackMonths, 0);
  assert.ok(Math.abs(result.monthlyRobotCost - 1491.226185962308) < 1e-9);
  assert.ok(result.annualSavings > 0);
});

test("manual robot count and negative savings remain visible in the calculation", () => {
  const result = calculateRoi({
    area: 1000,
    workdaysPerMonth: 1,
    shiftsPerDay: 1,
    employeesPerShift: 1,
    shiftHours: 1,
    employeeCostPerHour: 1,
    robotWorkShare: 0.5,
    robotCount: 7,
    selectedMonthlyFinancingRate: 1000,
    selectedFinancingIsLease: true,
    leaseDownPaymentPerRobot: 500,
    fteHoursPerMonth: 174,
  });
  assert.equal(result.robotCount, 7);
  assert.equal(result.leaseDownPaymentTotal, 3500);
  assert.ok(result.annualSavings < 0);
  assert.ok(result.monthlySavings < 0);
  assert.ok(result.netBenefit48 < 0);
  assert.equal(result.paybackMonths, null);
});

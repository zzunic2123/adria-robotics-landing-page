(function createRoiCalculator(global) {
  "use strict";

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function configNumber(config, key, fallback) {
    const row = Array.isArray(config) ? config.find((item) => item.key === key) : null;
    return row?.numericValue === null || row?.numericValue === undefined
      ? fallback
      : finiteNumber(row.numericValue, fallback);
  }

  function recommendRobotCount(area, config) {
    const safeArea = Math.max(0, finiteNumber(area));
    if (safeArea <= 1000) return configNumber(config, "robots_up_to_1000", 1);
    if (safeArea <= 3000) return configNumber(config, "robots_up_to_3000", 2);
    if (safeArea <= 5000) return configNumber(config, "robots_up_to_5000", 2);
    if (safeArea <= 10000) return configNumber(config, "robots_up_to_10000", 3);
    const areaPerRobot = Math.max(1, configNumber(config, "m2_per_robot_above_10000", 3500));
    return Math.ceil(safeArea / areaPerRobot);
  }

  function calculateRoi(inputs) {
    const area = finiteNumber(inputs.area);
    const workdaysPerMonth = finiteNumber(inputs.workdaysPerMonth);
    const shiftsPerDay = finiteNumber(inputs.shiftsPerDay);
    const employeesPerShift = finiteNumber(inputs.employeesPerShift);
    const shiftHours = finiteNumber(inputs.shiftHours);
    const employeeCostPerHour = finiteNumber(inputs.employeeCostPerHour);
    const robotWorkShare = finiteNumber(inputs.robotWorkShare);
    const robotCount = finiteNumber(inputs.robotCount);
    const selectedMonthlyFinancingRate = finiteNumber(inputs.selectedMonthlyFinancingRate);
    const leaseDownPaymentPerRobot = finiteNumber(inputs.leaseDownPaymentPerRobot);
    const fteHoursPerMonth = Math.max(1, finiteNumber(inputs.fteHoursPerMonth, 174));

    const monthlyLaborHours =
      workdaysPerMonth * shiftsPerDay * employeesPerShift * shiftHours;
    const baselineAnnualLaborCost = monthlyLaborHours * employeeCostPerHour * 12;
    const replacedMonthlyHours = monthlyLaborHours * robotWorkShare;
    const remainingMonthlyHours = monthlyLaborHours - replacedMonthlyHours;
    const remainingAnnualLaborCost = remainingMonthlyHours * employeeCostPerHour * 12;
    const monthlyRobotCost = selectedMonthlyFinancingRate * robotCount;
    const annualRobotCost = monthlyRobotCost * 12;
    const leaseDownPaymentTotal = inputs.selectedFinancingIsLease
      ? leaseDownPaymentPerRobot * robotCount
      : 0;
    const newAnnualCost = remainingAnnualLaborCost + annualRobotCost;
    const annualSavings = baselineAnnualLaborCost - newAnnualCost;
    const monthlySavings = annualSavings / 12;
    const annualROI = annualRobotCost > 0 ? annualSavings / annualRobotCost : null;
    const paybackMonths =
      leaseDownPaymentTotal === 0
        ? 0
        : monthlySavings > 0
          ? leaseDownPaymentTotal / monthlySavings
          : null;
    const costReduction = baselineAnnualLaborCost > 0
      ? annualSavings / baselineAnnualLaborCost
      : null;
    const netBenefit24 = monthlySavings * 24 - leaseDownPaymentTotal;
    const netBenefit36 = monthlySavings * 36 - leaseDownPaymentTotal;
    const netBenefit48 = monthlySavings * 48 - leaseDownPaymentTotal;
    const savingsPerReplacedHour = replacedMonthlyHours > 0
      ? annualSavings / (replacedMonthlyHours * 12)
      : null;
    const annualSavingsPerM2 = area > 0 ? annualSavings / area : null;
    const replacedHoursPerYear = replacedMonthlyHours * 12;
    const freedFTE = replacedMonthlyHours / fteHoursPerMonth;

    return {
      monthlyLaborHours,
      baselineAnnualLaborCost,
      replacedMonthlyHours,
      remainingMonthlyHours,
      remainingAnnualLaborCost,
      robotCount,
      monthlyRobotCost,
      annualRobotCost,
      leaseDownPaymentTotal,
      newAnnualCost,
      annualSavings,
      monthlySavings,
      annualROI,
      paybackMonths,
      costReduction,
      netBenefit24,
      netBenefit36,
      netBenefit48,
      savingsPerReplacedHour,
      annualSavingsPerM2,
      replacedHoursPerYear,
      freedFTE,
    };
  }

  const api = { recommendRobotCount, calculateRoi };
  global.AR_ROI = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

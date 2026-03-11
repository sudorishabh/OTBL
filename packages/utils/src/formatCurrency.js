"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null)
        return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};
exports.default = formatCurrency;

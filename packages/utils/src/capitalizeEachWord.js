"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeEachWord = capitalizeEachWord;
function capitalizeEachWord(input) {
    if (!input)
        return input;
    const str = input
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    return str;
}

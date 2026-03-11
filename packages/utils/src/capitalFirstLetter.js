"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalFirstLetter = capitalFirstLetter;
function capitalFirstLetter(input) {
    if (!input)
        return input;
    const str = input.trim();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

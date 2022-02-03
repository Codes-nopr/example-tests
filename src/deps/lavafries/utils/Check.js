"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function check(whatTo, type, msg) {
    // eslint-disable-next-line valid-typeof
    if (typeof whatTo !== type)
        throw new TypeError(msg);
}
exports.default = check;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
class FriesRoutePlanner {
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = yield (0, undici_1.request)(`http${this.node.options.secure ? "s" : ""}://${this.node.options.host}:${this.node.options.port}/routeplanner/status`, {
                method: "POST",
                bodyTimeout: this.node.options.requestTimeout,
                headersTimeout: this.node.options.requestTimeout,
                headers: {
                    Authorization: this.node.options.password,
                    "content-type": "application/json",
                },
            });
            const json = yield body.json();
            return json.class ? json : undefined;
        });
    }
    freeAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const { statusCode } = yield (0, undici_1.request)(`http${this.node.options.secure ? "s" : ""}://${this.node.options.host}:${this.node.options.port}/routeplanner/status`, {
                method: "POST",
                bodyTimeout: this.node.options.requestTimeout,
                headersTimeout: this.node.options.requestTimeout,
                headers: {
                    Authorization: this.node.options.password,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    address,
                }),
            });
            return statusCode === 204;
        });
    }
    freeAllAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const { statusCode } = yield (0, undici_1.request)(`http${this.node.options.secure ? "s" : ""}://${this.node.options.host}:${this.node.options.port}/routeplanner/free/all`, {
                method: "POST",
                bodyTimeout: this.node.options.requestTimeout,
                headersTimeout: this.node.options.requestTimeout,
                headers: {
                    Authorization: this.node.options.password,
                    "content-type": "application/json",
                },
                body: undefined,
            });
            return statusCode === 204;
        });
    }
}
exports.default = FriesRoutePlanner;

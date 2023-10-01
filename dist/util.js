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
exports.parseToken = exports.extractRequest = exports.useKeycloak = void 0;
// Confusing and all, but I needed to extract this fn to avoid more repeating code
// TODO: Rework in 2.0
const useKeycloak = (request, jwt, singleTenant, multiTenant, opts) => __awaiter(void 0, void 0, void 0, function* () {
    if (opts.multiTenant && opts.multiTenant.realmResolver) {
        const resolvedRealm = opts.multiTenant.realmResolver(request);
        const realm = resolvedRealm instanceof Promise ? yield resolvedRealm : resolvedRealm;
        return yield multiTenant.get(realm);
    }
    else if (!opts.realm) {
        const payload = (0, exports.parseToken)(jwt);
        const issuerRealm = payload.iss.split("/").pop();
        return yield multiTenant.get(issuerRealm);
    }
    return singleTenant;
});
exports.useKeycloak = useKeycloak;
const extractRequest = (context) => {
    var _a, _b, _c;
    let request, response;
    // Check if request is coming from graphql or http
    if (context.getType() === "http") {
        // http request
        const httpContext = context.switchToHttp();
        request = httpContext.getRequest();
        response = httpContext.getResponse();
    }
    else if (context.getType() === "graphql") {
        let gql;
        // Check if graphql is installed
        try {
            gql = require("@nestjs/graphql");
        }
        catch (er) {
            throw new Error("@nestjs/graphql is not installed, cannot proceed");
        }
        // graphql request
        const gqlContext = gql.GqlExecutionContext.create(context).getContext();
        request = gqlContext.req;
        response = gqlContext.res;
    }
    else if (context.getType() === "ws") {
        const wsContext = context.switchToWs();
        const socket = wsContext.getClient();
        if (socket && socket.request) {
            // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
            const wsRequest = socket.request;
            wsRequest.headers = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.headers;
            wsRequest.query = (_b = socket.handshake) === null || _b === void 0 ? void 0 : _b.query;
            wsRequest.auth = (_c = socket.handshake) === null || _c === void 0 ? void 0 : _c.auth;
            request = wsRequest;
            response = {};
        }
        else {
            throw new Error(`The express compatible 'request' was not found. Are you using 'ws'? Only Socket.IO platform is supported as native 'ws' cannot send headers.`);
        }
    }
    return [request, response, context.getType()];
};
exports.extractRequest = extractRequest;
const parseToken = (token) => {
    const parts = token.split(".");
    return JSON.parse(Buffer.from(parts[1], "base64").toString());
};
exports.parseToken = parseToken;

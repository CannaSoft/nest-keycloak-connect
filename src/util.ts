import { ContextType, ExecutionContext } from "@nestjs/common";
import KeycloakConnect from "keycloak-connect";
import { KeycloakConnectConfig } from "./interface/keycloak-connect-options.interface";
import { KeycloakMultiTenantService } from "./services/keycloak-multitenant.service";

type GqlContextType = "graphql" | ContextType;

// Confusing and all, but I needed to extract this fn to avoid more repeating code
// TODO: Rework in 2.0
export const useKeycloak = async (
  request: any,
  jwt: string,
  singleTenant: KeycloakConnect.Keycloak,
  multiTenant: KeycloakMultiTenantService,
  opts: KeycloakConnectConfig
): Promise<KeycloakConnect.Keycloak> => {
  if (opts.multiTenant && opts.multiTenant.realmResolver) {
    const resolvedRealm = opts.multiTenant.realmResolver(request);
    const realm =
      resolvedRealm instanceof Promise ? await resolvedRealm : resolvedRealm;
    return await multiTenant.get(realm);
  } else if (!opts.realm) {
    const payload = parseToken(jwt);
    const issuerRealm = payload.iss.split("/").pop();
    return await multiTenant.get(issuerRealm);
  }
  return singleTenant;
};

export const extractRequest = (
  context: ExecutionContext,
  jwtMapping: Map<string, string>
): [any, any, string] => {
  let request: any, response: any;

  // Check if request is coming from graphql or http
  if (context.getType() === "http") {
    // http request
    const httpContext = context.switchToHttp();

    request = httpContext.getRequest();
    response = httpContext.getResponse();
  } else if (context.getType<GqlContextType>() === "graphql") {
    let gql: any;
    // Check if graphql is installed
    try {
      gql = require("@nestjs/graphql");
    } catch (er) {
      throw new Error("@nestjs/graphql is not installed, cannot proceed");
    }

    // graphql request
    const gqlContext = gql.GqlExecutionContext.create(context).getContext();

    request = gqlContext.req;
    response = gqlContext.res;
  } else if (context.getType() === "ws") {
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient();

    if (socket && socket.request) {
      // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
      const wsRequest = socket.request;
      wsRequest.headers = socket.handshake?.headers;
      wsRequest.query = socket.handshake?.query;
      wsRequest.auth = socket.handshake?.auth;
      wsRequest.accessTokenJWT = jwtMapping.get(socket.id);

      request = wsRequest;
      response = {};
    } else {
      throw new Error(
        `The express compatible 'request' was not found. Are you using 'ws'? Only Socket.IO platform is supported as native 'ws' cannot send headers.`
      );
    }
  }

  return [request, response, context.getType()];
};

export const parseToken = (token: string): any => {
  const parts = token.split(".");
  return JSON.parse(Buffer.from(parts[1], "base64").toString());
};

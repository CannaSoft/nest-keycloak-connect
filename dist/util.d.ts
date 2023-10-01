import { ExecutionContext } from "@nestjs/common";
import KeycloakConnect from "keycloak-connect";
import { KeycloakConnectConfig } from "./interface/keycloak-connect-options.interface";
import { KeycloakMultiTenantService } from "./services/keycloak-multitenant.service";
export declare const useKeycloak: (request: any, jwt: string, singleTenant: KeycloakConnect.Keycloak, multiTenant: KeycloakMultiTenantService, opts: KeycloakConnectConfig) => Promise<KeycloakConnect.Keycloak>;
export declare const extractRequest: (context: ExecutionContext, jwtMapping: Map<string, string>) => [any, any, string];
export declare const parseToken: (token: string) => any;

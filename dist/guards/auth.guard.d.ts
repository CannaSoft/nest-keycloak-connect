import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KeycloakConnectConfig } from '../interface/keycloak-connect-options.interface';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';
/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
export declare class AuthGuard implements CanActivate {
    private readonly jwtTokenMap;
    private singleTenant;
    private keycloakOpts;
    private logger;
    private multiTenant;
    private readonly reflector;
    constructor(jwtTokenMap: Map<string, string>, singleTenant: KeycloakConnect.Keycloak, keycloakOpts: KeycloakConnectConfig, logger: Logger, multiTenant: KeycloakMultiTenantService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private throwUnauthorized;
    private validateToken;
    private extractJWTFromData;
    private extractJwtSocketIOAuth;
    private extractJwt;
    private extractJwtFromCookie;
}

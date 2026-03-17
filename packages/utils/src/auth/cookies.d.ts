import { Response, CookieOptions } from "express";
type CookiePayloadType = {
    res: Response;
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    node_env: string;
};
export declare const getRefreshTokenCookieOptions: (node_env: string, expiresIn: string) => CookieOptions;
export declare const getAccessTokenCookieOptions: (node_env: string, expiresIn: string) => CookieOptions;
export declare const setAuthenticationCookies: ({ res, accessToken, refreshToken, accessExpiresIn, refreshExpiresIn, node_env, }: CookiePayloadType) => Response;
export declare const clearAuthenticationCookies: (res: Response) => Response;
export {};

export interface AuthenticatedUserDto {
    sub: string;
    email: string;
    accessToken: string;
    // // Campos adicionales del payload JWT de Auth0
    // aud?: string[];
    // azp?: string;
    // exp?: number;
    // iat?: number;
    // iss?: string;
    // scope?: string;
    // sub?: string;
    // // Cualquier otro campo que Auth0 pueda incluir
    // [key: string]: any;
}

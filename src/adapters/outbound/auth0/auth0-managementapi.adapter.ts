import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { get } from 'http';

export interface Auth0UserMetadata {
    [key: string]: any;
}

export interface Auth0ManagementTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

@Injectable()
export class Auth0ManagementApiAdapter {
    private managementToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor(private readonly http: HttpService) { }

    private async getManagementToken(): Promise<string> {
        // Check if we have a valid token
        if (this.managementToken && Date.now() < this.tokenExpiresAt) {
            return this.managementToken;
        }

        try {
            const response: AxiosResponse<Auth0ManagementTokenResponse> = await firstValueFrom(
                this.http.post<Auth0ManagementTokenResponse>(
                    `${process.env.AUTH0_DOMAIN}/oauth/token`,
                    {
                        client_id: process.env.AUTH0_M2M_CLIENT_ID,
                        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
                        audience: process.env.AUTH0_AUDIENCE,
                        grant_type: 'client_credentials',
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            this.managementToken = response.data.access_token;
            // Set expiration time with a 5-minute buffer
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

            return this.managementToken;
        } catch (e) {
            throw new HttpException('Cannot obtain Management API token', 502);
        }
    }

    async updateUserMetadata(userId: string, metadata: Auth0UserMetadata): Promise<Auth0UserMetadata> {
        try {
            const token = await this.getManagementToken();

            await firstValueFrom(
                this.http.patch(
                    `${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
                    {
                        user_metadata: metadata,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );
            return this.getUserMetadata(userId);
        } catch (e) {
            throw new HttpException('Cannot update user metadata', 502);
        }
    }

    async getUserMetadata(userId: string): Promise<Auth0UserMetadata> {
        try {
            const token = await this.getManagementToken();

            const response: AxiosResponse<{ user_metadata: Auth0UserMetadata }> = await firstValueFrom(
                this.http.get(
                    `${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            fields: 'user_metadata',
                        },
                    },
                ),
            );

            return response.data.user_metadata || {};
        } catch (e) {
            throw new HttpException('Cannot fetch user metadata', 502);
        }
    }
}

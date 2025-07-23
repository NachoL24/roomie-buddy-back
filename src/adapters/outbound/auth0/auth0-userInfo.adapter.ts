import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface Auth0Profile {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
}

@Injectable()
export class Auth0UserinfoAdapter {
    constructor(private readonly http: HttpService) { }

    async fetchProfile(accessToken: string): Promise<Auth0Profile> {
        try {
            const response: AxiosResponse<Auth0Profile> = await firstValueFrom(
                this.http.get<Auth0Profile>(
                    `${process.env.AUTH0_DOMAIN}/userinfo`,
                    { headers: { Authorization: `Bearer ${accessToken}` } },
                ),
            );
            return response.data;
        } catch (e) {
            throw new HttpException('Cannot fetch user profile', 502);
        }
    }
}
import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Auth0ManagementApiAdapter } from './auth0-managementapi.adapter';

@Global()
@Module({
    imports: [HttpModule],
    providers: [Auth0ManagementApiAdapter],
    exports: [Auth0ManagementApiAdapter],
})
export class Auth0ManagementApiModule { }

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Auth0ManagementApiAdapter } from "../../infrastructure/external-services/auth0/auth0-managementapi.adapter";

@Injectable()
export class ProfileCompletedGuard implements CanActivate {
    constructor(private readonly auth0ManagementApiAdapter: Auth0ManagementApiAdapter) { }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user || !user.sub) {
            return false;
        }

        try {
            // Consultar los metadatos directamente desde Auth0
            const metadata = await this.auth0ManagementApiAdapter.getUserMetadata(user.sub);
            const profileComplete = metadata.profile_complete === true;

            // Permitir acceso a rutas de onboarding si el perfil no está completo
            const isOnboardingRoute = req.route?.path === '/user' ||
                req.route?.path === '/complete-profile' ||
                req.route?.path === '/user-metadata';

            if (profileComplete) {
                return true;
            }

            return isOnboardingRoute;
        } catch (error) {
            // En caso de error al consultar Auth0, permitir acceso a rutas de onboarding
            console.error('Error checking profile completion:', error);
            const isOnboardingRoute = req.route?.path === '/user' ||
                req.route?.path === '/complete-profile' ||
                req.route?.path === '/user-metadata';
            return isOnboardingRoute;
        }
    }
}
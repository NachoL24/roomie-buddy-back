import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { User } from "../decorators/user.decorator";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";
import { SettlementUseCase } from "src/application/use-cases/settlement/settlement.use_case";
import { SettlementCreateRequestDto } from "../dtos/settlement/settlement-create.request.dto";
import { SettlementResponseDto } from "../dtos/settlement/settlement.response.dto";
import { HouseBalanceSummaryResponseDto } from "../dtos/settlement/balance-summary.response.dto";

@Controller('settlements')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class SettlementController {

    constructor(private readonly settlementUseCase: SettlementUseCase) { }

    /**
     * Registrar un pago entre roomies
     * POST /settlements
     */
    @Post()
    async createSettlement(
        @Body() createSettlementDto: SettlementCreateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<SettlementResponseDto> {
        return await this.settlementUseCase.createSettlement(createSettlementDto, user.sub);
    }

    /**
     * Obtener todos los settlements de una casa
     * GET /settlements/house/:houseId
     */
    @Get('house/:houseId')
    async getSettlementsByHouseId(@Param('houseId') houseId: number): Promise<SettlementResponseDto[]> {
        return await this.settlementUseCase.getSettlementsByHouseId(houseId);
    }

    /**
     * Obtener resumen de balances pendientes para un usuario en una casa
     * GET /settlements/balance/:houseId
     */
    @Get('balance/:houseId')
    async getBalanceSummary(
        @Param('houseId') houseId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<HouseBalanceSummaryResponseDto> {
        return await this.settlementUseCase.getBalanceSummary(user.sub, houseId);
    }
}

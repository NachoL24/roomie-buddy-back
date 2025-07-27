import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { User } from "../decorators/user.decorator";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";
import { HouseUseCase } from "src/application/use-cases/house/user/house.use_case";
import { HouseResponseDto } from "../dtos/house/house.response.dto";
import { HouseWithMembersResponseDto } from "../dtos/house/house-with-members.response.dto";
import { HouseCreateDto } from "../dtos/house/house_create.request.dto";
import { UpdatePayRatiosRequestDto } from "../dtos/house/update-pay-ratios.request.dto";
import { UpdatePayRatiosResponseDto } from "../dtos/house/update-pay-ratios.response.dto";

@Controller('houses')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class HouseController {

    constructor(private readonly houseUseCase: HouseUseCase) { }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<HouseWithMembersResponseDto> {
        return await this.houseUseCase.getHouseById(id);
    }

    @Get('roomie/:roomieId')
    async getHousesByRoomieId(@Param('roomieId') roomieId: number): Promise<HouseResponseDto[]> {
        return await this.houseUseCase.getHousesByRoomieId(roomieId);
    }

    @Post()
    create(@Body() createHouseDto: HouseCreateDto) {
        return this.houseUseCase.createHouse(createHouseDto);
    }

    /**
     * Actualizar payRatios de los miembros de una casa
     * PUT /houses/{houseId}/pay-ratios
     */
    @Put(':houseId/pay-ratios')
    async updatePayRatios(
        @Param('houseId') houseId: number,
        @Body() updatePayRatiosDto: UpdatePayRatiosRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<UpdatePayRatiosResponseDto> {
        return await this.houseUseCase.updatePayRatios(houseId, updatePayRatiosDto, user.sub);
    }

    // @Put(':id')
    // update(@Param('id') id: string, @Body() updateHouseDto: UpdateHouseDto) {
    //     // Logic to update a house
    // }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.houseUseCase.removeHouse(id);
    }
}
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { HouseUseCase } from "src/application/use-cases/house/user/house.use_case";
import { HouseResponseDto } from "../dtos/house/house.response.dto";
import { HouseCreateDto } from "../dtos/house/house_create.request.dto";

@Controller('houses')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class HouseController {

    constructor(private readonly houseUseCase: HouseUseCase) { }

    @Get(':id')
    async findOne(@Param('id') id: number) {
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

    // @Put(':id')
    // update(@Param('id') id: string, @Body() updateHouseDto: UpdateHouseDto) {
    //     // Logic to update a house
    // }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.houseUseCase.removeHouse(id);
    }
}
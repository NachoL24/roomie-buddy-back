import { RoomieHouse } from "src/domain/entities/roomie-house.entity";

export class UpdatePayRatiosResponseDto {
    public readonly success: boolean;
    public readonly message: string;
    public readonly updatedMembers: PayRatioMemberInfo[];

    constructor(success: boolean, message: string, updatedMembers: PayRatioMemberInfo[]) {
        this.success = success;
        this.message = message;
        this.updatedMembers = updatedMembers;
    }

    static create(roomieHouses: RoomieHouse[]): UpdatePayRatiosResponseDto {
        const memberInfo = roomieHouses.map(rh => new PayRatioMemberInfo(
            rh.roomieId,
            rh.houseId,
            rh.payRatio || 0
        ));

        return new UpdatePayRatiosResponseDto(
            true,
            `PayRatios updated successfully for ${roomieHouses.length} members`,
            memberInfo
        );
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            updatedMembers: this.updatedMembers.map(member => member.toJSON())
        };
    }
}

export class PayRatioMemberInfo {
    public readonly roomieId: number;
    public readonly houseId: number;
    public readonly payRatio: number;

    constructor(roomieId: number, houseId: number, payRatio: number) {
        this.roomieId = roomieId;
        this.houseId = houseId;
        this.payRatio = payRatio;
    }

    toJSON() {
        return {
            roomieId: this.roomieId,
            houseId: this.houseId,
            payRatio: this.payRatio
        };
    }
}

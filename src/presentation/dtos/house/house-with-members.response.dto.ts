import { House } from "src/domain/entities/house.entity";
import { RoomieHouse } from "src/domain/entities/roomie-house.entity";
import { Roomie } from "src/domain/entities/roomie.entity";

export class HouseWithMembersResponseDto {
    public readonly id: number;
    public readonly name: string;
    public readonly createdAt: Date;
    public readonly members: HouseMemberDto[];

    constructor(
        id: number,
        name: string,
        createdAt: Date,
        members: HouseMemberDto[]
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.members = members;
    }

    static create(house: House, members: HouseMemberDto[]): HouseWithMembersResponseDto {
        return new HouseWithMembersResponseDto(
            house.id,
            house.name,
            house.createdAt,
            members
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            members: this.members.map(member => member.toJSON()),
            totalMembers: this.members.length,
            payRatioTotal: this.members.reduce((sum, member) => sum + member.payRatio, 0)
        };
    }
}

export class HouseMemberDto {
    public readonly roomieId: number;
    public readonly name: string;
    public readonly email: string;
    public readonly payRatio: number;

    constructor(
        roomieId: number,
        name: string,
        email: string,
        payRatio: number
    ) {
        this.roomieId = roomieId;
        this.name = name;
        this.email = email;
        this.payRatio = payRatio;
    }

    static create(
        roomie: Roomie,
        roomieHouse: RoomieHouse
    ): HouseMemberDto {
        return new HouseMemberDto(
            roomie.id,
            roomie.name,
            roomie.email,
            roomieHouse.payRatio || 0
        );
    }

    toJSON() {
        return {
            roomieId: this.roomieId,
            name: this.name,
            email: this.email,
            payRatio: this.payRatio,
            payRatioPercentage: `${(this.payRatio * 100).toFixed(1)}%`
        };
    }
}

export class UpdatePayRatiosRequestDto {
    public readonly payRatios: PayRatioItem[];

    constructor(payRatios: PayRatioItem[]) {
        this.payRatios = payRatios;
    }

    toJSON() {
        return {
            payRatios: this.payRatios.map(item => item.toJSON())
        };
    }
}

export class PayRatioItem {
    public readonly roomieId: number;
    public readonly payRatio: number;

    constructor(roomieId: number, payRatio: number) {
        this.roomieId = roomieId;
        this.payRatio = payRatio;
    }

    toJSON() {
        return {
            roomieId: this.roomieId,
            payRatio: this.payRatio
        };
    }
}

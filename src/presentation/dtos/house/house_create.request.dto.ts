export class HouseCreateDto {
    public readonly name: string;
    public readonly createdBy: number;

    constructor(name: string, createdBy: number) {
        this.name = name;
        this.createdBy = createdBy;
    }

    toJSON() {
        return {
            name: this.name,
            createdBy: this.createdBy
        };
    }
}

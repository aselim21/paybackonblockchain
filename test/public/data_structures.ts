export default class Partner {
    id: number;
    name: string;
    address: string;
    currency: string;
    valueForToken: number;

    constructor(id: number, name: string, address: string, currency: string, valueForToken: number) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.currency = currency;
        this.valueForToken = valueForToken;
    }
}
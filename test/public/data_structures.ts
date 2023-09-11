export default class Partner {
    id: Number;
    name: String;
    address: String;
    currency: String;
    valueForToken: Number;

    constructor(id: Number, name: String, address: String, currency: String, valueForToken: Number) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.currency = currency;
        this.valueForToken = valueForToken;
    }
}
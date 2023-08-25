declare class BigNumber {
    constructor(value:number|string|BigNumber);
    multipliedBy(value:number|string|BigNumber):BigNumber;
    isZero():boolean;
    isLessThan(a:number|string|BigNumber):boolean;
    isGreaterThan(a:number,b?:string):boolean;
    isGreaterThanOrEqualTo(a:BigNumber,b?:string):boolean;
    plus(value:number|string|BigNumber):BigNumber;
    minus(value:string|BigNumber):BigNumber;
    toString():string;
    toFixed(num?:number):string;
    decimalPlaces(a:number, b:number):BigNumber;
}
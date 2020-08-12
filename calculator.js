function Operator(a,b){
    this.a = a; 
    this.b = b;
}

Operator.prototype.evaluate = function(){
    if (typeof(this.a) == "Operator"){

    }
}

console.log(Operator(1,2));
console.log(typeof(Operator(1,3)));
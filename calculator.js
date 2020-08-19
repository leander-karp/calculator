class Base{
    constructor(precedence){
        this.precedence = precedence;
    }

    evaluate(){
        return this;
    }
}  

class Failure extends Base {
    constructor(msg){
        super(-1);
        this.message = msg;
    }
}

class Operand extends Base{
    constructor(content){
        super(0);
        this.content = content;
    }
    evaluate(){
        return this.content;
    }
}

class Operator extends Base{    
    constructor(precedence, left=null, right=null){
        super(precedence);
        this.left = left;
        this.right = right;
    }

    evaluate(evalFunction) {
        if (this.right == null || this.left == null){
            return new Failure("Invalid Expression");
        }
        else {
            const left = this.left.evaluate();
            const right = this.right.evaluate();

            if (right instanceof Failure){
                return right;
            }
            else if (left instanceof Failure){
                return left;
            }
            else {
                return evalFunction(left, right);
            }
    
        }
    }
}

class BinaryOperator extends Operator {
}

class UnaryOperator extends Operator { 
    constructor(precedence, left=null){
        super(precedence, left);
    }

    evaluate(evalFunction) {
        if (this.left == null){
            return new Failure("Invalid Expression");
        }
        else {
            const left = this.left.evaluate();
            if (left instanceof Failure){
                return left;
            }
            else {
                return evalFunction(left);
            }
        }
    }
}

class AddOperator extends BinaryOperator {
    constructor(left=new Operand(0), right=null){
        super(1, left, right);
    }
    evaluate(){
        return super.evaluate((a,b) => a+b);
    }
}

class SubtractOperator extends BinaryOperator {
    constructor(left=new Operand(0), right=null){
        super(1, left, right);
    }
    evaluate(){
        return super.evaluate((a,b) => a-b);
    }
}

class DivideOperator extends BinaryOperator {
    constructor(left=null, right=null){
        super(2, left, right);
    }
    evaluate(){
        return super.evaluate((a,b) => b!=0? a/b:new Failure("ZeroDivisionError"));
    }
}

class MultiplyOperator extends BinaryOperator {
    constructor(left=null, right=null){
        super(2, left, right);
    }
    evaluate(){
        return super.evaluate((a,b) => a*b);
    }
}

class PowOperator extends BinaryOperator  {
    constructor(left=null, right=null){
        super(3, left, right);
    }
    evaluate(){
        return super.evaluate((a,b) => a**b);
    }
}

class PlusOperator extends UnaryOperator{
    evaluate(){
        return super.evaluate((a) => a);
    }
}

class MinusOperator extends UnaryOperator{
    evaluate(){
        return super.evaluate((a) => -a);
    }
}

const binaryOperators = {
    "+": AddOperator,
    "-": SubtractOperator,
    "/": DivideOperator,
    "^": PowOperator,
    "*": MultiplyOperator, 
}

const unaryOperators = {
    "-": MinusOperator,
    "+": PlusOperator,
}

function tokenize(inputExpression){
    let parsedNumber = "";
    let tokens = [];

    for (let i = 0; i < inputExpression.length; i++) {
        const token = inputExpression[i];
        if (token in binaryOperators || token.match(/\s/)){
            if (parsedNumber){
                tokens.push(parsedNumber);
                parsedNumber = "";
            }
            if (token in unaryOperators && (inputExpression[i+1] in binaryOperators|| i==0)){
                tokens.push(new unaryOperators[token]());
            }
            else if (token in binaryOperators){
                tokens.push(new binaryOperators[token]());
            }
        }
        else if (token.match(/[0-9\.]+/)){
            parsedNumber += token;

            if (i == inputExpression.length-1){
                tokens.push(parsedNumber);
            }
        }
        else {
            tokens.push(new Failure("Invalid Expression"));
        }
    }

    tokens = tokens.map((token) => {
        if (typeof token == "string"){
            let parsedToken = Number(token);
            return isNaN(parsedToken)?new Failure("Invalid Expression"): new Operand(parsedToken);
        }
        return token;
    });
    return tokens;
}

function shuntingYardAlgorithm(expressionArray) {

    // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    const operatorArray = [];
    const outputArray = [];

    for (let index = 0; index < expressionArray.length; index++) {
        const token = expressionArray[index];
        if (token instanceof Operand || token instanceof Failure){
            outputArray.push(token);
        }
        else if (token instanceof Operator){
            if (operatorArray.length != 0){
                const lastOperator = operatorArray.pop();
                if (token.precedence >= lastOperator.precedence && token instanceof Operator){
                    // At the moment left-associativity is ignored
                    outputArray.push(lastOperator);
                }
                else {
                    operatorArray.push(lastOperator);
                }
            }
            operatorArray.push(token);
        }
        else {
            outputArray.push(
                new Failure(
                    "Failed to apply the Shunting-Yard-Algorithm")
            );
        }
    }
    outputArray.push(...operatorArray);
    return outputArray;
}

function constructTree(expressionArray){

    // https://en.wikipedia.org/wiki/Binary_expression_tree
    const stack = [];
    expressionArray.forEach((token) => {
        if (token instanceof Operand || token instanceof Failure){
            stack.push(token);
        }
        else if (token instanceof BinaryOperator){
            if (stack.length != 0){
                token.right = stack.pop();
                if (stack.length >= 1){
                    token.left = stack.pop();
                }
            }
            stack.push(token);
        }
    });
    
    if (expressionArray.length==0){
        return new Failure("");
    }
    else{
        return expressionArray.pop();
    }
}

function evaluateExpression(expression){
    let result = tokenize(expression);
    result = shuntingYardAlgorithm(result);
    result = constructTree(result);
    result = result.evaluate();

    if (result instanceof Failure){
        return result.message;
    }
    else {
        const digits = 10000;
        result = Math.round((result + Number.EPSILON) * digits) / digits;
        return result.toString();
    }
}

/* const solveButton = document.querySelector(".solve-button");
solveButton.addEventListener("click", () => {
    console.log(document.getElementById("expression").value);
    document.getElementById("expression").value = "OK";
}); */


function test(){

    // unary - 
    let x = shuntingYardAlgorithm(tokenize("--1-2-3--4"));
    console.log(x, constructTree(x), constructTree(x).evaluate());
    
}

test();

module.exports = evaluateExpression
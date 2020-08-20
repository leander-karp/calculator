class Failure{
    constructor(msg){
        this.message = msg;
    }
}

const binaryOperators = {
    "*": (a,b) => a*b,
    "-": (a,b) => a-b,
    "+": (a,b) => a+b,
    "^": (a,b) => a**b,
    "/": (a,b) => b!=0?a/b:new Failure("ZeroDivisionError"),
}

const binaryOperatorPrecedence = {
    "*": 1,
    "-": 0,
    "+": 0,
    "^": 3,
    "/": 1,
}

const unaryOperators = {
    "-": (a) => -a,
    "+": (a) => a,
}

const unaryOperatorsPrecedence = {
    "-": 2,
    "+": 2,
}

function solve(expression){
    /*
    Inspired by:
    http://www.martinbroadhurst.com/shunting-yard-algorithm-in-python.html    
    http://www.reedbeta.com/blog/the-shunting-yard-algorithm/
    http://wcipeg.com/wiki/Shunting_yard_algorithm
    */
    function is_Numerical(tokenToTest){
        return !isNaN(Number(tokenToTest));
    }
    function peek(stack){
        return stack.length!=0?stack[stack.length-1]:null;
    }
    function execute(operator, values){
        operator = binaryOperators[operator];
        if (operator.length == 2){
            const right = values.pop();
            const left = values.pop();
            values.push(operator(left, right));
        }
        else if (operator.length == 1) {
            const left = values.pop();
            values.push(operator(left));
        }
        else {
            values.push(new Failure("Invalid Expression"));
        }
    }

    const tokens = expression.match(/[\d\.]+|[-\/\+*()\^]/g);
    const valid = expression.match(/[^\d\.\/\+\s*()\^-]+/g)==null;
    const values = [];
    const operators = [];

    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        
        if (is_Numerical(token)){
            values.push(Number(token));
        }
        else if (token == "("){
            operators.push(token);
        }
        else if (token == ")"){
            let top = peek(operators);
            while (top != null && top != "("){
                execute(operators.pop(), values);
                top = peek(operators);
            }
            operators.pop();

        }
        else {
            let top = peek(operators);
            while (top != null && !"()".includes(top) &&
                binaryOperatorPrecedence[top] > binaryOperatorPrecedence[token]){
                    execute(operators.pop(), values);
                    top = peek(operators);
            }
            operators.push(token);
        }
    }

    while (peek(operators) != null){
        execute(operators.pop(), values);
    }

    return values;
}


const solveButton = document.querySelector(".solve-button");
solveButton.addEventListener("click", () => {
    console.log(document.getElementById("expression").value);
    document.getElementById("expression").value = "OK";
}); 

console.log(solve("---1--2--3-  abc  --4 "));
console.log(solve("   ++1 + + + 1++1+++1 "));
console.log(solve("(1+2.001)*3/2-4^0"));
console.log(solve("1+2.001*3"));
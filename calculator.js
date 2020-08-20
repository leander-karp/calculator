class Failure{
    constructor(msg){
        this.message = msg;
    }
}

function failureWatcher(f){
    function wrapper(a, b){
        if (a instanceof Failure){
            return a;
        }
        else if (b instanceof Failure){
            return b;
        }
        else if (f.length == 2){
            return f(a,b);
        }
        else {
            return f(a); 
        }
    }
    return wrapper;
}

const binaryOperators = {
    "*": failureWatcher((a,b) => a*b),
    "-": failureWatcher((a,b) => a-b),
    "+": failureWatcher((a,b) => a+b),
    "^": failureWatcher((a,b) => a**b),
    "/": failureWatcher((a,b) => b!=0?a/b:new Failure("ZeroDivisionError")),
}

const binaryOperatorPrecedence = {
    "*": 1,
    "-": 0,
    "+": 0,
    "^": 3,
    "/": 1,
}

const unaryOperators = {
    "-": failureWatcher((a) => -a),
    "+": failureWatcher((a) => a),
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
    function previousToken(index, tokenArray){
        return (index-1)<0?null:tokenArray[index-1];
    }
    function execute(operator, values){
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

    const tokens = expression.match(/[\d\.]+|[-\/\+*()\^]/g) || [];
    const valid = expression.match(/[^\d\.\/\+\s*()\^-]+/g)==null;
    const values = [];
    const operators = [];

    if (!valid){
        return "Invalid Expression";
    }

    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        
        if (is_Numerical(token)){
            values.push(Number(token));
            numberInValues = true;
        }
        else if (token == "("){
            operators.push(token);
        }
        else if (token == ")"){
            let top = peek(operators);
            while (top != null && top != "("){
                execute(binaryOperators[operators.pop()], values);
                top = peek(operators);
            }
            operators.pop();

        }
        else {
            const previous = previousToken(index, tokens);
            if (token in unaryOperators && (
                    previous == null || 
                    previous == ")" ||
                    previous in binaryOperators
                    )){
                //unary Operator
                //console.log("Unary Operator:" , token);
                //operators.push(token);
                values.push(new Failure("Cannot solve unary operators."));
            }
            else{
                // binary Operator
                let top = peek(operators);
                while (top != null && !"()".includes(top) &&
                    binaryOperatorPrecedence[top] >= binaryOperatorPrecedence[token]){
                        execute(binaryOperators[operators.pop()], values);
                        top = peek(operators);
                }
                operators.push(token);
            }

        }
    }

    while (peek(operators) != null){
        execute(binaryOperators[operators.pop()], values);
    }

    if (values.length > 0){
        const digits = 10000;
        const value = values[0];
        if (value instanceof Failure){
            return value.message;
        }
        return (Math.round((value + Number.EPSILON) * digits) / digits).toString();
    }
    else{
        return "";
    }
}


const solveButton = document.querySelector(".solve-button");
solveButton.addEventListener("click", () => {
    console.log(document.getElementById("expression").value);
    const expression = document.getElementById("expression").value;

    const item = document.createElement("div");
    item.textContent = `${expression} = ${solve(expression)}`;
    item.appendChild(document.createElement("hr"));

    document.querySelector("#history").appendChild(item);
}); 

const expressionModifier = document.querySelectorAll(".expression-modifier");
expressionModifier.forEach(function(element) {
    element.addEventListener("click", () => {
        document.getElementById("expression").value += element.getAttribute("value");
    });
});

const backspaceButton = document.querySelector(".backspace-button");
backspaceButton.addEventListener("click", () => {
    const value = document.getElementById("expression").value;
    if (value.length > 0){
        document.getElementById("expression").value = value.slice(0, -1);
    }
});

const clearButton = document.querySelector(".clear-button");
clearButton.addEventListener("click", () =>{
    document.getElementById("expression").value = "";
});

const clearHistoryButton = document.querySelector(".clear-history-button");
clearHistoryButton.addEventListener("click", () => {
    const history = document.querySelector("#history");
    Array.from(history.childNodes).forEach((element) => {
        history.removeChild(element);
    });
});


function test(){
    console.log(solve("---(1--2--3-   --4)")); // 7 unary operators
    console.log(solve("   ++(1) + + + 1++1+++1 ")); // 7 unary operators
    console.log(solve("(1+2.001)*3/2-4^0"));
    console.log(solve("1+2.001*3"));

   // empty input 
   console.assert(solve(" ") == "",);
   console.assert(solve("") == "");

   // binary operators
   console.assert(solve("2-2")=="0");
   console.assert(solve("2/2")=="1");
   console.assert(solve("2+2+2") == "6");
   console.assert(solve("1^2") == "1");
   console.assert(solve("2*3") == "6");
   console.assert(solve("2^2^2") == "16");

   // unary operators
   console.assert(false, "Unary Operators are missing");
   console.assert(solve("---1") == "-1", solve("---1"));


   // rounding
   console.assert(solve("4.999999") == "5");
   console.assert(solve("1.00005")== "1.0001");
   
   // floating point 
   console.assert(solve("1.5 + 1.001-1") == "1.501");
   console.assert(solve("0.1-0.001")=="0.099");
   console.assert(solve("1/2*0.5")=="0.25", "Floating point mistake: 1/2*0.5");
   console.assert(solve("1/3") == "0.3333");

    // precedence
    console.assert(solve("1+1-1-2*3+4/5") == "-4.2");
    console.assert(solve("(1+2.001)*3/2-4^0") == "3.5015");

    // brackets
    console.assert(solve("(1  +2  ) *3  ") == "9");
    console.assert(solve("1+2   * 3") == "7");
    console.assert(solve(" 1 + (2*3) ") == "7");
    console.assert(solve("(2-3 * ((6-5) * 2))") == "-4");

    // ZeroDivisionError, Exceptions
    console.assert(solve("1/0") == "ZeroDivisionError");
    console.assert(solve("1^2^2*3/0") == "ZeroDivisionError");
    console.assert(solve("2*a") == "Invalid Expression");
}

test();
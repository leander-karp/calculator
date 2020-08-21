class Failure{
    /*
    Class in order to distinguish between Errors
    and calculated results.
    */
    constructor(msg){
        this.message = msg;
    }
}

function failureWatcher(operatorFunction){
    /*
    Basic wrapper for Operator functions.
    It catches occurring Failure return values.
    */
    function unaryWrapper(a){
        if (a instanceof Failure){
            return a;
        }
        const result = operatorFunction(a);
        return result;
    }
    function binaryWrapper(a, b){
        if (a instanceof Failure){
            return a;
        }
        else if (b instanceof Failure){
            return b;
        }
        const result = operatorFunction(a,b);
        return result;
    }
    
    return operatorFunction.length==2? binaryWrapper:unaryWrapper;
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

function solve(expression){
    /*
    Inspired by:
    http://www.martinbroadhurst.com/shunting-yard-algorithm-in-python.html    
    http://www.reedbeta.com/blog/the-shunting-yard-algorithm/
    http://wcipeg.com/wiki/Shunting_yard_algorithm
    */
    function is_Numerical(tokenToTest){
        /*Tests if a given token can be convertet into an numeric value.*/
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
            let left = values.pop();
            if (left == undefined){
                left = new Failure("Invalid Expression");
            }
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

    let _tokens = expression.match(/[\d\.]+|[-\/\+*()\^]/g) || [];
    const tokens = Array.from(_tokens);
    const valid = expression.match(/[^\d\.\/\+\s*()\^-]+/g)==null;
    // Validation with regular expression to catch most of the invalid
    // formed formula.
    const values = [];
    const operators = [];

    if (!valid){
        return "Invalid Expression";
    }

    let index = 0; 
    while (index < tokens.length ) {
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
                execute(binaryOperators[operators.pop()], values);
                top = peek(operators);
            }
            operators.pop();
        }
        else if (token in binaryOperators || token in unaryOperators){
            const previous = previousToken(index, tokens);
            if (token in unaryOperators && (
                    previous == null || 
                    previous == "(" ||
                    previous in binaryOperators
            )){
                //unary Operator
                values.push(1);
                execute(unaryOperators[token], values);

                if (previous != null || index == 0){
                    tokens.splice(index+1, 0, "*");
                }
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
        else {
            // There is an invalid token, which passed the regex and
            // all conditions above.
            values.push(new Failure("Invalid Expression"));
        }
        index++;
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
    // console.log(solve("---(1--2--3-   --4)")); // 7 unary operators
    // console.log(solve("   ++(1) + + + 1++1+++1 ")); // 7 unary operators
    // console.log(solve("(1+2.001)*3/2-4^0"));
    // console.log(solve("1+2.001*3"));

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
//    console.assert(false, "Unary Operators are missing");
   console.assert(solve("---1") == "-1");
   console.assert(solve("--1---1") == "0");
   console.assert(solve("-1-1") == "-2");
   console.assert(solve("--1") == "1");

   console.assert(solve("++1") == "1");
   console.assert(solve("-1+-4") == "-5");


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
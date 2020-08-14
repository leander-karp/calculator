function createOperator(operator){
    function setOperands(firstOperand="Missing Operand", secondOperand="Missing Operand"){
        function callOperator(){
            /*
            */
            // function: another operator
            // !number: Error
            // otherwise operate
            let a = firstOperand; 
            let b = secondOperand;
            if (typeof firstOperand=="function"){
                a = firstOperand();
            }
            else if (typeof firstOperand!= "number"){
                return firstOperand;
            }
            if (typeof secondOperand=="function"){
                b = secondOperand();
            }
            else if (typeof secondOperand!="number"){
                if (!operator.length >= 2)
                    {return secondOperand;}
                else 
                    {return operator(a);}
            }
            return operator(a, b);
        }
        return callOperator;
    }
    return setOperands;
}

const add = createOperator((a,b) => a+b);
const subtract = createOperator((a,b) => a-b);
const divide = createOperator((a,b) => (b==0)?"ZeroDivisionError":a/b);
const multiply = createOperator((a,b) => a*b);
const pow = createOperator((a,b) => a**b);
const negative = createOperator((a) => multiply(-1, a)());

console.log(add(1,2)());
console.log(subtract(2,3)());
console.log(divide(1,0)());
console.log(multiply(2,2)());
console.log(pow(2,2)());
console.log(negative(10)());

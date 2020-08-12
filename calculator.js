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
                return secondOperand;
            }
            return operator(a, b);
        }
        return callOperator;
    }
    return setOperands;
}

const add = createOperator((a,b) => a+b);
const subtract = createOperator((a,b) => a-b);
const divide = createOperator((a,b) => {
    return (b==0)?"ZeroDivisionError":a/b;
});
console.log(add(1,2)());

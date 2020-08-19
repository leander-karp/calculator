const evaluateExpression = require("./calculator");

/*
    - Empty input
    - addition
    - subtraction
    - unary addition & subtraction
    - multiply
    - divide 
        - x/0
    - pow
    - operator precedence
    - rounding 
    - Floating point input
    - Integers >= 10
    - space in between
*/
describe("Testing Calulator parsing", function(){
    it("allows empty input", function(){
        expect(evaluateExpression("")).toBe("");
        expect(evaluateExpression("   ")).toBe("");
    });

    it("addition & unary addition", function() {
        expect(evaluateExpression("1+2+3+4")).toBe("10");
        expect(evaluateExpression("++++1++2+3+++++++++4")).toBe("10");
    });
    it("subtraction & unary subtraction", function() {
        expect(evaluateExpression("-1-2-3-4")).toBe("-10");
        expect(evaluateExpression("--1-2-3--4")).toBe("0");
    });
});
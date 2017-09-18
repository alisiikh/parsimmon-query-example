let P = require('Parsimmon');

let token = (parser) => parser.skip(P.optWhitespace);
let word = (str) => P.string(str).thru(token);

let QueryLang = P.createLanguage({
    fullExpr: (r) => P.alt(r.expr, r.valueExpr).sepBy(r.separator).desc("full expression"),
    expr: function (r) {
        return P.seq(r.variable.skip(r._), r.operator.skip(r._), r.value).map(function (results) {
            if (results.length === 1) {
                // this is a value expression
                return results[0];
            } else {
                // this is a complex expr, e.g. key=value
                return {
                    "var": results[0],
                    "operator": results[1],
                    "value": results[2]
                }
            }

        }).desc("complex expression");
    },
    valueExpr: (r) => r.quotedString.map((results) => {
        return { var: "*", operator: "=", "value": results }
    }).desc("value expression"),
    variable: () => P.regex(/[a-zA-Z_]\w*/).desc("variable"),
    operator: () => P.alt(
        word("="),
        word("!="),
        word("<="),
        word(">="),
        word("<"),
        word(">")
    ).desc("operator"),
    value: (r) => P.alt(
        r.quotedString,
        r.decimalNumber,
        r.number,
        r.array).desc("value"),
    separator: () => P.whitespace.desc("separator"),

    // TODO: this regexp is not perfect, is it possible to have multiple repeatable " symbols in a string?
    quotedString: () => P.regexp(/"([^"\x00-\x1F\x7F]|[a-fA-F0-9]{4})*"/).desc("string"),
    decimalNumber: () => P.regexp(/(\d+(\.\d*)?|\d*\.\d+)/).desc("decimal number").map(Number).desc("decimal number"),
    number: () => P.regexp(/-?\d+/).map(Number).desc("number"),
    array: (r) => {
        return word("[")
            .then(P.alt(r.quotedString, r.decimalNumber, r.number).sepBy(r._))
            .skip(word("]"))
            .desc("array")
    },
    _: () => P.optWhitespace.desc("whitespace")
});


let expr = 'bc=5 a <3 g> 10 stamm = "5555" size=10 "full text search" x=[2 3 "100500"]';
let result = QueryLang.fullExpr.tryParse(expr);
console.log(result);

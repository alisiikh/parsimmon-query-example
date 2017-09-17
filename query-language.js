var P = require('Parsimmon');


let whitespace = P.regexp(/\s*/m);
function token(parser) {
    return parser.skip(whitespace);
}
function word(str) {
    return P.string(str).thru(token);
}
// TODO: might be helpful? From here: https://github.com/jneen/parsimmon/blob/master/examples/json.js
function interpretEscapes(str) {
    let escapes = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };
    return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
        let type = escape.charAt(0);
        let hex = escape.slice(1);
        if (type === 'u') {
            return String.fromCharCode(parseInt(hex, 16));
        }
        if (escapes.hasOwnProperty(type)) {
            return escapes[type];
        }
        return type;
    });
}


var QueryLang = P.createLanguage({
    fullExpr: function (r) {
        return P.alt(r.expr, r.valueExpr).sepBy(r.separator);
    },
    expr: function (r) {
        return P.seq(r.variable.skip(r._), r.operator.skip(r._), r.value).map(function(results) {
            if (results.length === 1) {
                return results[0];
            } else {
                return {
                    "var": results[0],
                    "operator": results[1],
                    "value": results[2]
                }
            }

        });
    },
    valueExpr: function (r) {
        return r.quotedString
    },
    variable: function () {
        return P.regex(/[a-zA-Z_]\w*/)
    },
    operator: function () {
        return P.alt(
            word("="),
            word("!="),
            word("<="),
            word(">="),
            word("<"),
            word(">")
        );
    },
    value: function (r) {
        return P.alt(r.quotedString, r.decimalNumber, r.array)
    },
    separator: function () {
        return P.whitespace;
    },
    quotedString: function () {
        // TODO: this regexp is not perfect, is it possible to have multiple repeatable " symbols in a string?
        return P.regexp(/"([^"\x00-\x1F\x7F]|[a-fA-F0-9]{4})*"/)
    },
    decimalNumber: function () {
        return P.regexp(/(\d+(\.\d*)?|\d*\.\d+)/)
    },
    number: function () {
        return P.regexp(/-?\d+/).map(Number)
    },
    array: function (r) {
        return word("[")
            .then(P.alt(r.quotedString, r.decimalNumber, r.number).sepBy(r._))
            .skip(word("]"))
    },
    _: function () {
        return P.optWhitespace;
    },

    null: () => word('null').result(null),
    true: () => word('true').result(true),
    false: () => word('false').result(false),
});


let expr = "bc=5 a<3 g>10 stamm=\"No chto eto takoe\" \"xx\" x=[2 3 \"100500\"]";
let result = QueryLang.fullExpr.tryParse(expr);
console.log(result);

let QueryParser = require('../src/QueryParser');
let QueryLang = require('../src/QueryLang');
let expect = require('chai').expect;

describe("QueryParser", () => {
    it("parses all possible variations of expressions", () => {
        // given
        let expressions = [
            'wtf=2.33',
            'wtf=-2.33',
            'wtf=-2',
            'bc=5 a <3 g> 10 stamm = "5555" size=10 "full text search" x=[2, 3, "100500"]',
            'bc  =3 a>   10 st = "am"',
            'bc  =3 a>   10 st = "am"',
            'bc  =3 a           >   10  "3215"   st = "am"',
            'arr= [ 1,   2 ,   3 ]',
            'arr=[1,2,3]',
            'arr=[1,2,3] wtf=3',
            'wtf="hello dude"',
            'wtf=\"hello dude\"',
            'birthday=(\'2007-12-11\' -\'2008-01-01\')',
            'birthday=( \'2007-12-11\'-\'2008-01-01\')',
            'birthday=( \'2007-12-11\'-\'2008-01-01\' )',
            'birthday=   ( \'2007-12-11\'     -\'2008-01-01\'     )',
        ];

        // when
        expressions.forEach((expr, idx) => {
            //then
            try {
                let exprObj = QueryParser.parse(expr);
                console.log(exprObj);
            } catch (err) {
                console.error("Failed to parse '" + expressions[idx] + "'", err);
                throw err;
            }
        })
    });

    it("date is parsed accordingly", () => {
        let result = QueryLang.date.tryParse("'2007-12-11'");
        console.log(result);
    });

    it("date expression is parsed accordingly", () => {
        let result = QueryLang.dateExpr.tryParse("('2007-12-11'-'2008-01-01')");
        console.log(result);
    });
});

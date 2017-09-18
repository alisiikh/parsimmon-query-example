let QueryParser = require('../src/QueryParser');
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
            'wtf=\"hello dude\"'
        ];

        // when
        expressions.forEach((expr, idx) => {
            //then
            try {
                QueryParser.parse(expr);
            } catch (err) {
                console.error("Failed to parse '" + expressions[idx] + "'", err);
                throw err;
            }
        })
    });
});

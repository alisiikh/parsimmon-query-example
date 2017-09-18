let QueryLang = require('./QueryLang');

let expr = 'bc=5 a <3 g> 10 stamm = "5555" size=10 "full text search" x=[2 3 "100500"]';
let result = QueryLang.fullExpr.tryParse(expr);
console.log(result);

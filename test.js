let QueryParser = require('./QueryLang');

let expr = 'bc=5 a <3 g> 10 stamm = "5555" size=10 "full text search" x=[2, 3, "100500"]';
let expr2 = 'bc  =3 a>   10 st = "am"';
let expr3 = 'bc  =3 a>   10 st = "am"';
let expr4 = 'bc  =3 a           >   10  "3215"   st = "am"';
let arrayExpr1 = 'arr= [ 1,   2 ,   3 ]';
let arrayExpr2 = 'arr=[1,2,3]';
let arrayExpr3 = 'arr=[1,2,3] wtf=3';

console.log(QueryParser.parse(expr));
console.log(QueryParser.parse(expr2));
console.log(QueryParser.parse(expr3));
console.log(QueryParser.parse(expr4));
console.log(QueryParser.parse(arrayExpr1));
console.log(QueryParser.parse(arrayExpr2));
console.log(QueryParser.parse(arrayExpr3));

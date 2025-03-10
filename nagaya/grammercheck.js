const nlp = require('compromise');

let doc = nlp("she plays soccer");
console.log(doc.json());
console.log(doc.out()); 
// The two presitents are to meet at paris.
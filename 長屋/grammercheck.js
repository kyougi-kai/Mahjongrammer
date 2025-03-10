const nlp = require('compromise');

let doc = nlp("She plays soccer.");
console.log(doc.verbs().out('array'));
console.log(doc.nouns().out('array'));
console.log(doc.people().out('array'));

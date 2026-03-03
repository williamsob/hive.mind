import * as fs from 'fs';

fs.readFile('data/user_details.txt', 'utf8', (err, data) => {
    if (err){
        console.error(err);
        return;
    }

    console.log(data);
});


console.log('done');
let x = document.getElementById("study-group-container").childNodes;
console.log(x);

// const fs = require('fs');

// fs.readFile('data/user_details.txt', 'utf8', (err, data) => {
//     if (err){
//         console.log("ff");
//         return;
//     }

//     console.log(data);
// });

const fs = require('fs');

fs.readFile('data/user_details.txt', 'utf8', (err, data) => {
    if (err){
        console.error(err);
        return;
    }

    console.log(data);
});


const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

// bcrypt.genSalt(saltRounds, function(err, salt) {
//     bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
//         console.log(hash);
//         console.log(process.env.SECRET);
//     });
// });

const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, salt);
console.log('User password hash', hash);
const {Client} = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'user',
    port: 5432,
        });

client.connect()


// client.query('Select * from todolist', (err, res) => {
//     if (err) {
//         console.error('Error executing query', err.stack);
//     } else {
//         console.log('Query result:', res.rows);
//     }
//     client.end();
// }
// );

client.query('INSERT INTO todolist (task, status) VALUES ($1, $2)', ['Learn Pregresql', false], (err, res) => {
    if (err) {
        console.error('Error executing insert query', err.stack);
    } else {
        console.log('Insert successful:', res.rowCount);
    }
    client.end();
}   );


// client.query('UPDATE todolist SET status = $1 WHERE task = $2', [true, 'Learn Pregresql'], (err, res) => {
//     if (err) {
//         console.error('Error executing update query', err.stack);
//     } else {
//         console.log('Update successful:', res.rowCount);
//     }
//     client.end();

// });

// client.query('DELETE FROM todolist WHERE task = $1', ['Learn Pregresql'], (err, res) => {       
//     if (err) {
//         console.error('Error executing delete query', err.stack);
//     } else {
//         console.log('Delete successful:', res.rowCount);
//     }
//     client.end();
// });
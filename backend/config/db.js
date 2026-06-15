const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'GestionTramitesMunicipales',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
}); 

pool.getConnection()
  .then(conn => { console.log('✅ MySQL conectado'); conn.release(); })
  .catch(err  => { console.error('❌ MySQL error:', err.message); });

module.exports = pool;

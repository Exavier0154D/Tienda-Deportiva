const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;

// 1. Stock Bajo
app.get('/reportes/stock-bajo', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM productos WHERE stock <= stock_minimo ORDER BY stock ASC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Top Productos Movidos (Salidas)
app.get('/reportes/top-productos', async (req, res) => {
    const { inicio, fin } = req.query;
    try {
        let query = `
       SELECT p.nombre, COUNT(m.id) as total_salidas 
       FROM movimientos_inventario m
       JOIN productos p ON m.producto_id = p.id
       WHERE m.tipo_movimiento = 'SALIDA' 
    `;
        const params = [];

        if (inicio && fin) {
            query += ` AND m.fecha BETWEEN $1 AND $2`;
            params.push(inicio, fin);
        }

        query += ` GROUP BY p.nombre ORDER BY total_salidas DESC LIMIT 10`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. Valor Inventario
app.get('/reportes/valor-inventario', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.nombre as categoria, SUM(p.precio * p.stock) as valor_total
             FROM productos p
                      JOIN categorias c ON p.categoria_id = c.id
             GROUP BY c.nombre`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. Movimientos por fecha
app.get('/reportes/movimientos', async (req, res) => {
    const { inicio, fin } = req.query;
    try {
        const result = await pool.query(
            `SELECT m.*, p.nombre as producto_nombre
             FROM movimientos_inventario m
                      JOIN productos p ON m.producto_id = p.id
             WHERE m.fecha BETWEEN $1 AND $2
             ORDER BY m.fecha DESC`,
            [inicio, fin]
        );

        const totalMovimientos = result.rows.length;
        const totalEntradas = result.rows.filter(m => m.tipo_movimiento === 'ENTRADA').length;
        const totalSalidas = result.rows.filter(m => m.tipo_movimiento === 'SALIDA').length;

        res.json({
            resumen: {
                total_movimientos: totalMovimientos,
                entradas: totalEntradas,
                salidas: totalSalidas
            },
            detalles: result.rows
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 5. Resumen Proveedores
app.get('/reportes/resumen-proveedores', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.nombre, COUNT(p.id) as cantidad_productos, SUM(p.precio * p.stock) as valor_inventario
       FROM proveedores pr
       LEFT JOIN productos p ON p.proveedor_id = pr.id
       GROUP BY pr.nombre`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servicio de Reportes corriendo en puerto ${PORT}`);
});
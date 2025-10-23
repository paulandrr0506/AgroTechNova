/**
 * CONTROLADOR: Inventario (Sprint 4 - RF08, RF09, RF43)
 */

const InventoryModel = require('../models/inventoryModel');
const ProductModel = require('../models/productModel');
const { isPositiveNumber } = require('../utils/validators');

class InventoryController {
  /**
   * Registrar entrada de producto (RF43)
   */
  static async registrarEntrada(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { producto_id, cantidad, costo_unitario, descripcion, fecha } = JSON.parse(body);
        const usuario_id = req.user?.id;

        // Validaciones
        if (!producto_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El ID del producto es obligatorio' }));
        }

        if (!isPositiveNumber(cantidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La cantidad debe ser un número positivo' }));
        }

        if (!isPositiveNumber(costo_unitario)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El costo unitario debe ser un número positivo' }));
        }

        if (!fecha) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La fecha es obligatoria' }));
        }

        // Verificar que el producto existe
        const product = await ProductModel.findById(producto_id);
        if (!product) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Producto no encontrado' }));
        }

        // Registrar entrada
        const movimientoId = await InventoryModel.registrarEntrada({
          producto_id,
          cantidad: parseInt(cantidad),
          costo_unitario: parseFloat(costo_unitario),
          descripcion,
          usuario_id,
          fecha
        });

        // Incrementar stock
        await ProductModel.incrementStock(producto_id, parseInt(cantidad));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Entrada registrada exitosamente',
          movimientoId
        }));

      } catch (error) {
        console.error('Error registrando entrada:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Registrar salida de producto (RF43)
   */
  static async registrarSalida(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { producto_id, cantidad, proyecto_id, descripcion, fecha } = JSON.parse(body);
        const usuario_id = req.user?.id;

        // Validaciones
        if (!producto_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El ID del producto es obligatorio' }));
        }

        if (!isPositiveNumber(cantidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La cantidad debe ser un número positivo' }));
        }

        if (!fecha) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La fecha es obligatoria' }));
        }

        // Verificar que el producto existe
        const product = await ProductModel.findById(producto_id);
        if (!product) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Producto no encontrado' }));
        }

        // Verificar stock suficiente
        if (product.stock_actual < parseInt(cantidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            success: false, 
            message: `Stock insuficiente. Disponible: ${product.stock_actual} ${product.unidad}` 
          }));
        }

        // Registrar salida
        const movimientoId = await InventoryModel.registrarSalida({
          producto_id,
          cantidad: parseInt(cantidad),
          proyecto_id,
          descripcion,
          usuario_id,
          fecha
        });

        // Decrementar stock
        await ProductModel.decrementStock(producto_id, parseInt(cantidad));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Salida registrada exitosamente',
          movimientoId
        }));

      } catch (error) {
        console.error('Error registrando salida:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Obtener todos los movimientos (RF08)
   */
  static async getAllMovimientos(req, res) {
    try {
      const movimientos = await InventoryModel.findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movements: movimientos }));
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener movimientos por producto (RF08 - historial)
   */
  static async getMovimientosByProducto(req, res) {
    try {
      const { producto_id } = req.params;
      const movimientos = await InventoryModel.findByProducto(producto_id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movements: movimientos }));
    } catch (error) {
      console.error('Error obteniendo movimientos por producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener movimientos por proyecto
   */
  static async getMovimientosByProyecto(req, res) {
    try {
      const { proyecto_id } = req.params;
      const movimientos = await InventoryModel.findByProyecto(proyecto_id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movements: movimientos }));
    } catch (error) {
      console.error('Error obteniendo movimientos por proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener movimientos por tipo (RF09 - filtración)
   */
  static async getMovimientosByTipo(req, res) {
    try {
      const { tipo } = req.params;
      
      if (tipo !== 'entrada' && tipo !== 'salida') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Tipo inválido. Use "entrada" o "salida"' }));
      }

      const movimientos = await InventoryModel.findByTipo(tipo);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movements: movimientos }));
    } catch (error) {
      console.error('Error obteniendo movimientos por tipo:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener movimientos por rango de fechas (RF09 - filtración)
   */
  static async getMovimientosByDateRange(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Debe especificar fecha_inicio y fecha_fin' }));
      }

      const movimientos = await InventoryModel.findByDateRange(fecha_inicio, fecha_fin);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movements: movimientos }));
    } catch (error) {
      console.error('Error obteniendo movimientos por rango de fechas:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener resumen de movimientos por producto
   */
  static async getResumenByProducto(req, res) {
    try {
      const { producto_id } = req.params;
      const resumen = await InventoryModel.getResumenByProducto(producto_id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, resumen }));
    } catch (error) {
      console.error('Error obteniendo resumen por producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener estadísticas generales (RF05 - informes)
   */
  static async getEstadisticas(req, res) {
    try {
      const estadisticas = await InventoryModel.getEstadisticas();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, ...estadisticas }));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Eliminar movimiento
   */
  static async deleteMovimiento(req, res) {
    try {
      const { id } = req.params;

      const deleted = await InventoryModel.delete(id);
      if (!deleted) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Movimiento no encontrado' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Movimiento eliminado exitosamente' }));

    } catch (error) {
      console.error('Error eliminando movimiento:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }
}

module.exports = InventoryController;

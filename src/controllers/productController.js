/**
 * CONTROLADOR: Productos (Sprint 4 - RF06, RF43, RF45)
 */

const ProductModel = require('../models/productModel');
const { isNotEmpty, isPositiveNumber } = require('../utils/validators');

class ProductController {
  /**
   * Crear producto (RF06, RF43)
   */
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { nombre, descripcion, tipo, categoria, unidad, stock_actual, stock_minimo, costo_unitario, proveedor_id, es_organico } = JSON.parse(body);

        // Validaciones
        if (!isNotEmpty(nombre)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El nombre del producto es obligatorio' }));
        }

        if (!isNotEmpty(tipo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El tipo de producto es obligatorio' }));
        }

        if (!isNotEmpty(unidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La unidad de medida es obligatoria' }));
        }

        if (!isPositiveNumber(costo_unitario)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El costo unitario debe ser un número positivo' }));
        }

        // Crear producto
        const productId = await ProductModel.create({
          nombre,
          descripcion,
          tipo,
          categoria,
          unidad,
          stock_actual: stock_actual || 0,
          stock_minimo: stock_minimo || 0,
          costo_unitario,
          proveedor_id,
          es_organico: es_organico ? 1 : 0
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Producto creado exitosamente',
          productId
        }));

      } catch (error) {
        console.error('Error creando producto:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Obtener todos los productos (RF06)
   */
  static async getAll(req, res) {
    try {
      const products = await ProductModel.findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener productos disponibles
   */
  static async getAvailable(req, res) {
    try {
      const products = await ProductModel.findAvailable();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener producto por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Producto no encontrado' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, product }));
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener productos por tipo
   */
  static async getByTipo(req, res) {
    try {
      const { tipo } = req.params;
      const products = await ProductModel.findByTipo(tipo);
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos por tipo:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener productos orgánicos (RF45)
   */
  static async getOrganicos(req, res) {
    try {
      const products = await ProductModel.findOrganicos();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos orgánicos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener productos con stock bajo (RF04 - alertas)
   */
  static async getLowStock(req, res) {
    try {
      const products = await ProductModel.findLowStock();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos con stock bajo:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener productos por proveedor (RF18)
   */
  static async getByProveedor(req, res) {
    try {
      const { proveedor_id } = req.params;
      const products = await ProductModel.findByProveedor(proveedor_id);
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, products }));
    } catch (error) {
      console.error('Error obteniendo productos por proveedor:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Actualizar producto (RF43)
   */
  static async update(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { id } = req.params;
        const { nombre, descripcion, tipo, categoria, unidad, stock_minimo, costo_unitario, proveedor_id, estado, es_organico } = JSON.parse(body);

        // Validaciones
        if (!isNotEmpty(nombre)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El nombre del producto es obligatorio' }));
        }

        if (!isNotEmpty(tipo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El tipo de producto es obligatorio' }));
        }

        if (!isNotEmpty(unidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'La unidad de medida es obligatoria' }));
        }

        if (!isPositiveNumber(costo_unitario)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El costo unitario debe ser un número positivo' }));
        }

        // Verificar que el producto existe
        const product = await ProductModel.findById(id);
        if (!product) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Producto no encontrado' }));
        }

        // Actualizar
        const updated = await ProductModel.update(id, {
          nombre,
          descripcion,
          tipo,
          categoria,
          unidad,
          stock_minimo: stock_minimo || 0,
          costo_unitario,
          proveedor_id,
          estado: estado || product.estado,
          es_organico: es_organico ? 1 : 0
        });

        if (!updated) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'No se pudo actualizar el producto' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Producto actualizado exitosamente' }));

      } catch (error) {
        console.error('Error actualizando producto:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Eliminar producto (RF43)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id);
      if (!product) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Producto no encontrado' }));
      }

      const deleted = await ProductModel.delete(id);
      if (!deleted) {
        res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'No se pudo eliminar el producto' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, message: 'Producto eliminado exitosamente' }));

    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener valor total del inventario
   */
  static async getTotalValue(req, res) {
    try {
      const total = await ProductModel.getTotalValue();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, total_value: total }));
    } catch (error) {
      console.error('Error obteniendo valor total:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }
}

module.exports = ProductController;



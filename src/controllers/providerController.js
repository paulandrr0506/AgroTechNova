/**
 * CONTROLADOR: Proveedores (Sprint 4 - RF16, RF18)
 */

const ProviderModel = require('../models/providerModel');
const { isNotEmpty, isValidEmail } = require('../utils/validators');

class ProviderController {
  /**
   * Crear proveedor (RF16)
   */
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { nombre, nit, contacto, telefono, correo, direccion, tipo_productos } = JSON.parse(body);

        // Validaciones
        if (!isNotEmpty(nombre)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El nombre del proveedor es obligatorio' }));
        }

        if (correo && !isValidEmail(correo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Correo electrónico inválido' }));
        }

        // Verificar nombre único (RF16)
        const existingNombre = await ProviderModel.findByNombre(nombre);
        if (existingNombre) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Ya existe un proveedor con este nombre' }));
        }

        // Verificar NIT único (RF16)
        if (nit) {
          const existingNit = await ProviderModel.findByNit(nit);
          if (existingNit) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Ya existe un proveedor con este NIT' }));
          }
        }

        // Crear proveedor
        const providerId = await ProviderModel.create({
          nombre,
          nit,
          contacto,
          telefono,
          correo,
          direccion,
          tipo_productos
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Proveedor creado exitosamente',
          providerId
        }));

      } catch (error) {
        console.error('Error creando proveedor:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Obtener todos los proveedores
   */
  static async getAll(req, res) {
    try {
      const providers = await ProviderModel.findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, providers }));
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener proveedores activos (RF18)
   */
  static async getActive(req, res) {
    try {
      const providers = await ProviderModel.findActive();
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, providers }));
    } catch (error) {
      console.error('Error obteniendo proveedores activos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Obtener proveedor por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const provider = await ProviderModel.findById(id);

      if (!provider) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Proveedor no encontrado' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, provider }));
    } catch (error) {
      console.error('Error obteniendo proveedor:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Actualizar proveedor
   */
  static async update(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { id } = req.params;
        const { nombre, nit, contacto, telefono, correo, direccion, tipo_productos, estado } = JSON.parse(body);

        // Validaciones
        if (!isNotEmpty(nombre)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'El nombre del proveedor es obligatorio' }));
        }

        if (correo && !isValidEmail(correo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Correo electrónico inválido' }));
        }

        // Verificar que el proveedor existe
        const provider = await ProviderModel.findById(id);
        if (!provider) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Proveedor no encontrado' }));
        }

        // Verificar nombre único (RF16)
        if (nombre !== provider.nombre) {
          const existingNombre = await ProviderModel.findByNombre(nombre);
          if (existingNombre) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Ya existe un proveedor con este nombre' }));
          }
        }

        // Verificar NIT único (RF16)
        if (nit && nit !== provider.nit) {
          const existingNit = await ProviderModel.findByNit(nit);
          if (existingNit) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Ya existe un proveedor con este NIT' }));
          }
        }

        // Actualizar
        const updated = await ProviderModel.update(id, {
          nombre,
          nit,
          contacto,
          telefono,
          correo,
          direccion,
          tipo_productos,
          estado: estado || provider.estado
        });

        if (!updated) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'No se pudo actualizar el proveedor' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Proveedor actualizado exitosamente' }));

      } catch (error) {
        console.error('Error actualizando proveedor:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * Desactivar proveedor
   */
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      const provider = await ProviderModel.findById(id);
      if (!provider) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Proveedor no encontrado' }));
      }

      const deactivated = await ProviderModel.deactivate(id);
      if (!deactivated) {
        res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'No se pudo desactivar el proveedor' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, message: 'Proveedor desactivado exitosamente' }));

    } catch (error) {
      console.error('Error desactivando proveedor:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Activar proveedor
   */
  static async activate(req, res) {
    try {
      const { id } = req.params;

      const provider = await ProviderModel.findById(id);
      if (!provider) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Proveedor no encontrado' }));
      }

      const activated = await ProviderModel.activate(id);
      if (!activated) {
        res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'No se pudo activar el proveedor' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, message: 'Proveedor activado exitosamente' }));

    } catch (error) {
      console.error('Error activando proveedor:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }

  /**
   * Eliminar proveedor
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const provider = await ProviderModel.findById(id);
      if (!provider) {
        res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'Proveedor no encontrado' }));
      }

      const deleted = await ProviderModel.delete(id);
      if (!deleted) {
        res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ success: false, message: 'No se pudo eliminar el proveedor' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, message: 'Proveedor eliminado exitosamente' }));

    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
    }
  }
}

module.exports = ProviderController;


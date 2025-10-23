const ResourceModel = require('../models/resourceModel');
const { isNotEmpty, isPositiveNumber } = require('../utils/validators');

class ResourceController {
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!isNotEmpty(data.nombre)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre del recurso es obligatorio' }));
          return;
        }

        if (!data.tipo || !['material', 'equipo', 'insumo', 'mano_obra', 'otro'].includes(data.tipo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Tipo de recurso inválido' }));
          return;
        }

        if (!isPositiveNumber(data.cantidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La cantidad debe ser un número positivo' }));
          return;
        }

        if (!isNotEmpty(data.unidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La unidad es obligatoria' }));
          return;
        }

        if (!isPositiveNumber(data.costo_unitario)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El costo unitario debe ser un número positivo' }));
          return;
        }

        if (!data.proyecto_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El ID del proyecto es obligatorio' }));
          return;
        }

        const recurso = await ResourceModel.create(data);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Recurso creado exitosamente',
          recurso
        }));

      } catch (error) {
        console.error('Error al crear recurso:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al crear recurso' }));
      }
    });
  }

  static async getAll(req, res) {
    try {
      const recursos = await ResourceModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        recursos
      }));

    } catch (error) {
      console.error('Error al obtener recursos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener recursos' }));
    }
  }

  static async getById(req, res, id) {
    try {
      const recurso = await ResourceModel.findById(id);

      if (!recurso) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Recurso no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        recurso
      }));

    } catch (error) {
      console.error('Error al obtener recurso:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener recurso' }));
    }
  }

  static async getByProject(req, res, proyecto_id) {
    try {
      const recursos = await ResourceModel.findByProject(proyecto_id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        recursos
      }));

    } catch (error) {
      console.error('Error al obtener recursos del proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener recursos del proyecto' }));
    }
  }

  static async getByPhase(req, res, fase_id) {
    try {
      const recursos = await ResourceModel.findByPhase(fase_id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        recursos
      }));

    } catch (error) {
      console.error('Error al obtener recursos de la fase:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener recursos de la fase' }));
    }
  }

  static async update(req, res, id) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (data.cantidad !== undefined && !isPositiveNumber(data.cantidad)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La cantidad debe ser un número positivo' }));
          return;
        }

        if (data.costo_unitario !== undefined && !isPositiveNumber(data.costo_unitario)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El costo unitario debe ser un número positivo' }));
          return;
        }

        if (data.tipo && !['material', 'equipo', 'insumo', 'mano_obra', 'otro'].includes(data.tipo)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Tipo de recurso inválido' }));
          return;
        }

        if (data.estado && !['disponible', 'en_uso', 'agotado'].includes(data.estado)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Estado inválido' }));
          return;
        }

        const recurso = await ResourceModel.update(id, data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Recurso actualizado exitosamente',
          recurso
        }));

      } catch (error) {
        console.error('Error al actualizar recurso:', error);
        
        if (error.message === 'Recurso no encontrado') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al actualizar recurso' }));
        }
      }
    });
  }

  static async delete(req, res, id) {
    try {
      await ResourceModel.delete(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Recurso eliminado exitosamente'
      }));

    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      
      if (error.message === 'Recurso no encontrado') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al eliminar recurso' }));
      }
    }
  }

  static async getStats(req, res, proyecto_id) {
    try {
      const [totalCost, statsByType] = await Promise.all([
        ResourceModel.getTotalCostByProject(proyecto_id),
        ResourceModel.getStatsByType(proyecto_id)
      ]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        total_costo: totalCost.total_costo || 0,
        total_recursos: totalCost.total_recursos || 0,
        stats_por_tipo: statsByType
      }));

    } catch (error) {
      console.error('Error al obtener estadísticas de recursos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener estadísticas' }));
    }
  }
}

module.exports = ResourceController;

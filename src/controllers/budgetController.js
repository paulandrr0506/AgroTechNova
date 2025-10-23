const BudgetModel = require('../models/budgetModel');
const { isPositiveNumber } = require('../utils/validators');

class BudgetController {
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.proyecto_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El ID del proyecto es obligatorio' }));
          return;
        }

        if (!isPositiveNumber(data.monto_total)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El monto total debe ser un número positivo' }));
          return;
        }

        const existingBudget = await BudgetModel.findByProject(data.proyecto_id);
        if (existingBudget) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El proyecto ya tiene un presupuesto asignado' }));
          return;
        }

        const presupuesto = await BudgetModel.create(data);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Presupuesto creado exitosamente',
          presupuesto
        }));

      } catch (error) {
        console.error('Error al crear presupuesto:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al crear presupuesto' }));
      }
    });
  }

  static async getAll(req, res) {
    try {
      const presupuestos = await BudgetModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        presupuestos
      }));

    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener presupuestos' }));
    }
  }

  static async getById(req, res, id) {
    try {
      const presupuesto = await BudgetModel.findById(id);

      if (!presupuesto) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Presupuesto no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        presupuesto
      }));

    } catch (error) {
      console.error('Error al obtener presupuesto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener presupuesto' }));
    }
  }

  static async getByProject(req, res, proyecto_id) {
    try {
      const presupuesto = await BudgetModel.findByProject(proyecto_id);

      if (!presupuesto) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false,
          error: 'El proyecto no tiene presupuesto asignado',
          has_budget: false
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        has_budget: true,
        presupuesto
      }));

    } catch (error) {
      console.error('Error al obtener presupuesto del proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener presupuesto del proyecto' }));
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

        if (data.monto_total !== undefined && !isPositiveNumber(data.monto_total)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El monto total debe ser un número positivo' }));
          return;
        }

        const presupuesto = await BudgetModel.update(id, data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Presupuesto actualizado exitosamente',
          presupuesto
        }));

      } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        
        if (error.message === 'Presupuesto no encontrado') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al actualizar presupuesto' }));
        }
      }
    });
  }

  static async delete(req, res, id) {
    try {
      await BudgetModel.delete(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Presupuesto eliminado exitosamente'
      }));

    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      
      if (error.message === 'Presupuesto no encontrado') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al eliminar presupuesto' }));
      }
    }
  }

  static async getStatus(req, res, proyecto_id) {
    try {
      const status = await BudgetModel.getStatus(proyecto_id);

      if (!status) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Presupuesto no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        ...status
      }));

    } catch (error) {
      console.error('Error al obtener estado del presupuesto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener estado del presupuesto' }));
    }
  }

  static async checkAvailability(req, res, proyecto_id, monto) {
    try {
      const availability = await BudgetModel.checkAvailability(proyecto_id, monto);

      if (!availability) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Presupuesto no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tiene_disponible: availability.tiene_disponible === 1,
        monto_disponible: availability.monto_disponible
      }));

    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al verificar disponibilidad' }));
    }
  }
}

module.exports = BudgetController;

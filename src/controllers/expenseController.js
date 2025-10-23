const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const { isNotEmpty, isPositiveNumber } = require('../utils/validators');

class ExpenseController {
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

        if (!isNotEmpty(data.descripcion)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La descripción es obligatoria' }));
          return;
        }

        if (!isPositiveNumber(data.monto)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El monto debe ser un número positivo' }));
          return;
        }

        if (!data.fecha) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La fecha es obligatoria' }));
          return;
        }

        const budget = await BudgetModel.findByProject(data.proyecto_id);
        if (budget) {
          const availability = await BudgetModel.checkAvailability(data.proyecto_id, data.monto);
          if (!availability.tiene_disponible) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Presupuesto insuficiente',
              monto_disponible: availability.monto_disponible,
              monto_requerido: data.monto
            }));
            return;
          }
        }

        const gasto = await ExpenseModel.create(data);

        if (budget) {
          await BudgetModel.updateSpent(data.proyecto_id, data.monto);
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Gasto registrado exitosamente',
          gasto
        }));

      } catch (error) {
        console.error('Error al crear gasto:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al crear gasto' }));
      }
    });
  }

  static async getAll(req, res) {
    try {
      const gastos = await ExpenseModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        gastos
      }));

    } catch (error) {
      console.error('Error al obtener gastos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener gastos' }));
    }
  }

  static async getById(req, res, id) {
    try {
      const gasto = await ExpenseModel.findById(id);

      if (!gasto) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gasto no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        gasto
      }));

    } catch (error) {
      console.error('Error al obtener gasto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener gasto' }));
    }
  }

  static async getByProject(req, res, proyecto_id) {
    try {
      const gastos = await ExpenseModel.findByProject(proyecto_id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        gastos
      }));

    } catch (error) {
      console.error('Error al obtener gastos del proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener gastos del proyecto' }));
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

        if (data.monto !== undefined && !isPositiveNumber(data.monto)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El monto debe ser un número positivo' }));
          return;
        }

        const gasto = await ExpenseModel.update(id, data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Gasto actualizado exitosamente',
          gasto
        }));

      } catch (error) {
        console.error('Error al actualizar gasto:', error);
        
        if (error.message === 'Gasto no encontrado') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al actualizar gasto' }));
        }
      }
    });
  }

  static async delete(req, res, id) {
    try {
      const gasto = await ExpenseModel.findById(id);
      
      if (!gasto) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gasto no encontrado' }));
        return;
      }

      await ExpenseModel.delete(id);

      const budget = await BudgetModel.findByProject(gasto.proyecto_id);
      if (budget) {
        await BudgetModel.updateSpent(gasto.proyecto_id, -gasto.monto);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Gasto eliminado exitosamente'
      }));

    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al eliminar gasto' }));
    }
  }

  static async getStats(req, res, proyecto_id) {
    try {
      const [total, byCategory] = await Promise.all([
        ExpenseModel.getTotalByProject(proyecto_id),
        ExpenseModel.getByCategory(proyecto_id)
      ]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        total_gastado: total.total_gastado || 0,
        total_gastos: total.total_gastos || 0,
        por_categoria: byCategory
      }));

    } catch (error) {
      console.error('Error al obtener estadísticas de gastos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener estadísticas' }));
    }
  }
}

module.exports = ExpenseController;

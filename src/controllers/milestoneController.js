/**
 * CONTROLADOR DE HITOS - AGROTECHNOVA
 * 
 * Gestión de hitos dentro de fases de proyectos.
 * 
 * Cumple con:
 * - RF25: Seguimiento de hitos del proyecto
 */

const MilestoneModel = require('../models/milestoneModel');
const PhaseModel = require('../models/phaseModel');
const { isNotEmpty, isValidId } = require('../utils/validators');

class MilestoneController {
  /**
   * GET /api/phases/:phaseId/milestones
   * Lista todos los hitos de una fase
   */
  static async listByPhase(req, res, phaseId) {
    try {
      if (!isValidId(phaseId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID de fase inválido' }));
        return;
      }

      // Verificar que la fase existe
      const phase = await PhaseModel.findById(phaseId);
      if (!phase) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Fase no encontrada' }));
        return;
      }

      const milestones = await MilestoneModel.findByPhase(phaseId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        phaseId,
        phaseName: phase.nombre,
        milestones,
        count: milestones.length
      }));

    } catch (error) {
      console.error('❌ Error al listar hitos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener hitos' }));
    }
  }

  /**
   * GET /api/projects/:projectId/milestones
   * Lista todos los hitos de un proyecto (todas las fases)
   */
  static async listByProject(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID de proyecto inválido' }));
        return;
      }

      const milestones = await MilestoneModel.findByProject(projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projectId,
        milestones,
        count: milestones.length
      }));

    } catch (error) {
      console.error('❌ Error al listar hitos del proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener hitos' }));
    }
  }

  /**
   * GET /api/milestones/:id
   * Obtiene un hito específico
   */
  static async getById(req, res, milestoneId) {
    try {
      if (!isValidId(milestoneId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      const milestone = await MilestoneModel.findById(milestoneId);

      if (!milestone) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Hito no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        milestone
      }));

    } catch (error) {
      console.error('❌ Error al obtener hito:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener hito' }));
    }
  }

  /**
   * POST /api/phases/:phaseId/milestones
   * Crea un nuevo hito en una fase (RF25)
   */
  static async create(req, res, phaseId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(phaseId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID de fase inválido' }));
          return;
        }

        const { nombre, descripcion, fecha_limite, responsable_id } = JSON.parse(body);

        // Validaciones (RF25)
        if (!isNotEmpty(nombre, 3)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre debe tener al menos 3 caracteres' }));
          return;
        }

        if (!fecha_limite) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La fecha límite es obligatoria (RF25)' }));
          return;
        }

        // Verificar que la fase existe
        const phase = await PhaseModel.findById(phaseId);
        if (!phase) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Fase no encontrada' }));
          return;
        }

        // Usar el usuario autenticado como responsable si no se proporciona
        const finalResponsableId = responsable_id || req.session.userId;

        // Crear hito
        const milestoneId = await MilestoneModel.create({
          nombre,
          descripcion,
          fecha_limite,
          responsable_id: finalResponsableId,
          fase_id: phaseId
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Hito creado exitosamente',
          milestoneId
        }));

        console.log(`✅ Hito creado: ${nombre} (ID: ${milestoneId}) en fase ${phaseId}`);

      } catch (error) {
        console.error('❌ Error al crear hito:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al crear hito' }));
      }
    });
  }

  /**
   * PUT /api/milestones/:id
   * Actualiza un hito (RF25)
   * Auto-completa fecha_completado si estado = 'completado'
   */
  static async update(req, res, milestoneId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(milestoneId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const updates = JSON.parse(body);

        // Validar estado si se actualiza
        const validStates = ['pendiente', 'en_progreso', 'completado', 'retrasado'];
        if (updates.estado && !validStates.includes(updates.estado)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: `Estado inválido. Debe ser uno de: ${validStates.join(', ')}` 
          }));
          return;
        }

        // Actualizar hito (auto-timestamp implementado en modelo)
        await MilestoneModel.update(milestoneId, updates);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Hito actualizado exitosamente'
        }));

        if (updates.estado === 'completado') {
          console.log(`✅ Hito ${milestoneId} marcado como completado (fecha_completado auto-generada)`);
        } else {
          console.log(`✅ Hito ${milestoneId} actualizado`);
        }

      } catch (error) {
        console.error('❌ Error al actualizar hito:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al actualizar hito' }));
      }
    });
  }

  /**
   * DELETE /api/milestones/:id
   * Elimina un hito
   */
  static async delete(req, res, milestoneId) {
    try {
      if (!isValidId(milestoneId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      await MilestoneModel.delete(milestoneId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Hito eliminado exitosamente'
      }));

      console.log(`✅ Hito ${milestoneId} eliminado`);

    } catch (error) {
      console.error('❌ Error al eliminar hito:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al eliminar hito' }));
    }
  }

  /**
   * GET /api/projects/:projectId/stats
   * Obtiene estadísticas de hitos del proyecto (RF25)
   */
  static async getProjectStats(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID de proyecto inválido' }));
        return;
      }

      const stats = await MilestoneModel.getProjectStats(projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projectId,
        stats
      }));

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener estadísticas' }));
    }
  }

  /**
   * GET /api/milestones/my-milestones
   * Obtiene hitos asignados al usuario autenticado
   */
  static async getMyMilestones(req, res) {
    try {
      const userId = req.session.userId;
      const milestones = await MilestoneModel.findByResponsible(userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        milestones,
        count: milestones.length
      }));

    } catch (error) {
      console.error('❌ Error al obtener mis hitos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener hitos' }));
    }
  }
}

module.exports = MilestoneController;

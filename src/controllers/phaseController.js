/**
 * CONTROLADOR DE FASES - AGROTECHNOVA
 * 
 * Gestión de fases dentro de proyectos agroindustriales.
 * 
 * Cumple con:
 * - RF13: Seguimiento por fases del proyecto
 */

const PhaseModel = require('../models/phaseModel');
const ProjectModel = require('../models/projectModel');
const { isNotEmpty, isValidId } = require('../utils/validators');

class PhaseController {
  /**
   * GET /api/projects/:projectId/phases
   * Lista todas las fases de un proyecto
   */
  static async listByProject(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID de proyecto inválido' }));
        return;
      }

      // Verificar que el proyecto existe
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proyecto no encontrado' }));
        return;
      }

      const phases = await PhaseModel.findByProject(projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projectId,
        projectName: project.nombre,
        phases,
        count: phases.length
      }));

    } catch (error) {
      console.error('❌ Error al listar fases:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener fases' }));
    }
  }

  /**
   * GET /api/phases/:id
   * Obtiene una fase específica
   */
  static async getById(req, res, phaseId) {
    try {
      if (!isValidId(phaseId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      const phase = await PhaseModel.findById(phaseId);

      if (!phase) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Fase no encontrada' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        phase
      }));

    } catch (error) {
      console.error('❌ Error al obtener fase:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener fase' }));
    }
  }

  /**
   * POST /api/projects/:projectId/phases
   * Crea una nueva fase en un proyecto (RF13)
   */
  static async create(req, res, projectId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(projectId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID de proyecto inválido' }));
          return;
        }

        const { nombre, descripcion, fecha_inicio, fecha_fin, porcentaje_avance } = JSON.parse(body);

        // Validaciones (RF13)
        if (!isNotEmpty(nombre, 3)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre debe tener al menos 3 caracteres' }));
          return;
        }

        if (!fecha_inicio || !fecha_fin) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Las fechas de inicio y fin son obligatorias (RF13)' }));
          return;
        }

        // Validar que fecha_fin >= fecha_inicio
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La fecha de finalización no puede ser anterior a la de inicio' }));
          return;
        }

        // Verificar que el proyecto existe
        const project = await ProjectModel.findById(projectId);
        if (!project) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proyecto no encontrado' }));
          return;
        }

        // Crear fase
        const phaseId = await PhaseModel.create({
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          porcentaje_avance: porcentaje_avance || 0,
          proyecto_id: projectId
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Fase creada exitosamente',
          phaseId
        }));

        console.log(`✅ Fase creada: ${nombre} (ID: ${phaseId}) en proyecto ${projectId}`);

      } catch (error) {
        console.error('❌ Error al crear fase:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al crear fase' }));
      }
    });
  }

  /**
   * PUT /api/phases/:id
   * Actualiza una fase (RF13)
   */
  static async update(req, res, phaseId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(phaseId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const updates = JSON.parse(body);

        // Validar fechas si se actualizan
        if (updates.fecha_inicio && updates.fecha_fin) {
          if (new Date(updates.fecha_fin) < new Date(updates.fecha_inicio)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'La fecha de finalización no puede ser anterior a la de inicio' }));
            return;
          }
        }

        // Validar porcentaje si se actualiza
        if (updates.porcentaje_avance !== undefined) {
          const porcentaje = parseInt(updates.porcentaje_avance);
          if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'El porcentaje de avance debe estar entre 0 y 100' }));
            return;
          }
        }

        // Actualizar fase
        await PhaseModel.update(phaseId, updates);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Fase actualizada exitosamente'
        }));

        console.log(`✅ Fase ${phaseId} actualizada`);

      } catch (error) {
        console.error('❌ Error al actualizar fase:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al actualizar fase' }));
      }
    });
  }

  /**
   * DELETE /api/phases/:id
   * Elimina una fase
   */
  static async delete(req, res, phaseId) {
    try {
      if (!isValidId(phaseId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      await PhaseModel.delete(phaseId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Fase eliminada exitosamente'
      }));

      console.log(`✅ Fase ${phaseId} eliminada (CASCADE eliminará hitos asociados)`);

    } catch (error) {
      console.error('❌ Error al eliminar fase:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al eliminar fase' }));
    }
  }

  /**
   * GET /api/projects/:projectId/progress
   * Obtiene el progreso promedio del proyecto (RF13)
   */
  static async getProjectProgress(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID de proyecto inválido' }));
        return;
      }

      const progress = await PhaseModel.getProjectProgress(projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        ...progress
      }));

    } catch (error) {
      console.error('❌ Error al calcular progreso:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al calcular progreso' }));
    }
  }
}

module.exports = PhaseController;

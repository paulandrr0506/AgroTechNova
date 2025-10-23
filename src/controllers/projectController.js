/**
 * CONTROLADOR DE PROYECTOS - AGROTECHNOVA
 * 
 * Gestión de proyectos agroindustriales.
 * 
 * Cumple con:
 * - RF41: Registro de proyectos
 * - RF15: Edición de proyectos
 * - RF62: Búsqueda de proyectos por nombre, estado o fecha
 * - RF23: Categorización por sector productivo
 */

const ProjectModel = require('../models/projectModel');
const CategoryModel = require('../models/categoryModel');
const { isNotEmpty, isValidId } = require('../utils/validators');

class ProjectController {
  /**
   * GET /api/projects
   * Lista todos los proyectos
   */
  static async list(req, res) {
    try {
      const projects = await ProjectModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projects,
        count: projects.length
      }));

    } catch (error) {
      console.error('❌ Error al listar proyectos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener proyectos' }));
    }
  }

  /**
   * GET /api/projects/:id
   * Obtiene un proyecto específico
   */
  static async getById(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      const project = await ProjectModel.findById(projectId);

      if (!project) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proyecto no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        project
      }));

    } catch (error) {
      console.error('❌ Error al obtener proyecto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener proyecto' }));
    }
  }

  /**
   * POST /api/projects
   * Crea un nuevo proyecto (RF41)
   */
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { nombre, descripcion, fecha_inicio, fecha_fin, categoria_id, responsable_id } = JSON.parse(body);

        // Validaciones (RF41)
        if (!isNotEmpty(nombre, 3)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre debe tener al menos 3 caracteres' }));
          return;
        }

        if (!fecha_inicio || !fecha_fin) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Las fechas de inicio y fin son obligatorias' }));
          return;
        }

        // Validar que fecha_fin >= fecha_inicio (RF41)
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La fecha de finalización no puede ser anterior a la de inicio' }));
          return;
        }

        if (!isValidId(categoria_id)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Categoría inválida' }));
          return;
        }

        // Verificar que la categoría existe
        const category = await CategoryModel.findById(categoria_id);
        if (!category) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Categoría no encontrada' }));
          return;
        }

        // Usar el usuario autenticado como responsable si no se proporciona
        const finalResponsableId = responsable_id || req.session.userId;

        // Crear proyecto
        const projectId = await ProjectModel.create({
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          categoria_id,
          responsable_id: finalResponsableId
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Proyecto creado exitosamente',
          projectId
        }));

        console.log(`✅ Proyecto creado: ${nombre} (ID: ${projectId})`);

      } catch (error) {
        console.error('❌ Error al crear proyecto:', error);
        
        if (error.message.includes('nombre')) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al crear proyecto' }));
        }
      }
    });
  }

  /**
   * PUT /api/projects/:id
   * Actualiza un proyecto (RF15)
   * Restricción: Solo proyectos en "planificacion" o "ejecucion"
   */
  static async update(req, res, projectId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(projectId)) {
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

        // Actualizar proyecto (RF15 - valida estado internamente)
        await ProjectModel.update(projectId, updates);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Proyecto actualizado exitosamente'
        }));

        console.log(`✅ Proyecto ${projectId} actualizado`);

      } catch (error) {
        console.error('❌ Error al actualizar proyecto:', error);
        
        if (error.message.includes('estado')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else if (error.message.includes('nombre')) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al actualizar proyecto' }));
        }
      }
    });
  }

  /**
   * DELETE /api/projects/:id
   * Elimina un proyecto (solo en planificación)
   */
  static async delete(req, res, projectId) {
    try {
      if (!isValidId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      await ProjectModel.delete(projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      }));

      console.log(`✅ Proyecto ${projectId} eliminado`);

    } catch (error) {
      console.error('❌ Error al eliminar proyecto:', error);
      
      if (error.message.includes('planificación')) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al eliminar proyecto' }));
      }
    }
  }

  /**
   * GET /api/projects/search
   * Busca proyectos por filtros (RF62)
   */
  static async search(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const filters = {
        nombre: url.searchParams.get('nombre'),
        estado: url.searchParams.get('estado'),
        fecha_inicio: url.searchParams.get('fecha_inicio'),
        fecha_fin: url.searchParams.get('fecha_fin'),
        categoria_id: url.searchParams.get('categoria_id')
      };

      // Eliminar filtros null
      Object.keys(filters).forEach(key => {
        if (filters[key] === null) delete filters[key];
      });

      const projects = await ProjectModel.search(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projects,
        count: projects.length,
        filters
      }));

    } catch (error) {
      console.error('❌ Error al buscar proyectos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al buscar proyectos' }));
    }
  }

  /**
   * GET /api/projects/categories
   * Obtiene todas las categorías de proyecto (RF23)
   */
  static async getCategories(req, res) {
    try {
      const categories = await CategoryModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        categories
      }));

    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener categorías' }));
    }
  }

  /**
   * GET /api/projects/:id/my-projects
   * Obtiene proyectos del usuario autenticado
   */
  static async getMyProjects(req, res) {
    try {
      const userId = req.session.userId;
      const projects = await ProjectModel.findByResponsible(userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projects,
        count: projects.length
      }));

    } catch (error) {
      console.error('❌ Error al obtener mis proyectos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener proyectos' }));
    }
  }
}

module.exports = ProjectController;

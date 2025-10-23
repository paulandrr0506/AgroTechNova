const ReportController = require('../controllers/reportController');

const reportRoutes = (req, res) => {
  const { method, url } = req;
  const urlParts = url.split('?')[0].split('/').filter(Boolean);
  
  console.log('🔧 [reportRoutes] Procesando ruta de reportes');
  console.log('  - Method:', method);
  console.log('  - URL:', url);
  console.log('  - URL Parts:', urlParts);

  // GET /api/reports/financial/:proyectoId
  if (method === 'GET' && urlParts[2] === 'financial' && urlParts[3]) {
    return ReportController.getFinancialReport(
      { ...req, params: { proyectoId: urlParts[3] } },
      res
    );
  }

  // GET /api/reports/export/pdf/:proyectoId
  if (method === 'GET' && urlParts[2] === 'export' && urlParts[3] === 'pdf' && urlParts[4]) {
    return ReportController.exportToPDF(
      { ...req, params: { proyectoId: urlParts[4] } },
      res
    );
  }

  // GET /api/reports/export/excel/:proyectoId
  if (method === 'GET' && urlParts[2] === 'export' && urlParts[3] === 'excel' && urlParts[4]) {
    return ReportController.exportToExcel(
      { ...req, params: { proyectoId: urlParts[4] } },
      res
    );
  }

  // GET /api/reports/finished-projects
  if (method === 'GET' && urlParts[2] === 'finished-projects') {
    return ReportController.getFinishedProjects(req, res);
  }

  // GET /api/reports/consolidated
  if (method === 'GET' && urlParts[2] === 'consolidated') {
    return ReportController.getConsolidatedReport(req, res);
  }

  // Ruta no encontrada
  console.warn('⚠️ [reportRoutes] Ruta de reporte no encontrada');
  console.warn('  - Buscado:', urlParts.join('/'));
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta de reporte no encontrada', path: url }));
};

module.exports = reportRoutes;

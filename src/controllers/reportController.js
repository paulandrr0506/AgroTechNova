const ReportModel = require('../models/reportModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const ReportController = {
  /**
   * Obtener reporte financiero de un proyecto
   */
  getFinancialReport: (req, res) => {
    const { proyectoId } = req.params;

    ReportModel.getFinancialReport(proyectoId, (err, report) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Error al obtener reporte financiero',
          error: err.message
        }));
        return;
      }

      if (!report) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Proyecto no encontrado'
        }));
        return;
      }

      // Obtener detalles adicionales
      ReportModel.getExpensesByCategory(proyectoId, (err, expenses) => {
        ReportModel.getResourcesByType(proyectoId, (err2, resources) => {
          ReportModel.getInventoryMovements(proyectoId, (err3, inventory) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              report: {
                general: report,
                gastosPorCategoria: expenses || [],
                recursosPorTipo: resources || [],
                movimientosInventario: inventory || []
              }
            }));
          });
        });
      });
    });
  },

  /**
   * Exportar reporte financiero a PDF
   */
  exportToPDF: (req, res) => {
    const { proyectoId } = req.params;

    ReportModel.getFinancialReport(proyectoId, (err, report) => {
      if (err || !report) {
        return res.status(404).json({
          success: false,
          message: 'No se pudo generar el reporte'
        });
      }

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_financiero_${proyectoId}.pdf`);
      
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Reporte Financiero', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(report.proyecto_nombre, { align: 'center' });
      doc.moveDown(2);

      // Información general
      doc.fontSize(14).text('Información General', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Estado: ${report.estado}`);
      doc.text(`Fecha inicio: ${report.fecha_inicio || 'N/A'}`);
      doc.text(`Fecha fin: ${report.fecha_fin || 'N/A'}`);
      doc.moveDown();

      // Presupuesto
      doc.fontSize(14).text('Presupuesto', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Presupuesto total: $${(report.presupuesto_total || 0).toLocaleString('es-CO')}`);
      doc.text(`Gastado: $${(report.presupuesto_gastado || 0).toLocaleString('es-CO')}`);
      doc.text(`Disponible: $${(report.presupuesto_disponible || 0).toLocaleString('es-CO')}`);
      doc.text(`Ejecución: ${report.porcentaje_ejecucion || 0}%`);
      doc.moveDown();

      // Recursos
      doc.fontSize(14).text('Recursos', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total recursos: ${report.total_recursos || 0}`);
      doc.text(`Costo total: $${(report.costo_total_recursos || 0).toLocaleString('es-CO')}`);
      doc.moveDown();

      // Gastos
      doc.fontSize(14).text('Gastos', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total gastos: ${report.total_gastos || 0}`);
      doc.text(`Monto total: $${(report.total_monto_gastos || 0).toLocaleString('es-CO')}`);
      doc.moveDown();

      // Inventario
      doc.fontSize(14).text('Inventario', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Productos utilizados: ${report.productos_utilizados || 0}`);

      // Pie de página
      doc.moveDown(3);
      doc.fontSize(10).text(`Generado el: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });

      doc.end();
    });
  },

  /**
   * Exportar reporte financiero a Excel
   */
  exportToExcel: async (req, res) => {
    const { proyectoId } = req.params;

    ReportModel.getFinancialReport(proyectoId, async (err, report) => {
      if (err || !report) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'No se pudo generar el reporte'
        }));
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte Financiero');

        // Estilo de encabezados
        const headerStyle = {
          font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } },
          alignment: { vertical: 'middle', horizontal: 'center' }
        };

        // Título
        worksheet.mergeCells('A1:D1');
        worksheet.getCell('A1').value = 'REPORTE FINANCIERO';
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Información del proyecto
        worksheet.addRow(['Proyecto:', report.proyecto_nombre]);
        worksheet.addRow(['Estado:', report.estado]);
        worksheet.addRow(['Fecha inicio:', report.fecha_inicio || 'N/A']);
        worksheet.addRow(['Fecha fin:', report.fecha_fin || 'N/A']);
        worksheet.addRow([]);

        // Presupuesto
        worksheet.addRow(['PRESUPUESTO']);
        worksheet.getCell('A7').style = headerStyle;
        worksheet.addRow(['Concepto', 'Valor']);
        worksheet.getCell('A8').style = headerStyle;
        worksheet.getCell('B8').style = headerStyle;
        worksheet.addRow(['Presupuesto total', report.presupuesto_total || 0]);
        worksheet.addRow(['Gastado', report.presupuesto_gastado || 0]);
        worksheet.addRow(['Disponible', report.presupuesto_disponible || 0]);
        worksheet.addRow(['% Ejecución', `${report.porcentaje_ejecucion || 0}%`]);
        worksheet.addRow([]);

        // Recursos
        worksheet.addRow(['RECURSOS']);
        worksheet.getCell('A14').style = headerStyle;
        worksheet.addRow(['Total recursos', report.total_recursos || 0]);
        worksheet.addRow(['Costo total', report.costo_total_recursos || 0]);
        worksheet.addRow([]);

        // Gastos
        worksheet.addRow(['GASTOS']);
        worksheet.getCell('A18').style = headerStyle;
        worksheet.addRow(['Total gastos', report.total_gastos || 0]);
        worksheet.addRow(['Monto total', report.total_monto_gastos || 0]);

        // Ajustar ancho de columnas
        worksheet.getColumn('A').width = 25;
        worksheet.getColumn('B').width = 20;

        // Enviar archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_financiero_${proyectoId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error al generar Excel',
          error: error.message
        });
      }
    });
  },

  /**
   * Obtener proyectos finalizados
   */
  getFinishedProjects: (req, res) => {
    console.log('🔍 [reportController] Consultando proyectos finalizados...');
    ReportModel.getFinishedProjects((err, projects) => {
      if (err) {
        console.error('❌ [reportController] Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Error al obtener proyectos finalizados',
          error: err.message
        }));
        return;
      }

      console.log(`✅ [reportController] Proyectos encontrados: ${projects ? projects.length : 0}`);
      if (projects && projects.length > 0) {
        console.log('📦 [reportController] Primer proyecto:', projects[0]);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        projects: projects || []
      }));
    });
  },

  /**
   * Obtener reporte consolidado
   */
  getConsolidatedReport: (req, res) => {
    ReportModel.getConsolidatedReport((err, report) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Error al obtener reporte consolidado',
          error: err.message
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        report: report || {}
      }));
    });
  }
};

module.exports = ReportController;

// Script completo para generar modelos con Prisma
// Este archivo contiene plantillas de modelos completos actualizados

const MODELO_COMPLETO = {
  productModel: `
const prisma = require('../db/prisma-client');

class ProductModel {
  static async create(data) {
    return await prisma.product.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        categoria: data.categoria || null,
        unidad: data.unidad,
        stockActual: parseInt(data.stock_actual || data.stockActual || 0),
        stockMinimo: parseInt(data.stock_minimo || data.stockMinimo || 0),
        costoUnitario: parseFloat(data.costo_unitario || data.costoUnitario || 0),
        proveedorId: data.proveedor_id ? parseInt(data.proveedor_id) : null,
        descripcion: data.descripcion || null,
        esOrganico: Boolean(data.es_organico || data.esOrganico || false),
        estado: data.estado || 'activo'
      }
    });
  }

  static async findAll() {
    const productos = await prisma.product.findMany({
      include: { provider: true },
      orderBy: { nombre: 'asc' }
    });
    return productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      categoria: p.categoria,
      unidad: p.unidad,
      stock_actual: p.stockActual,
      stock_minimo: p.stockMinimo,
      costo_unitario: parseFloat(p.costoUnitario),
      proveedor_id: p.proveedorId,
      proveedor_nombre: p.provider?.nombre,
      descripcion: p.descripcion,
      es_organico: p.esOrganico,
      estado: p.estado,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));
  }

  static async findById(id) {
    const producto = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { provider: true }
    });
    if (!producto) return null;
    return {
      id: producto.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      categoria: producto.categoria,
      unidad: producto.unidad,
      stock_actual: producto.stockActual,
      stock_minimo: producto.stockMinimo,
      costo_unitario: parseFloat(producto.costoUnitario),
      proveedor_id: producto.proveedorId,
      proveedor_nombre: producto.provider?.nombre,
      descripcion: producto.descripcion,
      es_organico: producto.esOrganico,
      estado: producto.estado
    };
  }

  static async update(id, data) {
    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.unidad !== undefined) updateData.unidad = data.unidad;
    if (data.stock_actual !== undefined) updateData.stockActual = parseInt(data.stock_actual);
    if (data.stock_minimo !== undefined) updateData.stockMinimo = parseInt(data.stock_minimo);
    if (data.costo_unitario !== undefined) updateData.costoUnitario = parseFloat(data.costo_unitario);
    if (data.proveedor_id !== undefined) updateData.proveedorId = data.proveedor_id ? parseInt(data.proveedor_id) : null;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.es_organico !== undefined) updateData.esOrganico = Boolean(data.es_organico);
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }

  static async delete(id) {
    return await prisma.product.delete({
      where: { id: parseInt(id) }
    });
  }

  static async updateStock(id, cantidad) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stockActual: parseInt(cantidad) }
    });
  }
}

module.exports = ProductModel;
  `,

  providerModel: `
const prisma = require('../db/prisma-client');

class ProviderModel {
  static async create(data) {
    return await prisma.provider.create({
      data: {
        nombre: data.nombre,
        nit: data.nit || null,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        tipoProducto: data.tipo_producto || data.tipoProducto || null,
        calificacion: data.calificacion ? parseFloat(data.calificacion) : null,
        estado: data.estado || 'activo',
        notas: data.notas || null
      }
    });
  }

  static async findAll() {
    const proveedores = await prisma.provider.findMany({
      orderBy: { nombre: 'asc' }
    });
    return proveedores.map(p => ({
      id: p.id,
      nombre: p.nombre,
      nit: p.nit,
      contacto: p.contacto,
      telefono: p.telefono,
      email: p.email,
      direccion: p.direccion,
      tipo_producto: p.tipoProducto,
      calificacion: p.calificacion ? parseFloat(p.calificacion) : null,
      estado: p.estado,
      notas: p.notas,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));
  }

  static async findById(id) {
    const proveedor = await prisma.provider.findUnique({
      where: { id: parseInt(id) }
    });
    if (!proveedor) return null;
    return {
      id: proveedor.id,
      nombre: proveedor.nombre,
      nit: proveedor.nit,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      tipo_producto: proveedor.tipoProducto,
      calificacion: proveedor.calificacion ? parseFloat(proveedor.calificacion) : null,
      estado: proveedor.estado,
      notas: proveedor.notas
    };
  }

  static async update(id, data) {
    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.nit !== undefined) updateData.nit = data.nit;
    if (data.contacto !== undefined) updateData.contacto = data.contacto;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;
    if (data.tipo_producto !== undefined) updateData.tipoProducto = data.tipo_producto;
    if (data.calificacion !== undefined) updateData.calificacion = parseFloat(data.calificacion);
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.notas !== undefined) updateData.notas = data.notas;

    return await prisma.provider.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }

  static async delete(id) {
    return await prisma.provider.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = ProviderModel;
  `,

  inventoryModel: `
const prisma = require('../db/prisma-client');

class InventoryModel {
  static async createMovement(data) {
    return await prisma.inventoryMovement.create({
      data: {
        productoId: parseInt(data.producto_id),
        tipo: data.tipo,
        cantidad: parseInt(data.cantidad),
        costoUnitario: parseFloat(data.costo_unitario || 0),
        costoTotal: parseFloat(data.costo_total || 0),
        proyectoId: data.proyecto_id ? parseInt(data.proyecto_id) : null,
        usuarioId: parseInt(data.usuario_id),
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        descripcion: data.descripcion || null
      }
    });
  }

  static async findAll() {
    const movimientos = await prisma.inventoryMovement.findMany({
      include: {
        product: true,
        user: { select: { nombre: true } },
        project: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    return movimientos.map(m => ({
      id: m.id,
      producto_id: m.productoId,
      producto_nombre: m.product?.nombre,
      tipo: m.tipo,
      cantidad: m.cantidad,
      costo_unitario: parseFloat(m.costoUnitario),
      costo_total: parseFloat(m.costoTotal),
      proyecto_id: m.proyectoId,
      proyecto_nombre: m.project?.nombre,
      usuario_id: m.usuarioId,
      usuario_nombre: m.user?.nombre,
      fecha: m.fecha,
      descripcion: m.descripcion,
      created_at: m.createdAt
    }));
  }

  static async findByProduct(productoId) {
    const movimientos = await prisma.inventoryMovement.findMany({
      where: { productoId: parseInt(productoId) },
      include: {
        user: { select: { nombre: true } },
        project: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    return movimientos.map(m => ({
      id: m.id,
      tipo: m.tipo,
      cantidad: m.cantidad,
      costo_unitario: parseFloat(m.costoUnitario),
      costo_total: parseFloat(m.costoTotal),
      proyecto_id: m.proyectoId,
      proyecto_nombre: m.project?.nombre,
      usuario_nombre: m.user?.nombre,
      fecha: m.fecha,
      descripcion: m.descripcion
    }));
  }

  static async findByProject(proyectoId) {
    const movimientos = await prisma.inventoryMovement.findMany({
      where: { proyectoId: parseInt(proyectoId) },
      include: {
        product: true,
        user: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    return movimientos.map(m => ({
      id: m.id,
      producto_nombre: m.product?.nombre,
      tipo: m.tipo,
      cantidad: m.cantidad,
      costo_total: parseFloat(m.costoTotal),
      usuario_nombre: m.user?.nombre,
      fecha: m.fecha,
      descripcion: m.descripcion
    }));
  }

  static async getStockSummary() {
    const productos = await prisma.product.findMany({
      where: { estado: 'activo' },
      select: {
        id: true,
        nombre: true,
        stockActual: true,
        stockMinimo: true,
        unidad: true
      }
    });
    return productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      stock_actual: p.stockActual,
      stock_minimo: p.stockMinimo,
      unidad: p.unidad,
      alerta: p.stockActual <= p.stockMinimo
    }));
  }
}

module.exports = InventoryModel;
  `
};

console.log('📝 Plantillas de modelos generadas');
console.log('Ejecuta apply-prisma-models.js para aplicar estos modelos');

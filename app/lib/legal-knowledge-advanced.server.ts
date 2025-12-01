import { db } from "./db.server";

/**
 * Sistema avanzado de gestión de conocimiento legal
 * Estructura organizada por áreas, subáreas y normas
 */

// ============= ÁREAS DE DERECHO =============

export async function getAllAreas() {
  return db.areaDerecho.findMany({
    include: {
      _count: {
        select: { subareas: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function createArea(data: { nombre: string; descripcion: string }) {
  console.log(`📋 Creating legal area: ${data.nombre}`);
  return db.areaDerecho.create({ data });
}

export async function updateArea(id: string, data: { nombre?: string; descripcion?: string }) {
  return db.areaDerecho.update({
    where: { id },
    data
  });
}

export async function deleteArea(id: string) {
  return db.areaDerecho.delete({ where: { id } });
}

// ============= SUBÁREAS DE DERECHO =============

export async function getAllSubareas() {
  return db.subareaDerecho.findMany({
    include: {
      area: true,
      _count: {
        select: {
          normasSubareas: true,
          conceptosJuridicos: true
        }
      }
    },
    orderBy: [{ area: { nombre: 'asc' } }, { nombre: 'asc' }]
  });
}

export async function getSubareasByArea(areaId: string) {
  return db.subareaDerecho.findMany({
    where: { areaId },
    include: {
      _count: {
        select: {
          normasSubareas: true,
          conceptosJuridicos: true
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function createSubarea(data: {
  areaId: string;
  nombre: string;
  descripcion: string;
}) {
  console.log(`📑 Creating subarea: ${data.nombre}`);
  return db.subareaDerecho.create({ data });
}

export async function updateSubarea(id: string, data: {
  nombre?: string;
  descripcion?: string;
}) {
  return db.subareaDerecho.update({
    where: { id },
    data
  });
}

export async function deleteSubarea(id: string) {
  return db.subareaDerecho.delete({ where: { id } });
}

// ============= NORMAS =============

export async function getAllNormas() {
  return db.norma.findMany({
    include: {
      _count: {
        select: { normasSubareas: true }
      }
    },
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }]
  });
}

export async function createNorma(data: {
  tipo: string;
  nombre: string;
  anio?: number;
  descripcion: string;
}) {
  console.log(`⚖️ Creating norm: ${data.nombre}`);
  return db.norma.create({ data });
}

export async function updateNorma(id: string, data: {
  tipo?: string;
  nombre?: string;
  anio?: number;
  descripcion?: string;
}) {
  return db.norma.update({
    where: { id },
    data
  });
}

export async function deleteNorma(id: string) {
  return db.norma.delete({ where: { id } });
}

// ============= RELACIONES NORMA-SUBÁREA =============

export async function assignNormaToSubarea(subareaId: string, normaId: string) {
  console.log(`🔗 Assigning norm to subarea`);
  return db.normaSubarea.create({
    data: { subareaId, normaId }
  });
}

export async function removeNormaFromSubarea(subareaId: string, normaId: string) {
  return db.normaSubarea.deleteMany({
    where: {
      subareaId,
      normaId
    }
  });
}

export async function getNormasBySubarea(subareaId: string) {
  const normasSubareas = await db.normaSubarea.findMany({
    where: { subareaId },
    include: {
      norma: true
    }
  });

  return normasSubareas.map(ns => ns.norma);
}

// ============= CONCEPTOS JURÍDICOS =============

export async function getConceptosBySubarea(subareaId: string) {
  return db.conceptoJuridico.findMany({
    where: { subareaId },
    orderBy: { concepto: 'asc' }
  });
}

export async function createConcepto(data: {
  subareaId: string;
  concepto: string;
  definicion: string;
  fuente?: string;
}) {
  console.log(`📖 Creating legal concept: ${data.concepto}`);
  return db.conceptoJuridico.create({ data });
}

export async function updateConcepto(id: string, data: {
  concepto?: string;
  definicion?: string;
  fuente?: string;
}) {
  return db.conceptoJuridico.update({
    where: { id },
    data
  });
}

export async function deleteConcepto(id: string) {
  return db.conceptoJuridico.delete({ where: { id } });
}

// ============= BÚSQUEDA Y CONTEXTO =============

export async function searchKnowledge(query: string) {
  const [areas, subareas, normas, conceptos] = await Promise.all([
    db.areaDerecho.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    db.subareaDerecho.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { area: true },
      take: 5
    }),
    db.norma.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    db.conceptoJuridico.findMany({
      where: {
        OR: [
          { concepto: { contains: query, mode: 'insensitive' } },
          { definicion: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        subarea: {
          include: { area: true }
        }
      },
      take: 5
    })
  ]);

  return { areas, subareas, normas, conceptos };
}

export async function getContextForQuery(query: string) {
  const results = await searchKnowledge(query);
  
  let context = "CONTEXTO LEGAL DISPONIBLE:\n\n";
  
  if (results.areas.length > 0) {
    context += "ÁREAS RELEVANTES:\n";
    results.areas.forEach(a => {
      context += `- ${a.nombre}: ${a.descripcion}\n`;
    });
    context += "\n";
  }
  
  if (results.normas.length > 0) {
    context += "NORMAS APLICABLES:\n";
    results.normas.forEach(n => {
      context += `- ${n.nombre} ${n.anio ? `(${n.anio})` : ''}: ${n.descripcion}\n`;
    });
    context += "\n";
  }
  
  if (results.conceptos.length > 0) {
    context += "CONCEPTOS JURÍDICOS:\n";
    results.conceptos.forEach(c => {
      context += `- ${c.concepto}: ${c.definicion}\n`;
      if (c.fuente) context += `  Fuente: ${c.fuente}\n`;
    });
  }
  
  return context;
}

// ============= INICIALIZACIÓN DE DATOS BASE =============

export async function initializeLegalKnowledge() {
  console.log(`🎓 Initializing legal knowledge base...`);
  
  // Verificar si ya existe data
  const existingAreas = await db.areaDerecho.count();
  if (existingAreas > 0) {
    console.log(`⚠️ Legal knowledge already initialized (${existingAreas} areas)`);
    return { success: false, message: "Knowledge base already exists" };
  }
  
  // Crear áreas base
  const areaCivil = await db.areaDerecho.create({
    data: {
      nombre: "Derecho Civil",
      descripcion: "Regula las relaciones entre particulares, incluyendo personas, bienes, contratos y responsabilidad civil"
    }
  });

  const areaPenal = await db.areaDerecho.create({
    data: {
      nombre: "Derecho Penal",
      descripcion: "Regula los delitos, las penas y las medidas de seguridad aplicables a quienes los cometen"
    }
  });

  const areaLaboral = await db.areaDerecho.create({
    data: {
      nombre: "Derecho Laboral",
      descripcion: "Regula las relaciones entre trabajadores y empleadores, incluyendo contratos, salarios y prestaciones"
    }
  });

  // Crear subáreas para Civil
  const subareaContratos = await db.subareaDerecho.create({
    data: {
      areaId: areaCivil.id,
      nombre: "Contratos",
      descripcion: "Acuerdos de voluntades entre dos o más partes para crear, modificar o extinguir obligaciones"
    }
  });

  // Crear normas base
  const codigoCivil = await db.norma.create({
    data: {
      tipo: "Principal",
      nombre: "Código Civil Colombiano",
      anio: 1887,
      descripcion: "Ley 57 de 1887, regula las relaciones civiles y patrimoniales entre particulares"
    }
  });

  const codigoPenal = await db.norma.create({
    data: {
      tipo: "Principal",
      nombre: "Código Penal",
      anio: 2000,
      descripcion: "Ley 599 de 2000, establece los delitos y penas en Colombia"
    }
  });

  // Asignar norma a subárea
  await db.normaSubarea.create({
    data: {
      subareaId: subareaContratos.id,
      normaId: codigoCivil.id
    }
  });

  // Crear conceptos jurídicos
  await db.conceptoJuridico.create({
    data: {
      subareaId: subareaContratos.id,
      concepto: "Contrato",
      definicion: "Acuerdo de voluntades entre dos o más personas para crear, modificar o extinguir obligaciones",
      fuente: "Código Civil Colombiano, Artículo 1495"
    }
  });

  console.log(`✅ Legal knowledge base initialized successfully`);
  return { success: true, message: "Knowledge base created" };
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdvancedLegalKnowledge() {
  console.log('🌱 Seeding advanced legal knowledge system...');

  // Crear configuración de IA por defecto
  const aiConfig = await prisma.configuracionIA.upsert({
    where: { id: 'default' }, // Usaremos un ID fijo
    update: {},
    create: {
      modeloActivo: 'gemini',
      apiKeyGemini: process.env.GEMINI_API_KEY,
      temperaturaGlobal: 0.7,
      maxTokensRespuesta: 2048,
      ventanaContexto: 20
    }
  });

  console.log(`✅ AI Config created: ${aiConfig.id}`);

  // Crear áreas de derecho base
  const areaCivil = await prisma.areaDerecho.create({
    data: {
      nombre: 'Derecho Civil',
      descripcion: 'Regula las relaciones entre particulares, incluyendo personas, bienes, contratos y responsabilidad civil'
    }
  });

  const areaPenal = await prisma.areaDerecho.create({
    data: {
      nombre: 'Derecho Penal',
      descripcion: 'Regula los delitos, las penas y las medidas de seguridad aplicables a quienes los cometen'
    }
  });

  const areaLaboral = await prisma.areaDerecho.create({
    data: {
      nombre: 'Derecho Laboral',
      descripcion: 'Regula las relaciones entre trabajadores y empleadores'
    }
  });

  const areaFamilia = await prisma.areaDerecho.create({
    data: {
      nombre: 'Derecho de Familia',
      descripcion: 'Regula las relaciones familiares, matrimonio, divorcio, filiación y alimentos'
    }
  });

  console.log(`✅ Created 4 legal areas`);

  // Crear subáreas para Derecho Civil
  const subareaContratos = await prisma.subareaDerecho.create({
    data: {
      areaId: areaCivil.id,
      nombre: 'Contratos',
      descripcion: 'Acuerdos de voluntades entre dos o más partes para crear, modificar o extinguir obligaciones'
    }
  });

  const subareaPropiedad = await prisma.subareaDerecho.create({
    data: {
      areaId: areaCivil.id,
      nombre: 'Propiedad y Derechos Reales',
      descripcion: 'Regula la propiedad, posesión y otros derechos sobre bienes'
    }
  });

  // Crear subáreas para Derecho Laboral
  const subareaContratosLaborales = await prisma.subareaDerecho.create({
    data: {
      areaId: areaLaboral.id,
      nombre: 'Contratos de Trabajo',
      descripcion: 'Regulación de la relación laboral entre empleador y trabajador'
    }
  });

  const subareaPrestaciones = await prisma.subareaDerecho.create({
    data: {
      areaId: areaLaboral.id,
      nombre: 'Prestaciones Sociales',
      descripcion: 'Beneficios y derechos económicos del trabajador'
    }
  });

  console.log(`✅ Created subareas`);

  // Crear normas principales
  const codigoCivil = await prisma.norma.create({
    data: {
      tipo: 'Principal',
      nombre: 'Código Civil Colombiano',
      anio: 1887,
      descripcion: 'Ley 57 de 1887, regula las relaciones civiles y patrimoniales entre particulares'
    }
  });

  const codigoPenal = await prisma.norma.create({
    data: {
      tipo: 'Principal',
      nombre: 'Código Penal',
      anio: 2000,
      descripcion: 'Ley 599 de 2000, establece los delitos y penas en Colombia'
    }
  });

  const codigoTrabajo = await prisma.norma.create({
    data: {
      tipo: 'Principal',
      nombre: 'Código Sustantivo del Trabajo',
      anio: 1950,
      descripcion: 'Decreto 2663 de 1950, regula las relaciones laborales'
    }
  });

  const codigoFamilia = await prisma.norma.create({
    data: {
      tipo: 'Principal',
      nombre: 'Código de la Infancia y la Adolescencia',
      anio: 2006,
      descripcion: 'Ley 1098 de 2006, garantiza los derechos de niños y adolescentes'
    }
  });

  console.log(`✅ Created main norms`);

  // Asignar normas a subáreas
  await prisma.normaSubarea.createMany({
    data: [
      { subareaId: subareaContratos.id, normaId: codigoCivil.id },
      { subareaId: subareaPropiedad.id, normaId: codigoCivil.id },
      { subareaId: subareaContratosLaborales.id, normaId: codigoTrabajo.id },
      { subareaId: subareaPrestaciones.id, normaId: codigoTrabajo.id }
    ]
  });

  console.log(`✅ Assigned norms to subareas`);

  // Crear conceptos jurídicos
  await prisma.conceptoJuridico.createMany({
    data: [
      {
        subareaId: subareaContratos.id,
        concepto: 'Contrato',
        definicion: 'Acuerdo de voluntades entre dos o más personas para crear, modificar o extinguir obligaciones',
        fuente: 'Código Civil Colombiano, Artículo 1495'
      },
      {
        subareaId: subareaContratos.id,
        concepto: 'Oferta',
        definicion: 'Propuesta que una persona hace a otra para celebrar un contrato',
        fuente: 'Código Civil Colombiano, Artículo 845'
      },
      {
        subareaId: subareaContratosLaborales.id,
        concepto: 'Contrato de Trabajo',
        definicion: 'Acuerdo mediante el cual una persona se obliga a prestar un servicio personal a otra, bajo continuada dependencia o subordinación',
        fuente: 'Código Sustantivo del Trabajo, Artículo 22'
      },
      {
        subareaId: subareaPrestaciones.id,
        concepto: 'Cesantías',
        definicion: 'Prestación social que el empleador debe pagar al trabajador equivalente a un mes de salario por cada año de servicio',
        fuente: 'Código Sustantivo del Trabajo, Artículo 249'
      }
    ]
  });

  console.log(`✅ Created legal concepts`);
  console.log(`🎉 Advanced legal knowledge system seeded successfully!`);
}

async function main() {
  try {
    await seedAdvancedLegalKnowledge();
  } catch (error) {
    console.error('Error seeding advanced legal knowledge:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

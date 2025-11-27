import { db } from "./db.server";
import crypto from "crypto";

export interface LegalAreaData {
  name: string;
  description: string;
  mainLaw: string;
  complementaryLaws: Array<{
    lawName: string;
    lawNumber?: string;
    description?: string;
  }>;
}

// Datos iniciales de las áreas legales colombianas
export const COLOMBIAN_LEGAL_AREAS: LegalAreaData[] = [
  {
    name: "Derecho Constitucional",
    description: "Derechos fundamentales, acciones constitucionales, organización del Estado, control de constitucionalidad",
    mainLaw: "Constitución Política de Colombia (1991)",
    complementaryLaws: [
      { lawName: "Ley 137 de 1994", description: "Estados de excepción" },
      { lawName: "Ley 270 de 1996", description: "Estatutaria de la Administración de Justicia" },
      { lawName: "Jurisprudencia Corte Constitucional", description: "Precedentes constitucionales" }
    ]
  },
  {
    name: "Derecho Administrativo", 
    description: "Función pública, contratación estatal, responsabilidad del Estado, control disciplinario, servicios públicos",
    mainLaw: "Ley 1437 de 2011 (CPACA)",
    complementaryLaws: [
      { lawName: "Ley 80 de 1993", description: "Estatuto General de Contratación" },
      { lawName: "Ley 1150 de 2007", description: "Contratación pública" },
      { lawName: "Ley 734 de 2002", description: "Código Disciplinario Único" }
    ]
  },
  {
    name: "Derecho Civil",
    description: "Personas, familia, bienes, sucesiones, obligaciones y contratos, responsabilidad civil",
    mainLaw: "Código Civil (Ley 57 de 1887)",
    complementaryLaws: [
      { lawName: "Ley 29 de 1982", description: "Igualdad jurídica de los sexos" },
      { lawName: "Ley 1098 de 2006", description: "Código de la Infancia y la Adolescencia" }
    ]
  },
  {
    name: "Derecho Laboral y de la Seguridad Social",
    description: "Relaciones laborales, pensiones, riesgos laborales",
    mainLaw: "Código Sustantivo del Trabajo",
    complementaryLaws: [
      { lawName: "Ley 100 de 1993", description: "Sistema de Seguridad Social" },
      { lawName: "Ley 797 de 2003", description: "Reformas al sistema pensional" },
      { lawName: "Ley 1562 de 2012", description: "Sistema de Riesgos Laborales" }
    ]
  },
  {
    name: "Derecho Penal",
    description: "Derecho penal sustantivo y procesal, ejecución de penas",
    mainLaw: "Ley 599 de 2000 (Código Penal)",
    complementaryLaws: [
      { lawName: "Ley 906 de 2004", description: "Código de Procedimiento Penal" },
      { lawName: "Ley 65 de 1993", description: "Código Penitenciario y Carcelario" }
    ]
  },
  {
    name: "Derecho Comercial",
    description: "Sociedades, contratos mercantiles, títulos valores, propiedad industrial",
    mainLaw: "Código de Comercio (Decreto 410 de 1971)",
    complementaryLaws: [
      { lawName: "Ley 1116 de 2006", description: "Régimen de Insolvencia Empresarial" },
      { lawName: "Ley 256 de 1996", description: "Normas sobre competencia desleal" }
    ]
  },
  {
    name: "Derecho Financiero y Económico",
    description: "Bancario, mercado de valores, asegurador, cambiario",
    mainLaw: "Decreto 663 de 1993 (EOSF)",
    complementaryLaws: [
      { lawName: "Ley 964 de 2005", description: "Mercado de valores" },
      { lawName: "Resoluciones del Banco de la República", description: "Política monetaria y cambiaria" }
    ]
  },
  {
    name: "Derecho Tributario",
    description: "Impuestos nacionales y territoriales, procedimientos tributarios",
    mainLaw: "Decreto 624 de 1989 (Estatuto Tributario)",
    complementaryLaws: [
      { lawName: "Ley 1607 de 2012", description: "Reforma tributaria" },
      { lawName: "Ley 1819 de 2016", description: "Reforma tributaria estructural" }
    ]
  }
];

export async function initializeLegalAreas(): Promise<{ success: boolean; created: number; error?: string }> {
  console.log("🏛️ Initializing Colombian legal areas...");
  
  try {
    let createdCount = 0;
    
    for (const areaData of COLOMBIAN_LEGAL_AREAS) {
      // Verificar si ya existe
      const existing = await db.legalArea.findUnique({
        where: { name: areaData.name }
      });
      
      if (!existing) {
        // Crear área legal
        const legalArea = await db.legalArea.create({
          data: {
            name: areaData.name,
            description: areaData.description,
            mainLaw: areaData.mainLaw
          }
        });
        
        // Crear leyes complementarias
        for (const law of areaData.complementaryLaws) {
          await db.legalComplementaryLaw.create({
            data: {
              legalAreaId: legalArea.id,
              lawName: law.lawName,
              lawNumber: law.lawNumber,
              description: law.description
            }
          });
        }
        
        createdCount++;
        console.log(`✅ Created legal area: ${areaData.name}`);
      } else {
        console.log(`⏭️ Legal area already exists: ${areaData.name}`);
      }
    }
    
    console.log(`🎉 Legal areas initialization completed. Created: ${createdCount}`);
    return { success: true, created: createdCount };
    
  } catch (error) {
    console.error("💥 Error initializing legal areas:", error);
    return { 
      success: false, 
      created: 0,
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function getAllLegalAreas() {
  return db.legalArea.findMany({
    include: {
      complementaryLaws: true,
      _count: {
        select: {
          aiResponses: true,
          consultations: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getLegalAreaByName(name: string) {
  return db.legalArea.findUnique({
    where: { name },
    include: {
      complementaryLaws: true
    }
  });
}

export async function identifyLegalArea(query: string): Promise<string | null> {
  console.log(`🔍 Identifying legal area for query: "${query.substring(0, 50)}..."`);
  
  const lowerQuery = query.toLowerCase();
  
  // Palabras clave por área legal
  const keywordMap: Record<string, string[]> = {
    "Derecho Constitucional": ["constitucional", "derechos fundamentales", "tutela", "amparo", "constitución"],
    "Derecho Administrativo": ["contratación estatal", "función pública", "servidor público", "licitación", "cpaca"],
    "Derecho Civil": ["matrimonio", "divorcio", "herencia", "sucesión", "obligaciones", "contratos", "propiedad"],
    "Derecho Laboral y de la Seguridad Social": ["trabajo", "laboral", "despido", "pensión", "salario", "contrato laboral"],
    "Derecho Penal": ["penal", "delito", "hurto", "homicidio", "proceso penal", "fiscalía"],
    "Derecho Comercial": ["sociedad", "empresa", "comercial", "mercantil", "cámara de comercio"],
    "Derecho Tributario": ["impuesto", "tributario", "dian", "renta", "iva", "declaración"],
    "Derecho de Familia y del Menor": ["familia", "menor", "custodia", "alimentos", "adopción", "violencia intrafamiliar"]
  };
  
  for (const [areaName, keywords] of Object.entries(keywordMap)) {
    const hasKeyword = keywords.some(keyword => lowerQuery.includes(keyword));
    if (hasKeyword) {
      console.log(`📋 Identified legal area: ${areaName}`);
      return areaName;
    }
  }
  
  console.log(`❓ Could not identify specific legal area`);
  return null;
}

export async function getLegalContext(areaName: string): Promise<string> {
  const legalArea = await getLegalAreaByName(areaName);
  
  if (!legalArea) {
    return "";
  }
  
  let context = `Área Legal: ${legalArea.name}\n`;
  context += `Descripción: ${legalArea.description}\n`;
  context += `Normativa principal: ${legalArea.mainLaw}\n`;
  
  if (legalArea.complementaryLaws.length > 0) {
    context += `Leyes complementarias:\n`;
    legalArea.complementaryLaws.forEach(law => {
      context += `- ${law.lawName}${law.description ? `: ${law.description}` : ''}\n`;
    });
  }
  
  return context;
}

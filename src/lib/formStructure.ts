import type { MaterialsState } from "@/types";


const toCamelCase = (name: string): string => {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]+(.)?/g, (_match, chr) => chr ? chr.toUpperCase() : '').replace(/^\d+/, '');
};

const primaryNames = "LONA; MESCLA; N. 70 PLASTIF; VERNIZ; FACTO; CRISTAL 0,20; BEG-FLEX; CORANO; N. AMASSADO; TACTEL; CÓRDOBA LIGT; CORANO / MESCLA; LNA SUCAM; ATLANTA;".split(';').map(s => s.trim());
const secondaryNames = "CETIM; RESINADO; LEITOSO 15MM; ESPUMA PACK 4mm; VIVO; ZIPER NORMAL 6º; CURSOR NORMAL 6º; FITA-0,30 CA; Corano BB; ALKELIN; VERNIZ; NAYLON 600; CRISTAL 0,20; CRISTAL 0,30; NYLON 70; MARCELHA; FACTO; TELA FELPS OURO-PTA; TELA FELPS CORES; NAYLON 70; BOX 1.2; PERUGIA; TNT 60; TNT 40; FELTRO BOLSAS (Niver); N. ESPUMADO; ESPUMA 1CM; NEW-PRIME; TACTEL; LAMINADO TERMICO; ESPUMA PACK 6mm; VIVO; ESTAGUETE; ZIPPER Nº 3; ZIPER NORMAL 8º; CURSOR NORMAL 8º; CURSOR Nº 3; CURSOR ESPECIAL; FITA SILICONE; FITA 0,30 CBR; FITA-0,25; FITA-0,40; FITA-30 ALG; FITA-40 ALG; TELA TULI; TELA AERADA; CRAVO PLASTICO; REG. METAL 0,25mm; REG. METAL 0,30mm; REG. METAL 0,40mm; REG. PLÁS 0,25mm; REG. PLÁS 0,30mm; REG. PLÁS 0,40mm; PASSSADOR METAL 0,40mm; CORDÃO 4/2; CORDÃO 5/2; CORDA CRUA (GROSSA); CORRENTE_BOLINHA; B. PRESSÃO; B. IMÃ; BOTÃO PRESSÃO PLÁSTICO; REBITE PEQUENO; PUCHADOR DE PLÁSTICO 0,30mm; FECHO 0,25; FEICHE 0,30; FECHE 0,40; CASTELINHO 0,30 PLÁS; TRIÂNGULO PLÁSTICO 30mm; TRIÂNGULO METAL 0,30; MOSQ.+TRIÂNGOLO 0,30 - METAL; MEIA ARGOLA METAL 0,40 (GROSSA); MEIA-ARGOLA 0,30 METAL; MEIA-ARGOLA 0,25 METAL; ILHÓS Nº 45; ILHÓS Nº 5 GARRA; MOSQ. PLÁS 0,30; MOSQ. 0,30 LX; MOSQ. CHAVEIRO; PAPELÃO; PÉ DE MALA / PLÁSTICO; Macaquinho Focinho de porco; MANGUEIRA 5mm 7mm; GORGURÃO; VIÉS 0,30; ELASTICO; VELCO - 38m; VELCRO 16m; OMBREIRA 40mm; FIBRA VIRGEM; CARRINHO PLÁSTICO; SUBLIMAÇÃO / GRANDE / PEQUENA; ETIQUETA".split(';').map(s => s.trim());
const extraNames = "EMBALAGEM; LINHA; PINTURA; COMISSÃO; COSTURA; COMISSÃO COSTURA; FGTS-FÉRIAS ETC...; SALÁRIO FUNCIONÁRIOS; DESP. EXTRAS".split(';').map(s => s.trim());


const createCategory = (names: string[]) => {
  const category: Record<string, any> = {};
  names.forEach(name => {
    const id = toCamelCase(name);
    if (id && !category[id]) {
      category[id] = { name, cost: 0, unit: 'un' };
    }
  });
  return category;
};

export const initialMaterialsState: MaterialsState = {
  primary: createCategory(primaryNames),
  secondary: createCategory(secondaryNames),
  extra: createCategory(extraNames),
};
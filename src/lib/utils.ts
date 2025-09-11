import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

  export const sanitizeForFilename = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

export function formatMaterialName(name: string): string {
  return name.replace(/_/g, ' ');
}


export const downloadCsvLocally = (csvContent: string, filename: string) => {
  console.log("Iniciando download local como fallback.");
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



export const findOrCreateFolder = async (name: string, parentId: string, accessToken: string): Promise<string> => {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`;

  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    console.log(`Pasta '${name}' encontrada com ID: ${searchData.files[0].id}`);
    return searchData.files[0].id;
  }

  console.log(`Pasta '${name}' não encontrada. Criando...`);
  const folderMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  };
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(folderMetadata)
  });
  const createData = await createRes.json();
  console.log(`Pasta '${name}' criada com ID: ${createData.id}`);
  return createData.id;
};
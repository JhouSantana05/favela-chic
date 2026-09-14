/**
 * Serviço de processamento e compressão de fotos capturadas pela câmera ou selecionadas da galeria.
 * Otimiza resolução e reduz o peso em bytes para armazenamento instantâneo no navegador (IndexedDB).
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp';
}

/**
 * Converte e comprime um arquivo de imagem (File/Blob) para Base64 comprimido
 */
export async function compressImageFile(
  file: File | Blob,
  options: ProcessImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1080,
    maxHeight = 1350, // proporção 4:5 ideal para moda/streetwear
    quality = 0.82,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const dataUrl = drawAndCompress(img, maxWidth, maxHeight, quality, format);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Captura um frame atual de um elemento HTMLVideoElement (da câmera do usuário) e retorna como Base64 comprimido
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  options: ProcessImageOptions = {}
): string {
  const {
    maxWidth = 1080,
    maxHeight = 1350,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return drawAndCompress(video, maxWidth, maxHeight, quality, format);
}

function drawAndCompress(
  source: HTMLImageElement | HTMLVideoElement,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  format: 'image/jpeg' | 'image/webp'
): string {
  const canvas = document.createElement('canvas');
  const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.naturalWidth;
  const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Dimensões da imagem/vídeo inválidas');
  }

  // Calcular proporções para ajuste
  let width = sourceWidth;
  let height = sourceHeight;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter o contexto 2D do canvas');
  }

  // Desenhar com suavização de alta qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  return canvas.toDataURL(format, quality);
}

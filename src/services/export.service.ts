/**
 * export.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Export and ZIP generation for FORGE.
 * Renders pieces at production resolution, applies platform-specific compression,
 * organizes into folders, generates INDEX.txt, and downloads as ZIP.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getFormatById, PLATFORM_FOLDER_MAP } from '../constants/formats';
import type { GeneratedPiece } from '../types/composition.types';
import type { FormatSpec } from '../types/format.types';
import { renderPiece, renderToDataUrl, deserializeCanvas } from './renderer.service';
import * as fabric from 'fabric';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportedFile {
  fileName: string;
  platform: string;
  platformLabel: string;
  formatName: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a data URL to a Uint8Array (binary).
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Invalid data URL');
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Build the standard file name for an exported piece.
 * Pattern: {platform}-{slug}-{width}x{height}.{ext}
 */
function buildFileName(format: FormatSpec): string {
  return `${format.slug}-${format.width}x${format.height}.${format.file_format}`;
}

/**
 * Format bytes to human-readable size (KB or MB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get today's date as YYYYMMDD string.
 */
function getDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Render a piece to a production-resolution data URL.
 * If the piece has a serialized canvas_state, restore it.
 * Otherwise, re-render from the composition instruction.
 */
async function renderPieceToProduction(
  piece: GeneratedPiece,
  imageDataUrl: string,
  logoDataUrl?: string,
): Promise<{ dataUrl: string; format: FormatSpec }> {
  const format = getFormatById(piece.format_id);
  if (!format) {
    throw new Error(`Unknown format: ${piece.format_id}`);
  }

  // Compression as a 0-1 quality value
  const quality = format.compression / 100;
  const outputFormat = format.file_format === 'png' ? 'png' : 'jpeg';

  let canvas: fabric.Canvas;

  if (piece.canvas_state) {
    // Restore from serialized state
    const canvasEl = document.createElement('canvas');
    canvasEl.width = format.width;
    canvasEl.height = format.height;
    canvas = new fabric.Canvas(canvasEl, {
      width: format.width,
      height: format.height,
    });
    await deserializeCanvas(canvas, piece.canvas_state);
  } else {
    // Re-render from instruction
    canvas = await renderPiece(piece.composition, imageDataUrl, logoDataUrl);
  }

  const dataUrl = renderToDataUrl(canvas, outputFormat, quality);

  // Clean up canvas
  canvas.dispose();

  return { dataUrl, format };
}

// ---------------------------------------------------------------------------
// INDEX.txt generation
// ---------------------------------------------------------------------------

/**
 * Generate the INDEX.txt content for the export ZIP.
 * Includes metadata for every exported file grouped by platform.
 */
export function generateIndex(
  files: ExportedFile[],
  campaignName: string,
  brandName: string,
  intention: string,
): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const lines: string[] = [
    'FORGE -- Brand Asset Generator',
    `Export: ${campaignName} -- ${date}`,
    `Marca: ${brandName}`,
    `Intencion: ${intention.toUpperCase()}`,
    '\u2500'.repeat(56),
    '',
  ];

  // Group files by platform
  const grouped = new Map<string, ExportedFile[]>();
  for (const file of files) {
    const group = grouped.get(file.platformLabel) || [];
    group.push(file);
    grouped.set(file.platformLabel, group);
  }

  let totalSize = 0;

  for (const [platformLabel, platformFiles] of grouped) {
    lines.push(platformLabel.toUpperCase());
    lines.push('\u2500'.repeat(platformLabel.length));

    for (const file of platformFiles) {
      totalSize += file.sizeBytes;
      lines.push(file.fileName);
      lines.push(`  Plataforma: ${file.platformLabel}`);
      lines.push(`  Dimensiones: ${file.width} x ${file.height} px (${file.aspectRatio})`);
      lines.push(`  Tamano: ${formatFileSize(file.sizeBytes)}`);
      if (file.notes) {
        lines.push(`  Nota: ${file.notes}`);
      }
      lines.push('');
    }
  }

  lines.push('\u2500'.repeat(56));
  lines.push(`Total archivos: ${files.length}`);
  lines.push(`Tamano total: ${formatFileSize(totalSize)}`);
  lines.push('Generado con FORGE -- forge.app');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export all pieces as a ZIP file.
 *
 * 1. Renders each piece at production resolution
 * 2. Applies platform-specific compression
 * 3. Creates ZIP with folder structure by platform
 * 4. Generates INDEX.txt
 * 5. Downloads the ZIP via FileSaver
 *
 * @param pieces - Array of generated pieces to export
 * @param campaignName - Name of the campaign (used in ZIP filename)
 * @param brandName - Brand name (for INDEX.txt)
 * @param intention - Communication intention (for INDEX.txt)
 * @param imageDataUrl - Source image data URL (for re-rendering)
 * @param logoDataUrl - Optional logo data URL
 * @param onProgress - Optional progress callback (pieceIndex, totalPieces)
 */
export async function exportPieces(
  pieces: GeneratedPiece[],
  campaignName: string,
  brandName: string,
  intention: string,
  imageDataUrl: string,
  logoDataUrl?: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  if (!pieces.length) {
    throw new Error('No pieces to export.');
  }

  const zip = new JSZip();
  const exportedFiles: ExportedFile[] = [];

  // Create platform folders
  const folders = new Map<string, JSZip>();

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    // Report progress
    if (onProgress) {
      onProgress(i + 1, pieces.length);
    }

    try {
      const { dataUrl, format } = await renderPieceToProduction(piece, imageDataUrl, logoDataUrl);
      const bytes = dataUrlToBytes(dataUrl);
      const fileName = buildFileName(format);

      // Get or create platform folder
      const folderName = PLATFORM_FOLDER_MAP[format.platform] || format.platform;
      if (!folders.has(folderName)) {
        folders.set(folderName, zip.folder(folderName)!);
      }
      const folder = folders.get(folderName)!;

      // Add file to ZIP
      folder.file(fileName, bytes);

      // Track for INDEX.txt
      exportedFiles.push({
        fileName: `${folderName}/${fileName}`,
        platform: format.platform,
        platformLabel: format.platform_label,
        formatName: format.name,
        width: format.width,
        height: format.height,
        aspectRatio: format.aspect_ratio,
        sizeBytes: bytes.length,
        notes: format.notes,
      });
    } catch (error) {
      console.error(`Failed to export piece ${piece.format_id}:`, error);
      // Continue with other pieces
    }
  }

  // Generate INDEX.txt
  const indexContent = generateIndex(exportedFiles, campaignName, brandName, intention);
  zip.file('INDEX.txt', indexContent);

  // Generate and download ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const sanitizedCampaign = campaignName.replace(/[^a-zA-Z0-9_-]/g, '-');
  const sanitizedBrand = brandName.replace(/[^a-zA-Z0-9_-]/g, '-');
  const zipName = `FORGE-${sanitizedBrand}-${sanitizedCampaign}-${getDateString()}.zip`;

  saveAs(blob, zipName);
}

/**
 * Export a single piece as a direct download (no ZIP).
 *
 * @param piece - The piece to export
 * @param imageDataUrl - Source image data URL
 * @param logoDataUrl - Optional logo data URL
 */
export async function exportSinglePiece(
  piece: GeneratedPiece,
  imageDataUrl: string,
  logoDataUrl?: string,
): Promise<void> {
  const { dataUrl, format } = await renderPieceToProduction(piece, imageDataUrl, logoDataUrl);
  const fileName = buildFileName(format);

  // Convert data URL to blob for download
  const bytes = dataUrlToBytes(dataUrl);
  const mimeType = format.file_format === 'png' ? 'image/png' : 'image/jpeg';
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });

  saveAs(blob, fileName);
}

import sharp from 'sharp';
import Potrace from 'potrace';
import { optimize } from 'svgo';
import { parse } from 'svg-parser';

export interface ProcessingOptions {
  /** Output format - 'svg' or 'png' */
  outputFormat: 'svg' | 'png';
  /** Strategy for PNG generation */
  pngStrategy?: 'vectorize' | 'threshold';
  /** Final binarization threshold (0-255) applied to PNG output */
  finalThreshold?: number;
  /** Render scale before downscaling for extra crispness (e.g. 2 or 3) */
  rasterScale?: number;
  /** SVG stroke aesthetics (applied when vectorizing) */
  strokeLineCap?: 'butt' | 'round' | 'square';
  strokeLineJoin?: 'miter' | 'round' | 'bevel';
  strokeMiterLimit?: number;
  /** Line thickness for SVG output */
  strokeWidth?: number;
  /** Color for the line art */
  strokeColor?: string;
  /** Background color (for PNG output) */
  backgroundColor?: string;
  /** Threshold for edge detection (0-255) */
  threshold?: number;
  /** Optimize SVG paths */
  optimizeSvg?: boolean;
  /** Maximum width/height for output */
  maxSize?: number;
  /** Target size for consistent scaling */
  targetSize?: {
    width: number;
    height: number;
  };
  /** Size preset for common tattoo sizes */
  sizePreset?: 'small' | 'medium' | 'large' | 'custom';
  /** Maintain aspect ratio when scaling */
  maintainAspectRatio?: boolean;
}

export interface ProcessingResult {
  /** Processed image as buffer */
  buffer: Buffer;
  /** Output format */
  format: 'svg' | 'png';
  /** Original dimensions */
  originalDimensions: { width: number; height: number };
  /** Processed dimensions */
  processedDimensions: { width: number; height: number };
  /** Processing metadata */
  metadata: {
    processingTime: number;
    optimizationsApplied: string[];
  };
}

/**
 * Process an AI-generated tattoo image into clean line art
 */
export class TattooImageProcessor {
  private defaultOptions: ProcessingOptions = {
    outputFormat: 'png', // Default to PNG for high quality
    pngStrategy: 'threshold',
    strokeWidth: 2,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    threshold: 128,
    finalThreshold: 210,
    rasterScale: 2,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    strokeMiterLimit: 2,
    optimizeSvg: true,
    maxSize: 2048,
    sizePreset: 'medium',
    maintainAspectRatio: true,
  };

  // Size presets for common tattoo dimensions
  private sizePresets = {
    small: { width: 256, height: 256 },
    medium: { width: 512, height: 512 },
    large: { width: 1024, height: 1024 },
  };

  /**
   * Process an image buffer into clean line art
   */
  async processImage(
    inputBuffer: Buffer,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };
    const optimizationsApplied: string[] = [];

    try {
      // First, process the image with Sharp to clean it up
      const cleanedBuffer = await this.preprocessImage(inputBuffer, opts);
      
      // Detect if input is already SVG
      const isSvgInput = this.isSvgBuffer(inputBuffer);
      
      if (opts.outputFormat === 'svg') {
        if (isSvgInput) {
          // Optimize existing SVG
          const optimizedSvg = await this.optimizeSvg(inputBuffer, opts);
          optimizationsApplied.push('svg_optimization');
          
          return {
            buffer: Buffer.from(optimizedSvg),
            format: 'svg',
            originalDimensions: await this.getImageDimensions(inputBuffer),
            processedDimensions: await this.getSvgDimensions(optimizedSvg),
            metadata: {
              processingTime: Date.now() - startTime,
              optimizationsApplied,
            },
          };
        } else {
          // Convert to SVG using Potrace
          const svgBuffer = await this.convertToSvg(cleanedBuffer, opts);
          optimizationsApplied.push('raster_to_svg_conversion');
          
          return {
            buffer: svgBuffer,
            format: 'svg',
            originalDimensions: await this.getImageDimensions(inputBuffer),
            processedDimensions: await this.getSvgDimensions(svgBuffer.toString()),
            metadata: {
              processingTime: Date.now() - startTime,
              optimizationsApplied,
            },
          };
        }
      } else {
        // Output PNG
        if (opts.pngStrategy === 'threshold') {
          // Direct raster cleanup path (may leave artifacts on some inputs)
          const lineArtBuffer = await this.extractLineArt(cleanedBuffer, opts);
          optimizationsApplied.push('line_art_extraction');

          return {
            buffer: lineArtBuffer,
            format: 'png',
            originalDimensions: await this.getImageDimensions(inputBuffer),
            processedDimensions: await this.getImageDimensions(lineArtBuffer),
            metadata: {
              processingTime: Date.now() - startTime,
              optimizationsApplied,
            },
          };
        }

        // Vectorize to SVG first, then rasterize back to PNG for very clean edges
        let svgString: string;
        if (isSvgInput) {
          svgString = await this.optimizeSvg(inputBuffer, opts);
          optimizationsApplied.push('svg_optimization');
        } else {
          const svgBuffer = await this.convertToSvg(cleanedBuffer, opts);
          optimizationsApplied.push('raster_to_svg_conversion');
          svgString = opts.optimizeSvg ? await this.optimizeSvg(svgBuffer, opts) : svgBuffer.toString();
        }

        const pngBuffer = await this.rasterizeSvgToPng(svgString, opts);
        optimizationsApplied.push('vectorize_then_rasterize');

        return {
          buffer: pngBuffer,
          format: 'png',
          originalDimensions: await this.getImageDimensions(inputBuffer),
          processedDimensions: await this.getImageDimensions(pngBuffer),
          metadata: {
            processingTime: Date.now() - startTime,
            optimizationsApplied,
          },
        };
      }
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocess image to clean up noise and enhance edges
   */
  private async preprocessImage(inputBuffer: Buffer, opts: ProcessingOptions): Promise<Buffer> {
    // Determine target size
    const targetSize = this.getTargetSize(opts);
    
    let pipeline = sharp(inputBuffer);

    // Apply consistent scaling with high quality
    if (targetSize) {
      const resizeOptions = opts.maintainAspectRatio !== false 
        ? { 
            width: targetSize.width, 
            height: targetSize.height, 
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
            kernel: sharp.kernel.lanczos3 // High quality scaling
          }
        : { 
            width: targetSize.width, 
            height: targetSize.height, 
            fit: 'fill', // Stretch to exact dimensions
            kernel: sharp.kernel.lanczos3 // High quality scaling
          };
      
      pipeline = pipeline.resize(resizeOptions);
    } else {
      // Fallback to maxSize if no target size specified
      pipeline = pipeline.resize(opts.maxSize, opts.maxSize, { 
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      });
    }

    pipeline = pipeline.greyscale();

    // Apply advanced edge enhancement and noise reduction for PNG output
    if (opts.outputFormat === 'png') {
      pipeline = pipeline
        .normalize()
        .sharpen({ 
          sigma: 2.0,    // Increased sharpening
          m1: 0.5, 
          m2: 3, 
          x1: 2, 
          y2: 10 
        })
        .median(2)       // Reduced median filter for sharper lines
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 9, -1, -1, -1, -1] // Edge enhancement kernel
        });
    } else {
      // Standard processing for SVG
      pipeline = pipeline
        .normalize()
        .sharpen({ sigma: 1.5, m1: 0.5, m2: 3, x1: 2, y2: 10 })
        .median(3);
    }

    return await pipeline.png({ compressionLevel: 0 }).toBuffer();
  }

  /**
   * Get target size based on options
   */
  private getTargetSize(opts: ProcessingOptions): { width: number; height: number } | null {
    if (opts.targetSize) {
      return opts.targetSize;
    }
    
    if (opts.sizePreset && opts.sizePreset !== 'custom') {
      return this.sizePresets[opts.sizePreset];
    }
    
    return null;
  }

  /**
   * Convert raster image to SVG using Potrace
   */
  private async convertToSvg(inputBuffer: Buffer, opts: ProcessingOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const params = {
        threshold: opts.threshold || 128,
        color: 'auto',
        background: 'transparent',
        optTolerance: 0.4,
        turdSize: 2,
        turnPolicy: Potrace.Potrace.TURNPOLICY_MINORITY,
      };

      Potrace.trace(inputBuffer, params, (err, svg) => {
        if (err) {
          reject(err);
          return;
        }

        // Apply stroke styling
        let styledSvg = svg
          .replace(/stroke="none"/g, `stroke="${opts.strokeColor || '#000000'}"`)
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${opts.strokeWidth || 2}"`)
          .replace(/fill="none"/g, 'fill="none"');

        // Add stroke if not present
        if (!styledSvg.includes('stroke=')) {
          styledSvg = styledSvg.replace(/<path/g, `<path stroke="${opts.strokeColor || '#000000'}" stroke-width="${opts.strokeWidth || 2}"`);
        }

        // Apply line aesthetics
        const lineCap = opts.strokeLineCap || 'round';
        const lineJoin = opts.strokeLineJoin || 'round';
        const miter = opts.strokeMiterLimit || 2;
        styledSvg = styledSvg.replace(/<path/g, `<path stroke-linecap="${lineCap}" stroke-linejoin="${lineJoin}" stroke-miterlimit="${miter}"`);

        // Apply consistent sizing to SVG
        const targetSize = this.getTargetSize(opts);
        if (targetSize) {
          styledSvg = this.applySvgSizing(styledSvg, targetSize);
        }

        resolve(Buffer.from(styledSvg));
      });
    });
  }

  /**
   * Extract clean line art from processed image
   */
  private async extractLineArt(inputBuffer: Buffer, opts: ProcessingOptions): Promise<Buffer> {
    // Attempt to dynamically import node-canvas. If unavailable (e.g., on Vercel),
    // fall back to vectorize->rasterize pipeline that doesn't require native deps.
    let canvasLib: any = null;
    try {
      canvasLib = await import('canvas');
    } catch {}

    if (!canvasLib) {
      // Fallback: vectorize to SVG then rasterize to PNG using sharp only
      const svgBuffer = await this.convertToSvg(inputBuffer, opts);
      const svgString = opts.optimizeSvg ? await this.optimizeSvg(svgBuffer, opts) : svgBuffer.toString();
      return await this.rasterizeSvgToPng(svgString, opts);
    }

    const { createCanvas, loadImage, ImageData } = canvasLib;

    // Load image into canvas for advanced processing
    const image = await loadImage(inputBuffer);

    // Determine final canvas size
    const targetSize = this.getTargetSize(opts);
    const canvasWidth = targetSize ? targetSize.width : image.width;
    const canvasHeight = targetSize ? targetSize.height : image.height;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set background color if specified
    if (opts.backgroundColor && opts.backgroundColor !== 'transparent') {
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw image with proper scaling
    if (targetSize && opts.maintainAspectRatio !== false) {
      const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      const x = (canvasWidth - scaledWidth) / 2;
      const y = (canvasHeight - scaledHeight) / 2;
      ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    } else {
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    }

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply advanced edge detection and cleanup
    const cleanedData = this.applyAdvancedLineArtProcessing(data, canvas.width, canvas.height, opts);

    // Put cleaned data back
    const cleanedImageData = new ImageData(cleanedData, canvas.width, canvas.height);
    ctx.putImageData(cleanedImageData, 0, 0);

    // Convert to high-quality PNG buffer
    return Buffer.from(canvas.toBuffer('image/png'));
  }

  /**
   * Apply advanced line art processing for high-quality PNG output
   */
  private applyAdvancedLineArtProcessing(
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    opts: ProcessingOptions
  ): Uint8ClampedArray {
    const threshold = opts.threshold || 128;
    const cleanedData = new Uint8ClampedArray(data.length);
    const transparentBg = !opts.backgroundColor || opts.backgroundColor === 'transparent';
    const bgRgb = transparentBg ? { r: 255, g: 255, b: 255 } : this.parseColorToRgb(opts.backgroundColor as string);
    
    // First pass: Basic thresholding
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // R channel (already grayscale)
      
      if (gray > threshold) {
        // Background
        if (transparentBg) {
          cleanedData[i] = 0;     // R
          cleanedData[i + 1] = 0; // G
          cleanedData[i + 2] = 0; // B
          cleanedData[i + 3] = 0; // A (transparent)
        } else {
          cleanedData[i] = bgRgb.r;     // R
          cleanedData[i + 1] = bgRgb.g; // G
          cleanedData[i + 2] = bgRgb.b; // B
          cleanedData[i + 3] = 255;     // A
        }
      } else {
        // Black line
        cleanedData[i] = 0;       // R
        cleanedData[i + 1] = 0;   // G
        cleanedData[i + 2] = 0;   // B
        cleanedData[i + 3] = 255; // A
      }
    }

    // Second pass: Noise reduction and edge smoothing
    const smoothedData = new Uint8ClampedArray(cleanedData.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Check 3x3 neighborhood
        let blackNeighbors = 0;
        let totalNeighbors = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
            if (neighborIdx >= 0 && neighborIdx < cleanedData.length) {
              totalNeighbors++;
              if (cleanedData[neighborIdx] === 0) {
                blackNeighbors++;
              }
            }
          }
        }
        
        // Apply smoothing rules
        const currentPixel = cleanedData[idx];
        const blackRatio = blackNeighbors / totalNeighbors;
        
        if (currentPixel === 0) {
          // Black pixel - keep it if it has at least 2 black neighbors
          if (blackNeighbors >= 2) {
            smoothedData[idx] = 0;
            smoothedData[idx + 1] = 0;
            smoothedData[idx + 2] = 0;
            smoothedData[idx + 3] = 255;
          } else {
            // Convert isolated black pixels to white
            smoothedData[idx] = 255;
            smoothedData[idx + 1] = 255;
            smoothedData[idx + 2] = 255;
            smoothedData[idx + 3] = 255;
          }
        } else {
          // White pixel - convert to black if surrounded by mostly black
          if (blackRatio >= 0.6) {
            smoothedData[idx] = 0;
            smoothedData[idx + 1] = 0;
            smoothedData[idx + 2] = 0;
            smoothedData[idx + 3] = 255;
          } else {
            smoothedData[idx] = 255;
            smoothedData[idx + 1] = 255;
            smoothedData[idx + 2] = 255;
            smoothedData[idx + 3] = 255;
          }
        }
      }
    }

    // Copy border pixels (skip processing for now)
    for (let i = 0; i < width * 4; i++) {
      smoothedData[i] = cleanedData[i]; // Top border
      smoothedData[(height - 1) * width * 4 + i] = cleanedData[(height - 1) * width * 4 + i]; // Bottom border
    }
    
    for (let y = 0; y < height; y++) {
      const leftIdx = y * width * 4;
      const rightIdx = leftIdx + (width - 1) * 4;
      smoothedData[leftIdx] = cleanedData[leftIdx]; // Left border
      smoothedData[leftIdx + 1] = cleanedData[leftIdx + 1];
      smoothedData[leftIdx + 2] = cleanedData[leftIdx + 2];
      smoothedData[leftIdx + 3] = cleanedData[leftIdx + 3];
      smoothedData[rightIdx] = cleanedData[rightIdx]; // Right border
      smoothedData[rightIdx + 1] = cleanedData[rightIdx + 1];
      smoothedData[rightIdx + 2] = cleanedData[rightIdx + 2];
      smoothedData[rightIdx + 3] = cleanedData[rightIdx + 3];
    }

    return smoothedData;
  }

  /** Parse common CSS hex color formats to RGB */
  private parseColorToRgb(color: string): { r: number; g: number; b: number } {
    if (!color) return { r: 255, g: 255, b: 255 };
    const c = color.trim();
    // #RRGGBB
    const long = /^#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/;
    const short = /^#?([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/;
    let m = c.match(long);
    if (m) {
      return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
    }
    m = c.match(short);
    if (m) {
      return {
        r: parseInt(m[1] + m[1], 16),
        g: parseInt(m[2] + m[2], 16),
        b: parseInt(m[3] + m[3], 16),
      };
    }
    // Fallback white
    return { r: 255, g: 255, b: 255 };
  }

  /**
   * Optimize existing SVG
   */
  private async optimizeSvg(svgBuffer: Buffer, opts: ProcessingOptions): Promise<string> {
    const svgString = svgBuffer.toString();
    
    const result = optimize(svgString, {
      plugins: [
        'preset-default',
        {
          name: 'removeViewBox',
          active: false, // Keep viewBox for scaling
        },
        {
          name: 'cleanupNumericValues',
          params: {
            floatPrecision: 2, // Reduce precision for smaller files
          },
        },
        {
          name: 'convertPathData',
          params: {
            floatPrecision: 2,
          },
        },
      ],
    });

    let optimizedSvg = result.data;

    // Apply consistent styling
    if (opts.strokeColor || opts.strokeWidth) {
      optimizedSvg = this.applySvgStyling(optimizedSvg, opts);
    }

    return optimizedSvg;
  }

  /**
   * Rasterize SVG string to PNG buffer with sharp at high density
   */
  private async rasterizeSvgToPng(svgString: string, opts: ProcessingOptions): Promise<Buffer> {
    const targetSize = this.getTargetSize(opts) ?? { width: 1024, height: 1024 };
    const scale = Math.max(1, Math.min(4, opts.rasterScale || 2));

    // Ensure XML header for better compatibility
    const svg = svgString.startsWith('<?xml') ? svgString : `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

    // Step 1: render bigger for crisp edges
    const big = await sharp(Buffer.from(svg))
      .resize({
        width: targetSize.width * scale,
        height: targetSize.height * scale,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: opts.backgroundColor === 'transparent' ? 0 : 1 },
        kernel: sharp.kernel.lanczos3,
      })
      .png({ compressionLevel: 0 })
      .toBuffer();

    // Step 2: build a clean binary alpha mask from luminance
    const threshold = opts.finalThreshold ?? 210;
    let mask = await sharp(big)
      .greyscale()
      .threshold(threshold) // white background (255), black lines (0)
      .negate()             // lines -> 255, background -> 0
      .median(1)            // remove salt/pepper specks
      .extractChannel(0)
      .toBuffer();

    // Compose pure black with the alpha mask (black lines on transparent)
    const blackRGB = await sharp({
      create: {
        width: targetSize.width * scale,
        height: targetSize.height * scale,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();

    let rgba = await sharp(blackRGB).joinChannel(mask).png({ compressionLevel: 0 }).toBuffer();

    // Optional: flatten onto solid background if requested
    if (opts.backgroundColor && opts.backgroundColor !== 'transparent') {
      rgba = await sharp(rgba)
        .flatten({ background: opts.backgroundColor })
        .png({ compressionLevel: 0 })
        .toBuffer();
    }

    // Step 3: downscale using nearest for sharp edges
    const finalPng = await sharp(rgba)
      .resize({
        width: targetSize.width,
        height: targetSize.height,
        fit: 'fill',
        kernel: sharp.kernel.nearest,
      })
      .png({ compressionLevel: 0 })
      .toBuffer();

    return finalPng;
  }

  /**
   * Apply consistent sizing to SVG
   */
  private applySvgSizing(svg: string, targetSize: { width: number; height: number }): string {
    // Remove existing width and height attributes to avoid redefinition
    let sizedSvg = svg
      .replace(/width="[^"]*"/g, '')
      .replace(/height="[^"]*"/g, '')
      .replace(/\s+/g, ' '); // Clean up extra spaces

    // Update SVG dimensions properly
    sizedSvg = sizedSvg.replace(
      /<svg([^>]*)>/,
      `<svg$1 width="${targetSize.width}" height="${targetSize.height}">`
    );

    // Ensure viewBox is set for proper scaling
    if (!sizedSvg.includes('viewBox=')) {
      sizedSvg = sizedSvg.replace(
        /<svg([^>]*)>/,
        `<svg$1 viewBox="0 0 ${targetSize.width} ${targetSize.height}">`
      );
    }

    return sizedSvg;
  }

  /**
   * Apply consistent styling to SVG
   */
  private applySvgStyling(svg: string, opts: ProcessingOptions): string {
    let styledSvg = svg;

    // Apply stroke properties
    if (opts.strokeColor) {
      styledSvg = styledSvg.replace(/stroke="[^"]*"/g, `stroke="${opts.strokeColor}"`);
      // Add stroke to elements that don't have it
      styledSvg = styledSvg.replace(/<(path|line|polyline|polygon|circle|ellipse|rect)([^>]*?)(?:\s+stroke="[^"]*")?([^>]*?)>/g, 
        (match, tag, before, after) => {
          if (!match.includes('stroke=')) {
            return `<${tag}${before} stroke="${opts.strokeColor}"${after}>`;
          }
          return match;
        });
    }

    if (opts.strokeWidth) {
      styledSvg = styledSvg.replace(/stroke-width="[^"]*"/g, `stroke-width="${opts.strokeWidth}"`);
      // Add stroke-width to elements that don't have it
      styledSvg = styledSvg.replace(/<(path|line|polyline|polygon|circle|ellipse|rect)([^>]*?)(?:\s+stroke-width="[^"]*")?([^>]*?)>/g, 
        (match, tag, before, after) => {
          if (!match.includes('stroke-width=')) {
            return `<${tag}${before} stroke-width="${opts.strokeWidth}"${after}>`;
          }
          return match;
        });
    }

    return styledSvg;
  }

  /**
   * Check if buffer contains SVG data
   */
  private isSvgBuffer(buffer: Buffer): boolean {
    const str = buffer.toString('utf8', 0, Math.min(200, buffer.length));
    return str.toLowerCase().includes('<svg');
  }

  /**
   * Get image dimensions from buffer
   */
  private async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  /**
   * Get SVG dimensions from SVG string
   */
  private async getSvgDimensions(svgString: string): Promise<{ width: number; height: number }> {
    try {
      const ast = parse(svgString);
      const svgElement = ast.children.find((child: any) => child.tagName === 'svg');
      
      if (svgElement?.properties) {
        const width = svgElement.properties.width;
        const height = svgElement.properties.height;
        
        return {
          width: typeof width === 'string' ? parseInt(width) : (width as number) || 0,
          height: typeof height === 'string' ? parseInt(height) : (height as number) || 0,
        };
      }
    } catch (error) {
      // Fallback: try to parse viewBox
      const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch) {
        const [, , width, height] = viewBoxMatch[1].split(' ').map(Number);
        return { width, height };
      }
    }
    
    return { width: 0, height: 0 };
  }
}

// Export singleton instance
export const tattooImageProcessor = new TattooImageProcessor();

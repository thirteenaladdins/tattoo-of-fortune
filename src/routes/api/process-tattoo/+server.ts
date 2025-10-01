import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tattooImageProcessor, type ProcessingOptions } from '$lib/utils/imageProcessor.js';

/**
 * POST /api/process-tattoo
 * Process AI-generated tattoo images into clean line art
 * 
 * Body:
 * - image: File (multipart/form-data) or base64 string
 * - options: ProcessingOptions (optional)
 * 
 * Returns:
 * - processedImage: base64 encoded processed image
 * - format: 'svg' | 'png'
 * - metadata: processing information
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      return handleMultipartRequest(request);
    } else if (contentType.includes('application/json')) {
      return handleJsonRequest(request);
    } else {
      throw error(400, 'Unsupported content type. Use multipart/form-data or application/json.');
    }
  } catch (err) {
    console.error('Tattoo processing error:', err);
    
    if (err instanceof Error) {
      if (err.message.includes('Unsupported content type')) {
        throw error(400, err.message);
      }
      if (err.message.includes('No image provided')) {
        throw error(400, err.message);
      }
      if (err.message.includes('Invalid image format')) {
        throw error(400, err.message);
      }
    }
    
    throw error(500, 'Failed to process tattoo image');
  }
};

async function handleMultipartRequest(request: Request) {
  const formData = await request.formData();
  const imageFile = formData.get('image') as File;
  const optionsString = formData.get('options') as string;
  
  if (!imageFile) {
    throw error(400, 'No image provided');
  }
  
  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!allowedTypes.includes(imageFile.type)) {
    throw error(400, 'Invalid image format. Supported formats: PNG, JPEG, SVG');
  }
  
  // Parse options if provided
  let options: Partial<ProcessingOptions> = {};
  if (optionsString) {
    try {
      options = JSON.parse(optionsString);
    } catch (err) {
      console.warn('Failed to parse options:', err);
    }
  }
  
  // Convert file to buffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  
  // Process the image
  const result = await tattooImageProcessor.processImage(imageBuffer, options);
  
  // Convert result to base64 for response
  const base64Image = result.buffer.toString('base64');
  const dataUrl = `data:image/${result.format};base64,${base64Image}`;
  
  return json({
    success: true,
    processedImage: dataUrl,
    format: result.format,
    originalDimensions: result.originalDimensions,
    processedDimensions: result.processedDimensions,
    metadata: result.metadata,
  });
}

async function handleJsonRequest(request: Request) {
  const body = await request.json();
  const { image, options = {} } = body;
  
  if (!image) {
    throw error(400, 'No image provided');
  }
  
  let imageBuffer: Buffer;
  
  // Handle base64 image
  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      // Data URL format
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        throw error(400, 'Invalid data URL format');
      }
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Plain base64
      imageBuffer = Buffer.from(image, 'base64');
    }
  } else {
    throw error(400, 'Image must be provided as base64 string or data URL');
  }
  
  // Process the image
  const result = await tattooImageProcessor.processImage(imageBuffer, options);
  
  // Convert result to base64 for response
  const base64Image = result.buffer.toString('base64');
  const dataUrl = `data:image/${result.format};base64,${base64Image}`;
  
  return json({
    success: true,
    processedImage: dataUrl,
    format: result.format,
    originalDimensions: result.originalDimensions,
    processedDimensions: result.processedDimensions,
    metadata: result.metadata,
  });
}

/**
 * GET /api/process-tattoo
 * Get processing options and supported formats
 */
export const GET: RequestHandler = async () => {
  return json({
    supportedFormats: {
      input: ['PNG', 'JPEG', 'SVG'],
      output: ['PNG', 'SVG'],
    },
    defaultOptions: {
      outputFormat: 'png', // Default to PNG for high quality
      strokeWidth: 2,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      threshold: 128,
      optimizeSvg: true,
      maxSize: 2048,
      sizePreset: 'medium',
      maintainAspectRatio: true,
    },
    processingCapabilities: [
      'Edge detection and cleanup',
      'Noise reduction',
      'SVG path optimization',
      'Raster to vector conversion',
      'Line art extraction',
      'Consistent stroke styling',
      'Uniform image scaling',
      'Size presets (small, medium, large)',
      'Custom dimensions',
      'Aspect ratio preservation',
    ],
    sizePresets: {
      small: { width: 256, height: 256 },
      medium: { width: 512, height: 512 },
      large: { width: 1024, height: 1024 },
    },
  });
};

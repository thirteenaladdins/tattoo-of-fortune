import type { ProcessingOptions } from './imageProcessor.js';

export interface ProcessTattooResponse {
  success: boolean;
  processedImage: string; // base64 data URL
  format: 'svg' | 'png';
  originalDimensions: { width: number; height: number };
  processedDimensions: { width: number; height: number };
  metadata: {
    processingTime: number;
    optimizationsApplied: string[];
  };
}

export interface ProcessTattooError {
  error: string;
  message: string;
  status?: number;
}

/**
 * Client-side utility for processing tattoo images
 */
export class TattooProcessorClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Process a tattoo image from a File object
   */
  async processFromFile(
    file: File,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${this.baseUrl}/api/process-tattoo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ProcessTattooError(
        errorData.message || 'Failed to process image',
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Process a tattoo image from a base64 string
   */
  async processFromBase64(
    base64Image: string,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    const response = await fetch(`${this.baseUrl}/api/process-tattoo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ProcessTattooError(
        errorData.message || 'Failed to process image',
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Process a tattoo image from a canvas element
   */
  async processFromCanvas(
    canvas: HTMLCanvasElement,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    const base64Image = canvas.toDataURL('image/png');
    return this.processFromBase64(base64Image, options);
  }

  /**
   * Process a tattoo image from an image URL
   */
  async processFromUrl(
    imageUrl: string,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    // Fetch the image and convert to base64
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new ProcessTattooError(`Failed to fetch image: ${response.statusText}`, response.status);
    }

    const blob = await response.blob();
    const base64Image = await this.blobToBase64(blob);
    
    return this.processFromBase64(base64Image, options);
  }

  /**
   * Get supported formats and processing capabilities
   */
  async getCapabilities(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/process-tattoo`);
    
    if (!response.ok) {
      throw new ProcessTattooError('Failed to get capabilities', response.status);
    }

    return await response.json();
  }

  /**
   * Convert blob to base64 data URL
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * Custom error class for tattoo processing
 */
export class ProcessTattooError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ProcessTattooError';
    this.status = status;
  }
}

/**
 * Convenience functions for common processing scenarios
 */
export const tattooProcessing = {
  /**
   * Convert AI-generated tattoo to clean SVG line art
   */
  async toCleanSvg(
    input: File | string | HTMLCanvasElement,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    const processor = new TattooProcessorClient();
    const processingOptions = {
      outputFormat: 'svg' as const,
      strokeWidth: 2,
      strokeColor: '#000000',
      optimizeSvg: true,
      sizePreset: 'medium',
      maintainAspectRatio: true,
      ...options,
    };

    if (input instanceof File) {
      return processor.processFromFile(input, processingOptions);
    } else if (typeof input === 'string') {
      return processor.processFromUrl(input, processingOptions);
    } else if (input instanceof HTMLCanvasElement) {
      return processor.processFromCanvas(input, processingOptions);
    } else {
      throw new Error('Invalid input type');
    }
  },

  /**
   * Convert AI-generated tattoo to clean PNG line art
   */
  async toCleanPng(
    input: File | string | HTMLCanvasElement,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessTattooResponse> {
    const processor = new TattooProcessorClient();
    const processingOptions = {
      outputFormat: 'png' as const,
      backgroundColor: 'transparent',
      threshold: 128,
      sizePreset: 'medium',
      maintainAspectRatio: true,
      ...options,
    };

    if (input instanceof File) {
      return processor.processFromFile(input, processingOptions);
    } else if (typeof input === 'string') {
      return processor.processFromUrl(input, processingOptions);
    } else if (input instanceof HTMLCanvasElement) {
      return processor.processFromCanvas(input, processingOptions);
    } else {
      throw new Error('Invalid input type');
    }
  },

  /**
   * Batch process multiple tattoo images
   */
  async batchProcess(
    inputs: Array<File | string | HTMLCanvasElement>,
    options: Partial<ProcessingOptions> = {},
    format: 'svg' | 'png' = 'svg'
  ): Promise<ProcessTattooResponse[]> {
    const processor = new TattooProcessorClient();
    const processingOptions = {
      outputFormat: format,
      ...options,
    };

    const results = await Promise.allSettled(
      inputs.map(async (input) => {
        if (input instanceof File) {
          return processor.processFromFile(input, processingOptions);
        } else if (typeof input === 'string') {
          return processor.processFromUrl(input, processingOptions);
        } else if (input instanceof HTMLCanvasElement) {
          return processor.processFromCanvas(input, processingOptions);
        } else {
          throw new Error('Invalid input type');
        }
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<ProcessTattooResponse> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  },
};

// Export default instance
export const tattooProcessor = new TattooProcessorClient();

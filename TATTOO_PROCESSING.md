# AI Tattoo Image Processing System

This system processes AI-generated tattoo images into clean, tattoo-ready line art suitable for actual tattooing. It supports both SVG and PNG output formats with various customization options.

## Features

### Core Processing Capabilities
- **Edge Detection & Cleanup**: Advanced algorithms to extract clean lines from AI-generated images
- **Noise Reduction**: Removes artifacts and noise for crisp line art
- **SVG Optimization**: Converts raster images to scalable vector graphics with optimized paths
- **Format Flexibility**: Output in both SVG (vector) and PNG (raster) formats
- **Customizable Parameters**: Adjust stroke width, colors, thresholds, and other processing options

### Input Formats
- PNG images
- JPEG images  
- SVG images
- Base64 encoded images
- Image URLs

### Output Formats
- **SVG**: Scalable vector graphics with optimized paths, perfect for large-scale tattoos
- **PNG**: High-quality raster images with transparent or colored backgrounds

## Architecture

### Backend Processing (`src/lib/utils/imageProcessor.ts`)
The core processing engine using:
- **Sharp**: Image manipulation and preprocessing
- **Potrace**: Raster to vector conversion
- **SVGO**: SVG optimization and cleanup
- **Canvas**: Advanced image processing operations

### API Endpoint (`src/routes/api/process-tattoo/+server.ts`)
RESTful API for processing images:
- `POST /api/process-tattoo` - Process uploaded images
- `GET /api/process-tattoo` - Get supported formats and capabilities

### Client Utilities (`src/lib/utils/tattooProcessor.ts`)
Easy-to-use client-side utilities for:
- File uploads
- URL processing
- Canvas processing
- Batch operations

### UI Component (`src/lib/components/TattooProcessor.svelte`)
Complete Svelte component with:
- Drag-and-drop file upload
- URL input
- Processing options configuration
- Real-time preview
- Download functionality

## Usage

### Basic Usage

```typescript
import { tattooProcessor } from '$lib/utils/tattooProcessor';

// Process from file
const result = await tattooProcessor.processFromFile(file, {
  outputFormat: 'svg',
  strokeWidth: 2,
  strokeColor: '#000000'
});

// Process from URL
const result = await tattooProcessor.processFromUrl('https://example.com/tattoo.png', {
  outputFormat: 'png',
  backgroundColor: 'transparent'
});
```

### Advanced Options

```typescript
const options = {
  outputFormat: 'svg',           // 'svg' or 'png'
  strokeWidth: 2,               // Line thickness (SVG only)
  strokeColor: '#000000',       // Line color (SVG only)
  backgroundColor: 'transparent', // Background (PNG only)
  threshold: 128,               // Edge detection threshold (0-255)
  optimizeSvg: true,            // Optimize SVG paths
  maxSize: 2048                 // Maximum output dimensions
};
```

### Convenience Functions

```typescript
import { tattooProcessing } from '$lib/utils/tattooProcessor';

// Convert to clean SVG
const svgResult = await tattooProcessing.toCleanSvg(file, {
  strokeWidth: 3,
  strokeColor: '#000000'
});

// Convert to clean PNG
const pngResult = await tattooProcessing.toCleanPng(file, {
  backgroundColor: 'transparent',
  threshold: 150
});

// Batch process multiple images
const results = await tattooProcessing.batchProcess(
  [file1, file2, url1], 
  { outputFormat: 'svg' }
);
```

## API Reference

### POST /api/process-tattoo

**Multipart Form Data:**
```
image: File
options: JSON string (optional)
```

**JSON Body:**
```json
{
  "image": "base64_string_or_data_url",
  "options": {
    "outputFormat": "svg",
    "strokeWidth": 2,
    "strokeColor": "#000000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "processedImage": "data:image/svg;base64,...",
  "format": "svg",
  "originalDimensions": { "width": 1024, "height": 1024 },
  "processedDimensions": { "width": 1024, "height": 1024 },
  "metadata": {
    "processingTime": 1250,
    "optimizationsApplied": ["edge_detection", "svg_optimization"]
  }
}
```

### GET /api/process-tattoo

Returns supported formats and processing capabilities.

## Processing Pipeline

1. **Input Validation**: Check file format and size
2. **Preprocessing**: Resize, normalize, and enhance edges with Sharp
3. **Edge Detection**: Apply noise reduction and sharpening
4. **Format Conversion**:
   - **SVG**: Use Potrace for raster-to-vector conversion, then optimize with SVGO
   - **PNG**: Extract clean line art with custom canvas processing
5. **Styling**: Apply consistent stroke properties and colors
6. **Output**: Return processed image with metadata

## Installation

The system requires these dependencies (already added to package.json):

```bash
npm install sharp potrace svg-parser svgo canvas
```

## Demo

Visit `/process-demo` to see the complete system in action with:
- Interactive processing interface
- Real-time preview
- Processing history
- Download functionality

## Integration with AI Tattoo Generation

This system is designed to work seamlessly with AI-generated tattoos from:
- Midjourney
- DALL-E
- Stable Diffusion
- Other AI art generators

Simply upload the AI-generated image and the system will clean it up for tattooing.

## Performance Considerations

- Processing time: 1-3 seconds for typical images
- Memory usage: Optimized for server-side processing
- File size: SVG output is typically 10-50% smaller than original
- Scalability: Can handle batch processing of multiple images

## Future Enhancements

- [ ] Automatic style detection and optimization
- [ ] Tattoo placement recommendations
- [ ] Size scaling for different body parts
- [ ] Integration with tattoo artist workflows
- [ ] Advanced vectorization options
- [ ] Real-time collaboration features

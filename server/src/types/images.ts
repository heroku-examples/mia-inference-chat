export interface ImageRequest {
  prompt: string;
  aspect_ratio: string;
  negative_prompt?: string;
  seed?: number;
  model: string;
}

export interface ImageRequestBody extends ImageRequest {
  output_format: string;
}

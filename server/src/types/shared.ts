export type ModelConfig = {
  API_KEY: string;
} & (
  | { INFERENCE_URL: string; DIFFUSION_URL?: never }
  | { DIFFUSION_URL: string; INFERENCE_URL?: never }
);

export interface ErrorResponse {
  code: number;
  error: string;
  expiresIn?: number;
  message: string;
  details?: string;
}

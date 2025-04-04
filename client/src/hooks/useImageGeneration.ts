import { useState } from 'react';
import type {
  ImageGenerationParams,
  ImageGenerationResponse,
  Message,
  ChatError,
} from '@/types/chat';

interface UseImageGenerationProps {
  onSuccess: (messages: Message[]) => void;
  onComplete?: () => void;
}

export function useImageGeneration({ onSuccess }: UseImageGenerationProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<ChatError | null>(null);

  const generateImage = async (params: ImageGenerationParams) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `Request failed with status ${response.status}`
        );
      }

      const responseData: ImageGenerationResponse = await response.json();

      // Create messages for the chat
      const messages: Message[] = [
        {
          role: 'user',
          content: params.prompt,
          type: 'text',
        },
        {
          role: 'assistant',
          content: responseData.data[0].revised_prompt || 'Here is your generated image:',
          type: 'image',
          image_url: `data:image/png;base64,${responseData.data[0].b64_json}`,
        },
      ];

      onSuccess(messages);
      setStatus('idle');
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'An unknown error occurred' });
      setStatus('error');
    }
  };

  return {
    generateImage,
    status,
    error,
  };
}

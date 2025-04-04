# Type Relationships

This document outlines the relationships between different TypeScript interfaces and types in the
application.

## Server Types Diagram

```mermaid
classDiagram
    class Message {
        +role: 'user' | 'assistant' | 'agent'
        +content: string
        +type?: 'text' | 'image'
        +image_url?: string
        +reasoning?: ReasoningInfo
        +tool_calls?: ToolCall[]
        +is_tool_message?: boolean
    }

    class ReasoningInfo {
        +thinking: string
    }

    class ToolCall {
        +id: string
        +type: string
        +function: FunctionInfo
    }

    class FunctionInfo {
        +name: string
        +arguments: string
    }

    class ImageGenerationParams {
        +model: 'stable-image-ultra'
        +prompt: string
        +size: string
        +negative_prompt?: string
        +seed?: number
    }

    class ImageGenerationResponse {
        +data: ImageData[]
    }

    class ImageData {
        +b64_json: string
        +revised_prompt: string
    }

    class ChatError {
        +message: string
        +code?: string
    }

    class StreamChunk {
        +id: string
        +object: string
        +created: number
        +model: string
        +system_fingerprint: string
        +choices: Choice[]
        +usage?: UsageInfo
    }

    class Choice {
        +delta: DeltaInfo
        +message: MessageInfo
        +finish_reason: string
        +index: number
    }

    class UsageInfo {
        +prompt_tokens: number
        +completion_tokens: number
        +total_tokens: number
    }

    Message --> ReasoningInfo : optional
    Message --> ToolCall : optional[]
    ToolCall --> FunctionInfo : has
    ImageGenerationResponse --> ImageData : contains[]
    StreamChunk --> Choice : contains[]
    Choice --> DeltaInfo : has
    Choice --> MessageInfo : has
```

## Type Usage Flow

```mermaid
graph TB
    subgraph Client
        ClientReq[Client Request]
        ImageReq[Image Request]
    end

    subgraph Server Types
        Message[Message]
        ImgParams[ImageGenerationParams]
        ImgRes[ImageGenerationResponse]
        StreamRes[StreamChunk]
        ErrRes[ChatError]
    end

    subgraph External API
        ChatAPI[Chat API]
        ImageAPI[Image API]
    end

    ClientReq -->|Validated as| Message
    ImageReq -->|Validated as| ImgParams
    Message -->|Sent to| ChatAPI
    ImgParams -->|Sent to| ImageAPI
    ChatAPI -->|Streams| StreamRes
    ImageAPI -->|Returns| ImgRes
    ChatAPI -->|May result in| ErrRes
    ImageAPI -->|May result in| ErrRes
```

## Type Descriptions

1. **Message**

   - Core message type for chat interactions
   - Supports text and image content types
   - Can include reasoning and tool call information

2. **ImageGenerationParams**

   - Parameters for image generation requests
   - Includes prompt, size, and optional settings

3. **ImageGenerationResponse**

   - Response from image generation API
   - Contains base64 encoded image and revised prompt

4. **StreamChunk**

   - Streaming response format for chat
   - Contains incremental updates and usage stats

5. **ChatError**
   - Standardized error response format
   - Used across both chat and image endpoints

## Usage in Routes

The types are used in two main routes:

1. `/api/chat`

   - Handles chat interactions with streaming support
   - Uses Message type for request/response
   - Returns StreamChunk for incremental updates

2. `/api/images`
   - Handles image generation requests
   - Uses ImageGenerationParams for requests
   - Returns ImageGenerationResponse with generated images

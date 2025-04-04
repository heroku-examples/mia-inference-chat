# Type Relationships

This document outlines the relationships between different TypeScript interfaces and types in the
application.

## Server Types Diagram

```mermaid
classDiagram
    class ChatMessage {
        +role: 'system' | 'user' | 'assistant'
        +content: string
    }

    class ChatRequest {
        +messages: ChatMessage[]
        +model: string
        +reasoning?: boolean
        +agents?: string[]
        +stream?: boolean
    }

    class ModelRequestBody {
        +model: string
        +messages: ChatMessage[]
        +stream?: boolean
        +tools?: ToolConfig[]
        +tool_choice?: string
        +extended_thinking?: ExtendedThinking
    }

    class ToolConfig {
        +type: string
        +function: FunctionConfig
    }

    class FunctionConfig {
        +name: string
    }

    class ExtendedThinking {
        +enabled: boolean
        +budget_tokens: number
        +include_reasoning: boolean
    }

    class ModelConfig {
        +INFERENCE_URL: string
        +API_KEY: string
    }

    class ErrorResponse {
        +code: number
        +error: string
        +expiresIn?: number
        +message: string
        +details?: string
    }

    ChatRequest --> ChatMessage : contains[]
    ModelRequestBody --> ChatMessage : contains[]
    ModelRequestBody --> ToolConfig : optional[]
    ToolConfig --> FunctionConfig : has
    ModelRequestBody --> ExtendedThinking : optional
```

## Type Usage Flow

```mermaid
graph TB
    subgraph Client
        ClientReq[Client Request]
    end

    subgraph Server Types
        ChatReq[ChatRequest]
        ChatMsg[ChatMessage]
        ModelReq[ModelRequestBody]
        ErrRes[ErrorResponse]
        ModConfig[ModelConfig]
    end

    subgraph External API
        APIReq[API Request]
        APIRes[API Response]
    end

    ClientReq -->|Validated as| ChatReq
    ChatReq -->|Contains| ChatMsg
    ChatReq -->|Transformed to| ModelReq
    ModelReq -->|Sent as| APIReq
    APIRes -->|May result in| ErrRes
    ModConfig -->|Configures| APIReq
```

## Type Descriptions

1. **ChatMessage**

   - Basic message unit containing role and content
   - Used in both client requests and model interactions

2. **ChatRequest**

   - Primary interface for client-server communication
   - Contains array of messages and configuration options

3. **ModelRequestBody**

   - Internal type for API requests to the model
   - Extends ChatRequest with additional model-specific options

4. **ModelConfig**

   - Configuration interface for model endpoints
   - Contains API credentials and URLs

5. **ErrorResponse**
   - Standardized error response format
   - Used across all API endpoints

## Usage in Routes

The types are primarily used in the chat route (`/api/chat`):

- Request body is validated against `ChatRequest`
- Transformed into `ModelRequestBody` for API calls
- Errors are formatted using `ErrorResponse`
- Model configuration is managed via `ModelConfig`

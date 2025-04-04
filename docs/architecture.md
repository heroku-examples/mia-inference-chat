# Project Architecture

This document outlines the architecture and interactions between different components of the
application.

## System Architecture Diagram

```mermaid
graph TB
    subgraph Client ["Client (React + Vite)"]
        UI[UI Components]
        Pages[Pages]
        Hooks[Custom Hooks]
        State[State Management]
        UI --> Pages
        Pages --> Hooks
        Pages --> State
    end

    subgraph Server ["Server (Fastify)"]
        API[API Routes]
        ChatAPI["/api/chat"]
        ImagesAPI["/api/images"]
        Middleware[Middleware]
        LibUtils[Utility Functions]
        DB[(PostgreSQL)]
        Cache[(Redis)]

        API --> ChatAPI
        API --> ImagesAPI
        ChatAPI --> Middleware
        ImagesAPI --> Middleware
        ChatAPI --> LibUtils
        ImagesAPI --> LibUtils
        LibUtils --> DB
        LibUtils --> Cache
    end

    subgraph Assets ["Static Assets"]
        Public[Public Files]
        Images[Images]
        Styles[CSS/Tailwind]
    end

    Client --"HTTP/API Requests"--> Server
    Server --"JSON/SSE Responses"--> Client
    Assets --"Static Files"--> Client

    classDef clientNode fill:#e1f5fe,stroke:#01579b
    classDef serverNode fill:#e8f5e9,stroke:#1b5e20
    classDef assetNode fill:#fff3e0,stroke:#e65100
    classDef apiNode fill:#f3e5f5,stroke:#4a148c

    class UI,Pages,Hooks,State clientNode
    class API,Middleware,LibUtils,DB,Cache serverNode
    class Public,Images,Styles assetNode
    class ChatAPI,ImagesAPI apiNode
```

## Component Interactions

1. **Client-Side**

   - React components render the UI and manage local state
   - Pages handle routing and layout
   - Custom hooks manage reusable logic and API interactions
   - Tailwind CSS provides styling

2. **Server-Side**

   - Fastify handles HTTP requests and routing
   - Middleware processes authentication and request validation
   - Library utilities manage database and cache interactions
   - PostgreSQL stores persistent data
   - Redis handles caching and session management

3. **Asset Management**
   - Static files served directly
   - Images and other media optimized for delivery
   - Styles processed through PostCSS/Tailwind

## Data Flow

1. User interacts with React components
2. Components trigger API calls through custom hooks
3. Server receives requests through Fastify routes
4. Middleware validates and processes requests
5. Server performs business logic and database operations
6. Responses flow back to the client
7. UI updates to reflect new data

## Development Workflow

- TypeScript ensures type safety across the stack
- ESM modules for modern JavaScript features
- Environment variables manage configuration
- Vite provides fast development and optimized builds

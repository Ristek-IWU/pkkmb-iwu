# Architecture Document

## PKKMB IWU — Technical Architecture

**Version:** 1.0  
**Date:** September 2026

---

## 1. System Overview

```mermaid
graph TB
    subgraph "Static Hosting (cPanel) - /out"
        subgraph "Pages"
            HP[Homepage /]
            ST[Studio /studio]
            AG[Agenda /agenda]
            KL[Kelompok /kelompok]
        end
        
        subgraph "Shared Components"
            NB[Navbar]
            FT[Footer]
            LY[Layout]
        end
    end
    
    subgraph "Client-Side APIs"
        FJ[Fabric.js Canvas]
        CP[Clipboard API]
        BR[Browser APIs]
    end
    
    HP --> NB
    ST --> NB
    AG --> NB
    KL --> NB
    
    ST --> FJ
    ST --> CP
    ST --> BR
    
    style HP fill:#0A192F,color:#fff
    style ST fill:#7C3AED,color:#fff
    style AG fill:#D4AF37,color:#000
    style KL fill:#0F2042,color:#fff
```

---

## 2. Directory Structure

```
pkkmb-iwu/
├── public/
│   ├── frames/              # Frame PNG assets
│   │   ├── pkkmb-2026.png
│   │   ├── fst.png
│   │   ├── fisbis.png
│   │   └── pasca.png
│   ├── images/              # Static images
│   │   └── og-image.png
│   └── icons/               # Favicons, icons
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Homepage
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css      # Global styles
│   │   ├── studio/
│   │   │   └── page.tsx     # Twibbon Studio
│   │   ├── agenda/
│   │   │   └── page.tsx     # Agenda + Panduan
│   │   └── kelompok/
│   │       └── page.tsx     # Kelompok lookup
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── studio/
│   │   │   ├── TwibbonCanvas.tsx
│   │   │   ├── FrameSelector.tsx
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   ├── CaptionGenerator.tsx
│   │   │   └── DownloadButton.tsx
│   │   │
│   │   ├── agenda/
│   │   │   ├── AgendaTimeline.tsx
│   │   │   └── GuideAccordion.tsx
│   │   │
│   │   └── kelompok/
│   │       ├── GroupSearch.tsx
│   │       └── GroupMembers.tsx
│   │
│   ├── data/
│   │   ├── frames.ts
│   │   ├── agenda.ts
│   │   └── groups.ts
│   │
│   ├── lib/
│   │   ├── fabric.ts
│   │   ├── image-export.ts
│   │   └── caption-generator.ts
│   │
│   └── types/
│       └── index.ts
│
├── docs/                    # Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── COMPONENTS.md
│   ├── DATA.md
│   └── DEPLOYMENT.md
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.js
```

---

## 3. Technology Stack

### 3.1 Core

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ | Framework, routing, static export |
| TypeScript | 5+ | Type safety |
| React | 18+ | UI library |
| Node.js | 18+ | Build time only |

### 3.2 Styling

| Technology | Purpose |
|-----------|---------|
| Tailwind CSS | Layout, responsive, custom styling |
| Mantine UI | Component library (Button, Modal, etc.) |
| CSS Modules | Component-scoped styles (if needed) |

### 3.3 Canvas

| Technology | Purpose |
|-----------|---------|
| Fabric.js | Canvas manipulation, image processing |

### 3.4 Fonts

| Font | Source |
|------|--------|
| Plus Jakarta Sans | next/font/google |

### 3.5 Icons

| Library | Usage |
|---------|-------|
| Lucide React | General icons |
| Tabler Icons | Alternative icons |

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```mermaid
graph TB
    RL[RootLayout] --> MP[MantineProvider]
    
    MP --> NB[Navbar]
    MP --> PC[Page Content]
    MP --> FT[Footer]
    
    NB --> LOGO[Logo]
    NB --> NAV[Navigation Links]
    NB --> CTA[CTA Button]
    
    PC --> HP[Homepage]
    PC --> ST[Studio]
    PC --> AG[Agenda]
    PC --> KL[Kelompok]
    
    HP --> HERO[Hero Section]
    HP --> FEAT[Features Section]
    HP --> CTA2[CTA Section]
    
    ST --> TC[TwibbonCanvas]
    ST --> FS[FrameSelector]
    ST --> PU[PhotoUploader]
    ST --> CC[CanvasControls]
    ST --> DB[DownloadButton]
    ST --> CG[CaptionGenerator]
    
    TC --> FC[Fabric Canvas]
    FS --> FT2[Frame Thumbnails]
    CC --> ZS[Zoom Slider]
    CC --> RS[Rotation Slider]
    CC --> RB[Reset Button]
    CG --> FF[Form Fields]
    CG --> PV[Preview]
    CG --> CP[Copy Button]
    
    AG --> AT[AgendaTimeline]
    AG --> GA[GuideAccordion]
    AT --> TI[Timeline Items]
    GA --> AI2[Accordion Items]
    
    KL --> GS[GroupSearch]
    KL --> GM[GroupMembers]
    GS --> FS2[Filter Selects]
    GM --> ML[Member List]
    
    FT --> UI[University Info]
    FT --> LNK[Links]
    FT --> CR[Copyright]
    
    style RL fill:#0A192F,color:#fff
    style ST fill:#7C3AED,color:#fff
    style TC fill:#D4AF37,color:#000
```

### 4.2 State Management

**Approach:** Local state + React Context (minimal)

```
Global State (Context):
└── MantineProvider (theme, notifications)

Local State (Component):
└── Studio Page
    ├── fabricInstance (ref)
    ├── selectedFrame (state)
    ├── uploadedPhoto (state)
    ├── zoomLevel (state)
    ├── rotationAngle (state)
    └── captionData (state)
```

**Fabric.js State:**
- Instance stored in `useRef`
- Not shared globally
- Initialized client-side only
- Cleaned up on unmount

---

## 5. Data Flow

### 5.1 Twibbon Studio Data Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as UI Components
    participant State as React State
    participant Canvas as Fabric Canvas
    
    User->>UI: Upload Photo
    UI->>State: setUploadedPhoto(file)
    State->>Canvas: addPhoto(file)
    Canvas-->>UI: Canvas re-renders
    
    User->>UI: Select Frame
    UI->>State: setSelectedFrame(frame)
    State->>Canvas: loadFrame(frame.image)
    Canvas-->>UI: Canvas re-renders
    
    User->>UI: Drag Photo
    UI->>Canvas: fabricCanvas.renderAll()
    
    User->>UI: Zoom Slider
    UI->>State: setZoom(value)
    State->>Canvas: photo.scaleX/Y = value
    Canvas-->>UI: Canvas re-renders
    
    User->>UI: Click Download
    UI->>Canvas: exportCanvas(1080, 1080)
    Canvas-->>UI: toDataURL()
    UI-->>User: File download
```

### 5.2 Canvas Rendering Pipeline

```mermaid
flowchart LR
    A[Load Frame PNG] --> B[Load User Photo]
    B --> C[Render Canvas]
    
    A --> D[selectable: false]
    A --> E[evented: false]
    A --> F[zIndex: 1]
    
    B --> G[selectable: true]
    B --> H[evented: true]
    B --> I[zIndex: 0]
    
    C --> J[canvas.renderAll]
    
    D -.-> A
    E -.-> A
    F -.-> A
    G -.-> B
    H -.-> B
    I -.-> B
    
    style A fill:#0A192F,color:#fff
    style B fill:#7C3AED,color:#fff
    style C fill:#D4AF37,color:#000
```

### 5.3 Export Pipeline

```mermaid
flowchart LR
    A[Get Canvas 350x350] --> B[Scale to Target 1080x1080]
    B --> C[Export as PNG]
    C --> D[canvas.toDataURL]
    D --> E[Download Link]
    
    A -->|Preview Size| F[350 x 350 px]
    B -->|Export Size| G[1080 x 1080 px]
    C -->|Format| H[PNG High-Res]
    
    style A fill:#0A192F,color:#fff
    style B fill:#7C3AED,color:#fff
    style C fill:#D4AF37,color:#000
```

---

## 6. Routing

### 6.1 Route Configuration

| Route | Page | Description |
|-------|------|-------------|
| `/` | page.tsx | Homepage |
| `/studio` | studio/page.tsx | Twibbon Studio |
| `/agenda` | agenda/page.tsx | Agenda + Panduan |
| `/kelompok` | kelompok/page.tsx | Kelompok Lookup |

### 6.2 Navigation

**Desktop:**
```
Home | Studio | Agenda | Kelompok | [Buat Twibbon]
```

**Mobile:**
```
Logo | Burger Menu (Drawer)
```

---

## 7. Build & Deployment

### 7.1 Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Output directory
/out/
```

### 7.2 Static Export Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

### 7.3 Deployment Steps

1. Run `npm run build`
2. Verify `/out` directory generated
3. Upload `/out` contents to cPanel `public_html`
4. Configure `.htaccess` for SPA routing (if needed)

### 7.4 .htaccess Configuration

```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 8. Performance Strategy

### 8.1 Loading Strategy

```mermaid
graph TB
    subgraph "Initial Load"
        HTML[HTML - Static]
        CSS[CSS - Tailwind + Mantine]
        JS[JS - React + Next.js]
        FONT[Font - Plus Jakarta Sans]
    end
    
    subgraph "Lazy Load"
        FJ[Fabric.js - Dynamic Import]
        PSC[Page-specific Components]
        FI[Frame Images]
    end
    
    HTML --> CSS --> JS --> FONT
    FONT -.->|On Demand| FJ
    FONT -.->|On Demand| PSC
    FONT -.->|On Demand| FI
    
    style HTML fill:#0A192F,color:#fff
    style CSS fill:#7C3AED,color:#fff
    style JS fill:#D4AF37,color:#000
    style FONT fill:#0F2042,color:#fff
```

### 8.2 Code Splitting

```typescript
// Dynamic import for Fabric.js
const FabricCanvas = dynamic(
  () => import('@/components/studio/TwibbonCanvas'),
  { ssr: false }
)
```

### 8.3 Image Optimization

- Frame assets: Pre-optimized PNG/WebP
- User photos: Client-side processing only
- No server-side image processing

---

## 9. Security Considerations

### 9.1 Client-Side Only

- No server upload of user photos
- No API endpoints
- No database connections
- No authentication required

### 9.2 Data Privacy

- All processing in browser
- No data sent to external services
- Clipboard API only for copy functionality

### 9.3 Content Security

- Static assets only
- No external scripts (except fonts)
- No third-party analytics (MVP)

---

## 10. Error Handling

### 10.1 Error Types

| Type | Handling |
|------|----------|
| File format error | Mantine Notification |
| File too large | Mantine Notification |
| Canvas init error | Fallback UI |
| Export error | Retry button |
| Clipboard error | Fallback copy method |

### 10.2 Error Boundaries

```typescript
// Global error boundary
app/error.tsx

// Studio-specific errors
studio/page.tsx → try/catch for Fabric.js init
```

---

## 11. Testing Strategy

### 11.1 Test Types (Future)

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Jest | Utilities, helpers |
| Integration | React Testing Library | Components |
| E2E | Playwright | Critical flows |
| Visual | Chromatic | UI regression |

### 11.2 Manual Testing Checklist

- [ ] Mobile responsive (360px-430px)
- [ ] Touch interactions work
- [ ] Canvas renders correctly
- [ ] Export produces high-res image
- [ ] All buttons functional
- [ ] No console errors
- [ ] Static export successful

---

## 12. Future Considerations

### 12.1 Potential Enhancements

```mermaid
graph LR
    subgraph "MVP"
        A[Twibbon Studio]
        B[Caption Generator]
        C[Agenda]
        D[Kelompok]
    end
    
    subgraph "Phase 2"
        E[User Authentication]
        F[Backend API]
        G[Admin Panel]
    end
    
    subgraph "Phase 3"
        H[Analytics]
        I[PWA]
        J[Multi-language]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style A fill:#0A192F,color:#fff
    style E fill:#7C3AED,color:#fff
    style H fill:#D4AF37,color:#000
```

### 12.2 Scalability

```mermaid
graph TB
    subgraph "Current: Static Hosting"
        SH[cPanel + /out]
    end
    
    subgraph "Future: CDN"
        CDN[Cloudflare/Netlify]
        SH --> CDN
    end
    
    subgraph "Future: Backend"
        BE[Node.js API]
        DB[(Database)]
        CDN --> BE
        BE --> DB
    end
    
    style SH fill:#0A192F,color:#fff
    style CDN fill:#7C3AED,color:#fff
    style BE fill:#D4AF37,color:#000
```

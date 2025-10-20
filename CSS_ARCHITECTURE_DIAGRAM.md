# 🎨 AEG CSS System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       REACT COMPONENTS                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Sidebar   │  │  DaftarRFID │  │ MonitoringRF│  │  ListID   │ │
│  │    .jsx     │  │    .jsx     │  │   ID.jsx    │  │   .jsx    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
│         │                │                 │                │        │
│         └────────────────┴─────────────────┴────────────────┘        │
│                                   │                                  │
│                          ┌────────▼────────┐                         │
│                          │  SINGLE IMPORT  │                         │
│                          │                 │                         │
│                          │ aeg-system.css  │ ⭐ MASTER FILE         │
│                          │                 │                         │
│                          └────────┬────────┘                         │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
┌───────▼───────┐         ┌─────────▼─────────┐       ┌────────▼────────┐
│   FOUNDATION  │         │    COMPONENTS      │       │    UTILITIES    │
│               │         │                    │       │                 │
│ _variables    │────────▶│  _sidebar          │◀──────│  _animations    │
│ _reset        │         │  _forms            │       │  _scrollbar     │
│ _typography   │         │  _buttons          │       │  _utilities     │
│ _layout       │         │  _cards            │       │                 │
│               │         │  _tables           │       │                 │
│               │         │  _modals           │       │                 │
│               │         │  _qc-buttons       │       │                 │
└───────────────┘         └────────────────────┘       └─────────────────┘
```

## 📦 Module Breakdown

```
aeg-system.css (MASTER)
│
├── 1. FOUNDATION
│   ├── _variables.css      ← 200+ design tokens
│   ├── _reset.css          ← Browser normalization
│   ├── _typography.css     ← Font system
│   └── _layout.css         ← Grid & flex
│
├── 2. COMPONENTS
│   ├── _sidebar.css        ← Navigation
│   ├── _forms.css          ← Input fields
│   ├── _buttons.css        ← Buttons
│   ├── _cards.css          ← Card containers
│   ├── _tables.css         ← Data tables
│   ├── _modals.css         ← Overlay modals
│   └── _qc-buttons.css     ← QC checkpoints
│
└── 3. UTILITIES
    ├── _animations.css     ← Keyframes
    ├── _scrollbar.css      ← Custom scrollbar
    └── _utilities.css      ← Helper classes
```

## 🔄 Import Flow

```
Component (.jsx)
    │
    │ import './styles/aeg-system.css'
    │
    ▼
aeg-system.css
    │
    ├─▶ @import './modules/_variables.css'      [1st - Foundation]
    ├─▶ @import './modules/_reset.css'
    ├─▶ @import './modules/_typography.css'
    ├─▶ @import './modules/_layout.css'
    │
    ├─▶ @import './modules/_sidebar.css'        [2nd - Components]
    ├─▶ @import './modules/_forms.css'
    ├─▶ @import './modules/_buttons.css'
    ├─▶ @import './modules/_cards.css'
    ├─▶ @import './modules/_tables.css'
    ├─▶ @import './modules/_modals.css'
    ├─▶ @import './modules/_qc-buttons.css'
    │
    ├─▶ @import './modules/_animations.css'     [3rd - Features]
    ├─▶ @import './modules/_scrollbar.css'
    └─▶ @import './modules/_utilities.css'
```

## 🎨 Design Token Hierarchy

```
:root (CSS Variables)
│
├── COLORS
│   ├── Primary
│   │   ├── --primary-blue (#2563EB)
│   │   ├── --primary-blue-dark (#1E40AF)
│   │   └── --primary-blue-light (#3B82F6)
│   │
│   ├── Semantic
│   │   ├── --success (#10B981)
│   │   ├── --warning-orange (#F59E0B)
│   │   └── --danger (#EF4444)
│   │
│   └── Grays
│       ├── --gray-900 (#1E293B)
│       ├── --gray-600 (#64748B)
│       ├── --gray-300 (#E2E8F0)
│       └── --gray-100 (#F8FAFC)
│
├── SPACING (4px grid)
│   ├── --spacing-1 (4px)
│   ├── --spacing-2 (8px)
│   ├── --spacing-3 (12px)
│   ├── --spacing-4 (16px)
│   ├── --spacing-6 (24px)
│   └── --spacing-8 (32px)
│
├── SHADOWS
│   ├── --shadow-sm
│   ├── --shadow-md
│   ├── --shadow-lg
│   └── --shadow-blue-md
│
├── GRADIENTS
│   ├── --gradient-primary
│   ├── --gradient-cyan
│   └── --gradient-green
│
└── TYPOGRAPHY
    ├── --text-xs to --text-4xl
    └── --font-normal to --font-bold
```

## 🧩 Component Dependencies

```
SIDEBAR (.jsx)
    ↓
aeg-system.css
    ↓
    ├─ _variables.css   → Colors, spacing
    ├─ _sidebar.css     → Sidebar specific styles
    ├─ _buttons.css     → Navigation links
    └─ _animations.css  → Status dot pulse

DAFTAR RFID (.jsx)
    ↓
aeg-system.css
    ↓
    ├─ _variables.css   → Colors, spacing
    ├─ _forms.css       → Input fields, labels
    ├─ _buttons.css     → Scan button
    ├─ _cards.css       → Form card
    └─ _modals.css      → Scanning modal

MONITORING RFID (.jsx)
    ↓
aeg-system.css
    ↓
    ├─ _variables.css   → Colors, spacing, gradients
    ├─ _cards.css       → Stat cards
    ├─ _qc-buttons.css  → QC checkpoint buttons
    ├─ _tables.css      → Data table
    └─ _animations.css  → Hover effects

LIST ID (.jsx)
    ↓
aeg-system.css
    ↓
    ├─ _variables.css   → Colors, spacing
    ├─ _cards.css       → RFID cards
    ├─ _forms.css       → Search input
    ├─ _buttons.css     → Filter buttons
    └─ _layout.css      → Grid layout
```

## 📊 Before vs After Comparison

```
BEFORE (❌ Scattered)
├── components/
│   ├── Sidebar.css            ─┐
│   ├── DaftarID.css           ─┤
│   ├── DaftarKaryawan.css     ─┤
│   ├── DataSMV.css            ─┤
│   ├── EmployeeDashboard.css  ─┤
│   ├── Monitoring.css         ─┤  17+ FILES
│   ├── MonitoringQC.css       ─┤  Multiple imports
│   ├── Productivity.css       ─┤  Duplicate code
│   ├── Report.css             ─┤  Hard to maintain
│   └── RFID/                  ─┤
│       ├── DaftarRFID.css     ─┤
│       ├── ListID.css         ─┤
│       ├── MonitoringRFID.css ─┤
│       └── ScanningModal.css  ─┘
├── App.css
└── index.css

AFTER (✅ Modular)
└── styles/
    ├── aeg-system.css         ─┐  SINGLE IMPORT
    └── modules/               ─┤  Organized
        ├── _variables.css     ─┤  Reusable tokens
        ├── _reset.css         ─┤  Easy maintenance
        ├── _typography.css    ─┤  Consistent design
        ├── _layout.css        ─┤  Better performance
        ├── _sidebar.css       ─┤
        ├── _forms.css         ─┤
        ├── _buttons.css       ─┤  14 MODULES
        ├── _cards.css         ─┤  Component-based
        ├── _tables.css        ─┤  Scalable
        ├── _modals.css        ─┤  Professional
        ├── _qc-buttons.css    ─┤
        ├── _animations.css    ─┤
        ├── _scrollbar.css     ─┤
        └── _utilities.css     ─┘
```

## 🎯 Usage Pattern

```
OLD WAY (❌)
┌──────────────────────┐
│  Component.jsx       │
│                      │
│ import './Comp.css'  │ ─┐
│ import './App.css'   │ ─┼─ Multiple imports
│ import './index.css' │ ─┘
│                      │
│ <div className=...>  │
└──────────────────────┘

NEW WAY (✅)
┌───────────────────────────┐
│  Component.jsx            │
│                           │
│ import                    │
│ './styles/aeg-system.css' │ ─── Single import
│                           │
│ <div className="card      │
│   shadow-lg rounded-xl    │ ─── Utility classes
│   p-6">                   │
│                           │
│   <h2 className=          │
│     "text-2xl font-bold   │
│      text-primary mb-4">  │ ─── Typography classes
│                           │
│   <button className=      │
│     "btn btn-primary">    │ ─── Component classes
│                           │
└───────────────────────────┘
```

## 🔧 Customization Workflow

```
1. Change Design Token
   ↓
   Edit _variables.css
   ↓
   --primary-blue: #NEW_COLOR
   ↓
   Automatically updates ALL components
   ✅ Consistent across entire app

2. Add New Component Style
   ↓
   Create new module (e.g., _badge.css)
   ↓
   Add @import to aeg-system.css
   ↓
   Use classes in components
   ✅ Modular and organized

3. Modify Existing Component
   ↓
   Edit specific module file
   ↓
   Changes isolated to that component
   ↓
   Test component
   ✅ No side effects
```

## 📈 Performance Flow

```
Browser Request
    ↓
Load HTML
    ↓
Find <link> or import
    ↓
Request aeg-system.css (1 FILE)
    ↓
Parse CSS (all modules bundled)
    ↓
Apply styles to components
    ↓
✅ FAST: Single HTTP request
✅ CACHED: One file to cache
✅ OPTIMIZED: Minimal overhead
```

## 🎓 Learning Path

```
BEGINNER
├── Read CSS_QUICK_REFERENCE.md
├── Try basic examples
└── Use utility classes

INTERMEDIATE
├── Read CSS_SYSTEM_GUIDE.md
├── Understand variables
├── Use component classes
└── Customize colors

ADVANCED
├── Edit module files
├── Create custom components
├── Add new variables
└── Optimize for production
```

---

**Legend**:
- ⭐ = Master file (import this)
- ↓ = Import/dependency direction
- ─ = Connection/grouping
- ✅ = Best practice
- ❌ = Avoid this

---

This diagram represents the complete architecture of the AEG Modular CSS System.

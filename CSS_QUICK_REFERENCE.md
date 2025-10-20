# 🎨 AEG CSS - Quick Reference

## 📥 Import (Do this ONCE)
```jsx
import './styles/aeg-system.css';
```

---

## 🎨 Colors

### Primary
```css
var(--primary-blue)       /* #2563EB */
var(--primary-blue-dark)  /* #1E40AF */
var(--primary-blue-light) /* #3B82F6 */
```

### Semantic
```css
var(--success)           /* #10B981 Green */
var(--warning-orange)    /* #F59E0B Orange */
var(--danger)            /* #EF4444 Red */
```

### Grays
```css
var(--gray-900)  /* #1E293B Dark */
var(--gray-600)  /* #64748B Medium */
var(--gray-300)  /* #E2E8F0 Light */
var(--gray-100)  /* #F8FAFC Very Light */
```

---

## 📏 Spacing (4px grid)

```css
var(--spacing-1)  /* 4px */
var(--spacing-2)  /* 8px */
var(--spacing-3)  /* 12px */
var(--spacing-4)  /* 16px */
var(--spacing-6)  /* 24px */
var(--spacing-8)  /* 32px */
```

**Utility Classes**:
```jsx
<div className="p-4 mt-6 mb-8">  // padding-4, margin-top-6, margin-bottom-8
```

---

## 🔘 Buttons

```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Delete</button>
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-lg">Large</button>
```

---

## 📦 Cards

```jsx
// Basic Card
<div className="card shadow-lg rounded-xl p-6">
  <h2 className="text-xl font-bold">Title</h2>
  <p className="text-secondary">Description</p>
</div>

// Stat Card
<div className="stat-card primary">
  <div className="stat-label">Total Scans</div>
  <div className="stat-value">150</div>
</div>

// RFID Card
<div className="rfid-card">
  <div className="rfid-card-header">
    <div className="rfid-card-id">RF20250115001</div>
  </div>
</div>
```

---

## 📝 Forms

```jsx
<div className="form-group">
  <label className="form-label required">Work Order</label>
  <input 
    type="text" 
    className="form-input"
    placeholder="Enter work order"
  />
  <span className="form-error">Required field</span>
</div>

<div className="form-actions">
  <button className="btn btn-primary">Submit</button>
</div>
```

---

## 📊 Tables

```jsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th>RFID ID</th>
        <th>Work Order</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="table-cell-primary">RF001</td>
        <td>WO-2025-001</td>
        <td>
          <div className="table-actions">
            <button className="table-action-btn delete">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 🎯 QC Buttons

```jsx
<div className="qc-checkpoint">
  <h3 className="qc-checkpoint-title">QC Endline</h3>
  <div className="qc-buttons">
    <button className="qc-btn reject">
      <div className="qc-btn-label">Reject</div>
      <div className="qc-btn-value">5</div>
    </button>
    
    <button className="qc-btn rework">
      <div className="qc-btn-label">Rework</div>
      <div className="qc-btn-value">3</div>
    </button>
    
    <button className="qc-btn hasper">
      <div className="qc-btn-label">Hasper</div>
      <div className="qc-btn-value">2</div>
    </button>
    
    <button className="qc-btn pass">
      <div className="qc-btn-label">QC Pass</div>
      <div className="qc-btn-value">10</div>
    </button>
  </div>
</div>
```

---

## 💫 Animations

```jsx
<div className="animate-pulse">Pulsing</div>
<div className="animate-spin">Spinning</div>
<div className="animate-float">Floating</div>
<div className="animate-fade-in">Fading In</div>

<div className="hover-lift">Lift on hover</div>
<div className="hover-grow">Grow on hover</div>
```

---

## 🎭 Modals

```jsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2 className="modal-title">Title</h2>
      <button className="modal-close">×</button>
    </div>
    <div className="modal-body">
      Content here
    </div>
    <div className="modal-footer">
      <button className="btn btn-primary">OK</button>
    </div>
  </div>
</div>
```

---

## 🎨 Shadows

```css
var(--shadow-sm)       /* Subtle */
var(--shadow-md)       /* Medium */
var(--shadow-lg)       /* Large */
var(--shadow-blue-md)  /* Blue glow */
```

**Classes**:
```jsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow-lg">Large shadow</div>
```

---

## 📐 Border Radius

```css
var(--radius-sm)   /* 4px */
var(--radius-md)   /* 8px */
var(--radius-lg)   /* 12px */
var(--radius-xl)   /* 16px */
var(--radius-full) /* Circle */
```

**Classes**:
```jsx
<div className="rounded-lg">Large radius</div>
<div className="rounded-full">Circle</div>
```

---

## 📊 Layout Utilities

```jsx
// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-3 gap-6">

// Spacing
<div className="p-6 mt-4 mb-8">

// Display
<div className="hidden">
<div className="block">
```

---

## 🎨 Typography

```jsx
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-2xl font-semibold">Heading 2</h2>
<p className="text-base text-secondary">Paragraph</p>
<small className="text-sm text-muted">Small text</small>

// Text colors
<span className="text-primary">Primary blue</span>
<span className="text-secondary">Gray</span>
<span className="text-white">White</span>
```

---

## 🔧 Common Patterns

### Centered Content
```jsx
<div className="center">
  <h1>Centered</h1>
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-3 gap-6">
  <div className="card shadow-lg"></div>
  <div className="card shadow-lg"></div>
  <div className="card shadow-lg"></div>
</div>
```

### Form with Card
```jsx
<div className="form-container">
  <div className="form-card">
    <div className="form-group">...</div>
    <div className="form-actions">...</div>
  </div>
</div>
```

---

## ⚡ Pro Tips

1. **Use CSS Variables**: `var(--primary-blue)` instead of `#2563EB`
2. **Utility First**: Use utility classes before custom CSS
3. **Spacing System**: Stick to 4px grid (spacing-1 to spacing-8)
4. **Consistent Colors**: Use semantic colors (success, warning, danger)
5. **Gradients**: Use predefined gradients from variables

---

## 🚨 Common Mistakes

❌ **Don't**:
```jsx
// Multiple CSS imports
import './Sidebar.css';
import './DaftarRFID.css';

// Hardcoded values
style={{ color: '#2563EB', padding: '12px' }}

// Inline styles for layout
style={{ display: 'flex', justifyContent: 'center' }}
```

✅ **Do**:
```jsx
// Single CSS import
import './styles/aeg-system.css';

// Use variables
style={{ color: 'var(--primary-blue)', padding: 'var(--spacing-3)' }}

// Use utility classes
className="flex justify-center"
```

---

## 📝 Example Component

```jsx
import React from 'react';
import './styles/aeg-system.css';

function MyComponent() {
  return (
    <div className="container">
      <div className="card shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">
          RFID Scan Details
        </h2>
        
        <div className="form-group">
          <label className="form-label required">Work Order</label>
          <input 
            type="text" 
            className="form-input"
            placeholder="WO-2025-001"
          />
        </div>
        
        <div className="flex gap-3 mt-6">
          <button className="btn btn-primary">Save</button>
          <button className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default MyComponent;
```

---

**Quick Help**: See `CSS_SYSTEM_GUIDE.md` for full documentation

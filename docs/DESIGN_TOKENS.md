# Design Tokens Reference

**DM Tool Design System - Token Usage Guide**

Questo documento fornisce linee guida su quando e come utilizzare i design tokens definiti nel nostro sistema.

---

## 🎨 Color Tokens

### **Surface Colors**

Utilizzati per sfondi di componenti e layout:

```css
--surface-primary     /* Superficie principale (card, modal, sidebar) */
--surface-secondary   /* Superficie secondaria (hover states, accenti sottili) */
--surface-tertiary    /* Superficie terziaria (disabled, placeholder areas) */
```

**Quando usare:**

- **Primary**: Background principale di card, modal, pannelli
- **Secondary**: Stati hover, aree di input focus, accenti sottili
- **Tertiary**: Componenti disabilitati, aree placeholder, divisori

**Esempi:**

```css
.dm-card {
  background-color: var(--surface-primary);
}
.dm-button:hover {
  background-color: var(--surface-secondary);
}
.dm-input:disabled {
  background-color: var(--surface-tertiary);
}
```

### **Text Colors**

Gerarchia tipografica semantica:

```css
--text-primary        /* Testo principale, titoli, contenuto importante */
--text-secondary      /* Testo di supporto, sottotitoli, metadati */
--text-placeholder    /* Placeholder, hint text, contenuto secondario */
--text-inverse        /* Testo su sfondi scuri/colorati */
```

**Regola di accessibilità**: Sempre contrast ratio ≥ 4.5:1 con il background.

### **Border Colors**

```css
--border-primary      /* Bordi principali (card, input, divisori) */
--border-secondary    /* Bordi secondari (hover states) */
--border-focus        /* Bordi focus states (blu, alta visibilità) */
```

### **Semantic Colors**

Stati e feedback per l'utente:

```css
--color-primary-*     /* Azioni principali, brand (CTA, link primari) */
--color-success-*     /* Successo, conferme (salva, completa) */
--color-error-*       /* Errori, warning critici (elimina, errore) */
--color-warning-*     /* Attenzione, modifiche (edit, attenzione) */
--color-info-*        /* Informazioni, neutrali (info, dettagli) */
```

**Palette per ogni colore**: 100-900 (100=lightest, 900=darkest)

- **500**: Colore base standard
- **600**: Hover state
- **700**: Active/pressed state

---

## 📏 Spacing Tokens

### **Scale di Spacing**

Sistema basato su 4px (0.25rem):

```css
--space-0-5: 0.125rem; /* 2px  - Micro spacing */
--space-1: 0.25rem; /* 4px  - Tiny gaps */
--space-1-5: 0.375rem; /* 6px  - Small padding */
--space-2: 0.5rem; /* 8px  - Base small */
--space-3: 0.75rem; /* 12px - Base medium */
--space-4: 1rem; /* 16px - Base large */
--space-5: 1.25rem; /* 20px - Component spacing */
--space-6: 1.5rem; /* 24px - Section spacing */
--space-8: 2rem; /* 32px - Layout spacing */
--space-10: 2.5rem; /* 40px - Large sections */
--space-12: 3rem; /* 48px - Page sections */
--space-16: 4rem; /* 64px - Major layout */
```

### **Linee Guida Spacing**

**Micro Spacing (0.5-2):**

- Gap tra icone e testo
- Padding interno di tag/badge
- Border spacing

**Component Spacing (3-6):**

- Padding interno componenti
- Gap tra elementi correlati
- Margini di form field

**Layout Spacing (8-16):**

- Margini tra sezioni
- Padding di container
- Separazione logica di contenuti

**Esempi:**

```css
/* ✅ Corretto */
.dm-button {
  gap: var(--space-2);
  padding: 0 var(--space-4);
}
.dm-card {
  padding: var(--space-6);
}
.dm-form-field {
  margin-bottom: var(--space-4);
}

/* ❌ Evitare */
.dm-button {
  gap: 6px;
} /* Usa i token, non valori fissi */
```

---

## 🔤 Typography Tokens

### **Font Sizes**

```css
--font-size-xs: 0.75rem; /* 12px - Caption, metadata */
--font-size-sm: 0.875rem; /* 14px - Body small, helper text */
--font-size-base: 1rem; /* 16px - Body text standard */
--font-size-lg: 1.125rem; /* 18px - Lead text, subtitle */
--font-size-xl: 1.25rem; /* 20px - Heading small */
--font-size-2xl: 1.5rem; /* 24px - Heading medium */
--font-size-3xl: 1.875rem; /* 30px - Heading large */
--font-size-4xl: 2.25rem; /* 36px - Page title */
```

### **Font Weights**

```css
--font-weight-normal: 400; /* Body text */
--font-weight-medium: 500; /* Button text, emphasis */
--font-weight-semibold: 600; /* Subheadings */
--font-weight-bold: 700; /* Headings */
```

### **Line Heights**

```css
--line-height-none: 1; /* Tight headings */
--line-height-tight: 1.25; /* Headings, UI text */
--line-height-normal: 1.5; /* Body text standard */
--line-height-relaxed: 1.75; /* Long-form content */
```

**Quando usare:**

- **None/Tight**: Titoli, button text, UI labels
- **Normal**: Paragrafi, contenuto standard
- **Relaxed**: Testo lungo, documentazione

---

## 🔲 Component Tokens

### **Border Radius**

```css
--radius-base: 0.25rem; /* 4px  - Piccoli elementi */
--radius-md: 0.375rem; /* 6px  - Button, input */
--radius-lg: 0.5rem; /* 8px  - Card, panel */
--radius-xl: 0.75rem; /* 12px - Modal, grandi componenti */
--radius-2xl: 1rem; /* 16px - Hero sections */
--radius-full: 9999px; /* Circular - Avatar, badge */
```

### **Shadows**

```css
--shadow-sm:   /* Sottili - Card base */
--shadow-md:   /* Medie - Card hover, dropdown */
--shadow-lg:   /* Grandi - Modal, toast */
--shadow-xl:   /* Extra - Overlay principali */
--shadow-2xl:  /* Massive - Hero elements */
--shadow-focus: /* Focus states - Accessibilità */
```

**Gerarchia di elevazione:**

- **sm**: Card, button base
- **md**: Hover states, dropdown
- **lg**: Modal, sidepanel
- **xl-2xl**: Toast, overlay globali

### **Z-Index Scale**

```css
--z-dropdown: 1000; /* Menu dropdown */
--z-sticky: 1020; /* Sticky headers */
--z-fixed: 1030; /* Fixed navigation */
--z-modal-backdrop: 1040; /* Modal overlay */
--z-modal: 1050; /* Modal content */
--z-popover: 1060; /* Tooltip, popover */
--z-tooltip: 1070; /* Tooltip top-level */
--z-toast: 1080; /* Toast notifications */
```

---

## 🧩 Component-Specific Tokens

### **Button Tokens**

```css
--button-height-sm: 2rem; /* 32px */
--button-height-md: 2.5rem; /* 40px */
--button-height-lg: 3rem; /* 48px */
--button-padding-x-sm: var(--space-3);
--button-padding-x-md: var(--space-4);
--button-padding-x-lg: var(--space-6);
```

### **Input Tokens**

```css
--input-height-sm: 2rem;
--input-height-md: 2.5rem;
--input-height-lg: 3rem;
--input-padding-x-sm: var(--space-3);
--input-padding-y-sm: var(--space-1-5);
```

### **Modal Tokens**

```css
--modal-max-width-xs: 20rem; /* 320px - Alert, confirm */
--modal-max-width-sm: 24rem; /* 384px - Form semplici */
--modal-max-width-md: 32rem; /* 512px - Form standard */
--modal-max-width-lg: 48rem; /* 768px - Form complessi */
--modal-max-width-xl: 64rem; /* 1024px - Data intensive */
--modal-backdrop-blur: blur(4px);
```

### **Card Tokens**

```css
--card-padding-sm: var(--space-3); /* Card compatte */
--card-padding-md: var(--space-4); /* Card standard */
--card-padding-lg: var(--space-6); /* Card spaziose */
--card-radius: var(--radius-lg);
```

---

## ⚡ Animation Tokens

```css
--transition-fast: 150ms ease-in-out; /* Micro-interazioni */
--transition-normal: 250ms ease-in-out; /* Transizioni standard */
--transition-slow: 350ms ease-in-out; /* Animazioni complesse */

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Standard */
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* Enter */
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* Exit */
```

**Quando usare:**

- **Fast**: Hover, focus, piccoli cambiamenti
- **Normal**: Modal open/close, tab switching
- **Slow**: Page transitions, complex animations

---

## 📋 Linee Guida Pratiche

### **✅ Best Practices**

1. **Sempre usare token invece di valori hardcoded**

   ```css
   /* ✅ Corretto */
   .my-component {
     margin: var(--space-4);
   }

   /* ❌ Evitare */
   .my-component {
     margin: 16px;
   }
   ```

2. **Rispettare la semantic hierarchy**

   ```css
   /* ✅ Corretto */
   .primary-action {
     background: var(--color-primary-500);
   }
   .destructive-action {
     background: var(--color-error-500);
   }
   ```

3. **Utilizzare component tokens quando disponibili**

   ```css
   /* ✅ Corretto */
   .my-button {
     height: var(--button-height-md);
   }

   /* ❌ Meno ideale */
   .my-button {
     height: var(--space-10);
   }
   ```

### **🚫 Cosa Evitare**

- Non creare nuovi colori custom senza aggiungerli al sistema
- Non usare `!important` per override - modificare i token
- Non mescolare unità (px, rem, em) - seguire il sistema
- Non saltare livelli di spacing (da --space-2 a --space-8)

### **🔧 Estendere il Sistema**

Per aggiungere nuovi token:

1. **Aggiungi nel `variables.css`** seguendo le convenzioni
2. **Documenta qui** il nuovo token e il suo utilizzo
3. **Testa** in almeno 2 componenti diversi
4. **Valida** accessibilità e consistenza

---

## 🎯 Quick Reference

### **Spacing Comune**

- **Micro gap**: `--space-1` (4px)
- **Element gap**: `--space-2` (8px)
- **Component padding**: `--space-4` (16px)
- **Section spacing**: `--space-6` (24px)
- **Layout margins**: `--space-8` (32px)

### **Colori Frequenti**

- **Primary button**: `--color-primary-500`
- **Success button**: `--color-success-500`
- **Danger button**: `--color-error-500`
- **Card background**: `--surface-primary`
- **Body text**: `--text-primary`
- **Helper text**: `--text-secondary`

### **Sizes Standard**

- **Button medium**: `--button-height-md` (40px)
- **Input medium**: `--input-height-md` (40px)
- **Card radius**: `--radius-lg` (8px)
- **Modal medium**: `--modal-max-width-md` (512px)

---

_Questo documento è la single source of truth per l'utilizzo dei design tokens. Aggiornare quando si modificano i token in `variables.css`._

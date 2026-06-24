# Legal Contract Review Platform Design System

## Overview

This design system is built for an enterprise-grade AI Contract Review Platform focused on NDA and MSA contract analysis.

The visual language should communicate:

* Trust
* Security
* Professionalism
* Clarity
* Intelligence

The interface should feel modern and enterprise-ready while remaining clean and highly usable for legal and compliance teams.

---

# Brand Colors

## Primary Palette

| Token           | Hex       | Usage                      |
| --------------- | --------- | -------------------------- |
| Primary         | `#112E81` | Main brand color           |
| Primary Hover   | `#0E276E` | Hover states               |
| Secondary       | `#4647AE` | Secondary actions          |
| Secondary Hover | `#3B3C96` | Hover states               |
| Accent          | `#AACCD6` | Highlights and information |
| Accent Light    | `#D8E8ED` | Soft backgrounds           |

---

# Light Theme

## Background Colors

| Token             | Hex       |
| ----------------- | --------- |
| Background        | `#FFFFFF` |
| Background Subtle | `#F8FAFC` |
| Surface           | `#F1F5F9` |
| Elevated Surface  | `#FFFFFF` |

## Borders

| Token          | Hex       |
| -------------- | --------- |
| Border Default | `#E2E8F0` |
| Border Strong  | `#CBD5E1` |

## Text

| Token          | Hex       |
| -------------- | --------- |
| Primary Text   | `#0F172A` |
| Secondary Text | `#475569` |
| Muted Text     | `#64748B` |

---

# Dark Theme

## Background Colors

| Token             | Hex       |
| ----------------- | --------- |
| Background        | `#0F172A` |
| Background Subtle | `#162033` |
| Surface           | `#1E293B` |
| Elevated Surface  | `#263449` |

## Borders

| Token          | Hex                      |
| -------------- | ------------------------ |
| Border Default | `rgba(255,255,255,0.08)` |
| Border Strong  | `rgba(255,255,255,0.15)` |

## Text

| Token          | Hex       |
| -------------- | --------- |
| Primary Text   | `#F8FAFC` |
| Secondary Text | `#CBD5E1` |
| Muted Text     | `#94A3B8` |

---

# Semantic Colors

| State   | Color     |
| ------- | --------- |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Error   | `#DC2626` |
| Info    | `#0284C7` |

---

# Contract Status Colors

| Status     | Color     |
| ---------- | --------- |
| Completed  | `#16A34A` |
| Processing | `#F59E0B` |
| Failed     | `#DC2626` |
| Draft      | `#64748B` |

---

# Confidence Score Colors

| Confidence | Color     |
| ---------- | --------- |
| 90-100%    | `#16A34A` |
| 70-89%     | `#84CC16` |
| 50-69%     | `#F59E0B` |
| Below 50%  | `#DC2626` |

---

# Typography

## Fonts

### Primary Font

```css
Inter, sans-serif
```

Used for:

* Body text
* Inputs
* Labels
* Buttons
* Tables

### Display Font

```css
Inter, sans-serif
```

Used for:

* Page titles
* Dashboard headings
* Hero sections

### Monospace Font

```css
JetBrains Mono, monospace
```

Used for:

* Contract excerpts
* Technical content
* Code snippets

---

# Typography Scale

| Token      | Size | Weight |
| ---------- | ---- | ------ |
| Display    | 32px | 700    |
| H1         | 28px | 700    |
| H2         | 24px | 600    |
| H3         | 20px | 600    |
| H4         | 18px | 600    |
| Body Large | 16px | 400    |
| Body       | 14px | 400    |
| Small      | 12px | 400    |

---

# Spacing System

Use a 4px grid.

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| 2xl   | 40px  |
| 3xl   | 48px  |

---

# Layout Structure

## Dashboard Layout

```text
┌─────────────────────────────────────────────┐
│ Sidebar │ Main Content │ Right Panel        │
└─────────────────────────────────────────────┘
```

### Sidebar

Width:

```text
280px
```

Background:

```text
#112E81
```

### Main Content

Width:

```text
flex-1
```

Background:

```text
#F8FAFC
```

### Right Panel

Width:

```text
340px
```

Used for:

* AI insights
* Processing status
* Contract metadata

---

# Buttons

## Primary Button

Background:

```text
#112E81
```

Text:

```text
#FFFFFF
```

Usage:

* Upload Contract
* Process Contract
* Save Changes
* Sign In

---

## Secondary Button

Background:

```text
#4647AE
```

Text:

```text
#FFFFFF
```

Usage:

* View Details
* Open Chat
* Export Results

---

## Ghost Button

Background:

```text
transparent
```

Border:

```text
1px solid #CBD5E1
```

Usage:

* Cancel
* Close
* Back

---

# Cards

Background:

```text
#FFFFFF
```

Border:

```text
1px solid #E2E8F0
```

Radius:

```text
12px
```

Padding:

```text
24px
```

---

# Contract Viewer

## Document Area

Background:

```text
#FFFFFF
```

## Toolbar

Background:

```text
#112E81
```

Text:

```text
#FFFFFF
```

## Selected Text

Background:

```text
#AACCD6
```

---

# Key Term Table

Columns:

* Key Term
* Value
* Page Number
* Confidence Score
* Status

Row Hover:

```text
#F8FAFC
```

Selected Row:

```text
#D8E8ED
```

---

# Chat Interface

## User Messages

Background:

```text
#112E81
```

Text:

```text
#FFFFFF
```

## Assistant Messages

Background:

```text
#F1F5F9
```

Text:

```text
#0F172A
```

## Chat Container

Background:

```text
#FFFFFF
```

Border:

```text
#E2E8F0
```

---

# Forms

## Inputs

Height:

```text
44px
```

Border:

```text
#CBD5E1
```

Focus Border:

```text
#112E81
```

Radius:

```text
8px
```

---

# Icons

Library:

```text
Lucide React
```

Default Size:

```text
18px
```

Stroke Width:

```text
1.5
```

---

# Motion

Duration:

```text
150ms
```

Easing:

```text
ease-out
```

Rules:

* No bounce animations
* No excessive motion
* Fast transitions only
* Prioritize usability

---

# Accessibility

Requirements:

* WCAG AA compliance
* Keyboard navigation support
* Focus states for all interactive elements
* Minimum 4.5:1 text contrast ratio
* Screen reader compatibility

---

# Design Principles

1. Enterprise First
2. Legal Professional Focused
3. High Information Density
4. Minimal Visual Noise
5. Consistent Spacing
6. Clear Hierarchy
7. Accessibility First
8. Mobile Responsive
9. Fast Interactions
10. Trust & Security Focused

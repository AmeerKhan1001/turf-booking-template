# Design Document

## Overview

The BookingForm UI enhancement will transform the existing component into a modern, enterprise-grade interface using ShadCN UI components, Framer Motion animations, and professional design principles. The design focuses on creating a seamless, accessible, and visually appealing booking experience that builds user confidence and trust.

## Architecture

### Component Structure
The enhanced BookingForm will maintain its existing functional architecture while upgrading the presentation layer:

```
BookingForm (Enhanced)
├── FormProvider (React Hook Form + ShadCN Form)
├── StepIndicator (Custom with animations)
├── PersonalInfoStep (ShadCN Form fields)
├── ActivitySelectionStep (Enhanced Select with icons)
├── DateTimeStep (Improved Calendar + Time picker)
├── ReviewStep (Polished summary with animations)
└── AnimationProvider (Framer Motion wrapper)
```

### Design System Integration
- **ShadCN Components**: Form, Input, Select, Calendar, Dialog, Tabs, Popover, Button
- **Animation Library**: Framer Motion for smooth transitions and micro-interactions
- **Styling**: Tailwind CSS with custom design tokens for enterprise aesthetics


## Components and Interfaces

### Enhanced Form Architecture

#### FormProvider Integration
```typescript
interface EnhancedBookingFormProps {
  turfName: string;
  turfLocation: string;
  onSubmit?: (data: BookingFormData) => void;
  className?: string;
}

interface BookingFormData {
  customerName: string;
  sport: string;
  peopleCount: number;
  date: Date | null;
  time: string;
  duration: number;
  courtId: number;
}
```

#### Step Management System
```typescript
interface StepConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  validation: ZodSchema;
  isComplete: boolean;
  isAccessible: boolean;
}
```

### Animation System

#### Motion Variants
```typescript
const formAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  step: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  field: {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }
}
```

#### Micro-interactions
- Button press animations with scale transforms
- Input focus animations with border color transitions
- Loading states with skeleton animations
- Success/error state transitions with color morphing

### Visual Design System

#### Color Palette (Enterprise Theme)
```css
:root {
  --primary: 142 69% 58%;        /* Professional blue */
  --primary-foreground: 0 0% 98%;
  --secondary: 142 69% 95%;      /* Light blue accent */
  --accent: 142 69% 96%;         /* Subtle background */
  --muted: 210 40% 96%;          /* Neutral backgrounds */
  --border: 214 32% 91%;         /* Subtle borders */
  --success: 142 76% 36%;        /* Success green */
  --warning: 38 92% 50%;         /* Warning amber */
  --destructive: 0 84% 60%;      /* Error red */
}
```

#### Typography Scale
- **Headings**: Inter font family, semibold weights
- **Body**: Inter font family, regular weights
- **Labels**: Medium weight for form labels
- **Captions**: Smaller text with muted colors

#### Spacing System
- **Container**: max-width: 42rem (672px)
- **Section padding**: 1.5rem (24px)
- **Field spacing**: 1rem (16px) vertical
- **Component gaps**: 0.75rem (12px)

## Data Models

### Form State Management
```typescript
interface FormState {
  currentStep: number;
  formData: BookingFormData;
  validation: {
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };
  ui: {
    isLoading: boolean;
    isSubmitting: boolean;
    availabilityStatus: 'checking' | 'available' | 'unavailable';
  };
}
```

### Animation State
```typescript
interface AnimationState {
  stepTransition: 'entering' | 'exiting' | 'idle';
  fieldAnimations: Record<string, boolean>;
  loadingAnimations: Record<string, boolean>;
}
```

## Error Handling

### Validation Strategy
- **Real-time validation**: Using React Hook Form with Zod schemas
- **Visual feedback**: Animated error states with ShadCN form error components
- **Accessibility**: ARIA error announcements and descriptions

### Error States
```typescript
interface ErrorHandling {
  fieldErrors: {
    display: 'inline' | 'tooltip' | 'summary';
    animation: 'shake' | 'fade' | 'slide';
    persistence: 'until-fixed' | 'temporary';
  };
  networkErrors: {
    retry: boolean;
    fallback: React.ComponentType;
  };
}
```

## Testing Strategy

### Component Testing
- **Unit tests**: Individual form components with Jest/React Testing Library
- **Integration tests**: Form flow and validation logic
- **Accessibility tests**: ARIA compliance and keyboard navigation
- **Visual regression**: Storybook with Chromatic for UI consistency

### Animation Testing
- **Motion tests**: Framer Motion animation completion
- **Performance tests**: Animation frame rates and smoothness
- **Reduced motion**: Respect for user preferences

### Responsive Testing
- **Breakpoint tests**: Mobile (320px), Tablet (768px), Desktop (1024px+)
- **Touch interaction**: Minimum touch target sizes
- **Cross-browser**: Chrome, Firefox, Safari, Edge

## Implementation Phases

### Phase 1: Foundation
1. Set up ShadCN Form integration
2. Implement basic animation system
3. Create design system tokens
4. Establish accessibility baseline

### Phase 2: Component Enhancement
1. Upgrade form fields to ShadCN components
2. Implement step-by-step animations
3. Add micro-interactions
4. Enhance visual hierarchy

### Phase 3: Polish & Optimization
1. Fine-tune animations and transitions
2. Optimize performance
3. Complete accessibility audit
4. Cross-browser testing and fixes

## Performance Considerations

### Animation Performance
- Use CSS transforms for animations (GPU acceleration)
- Implement `will-change` property strategically
- Lazy load Framer Motion components
- Respect `prefers-reduced-motion` settings

### Bundle Optimization
- Tree-shake unused ShadCN components
- Code-split animation components
- Optimize image assets and icons
- Minimize CSS-in-JS runtime overhead

## Accessibility Features

### Keyboard Navigation
- Logical tab order through form steps
- Skip links for screen reader users
- Focus management during step transitions
- Escape key handling for modals/popovers

### Screen Reader Support
- Comprehensive ARIA labels and descriptions
- Live regions for dynamic content updates
- Proper heading hierarchy
- Form field associations with labels

### Visual Accessibility
- High contrast mode support
- Scalable text up to 200%
- Color-blind friendly color choices
- Clear focus indicators

## Browser Support

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Core functionality without JavaScript
- Graceful degradation for older browsers
- CSS feature detection with `@supports`
- Polyfills for critical features only
// Component Props and UI Types

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { User } from './index';

// Common Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Button Components
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

// Form Components
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, FormFieldProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement>, FormFieldProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
}

// Layout Components
export interface ContainerProps extends BaseComponentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fluid?: boolean;
}

export interface PageProps extends BaseComponentProps {
  title?: string;
  description?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

// Navigation Components
export interface NavigationLink {
  link: string;
  label: string;
  icon?: any; // Tabler icon component
  external?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  user?: User | null;
  onLogout?: () => void;
  links?: NavigationLink[];
}

export interface FooterProps extends BaseComponentProps {
  buildInfo?: string;
  currentYear?: number;
}

// Authentication Components
export interface LoginFormProps extends BaseComponentProps {
  onSubmit?: (credentials: { email: string; password: string; rememberMe?: boolean }) => void;
  loading?: boolean;
  error?: string;
}

export interface ProtectedRouteProps extends BaseComponentProps {
  user?: User | null;
  loading?: boolean;
  redirectTo?: string;
}

// Card and Content Components
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  actions?: ReactNode;
  hover?: boolean;
}

export interface SnippetProps extends BaseComponentProps {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  tags?: string[];
  date?: string;
}

// Modal and Dialog Components
export interface ModalProps extends BaseComponentProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  overlayProps?: any;
}

export interface ConfirmModalProps extends ModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
}

// Table Components
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string | number;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: ValidationRule;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitText?: string;
  resetText?: string;
  loading?: boolean;
}

// Animation and Motion Types
export interface AnimationConfig {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

export interface MotionComponentProps extends BaseComponentProps {
  animation?: AnimationConfig;
  delay?: number;
  duration?: number;
}
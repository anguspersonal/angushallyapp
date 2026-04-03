// CSS Module type declarations for proper TypeScript support

declare module '*.module.css' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}

declare module '*.module.scss' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}

declare module '*.module.sass' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}

// Specific type declarations for our Header component styles
export interface HeaderClasses {
  readonly header: string;
  readonly inner: string;
  readonly link: string;
  readonly dropdown: string;
}

// Style object types for inline styles
export interface InlineStyles {
  readonly textDecoration: 'none';
  readonly color: 'inherit';
  readonly display: 'block';
  readonly width: '100%';
  readonly height: 'auto';
  readonly maxWidth: number;
  readonly margin: string;
}
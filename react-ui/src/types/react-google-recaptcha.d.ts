declare module 'react-google-recaptcha' {
  import React from 'react';

  interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (value: string | null) => void;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    tabindex?: number;
    onExpired?: () => void;
    onErrored?: () => void;
    ref?: React.RefObject<any>;
  }

  const ReCAPTCHA: React.FC<ReCAPTCHAProps>;
  export default ReCAPTCHA;
} 
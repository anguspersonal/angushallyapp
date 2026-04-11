'use client';

import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
  isLoading: boolean;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  return (
<GoogleLogin
  onSuccess={onSuccess}
  onError={onError}
  useOneTap={false}
  auto_select={false}
  context="signin"
  theme="outline"
  size="large"
  width="300"
  type="standard"
  text="signin_with"
  shape="rectangular"
  logo_alignment="left"
  locale="en-GB"
  containerProps={{
    onClick: () => {} // ✅ safely injects click_listener param, avoids TS error
  }}
  promptMomentNotification={() => {
    console.log('Google One Tap prompt fired');
  }}
/>


  );
} 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSmtpAuthConfig(): any {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const oauthIntended = Boolean(clientId || clientSecret || refreshToken);

  if (oauthIntended) {
    const missing: string[] = [];
    if (!user) missing.push('SMTP_USER');
    if (!clientId) missing.push('GOOGLE_OAUTH_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_OAUTH_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_OAUTH_REFRESH_TOKEN');

    if (missing.length) {
      throw new Error(`Email OAuth2 configuration incomplete; missing ${missing.join(', ')}.`);
    }

    return {
      type: 'OAuth2',
      user: user!,
      clientId: clientId!,
      clientSecret: clientSecret!,
      refreshToken: refreshToken!,
    };
  }

  if (user && pass) {
    return { user, pass };
  }

  throw new Error(
    'Email authentication is not configured; please provide OAuth2 or password credentials.'
  );
}

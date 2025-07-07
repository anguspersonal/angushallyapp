// Basic user & auth related types shared between CRA and Next.js

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  token: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}
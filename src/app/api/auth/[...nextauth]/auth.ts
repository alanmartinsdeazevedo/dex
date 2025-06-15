import NextAuth, { Session } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { JWT } from 'next-auth/jwt';

interface UserData {
  ms_id: string;
  name: string;
  email: string;
  profile_image: string;
}

interface BackendResponse {
  id: string;
  role: {
    role: string;
  };
}
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('User:', user);
      console.log('Account:', account);
      console.log('Profile:', profile);
      if (account?.provider === 'microsoft-entra-id') {
        try {
          const userData: UserData = {
            ms_id: profile?.oid as string,
            name: profile?.name as string,
            email: profile?.email as string,
            profile_image: user?.image as string,
          };

          const response = await fetch(`${process.env.BACKEND_URL}/users/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error('Erro ao logar usuário');
          }

          const dbUser: BackendResponse = await response.json();

          user.id = dbUser.id;
          user.role = dbUser.role.role;

          return true;
        } catch (error) {
          console.error('Erro ao verificar/criar usuário:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Adiciona os campos personalizados à sessão
      if (token.id) {
        session.user.id = token.id;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Adiciona os campos personalizados ao token JWT
      if (user?.id) {
        token.id = user.id;
      }
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
  },
  debug: true,
});
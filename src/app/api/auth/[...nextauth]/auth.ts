import NextAuth from "next-auth"
import Entra from "next-auth/providers/microsoft-entra-id"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Entra({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
    }),
  ],
}) 
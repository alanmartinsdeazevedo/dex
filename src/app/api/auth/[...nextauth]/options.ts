import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const options: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { params: { scope: "openid profile email" } },

    }),
    
    ],
    pages: {
      signIn:"/dashboard",
      signOut: '/'  
    },
    
    session: {
      maxAge: 48 * 60 * 60,
      strategy: "jwt",
    },
    jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      
    },
 
};

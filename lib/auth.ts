import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export type Role = 'OWNER' | 'ADMIN' | 'EDITOR';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-email',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            memberships: {
              include: {
                organization: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error('No user found with this email');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        const defaultOrg = user.memberships[0]?.organization;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          organizationId: defaultOrg?.id,
          organizationRole: user.memberships[0]?.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as unknown as { organizationId?: string }).organizationId;
        token.organizationRole = (user as unknown as { organizationRole?: Role }).organizationRole;
      }

      if (trigger === 'update' && session?.organizationId) {
        token.organizationId = session.organizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { organizationId?: string }).organizationId = token.organizationId as string;
        (session.user as unknown as { organizationRole?: Role }).organizationRole = token.organizationRole as Role;
      }
      return session;
    },
  },
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireOrgRole(requiredRole: Role = 'EDITOR') {
  const session = await getAuthSession();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const orgId = (session?.user as unknown as { organizationId?: string })?.organizationId;

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: userId,
      },
    },
  });

  if (!member) {
    throw new Error('User is not a member of this organization');
  }

  const roleHierarchy: Record<Role, number> = {
    EDITOR: 1,
    ADMIN: 2,
    OWNER: 3,
  };

  const userRole = (member.role || 'EDITOR') as Role;

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }

  return { userId, orgId, role: userRole };
}

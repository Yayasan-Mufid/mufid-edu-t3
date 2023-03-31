import NextAuth from "next-auth"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from "@/lib/prisma"
import { createTransport } from 'nodemailer'
import Credentials from "next-auth/providers/credentials"
import { comparePassword } from '@/lib/password'
import EmailProvider from "next-auth/providers/email"
import { Roles } from "next-auth"
import { AuthOptions } from "next-auth/core/types"

const providers = [
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    async sendVerificationRequest(params) {
      const { provider, identifier, url } = params
      const { host } = new URL(url)
      console.log({ host, url, server: provider.server })
      const transport = createTransport(provider.server)
      const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: `Sign in to ${host}`,
        text: `Sign in now`,
        html: `<a href=${url}>Sign in now</a>`
      })
      console.log({ result })
    },
  }),
  Credentials({
    name: 'credentials',
    credentials: {
      email: {
        label: 'Username/E-mail',
        type: 'email',
        placeholder: 'username / student id',
      },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: 'password'
      }
    },
    async authorize(credentials) {
      if (credentials) {
        const { email, password } = credentials
        const user = await prisma.user.findFirst({
          where: { email }
        })
        if (user) {
          if (await comparePassword(password, user.password || '')) {
            console.log('PASSWORD MATCHES')
            return user
          } else {
            return null
          }
        }
      }
      return null
    },
  }),

]

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log({ user, account, email })
      return true
    },
    async jwt(payload) {
      if (payload.user) {
        const role = await prisma.userRole.findFirst({ where: { user_id: payload.user.id }})
        if (role) {
          const token = payload.token
          token.role = role.role_name as Roles
          token.userId = payload.user.id
        }
      }
      return payload.token
    },
    async session(payload) {
      const session = payload.session
      if (payload.token) {
        session.user.id = payload.token.userId
        const role = await prisma.userRole.findFirst({ where: { user_id: payload.token.userId }})
        if (role) {
          session.user.role = role.role_name as Roles
        }
      }
      // console.log({ session })
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'sdtsdf',
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'sdtsdf',
  }
}

export default NextAuth(authOptions)
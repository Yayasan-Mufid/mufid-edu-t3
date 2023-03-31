import { useState } from 'react';
import Head from 'next/head';
import { z } from 'zod'
import { trpc } from '@/lib/trpc/utils/trpc';
import { ErrorMessage } from '@hookform/error-message';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from 'next/link';

function SignInPage() {
  const { query } = useRouter()
  const context = trpc.useContext()
  const [userNotExist, setUserNotExist] = useState(false)
  const { register, watch, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      type: 'email',
      email: null,
      password: undefined
    },
    resolver: zodResolver(z.object({
      email: z.string().email(),
      type: z.literal('email').or(z.literal('credentials')),
      password: z.string().optional()
    }))
  })
  const selectedType = watch('type')
  return (
    <>
      <Head>
        <title>Mufid Edu - Masuk</title>
      </Head>
      <div className="flex min-h-screen justify-center items-center">
        <div className="card my-2 bg-base-300 dark:bg-slate-600 h-auto w-4/5 max-w-lg">
          <form onSubmit={handleSubmit(function(data) {
            if (data.email) {
              context.client.user.checkUserExist.mutate(data.email)
              .then(function(exists) {
                if (exists) {
                  setUserNotExist(false)
                  const { type, email, password } = getValues()
                  if (type === 'email') {
                    signIn('email', { email, callbackUrl: `${query.redirect || '/'}`, redirect: true })
                  } else {
                    signIn('credentials', { email, password, callbackUrl: `${query.redirect || '/'}`, redirect: true })
                  }
                } else {
                  setUserNotExist(true)
                }
              })
            }
          })}>
            <div className="card-body flex flex-col gap-2">
              <h1 className="font-extrabold text-lg text-center">Masuk/Login ke MUFID EDU</h1>
              <div className="form-control">
                <input
                  className="input input-bordered text-center"
                  type="email"
                  placeholder="Alamat E-mail"
                  {...register('email')}
                />
                <ErrorMessage
                  name="email"
                  errors={errors}
                  render={function({ message }) {
                    return (
                      <label className="label">
                        <span className="label-text text-red-500">{message}</span>
                      </label>
                    )
                  }}
                />
              </div>
              {
                selectedType === 'credentials' ? (
                  <div className="form-control">
                    <input
                      type="password"
                      className="input input-bordered text-center"
                      defaultChecked
                      placeholder="Password / Kata Sandi"
                      {...register('password')}
                    />
                    <ErrorMessage
                      name="password"
                      errors={errors}
                      render={function({ message }) {
                        return (
                          <label className="label">
                            <span className="label-text text-red-500">{message}</span>
                          </label>
                        )
                      }}
                    />
                  </div>
                ) : null
              }
              <div className="flex gap-2 justify-around">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Kirim link</span>
                    <input className="radio checked:bg-purple-500" type="radio" value="email" {...register('type')} />
                  </label>
                  {
                    userNotExist ? (
                      <label className="label">
                        <span className="label-text text-red-500">User tidak terdaftar</span>
                      </label>
                    ) : null
                  }
                  <ErrorMessage
                    name="type"
                    errors={errors}
                    render={function({ message }) {
                      return (
                        <label className="label">
                          <span className="label-text text-red-500">{message}</span>
                        </label>
                      )
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Password</span>
                    <input className="radio checked:bg-purple-500" type="radio" value="credentials" {...register('type')} />
                  </label>
                  <ErrorMessage
                    name="type"
                    errors={errors}
                    render={function({ message }) {
                      return (
                        <label className="label">
                          <span className="label-text text-red-500">{message}</span>
                        </label>
                      )
                    }}
                  />
                </div>
              </div>
              <div className="card-actions items-stretch flex-col">
                <button type="submit" className="btn btn-primary">
                  Masuk/Login
                </button>
                <div className="divider">Atau</div>
                <Link passHref href="/auth/register">
                  <button type="button" className="btn btn-outline">
                    Daftar
                  </button>
                </Link>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  )
}

SignInPage.withoutLayout = true

export default SignInPage
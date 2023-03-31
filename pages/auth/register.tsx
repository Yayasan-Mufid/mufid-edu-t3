import moment from 'moment'
import Head from 'next/head';
import Link from 'next/link';
import { trpc } from "@/lib/trpc/utils/trpc";
import { signIn } from 'next-auth/react'
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@hookform/error-message'
import { z, type ZodSchema } from "zod";

const userSchema: ZodSchema = z.object({
  name: z.string().refine(function(v: string) { return v.length > 2 }, { message: 'Too short' }),
  gender: z.literal('MALE').or(z.literal('FEMALE')),
  email: z.string().email(),
  date_of_birth: z.date().refine(function(v: Date) {
    return v <= moment().endOf('month').subtract(10, 'years').toDate()
  }, { message: 'Too Young' }),
  place_of_birth: z.string(),
  address: z.string(),
  phone_number: z.string(),
  password: z.string().refine(function(p) { return p.length >=8 }, { message: 'Minimal 8 karakter' }),
  password2: z.string()
})
.refine(function(val) {
  return val.password === val.password2
}, { message: 'Password harus sama', path: ['password2'] })

function UserRegistrationPage() {
  const { query } = useRouter()
  const { mutate } = trpc.user.registerUser.useMutation({
    onSuccess(data) {
      if ('redirect' in query) {
        signIn('email', {
          email: data.email,
          redirect: true,
          callbackUrl: query.redirect as string
        })
      } else {
        signIn('email', { email: data.email, redirect: true, callbackUrl: '/' })
      }
    }
  })
  const { register, formState, handleSubmit } = useForm({
    resolver: zodResolver(userSchema)
  })
  return (
    <>
      <Head>
        <title>Pendaftaran Pengguna Baru</title>
      </Head>
      <div className="flex justify-center">
        <div className="card my-2 bg-base-300 dark:bg-slate-600 h-auto w-4/5 max-w-lg">          
          <form onSubmit={handleSubmit(function(data) {
            const parsed = userSchema.safeParse(data)
            if (parsed.success) mutate(parsed.data)
          })}>
            <div className="card-body">
              <h1 className="card-title font-extrabold text-xl text-center">Formulir Pendaftaran Pengguna Baru</h1>
              <div className="flex flex-col gap-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nama</span>
                  </label>
                  <input className="input input-bordered" {...register('name')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="name"
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
                  <label className="label">
                    <span className="label-text">Gender</span>
                  </label>
                  <select className="select select-bordered" {...register('gender')}>
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                  <ErrorMessage
                    errors={formState.errors}
                    name="gender"
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
                  <label className="label">
                    <span className="label-text">Tanggal Lahir</span>
                  </label>
                  <input type="date" className="input input-bordered" {...register('date_of_birth', { valueAsDate: true })} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="date_of_birth"
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
                  <label className="label">
                    <span className="label-text">Tempat Lahir</span>
                  </label>
                  <input className="input input-bordered" {...register('place_of_birth')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="place_of_birth"
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
                  <label className="label">
                    <span className="label-text">Alamat E-mail</span>
                  </label>
                  <input type="email" className="input input-bordered" {...register('email')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="email"
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
                  <label className="label">
                    <span className="label-text">No. Telepon Seluler</span>
                  </label>
                  <input type="tel" className="input input-bordered" {...register('phone_number')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="phone_number"
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
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input type="password" className="input input-bordered" {...register('password')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="password"
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
                  <label className="label">
                    <span className="label-text">Konfirmasi Password</span>
                  </label>
                  <input type="password" className="input input-bordered" {...register('password2')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="password2"
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
                  <label className="label">
                    <span className="label-text">Alamat (Sesuai KTP)</span>
                  </label>
                  <textarea className="textarea textarea-bordered" {...register('address')} />
                  <ErrorMessage
                    errors={formState.errors}
                    name="address"
                    render={function({ message }) {
                      return (
                        <label className="label">
                          <span className="label-text text-red-500">{message}</span>
                        </label>
                      )
                    }}
                  />
                </div>
                <div className="flex flex-col items-stretch gap-4">
                  <button className="btn btn-primary btn-block" type="submit">
                    Daftar
                  </button>
                  <div className="divider">Atau</div>
                  <Link href="/auth/signin" passHref>
                    <button className="btn btn-link btn-block">
                      Masuk
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default UserRegistrationPage
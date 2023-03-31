import { useMemo } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { trpc } from "@/lib/trpc/utils/trpc";
import { z } from 'zod'
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from "next/router";
import Head from "next/head";
import { useLayout } from "@/components/layout";

const programCreateSchema = z.object({
  title: z.string(),
  code: z.string(),
  description: z.string(),
  published: z.date(),
  cover_img_url: z.string().nullable(),
  bg_img_url: z.string().nullable()
})

function CreateProgramPage() {
  const { push } = useRouter()
  const { user } = useLayout()
  const { mutate, isLoading } = trpc.program.createProgram.useMutation({
    onSuccess(data, variables, context) {
      push(`/programs/${data.id}`)
    },
  })
  const formConfig: Parameters<typeof useForm>[0] = useMemo(function() {
    return {
      resolver: zodResolver(programCreateSchema),
      mode: 'all'
    }
  }, [])
  const { register, formState, handleSubmit } = useForm(formConfig)
  if (user?.role === 'ADMIN') return (
    <>
      <Head>
        <title>Program Baru</title>
      </Head>
      <div className="flex items-start justify-center">
        <div className="card my-2 bg-base-300 dark:bg-slate-600 h-auto w-full md:w-4/5 max-w-lg">
          <div className="card-body">
            <div className="card-title">
              <h3>Formulir Program Baru</h3>
            </div>
            <form
              className="flex flex-col gap-2 items-stretch"
              onSubmit={handleSubmit(function(data) {
                console.log(data)
                try {
                  const parsed = programCreateSchema.transform(function(v) {
                    return { ...v, published: v.published.toISOString() }
                  }).parse(data)
                  mutate({
                    code: parsed.code,
                    description: parsed.description,
                    title: parsed.title,
                    published: parsed.published
                  })
                } catch (e) {
                  console.log(e)
                }
              })}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Judul Program</span>
                </label>
                <input className="input input-bordered"
                {...register('title')}
                />
                <ErrorMessage
                  name="title"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Kode Program</span>
                </label>
                <input className="input input-bordered"
                {...register('code')}
                />
                <ErrorMessage
                  name="code"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deskripsi</span>
                </label>
                <textarea className="textarea textarea-bordered"
                {...register('description')}
                />                
                <ErrorMessage
                  name="description"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tanggal Publikasi</span>
                </label>
                <input type="date" className="input input-bordered"
                {...register('published', { valueAsDate: true })}
                />                
                <ErrorMessage
                  name="published"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cover Image URL</span>
                </label>
                <input className="input input-bordered"
                {...register('cover_img_url')}
                />                
                <ErrorMessage
                  name="cover_img_url"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Background Image URL</span>
                </label>
                <input className="input input-bordered"
                {...register('bg_img_url')}
                />                
                <ErrorMessage
                  name="bg_img_url"
                  errors={formState.errors}
                  render={function({ message }) {
                    return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                  }}
                />
              </div>
              <button type="submit" className="btn btn-block btn-primary mt-2">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
    
  )
  return null
}

export default CreateProgramPage
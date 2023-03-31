import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ErrorMessage } from "@hookform/error-message";
import { trpc } from "@/lib/trpc/utils/trpc";


const moduleSchema = z.object({
  program_id: z.string(),
  title: z.string(),
  code: z.string().refine(function(v: string): boolean {
    return v.indexOf(' ') === -1
  }, { message: 'Slug must be unique and contains no space' }),
  slug: z.string().refine(function(v: string = ''): boolean {
    return v.indexOf(' ') === -1
  }, { message: 'Slug must be unique and contains no space' }),
  description: z.string(),
  published: z.date().nullable().optional(),
  cover_img_url: z.string().nullable().optional(),
  bg_img_url: z.string().nullable().optional(),
  seq: z.number().int()
})

function CreateModulePage() {
  const { query, push } = useRouter()
  const { mutate, isLoading } = trpc.module.createModule.useMutation({
    onSuccess(data) {
      push(`/modules/${data.id}`)
    }
  })
  const { register, formState, handleSubmit } = useForm({
    resolver: zodResolver(moduleSchema)
  })
  if ('program_id' in query) {
    return (
      <>
        <Head>
          <title>Buat Program Baru</title>
        </Head>
        <div className="flex justify-center items-start">
          <div className="card my-2 bg-base-300 dark:bg-slate-600 h-auto w-full md:w-4/5 max-w-lg">
            <div className="card-body">
              <h1 className="card-title text-2xl font-extrabold">Formulir Modul</h1>
              <form
                className="flex flex-col gap-2 items-stretch"
                onSubmit={handleSubmit(function(data) {
                  const parsed = moduleSchema.transform(function(v) {
                    return { ...v, published: v.published?.toISOString() }
                  }).safeParse(data)
                  if (parsed.success) {
                    mutate(parsed.data)
                  } else {
                    console.log(parsed.error.issues)
                  }
                })}
              >
                <input type="hidden" value={query.program_id} {...register('program_id')} />
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Judul</span>
                  </label>
                  <input className="input input-bordered" {...register('title')} />                  
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
                    <span className="label-text">Kode</span>
                  </label>
                  <input className="input input-bordered" {...register('code')} />
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
                    <span className="label-text">Slug</span>
                  </label>
                  <input className="input input-bordered" {...register('slug')} />
                  <ErrorMessage
                    name="slug"
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
                  <textarea className="textarea textarea-bordered" {...register('description')} />
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
                  <input type="date" className="input input-bordered" {...register('published', { valueAsDate: true })} />                  
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
                    <span className="label-text">Urutan Modul</span>
                  </label>
                  <input type="number" step={1} className="input input-bordered" {...register('seq', { valueAsNumber: true })} />                  
                  <ErrorMessage
                    name="seq"
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
                  <input type="url" className="input input-bordered"
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
                  <input type="url" className="input input-bordered"
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
                <button type="submit" className={["mt-4 btn btn-primary btn-block", isLoading ? 'loading' : ''].join(' ')}>
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }
  return <div>Incomplete Parameter</div>
}

export default CreateModulePage
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { trpc } from "@/lib/trpc/utils/trpc";
import { ErrorMessage } from '@hookform/error-message';

const basicModuleItemSchema = z.object({
  title: z.string(),
  code: z.string(),
  text: z.string(),
  seq: z.number(),
  mandatory: z.boolean(),
  cover_img_url: z.string().url().nullable().optional(),
  bg_img_url: z.string().url().nullable().optional(),
})

const basicModuleItemaAttachmentSchema = z.object({
  description: z.string(),
  type: z.string(),
  url: z.string().url(),
  seq: z.number(),
  mandatory: z.boolean()
})


const createModuleItemSchema = basicModuleItemSchema.extend({
  module_id: z.string(),
  parent_item_id: z.string().optional(),
  is_root: z.boolean().optional(),
  attachments: z.array(basicModuleItemaAttachmentSchema).optional()
})


function CreateModuleItemPage() {
  const { query, push } = useRouter()
  const { register, formState: { errors }, handleSubmit, control } = useForm({
    resolver: zodResolver(createModuleItemSchema)
  })
  const { append, fields, remove } = useFieldArray({
    name: 'attachments',
    control,
  })
  const { mutate, isLoading } = trpc.moduleItem.createModuleItem.useMutation({
    onSuccess(data, variables, context) {
      push(`/module-items/${data.id}`)
    },
  })
  if (query?.module_id) {
    return (
      <>
        <Head>
          <title>Buat Materi Baru</title>
        </Head>
        <div className="flex justify-center items-start">
          <div className="card my-2 bg-base-300 dark:bg-slate-600 h-auto w-full md:w-4/5 max-w-lg">
            <div className="card-body">
              <h1 className="card-title text-2xl font-extrabold">Formulir Materi</h1>
              <form
                className="flex flex-col items-stretch gap-2"
                onSubmit={handleSubmit(function(data) {
                  const parsed = createModuleItemSchema.safeParse(data)
                  if (parsed.success) {
                    mutate(parsed.data)
                  }
                })}
              >
                <input type="hidden" value={`${query.module_id}`} {...register('module_id')} />
                {
                  query.parent_item_id ? (
                    <input type="hidden" value={`${query.parent_item_id}`} {...register('parent_item_id')} />
                  ) : null
                }
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Judul</span>
                  </label>
                  <input className="input input-bordered" {...register('title')} />
                  <ErrorMessage
                    name="title"
                    errors={errors}
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
                    errors={errors}
                    render={function({ message }) {
                      return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Text</span>
                  </label>
                  <textarea className="textarea textarea-bordered" {...register('text')} />
                  <ErrorMessage
                    name="text"
                    errors={errors}
                    render={function({ message }) {
                      return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">No. Urut</span>
                  </label>
                  <input type="number" step={1} min={1} className="input input-bordered" {...register('seq', { valueAsNumber: true })} />
                  <ErrorMessage
                    name="seq"
                    errors={errors}
                    render={function({ message }) {
                      return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Wajib</span>
                    <input type="checkbox" className="toggle toggle-primary" {...register('mandatory')} />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Punya Sub-Materi</span>
                    <input type="checkbox" defaultChecked className="toggle toggle-primary" {...register('is_root')} />
                  </label>
                </div>
                <div className="divider">Sisipan</div>
                {
                  fields.map(function(field, index) {
                    return (
                      <div key={field.id} className="rounded-box p-4 flex flex-col items-stretch bg-base-200 dark:bg-slate-200">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Tipe</span>
                          </label>
                          <select className="select select-bordered" {...register(`attachments.${index}.type`)}>
                            <option value="youtube">Youtube Video</option>
                            <option value="video">Hosted Video</option>
                            <option value="image">Gambar</option>
                            <option value="file">File</option>
                            <option value="audio">Audio</option>
                          </select>
                          <ErrorMessage
                            name={`attachments.${index}.type`}
                            errors={errors}
                            render={function({ message }) {
                              return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                            }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">URL/Link</span>
                          </label>
                          <input className="input input-bordered" {...register(`attachments.${index}.url`)} />
                          <ErrorMessage
                            name={`attachments.${index}.url`}
                            errors={errors}
                            render={function({ message }) {
                              return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                            }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Deskripsi</span>
                          </label>
                          <textarea className="textarea textarea-bordered" {...register(`attachments.${index}.description`)} />                        
                          <ErrorMessage
                            name={`attachments.${index}.description`}
                            errors={errors}
                            render={function({ message }) {
                              return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                            }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">No. Urut</span>
                          </label>
                          <input type="number" step={1} min={1} className="input input-bordered" {...register(`attachments.${index}.seq`, { valueAsNumber: true })} />
                          <ErrorMessage
                            name={`attachments.${index}.seq`}
                            errors={errors}
                            render={function({ message }) {
                              return <label className="label"><span className="label-text text-red-500">{message}</span></label>
                            }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Wajib</span>
                            <input type="checkbox" className="toggle toggle-primary" {...register(`attachments.${index}.mandatory`)} />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-block"
                          onClick={function() { remove(index) }}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })
                }
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={isLoading}
                  onClick={function() {
                    append({
                      type: 'youtube',
                      url: null,
                      description: null,
                      seq: null,
                      mandatory: true
                    })
                  }}
                >
                  Tambah Sisipan
                </button>
                <div className="card-actions mt-4">
                  <button type="submit" className={["btn btn-primary btn-block", isLoading ? 'loading' : ''].join(' ')}>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }
  return null
}

export default CreateModuleItemPage
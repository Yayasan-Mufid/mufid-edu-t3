import { trpc } from "@/lib/trpc/utils/trpc";
import { useRouter } from "next/router";
import { useLayout } from "@/components/layout";
import Link from "next/link";

export default function ProgramPage() {
  const { query } = useRouter()
  const { user } = useLayout()
  const { data } = trpc.program.getProgram.useQuery(`${query.program_id}`)
  const { data: modules } = trpc.module.getModules.useQuery({
    where: { program_id: data?.id },
    orderBy: { seq: 'asc' }
  })
  if (!query.program_id) {
    return <div>Not Found</div>
  }
  if (data) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="hero lg:flex-shrink-0 lg:w-96">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-extrabold">{data.title}</h1>
              <p className="py-6">{data.description}</p>
            </div>
          </div>
        </div>
        <div className="lg:flex-grow">
          <div className="divider">Modul</div>
          {
            modules ? (
              modules.map(function({ id, title, code, description, seq }) {
                return (
                  <div key={id} className="flex gap-2 items-center hover:shadow-xl">
                    <div className="font-extrabold flex-shrink-0 text-2xl w-48 justify-center items-center">
                      {seq}
                    </div>
                    <Link passHref href={`/modules/${id}`}>
                      <div className="flex flex-grow flex-col gap-1 cursor-pointer">
                        <h3 className="font-extrabold">{title}</h3>
                        <p>{description}</p>
                      </div>
                    </Link>
                  </div>
                )
              })
            ) : <div className="text-center">Belum ada modul</div>
          }
          <div className="flex justify-center">
          {
            user?.role === 'ADMIN' ? (
              <Link passHref href={`/modules/create?program_id=${data.id}`}>
                <button className="btn btn-primary w-64">Tambah Modul</button>
              </Link>
            ) : null
          }
          </div>
        </div>
      </div>
    )
  }
  return null
}
/* eslint-disable @next/next/no-img-element */
import { trpc } from "@/lib/trpc/utils/trpc";
import Link from "next/link";
import RoleGuard from "@/components/layout/role-guard";

export default function ProgramsPage() {
  const { data } = trpc.program.getPrograms.useQuery({
    select: { id: true, title: true, description: true, code: true }
  })
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-stretch md:grid md:grid-cols-2 lg:grid-cols-3">
        {
          data?.map(function({ code, title, cover_img_url, id, description }) {
            return (
              <div key={id} className="card w-full col-span-1 bg-base-100 dark:bg-slate-200 rounded-lg hover:shadow-xl">
                <figure>
                  {
                    cover_img_url ? (
                      <img src={cover_img_url} alt="thumbnails" />
                    ) : null
                  }
                </figure>
                <div className="card-body">                  
                  <div className="card-title font-extrabold text-lg">{title}</div>
                  <p>{description}</p>
                  <div className="card-actions justify-end">
                    <Link passHref href={`/programs/${code}`}>
                      <button className="btn btn-primary">Detil</button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>      
      <div className="flex gap-2 justify-center">
        <RoleGuard roles={['ADMIN', 'PROGRAM_ADMIN']}>
          <Link passHref href="/programs/create">
            <button className="btn btn-primary">Buat Program</button>
          </Link>
        </RoleGuard>
      </div>
    </div>
  )
}
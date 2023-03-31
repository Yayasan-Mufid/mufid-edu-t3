import { useMemo } from "react";
import ReactPlayer from 'react-player'
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { trpc } from "@/lib/trpc/utils/trpc";
import { useLayout } from "@/components/layout";

interface BreadcrumbChild {
  href: string,
  text: string
}

export default function ModuleItemPage() {
  const { user } = useLayout()
  const { query } = useRouter()
  const { data, isFetching } = trpc.moduleItem.getModuleItem.useQuery(`${query.id}`)
  const { data: siblings } = trpc.moduleItem.getModuleItems.useQuery({ module_id: data?.module_id }, { enabled: Boolean(data) })
  const { data: children, isFetching: isFetchingChildren } = trpc.moduleItem.getModuleItems.useQuery({ parent_item_id: `${query.id}` }, { enabled: Boolean(data) })
  const breadCrumbs: Array<BreadcrumbChild> = useMemo(function() {
    if (data) {
      const links: Array<BreadcrumbChild> = [
        { href: `/programs/${data.module.program.code}`, text: data.module.program.title },
        { href: `/modules/${data.module.code}`, text: data.module.title },
      ]
      const crumbs: Array<BreadcrumbChild> = [{ href: `/module-items/${data.id}`, text: data.title }]
      if (siblings && data.parent_item && data.parent_item_id) {
        let lastParent: string | null = data.parent_item_id
        while(lastParent) {
          const nextparent = siblings.filter(function({ id }) { return id === lastParent })
          if (nextparent) {
            lastParent = nextparent[0].parent_item_id
            crumbs.push({ href: `/module-items/${nextparent[0].id}`, text: nextparent[0].title })
          }
        }
      }
      return [...links, ...crumbs.reverse()]
    }
    return []
  }, [data, siblings])
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm breadcrumbs">
        <ul>
          {breadCrumbs.map(function({ href, text }) {
            return <li key={href}><Link passHref href={href}><a>{text}</a></Link></li>
          })}
        </ul>
      </div>
      <h1 className="text-2xl font-extrabold">{data?.title}</h1>
      <p>{data?.text}</p>
      <div className="w-full p-4 flex flex-col gap-2 mt-2">
        
        {
          data?.attachments.map(function({ id, type, url, description }) {
            if (['youtube', 'video'].includes(type)) return (
              <div className="flex justify-center">
                <ReactPlayer
                  url={url}
                />
              </div>
            )
            return (
              <div key={id} className="flex flex-col gap-1">
                URL:{url}
                Tipe:{type}
                Deskripsi:{description}
              </div>
            )
          })
        }
      </div>
      {
        children && children.length > 0 ? (
          <>
            <div className="divider">Sub-Materi</div>
            <div className="flex flex-col items-stretch gap-2">
              {
                children.map(function({ id, title, text, seq }) {
                  return (
                    <div key={id} className="flex">
                      <div className="w-24 text-center font-extrabold">{seq}</div>
                      <Link passHref href={`/module-items/${id}`}>
                        <div className="flex flex-col cursor-pointer">
                          <h3 className="font-extrabold text-lg">{title}</h3>
                          <p>{text}</p>
                        </div>
                      </Link>
                    </div>
                  )
                })
              }
            </div>
          </>
        ) : null
      }
      {
        ['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN'].includes(user?.role) ? (
          <Link href={`/module-items/create?parent_item_id=${data?.id}&module_id=${data?.module_id}`} passHref>
            <button className="btn btn-primary">
              Tambah Sub-Materi
            </button>
          </Link>
        ) : null
      }
    </div>
  ) 
}
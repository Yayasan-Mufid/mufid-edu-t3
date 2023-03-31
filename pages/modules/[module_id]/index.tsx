import Head from "next/head";
import Link from "next/link";
import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import { trpc } from "@/lib/trpc/utils/trpc";
import { useLayout } from "@/components/layout";

function ModulePage() {
  const { user } = useLayout()
  const { query } = useRouter()
  const { data, isLoading } = trpc.module.getModule.useQuery(`${query.module_id}`)
  const { data: items, isLoading: isLoadingItem } = trpc.moduleItem.getModuleItems.useQuery({ module_id: data?.id })
  return (
    <>
      <Head>
        {
          data?.title ? (
            <title>Modul {data?.title}</title>
          ) : null
        }
      </Head>
      <div className="flex flex-col gap-4">
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            <li>
              <Link passHref href={`/programs/${data?.program.code}`}>
                <a>{data?.program.title}</a>
              </Link>
            </li>
            <li>
              <a>{data?.title}</a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-start">
          <div className="hero lg:w-96 lg:flex-shrink-0">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-2xl font-extrabold">{data?.title}</h1>
                <p>{data?.description}</p>
              </div>
            </div>
          </div>
          <div className="lg:flex-grow">
            <Tab.Group>
              <Tab.List className="tabs tabs-boxed flex-nowrap justify-center text-center overflow-x-auto">
                {
                  function({ selectedIndex }) {
                    return (
                      <>
                        <Tab as="a" key="items" className={['tab tab-lifted', selectedIndex === 0 ? 'tab-active' : ''].join(' ')}>Materi</Tab>
                        <Tab as="a" key="admins" className={['tab tab-lifted', selectedIndex === 1 ? 'tab-active' : ''].join(' ')}>Admin</Tab>
                        <Tab as="a" key="study-groups" className={['tab tab-lifted', selectedIndex === 2 ? 'tab-active' : ''].join(' ')}>Kelompok Belajar</Tab>
                        <Tab as="a" key="exams" className={['tab tab-lifted', selectedIndex === 3 ? 'tab-active' : ''].join(' ')}>Ujian</Tab>
                      </>
                    )
                  }
                }
              </Tab.List>
              <Tab.Panels className="mt-2">
                <Tab.Panel className="flex flex-col gap-2 items-stretch">
                  <div className="flex flex-col items-stretch mx-2">
                  {
                    items?.filter(function({ parent_item_id }) { return !parent_item_id })
                    .map(function({ id, title, text, seq }) {
                      return (
                        <div key={id} className="flex items-center">
                          <div className="w-24 font-extrabold text-lg text-center justify-center items-center flex-shrink-0">
                            {seq}
                          </div>
                          <Link passHref href={`/module-items/${id}`}>
                            <div className="flex-grow flex flex-col cursor-pointer">
                              <h3 className="text-xl font-extrabold">{title}</h3>
                              <p>{text}</p>
                            </div>
                          </Link>
                        </div>
                      )
                    })
                  }
                  </div>
                  <div className="flex justify-center items-center h-40">
                    {
                      ['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN'].includes(user?.role) ? (
                        
                        <Link passHref href={`/module-items/create?module_id=${data?.id}`}>
                          <button className="btn btn-primary">Tambah Materi</button>                      
                        </Link>
                      ) : null
                    }
                  </div>
                  {/* Tambah List Materi di sini */}
                  </Tab.Panel>
                <Tab.Panel className="flex flex-col gap-2 items-stretch">
                  <div className="flex justify-center items-center h-40">
                    <button className="btn btn-primary">Tambah Admin</button>
                  </div>
                  {/* Tambah List Admin di sini */}
                </Tab.Panel>
                <Tab.Panel className="flex flex-col gap-2 items-stretch">
                  <div className="flex justify-center items-center h-40">
                    <Link passHref href={`/study-groups/create?module_id=${data?.id}`}>
                      <button className="btn btn-primary">Tambah Kelompok Belajar</button>
                    </Link>
                  </div>
                  {/* Tambah List Kelompok Belajar di sini */}
                </Tab.Panel>
                <Tab.Panel className="flex flex-col gap-2 items-stretch">
                  <div className="flex justify-center items-center h-40">
                    <Link passHref href={`/exams/create?module_id=${data?.id}`}>
                      <button className="btn btn-primary">Tambah Ujian</button>
                    </Link>
                  </div>
                  {/* Tambah List Ujian  di sini */}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModulePage
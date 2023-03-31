import { useState } from 'react'
import { trpc } from "@/lib/trpc/utils/trpc";
import { useSession } from 'next-auth/react';

function ModulesPage() {
  const [searchText, setSearchText] = useState<string>('')
  const { data } = trpc.module.getModules.useQuery(searchText !== '' ? {
    where: {
      OR: [
        { title: { contains: searchText }},
        { code: { contains: searchText }},
        { description: { contains: searchText }}
      ]
    },
    include: { program: true }
  } : {
    include: { program: true }
  })
  if (data) {
    return (
      <div className="flex flex-col gap-2 items-stretch">
        <div className="flex"></div>
        <div className="flex flex-col gap-1">
          {
            data?.map(function({ title, slug, code, seq, description, id, program }) {
              return (
                <div key={id} className="flex">
                  <div className="avatar flex-shrink-0">
                    <div className="w-24 bg-base-300">
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="text-lg">{title}<span className="text-sm">{code}</span></div>
                    <div className="text-md">Program: {program.title}</div>
                    <p className="text-left">{description}</p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

}

export default ModulesPage
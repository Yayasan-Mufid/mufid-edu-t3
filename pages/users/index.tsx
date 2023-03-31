import { useState, useRef, useCallback, useEffect } from 'react'
import { trpc } from "@/lib/trpc/utils/trpc";
import { useLayout, type Direction } from '@/components/layout';

const topem = '48'

function UserListPage() {
  const { setShouldRespond } = useLayout()
  useEffect(function() {
    setShouldRespond(false)
    return function() {
      setShouldRespond(true)
    }
  }, [setShouldRespond])
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState<number>(30)
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = trpc.user.getUsers.useInfiniteQuery({
    filter,
    pageSize,
    direction
  }, {
    getNextPageParam(lastPage) {
      return lastPage.nextPageCursor
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
  return (
    <div className="w-full mt-2 flex flex-col items-center gap-2">
      <div
        className="flex w-11/12 lg:w-2/3 gap-2 items-center justify-between sticky top-5 bg-base-100 dark:bg-slate-800"
      >
        <div className="flex-grow input-group">
          <input
            className="input input-bordered w-full"
            onChange={function(e) {
              setFilter(e.target.value)
            }}
            value={filter || ''}
            placeholder="Cari User"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="select select-bordered flex-shrink-0"
            value={pageSize}
            onChange={function(e) { setPageSize(parseInt(e.target.value)) }}
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex-shrink-0">

        </div>
      </div>
      <div className="flex flex-col gap-2 w-11/12 lg:w-2/3 items-stretch">
        {
          data?.pages.map(function(page) {
            if (page) return page.data?.map(function({ id, name, date_of_birth, email, gender }) {
              return (
                <div key={id} className="flex bordered hover:shadow-xl hover:cursor-pointer">
                  <div className="avatar">
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col lg:gap-2 lg:flex-row lg:items-baseline">
                      <div className="text-lg font-bold">{name}</div>
                      <div className="text-sm font-thin">{email}</div>
                    </div>
                    <div>Jenis: {gender}</div>
                    {
                      date_of_birth ? <div>Tanggal Lahir: {new Date(date_of_birth).toDateString()}</div> : null
                    }
                    
                  </div>
                </div>
              )
            })
            return null
          })
        }
      </div>
      {
        hasNextPage ? (
          <div className="flex justify-center mb-2">
            <button
              className={['btn btn-primary w-48', isFetchingNextPage ? 'loading' : ''].join(' ')}
              onClick={function() { fetchNextPage() }}
            >
              More
            </button>
          </div>
        ) : null
      }
    </div>
  )
}

export default UserListPage
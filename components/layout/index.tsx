/* eslint-disable @next/next/no-img-element */
import { Fragment, useRef, useEffect, useCallback, createContext, useState, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import Link from "next/link";
import { createPortal } from "react-dom";
import useMenu from "./menus";

export type Direction = 'up' | 'down'

const LayoutContext = createContext<{
  container: HTMLDivElement | null,
  setShouldRespond: (arg: boolean) => void,
  user: Session['user'] | null
}>({
  container: null,
  setShouldRespond(arg) {},
  user: null
})

export function useLayout() {
  return useContext(LayoutContext)
}

function AppLayout(props: { children: ReactNode }) {
  const { data } = useSession()
  const menu = useMenu(data?.user.role)
  const prevScroll = useRef<number>(0)
  const direction = useRef<Direction>('down')
  const shouldRespond = useRef<boolean>(true)
  const [navbar, setnavbar] = useState<HTMLDivElement | null>(null)
  const [container, setcontainer] = useState<HTMLDivElement | null>(null)
  const [drawer, setdrawer] = useState<HTMLDivElement | null>(null)

  useEffect(function() {
    const target = document.getElementById('__content')
    const ddrawer = document.getElementById('__drawer')
    if (target) {
      setcontainer(target as HTMLDivElement)
    }
    if (ddrawer) {
      setdrawer(ddrawer as HTMLDivElement)
    }
  }, [])
  // const navbar = useRef<HTMLDivElement>(null)
  // const container = useRef<HTMLDivElement>(null)
  const scroller = useCallback(function() {
    if (container && navbar) {
      const currentPos = container.scrollTop
      const dir: Direction = currentPos > prevScroll.current ? 'down' : 'up'
      if (dir !== direction.current) {
        if (dir === 'down') {
          if (navbar.classList.contains('top-0')) navbar.classList.remove('top-0')
          navbar.classList.add('-top-64')
        } else {
          if (shouldRespond.current) {
            if (navbar.classList.contains('-top-64')) navbar.classList.remove('-top-64')
            navbar.classList.add('top-0')
          }
        }
        direction.current = dir
      }
      // console.log({ currentPos, prevScroll: prevScroll.current, dir, classes: navbar.classList })
      prevScroll.current = currentPos
    }
  }, [container, navbar])
  useEffect(function() {
    if (container) {
      container.addEventListener('scroll', scroller)
      console.log('ADDED SCROLLSPY')
      return function() {
        container.removeEventListener('scroll', scroller)
      }
    }
  }, [scroller, container])
  return (
    <LayoutContext.Provider
      value={{
        container: container,
        setShouldRespond(should) {
          shouldRespond.current = should
        },
        user: data?.user || null
      }}
    >
      <div ref={setnavbar} className="navbar sticky bg-base-300 z-50 px-0">
        <div className="navbar-start pl-2">
          <label htmlFor="top-drawer" className="lg:hidden cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </label>
          <div className="text-lg font-extrabold hidden lg:block">
            Mufid
          </div>
        </div>
        <div className="navbar-center">
          <div className="text-xl font-extrabold lg:hidden">
            Mufid
          </div>
          <ul className="menu menu-horizontal hidden lg:inline-flex items-center">
          {
            menu.map(function(dmenu) {
              const { children, href, text } = dmenu
              if (children) {
                return (
                  <li tabIndex={0} key={text}>
                    <span>{text}</span>
                    <ul className="bg-base-100 p-2">
                    {
                      children.map(function(child) {
                        return (
                          <li key={child.href}>
                            <Link passHref href={child.href || '#'}><a className="no-underline">{child.text}</a>
                            </Link>
                          </li>
                        )
                      })
                    }
                    </ul>
                  </li>
                )
              }
              return (
                <li key={href || crypto.randomUUID()}>
                  <Link href={href || '#'} passHref>
                    <a className="no-underline">{text}</a>
                  </Link>
                </li>
              )
            })
          }
          </ul>
        </div>
        <div className="navbar-end pr-2 justify-end">
          <div className="dropdown dropdown-end dropdown-bottom mr-2">
            <label className="cursor-pointer" tabIndex={0}>
              {
                data?.user.image ? (
                  <div className="avatar">
                    <div className="w-24 rounded">
                      <img src={data.user.image} alt="_profilepicture" />
                    </div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )
              }
            </label>
            <div className="dropdown-content w-64 p-4 bg-base-300 dark:bg-slate-800 shadow-lg">
              {
                data ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      {
                        data?.user.image ? (
                          <div className="avatar">
                            <div className="w-18 rounded">
                              <img src={data.user.image} alt="_profilepicture" />
                            </div>
                          </div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        )
                      }
                      <div className="flex flex-col">
                        <div>{data?.user.name}</div>
                        <div>{data?.user.role}</div>
                      </div>
                    </div>
                    <div>
                      <Link passHref href="/api/auth/signout">
                        <button className="btn btn-warning btn-block">Keluar</button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <ul className="menu list-none flex flex-column">
                    <li><Link passHref href="/auth/signin"><a className="no-underline">Masuk</a></Link></li>
                    <li><Link passHref href="/auth/register"><a className="no-underline">Daftar</a></Link></li>
                  </ul>
                )
              }
            </div>
          </div>
        </div>
      </div>
      <div className="z-0">
      {props.children}
      </div>
      {
        drawer ? createPortal((
          <ul className="menu w-56 text-base-content p-4 bg-base-100">
            {
              menu.map(function(dmenu) {
                const { children, href, text } = dmenu
                if (children) {
                  return (
                    <Fragment key={text}>
                      <li className="menu-title">{text}</li>
                      {
                        children.map(function(child) {
                          return (
                            <li key={child.href}>
                              <Link passHref href={child.href || '#'}>
                                <a className="no-underline">{child.text}</a>
                              </Link>
                            </li>
                          )
                        })
                      }
                    </Fragment>
                  )
                }
                return (
                  <li key={href || crypto.randomUUID()}>
                    <Link href={href || '#'} passHref>
                      <a className="no-underline">{text}</a>
                    </Link>
                  </li>
                )
              })
            }
          </ul>
        ), drawer) : null
      }
    </LayoutContext.Provider>
  )
}

export default AppLayout
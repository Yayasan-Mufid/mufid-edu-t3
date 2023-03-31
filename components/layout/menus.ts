import { useMemo } from 'react'
import type { Roles } from 'next-auth'

export interface MenuItem {
  text: string,
  href?: string,
  roles: Array<Roles> | 'ALL',
  children?: Array<MenuItem>
}

const menus: Array<MenuItem> = [
  { text: 'Beranda', href: '/', roles: 'ALL' },
  {
    text: 'Dasbor',
    roles: ['ADMIN'],
    children: [
      { text: 'Admin', href: '/dashboard/admin', roles: ['ADMIN'] },
      { text: 'Staf', href: '/dashboard/staff', roles: ['ADMIN', 'STAFF'] },
      { text: 'Guru', href: '/dashboard/teacher', roles: ['ADMIN', 'TEACHER'] },
      { text: 'Asisten', href: '/dashboard/assistant', roles: ['ADMIN', 'ASSISTANT'] },
    ]
  },
  { text: 'Dasbor Staf', href: '/dashboard/staff', roles: ['STAFF'] },
  { text: 'Dasbor Guru', href: '/dashboard/teacher', roles: ['TEACHER'] },
  { text: 'Dasbor Asisten', href: '/dashboard/assistant', roles: ['ASSISTANT'] },
  { text: 'Program', href: '/programs', roles: ['TEACHER', 'ASSISTANT', 'STUDENT'] },
  { text: 'Program', roles: ['ADMIN', 'STAFF'],  children: [
    { text: 'List Program', href: '/programs', roles: ['ADMIN', 'STAFF'] },
    { text: 'Buat Program', href: '/programs/create', roles: ['ADMIN', 'STAFF'] },
  ]},
  {
    text: 'Administration', roles: ['ADMIN', 'STAFF'], children: [
      { text: 'User', href: '/users', roles: ['ADMIN', 'STAFF'] },
      { text: 'Bank Soal', href: '/questions', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    text: 'AkunTagihan', roles: ['ADMIN', 'STAFF', 'TREASURER'], children: [
      { text: 'Daftar Tagihan', href: '/invoices', roles: ['ADMIN', 'TREASURER'] },
      { text: 'Akun Tagihan', href: '/accounts', roles: ['ADMIN', 'STAFF', 'TREASURER']}
    ]
  }
]

function roleChecker(subject: Roles | null | undefined, targets: Array<Roles> | 'ALL') {
  if (targets === 'ALL') return true
  return targets.reduce(function(acc, curr) {
    return acc || subject === curr
  }, false)
}

export default function useMenu(role: Roles | null | undefined) {
  const usedMenus = useMemo(function() {
    const usedmenus = menus.reduce(function(acc, curr) {
      if (roleChecker(role, curr.roles)) {
        if (curr.children) {
          const children = curr.children.reduce(function(cacc, ccurr) {
            if (roleChecker(role, ccurr.roles)) {
              cacc.push(ccurr)
            }
            return cacc
          }, [] as Array<MenuItem>)
          if (children.length > 0) acc.push(Object.assign({}, curr, { children }))
        } else {
          acc.push(curr)
        }
      }
      return acc
    }, [] as Array<MenuItem>)
    return usedmenus
  }, [role])
  return usedMenus
}
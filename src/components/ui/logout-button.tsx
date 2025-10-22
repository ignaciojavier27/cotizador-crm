'use client'

import { logoutAction } from '@/actions/logout'

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
      >
        Cerrar Sesión
      </button>
    </form>
  )
}

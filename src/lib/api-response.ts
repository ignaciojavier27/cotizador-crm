import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  )
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message: error,
      error,
    } as ApiResponse,
    { status }
  )
}

export function unauthorizedResponse(message: string = 'No autorizado') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message: string = 'Acceso denegado') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message: string = 'Recurso no encontrado') {
  return errorResponse(message, 404)
}

export function serverErrorResponse(message: string = 'Error interno del servidor') {
  return errorResponse(message, 500)
}
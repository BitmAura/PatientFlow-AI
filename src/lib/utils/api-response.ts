import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404)
}

export function unauthorizedResponse(message = 'Unauthorized access') {
  return errorResponse(message, 401)
}

export function validationErrorResponse(error: ZodError) {
  const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
  return errorResponse(message, 400)
}

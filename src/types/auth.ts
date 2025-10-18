export type LoginResult = {
    success: boolean;
    error?: string;
}

export type RegisterResult = {
  success: boolean
  error?: string
  userId?: string
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
  email: string;
}

export interface JwtPayload {
  sub?: string;
  exp?: number;
}

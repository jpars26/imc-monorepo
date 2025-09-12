// apps/web/src/lib/http.ts
import axios, { AxiosError, AxiosResponse } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export class ApiError extends Error {
  status?: number;
  body?: any;
}

export async function getData<T>(p: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const { data } = await p;
    return data;
  } catch (err) {
    const e = err as AxiosError<any>;
    const ae = new ApiError(
      (e.response?.data?.mensagem as string) || e.message || "Erro de rede"
    );
    ae.status = e.response?.status;
    ae.body = e.response?.data;
    throw ae;
  }
}

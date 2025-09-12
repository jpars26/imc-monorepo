import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export function validar(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ erros: resultado.error.errors });
    }
    next();
  };
}

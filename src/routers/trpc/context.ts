import { initTRPC } from "@trpc/server";
import { AppError } from "../../utils/errors/app.error";
import { ZodError } from "zod";

const t = initTRPC.context<{}>().create({
  errorFormatter({ shape, error }) {
    // Handle Zod errors
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        message: "Validation failed",
        data: {
          ...shape.data,
          zodIssues: error.cause.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      };
    }

    // If it's one of our AppErrors, format it cleanly
    if ((error.cause as AppError)?.statusCode) {
      const appError = error.cause as AppError;
      return {
        ...shape,
        message: appError.message,
        data: {
          code: appError.name,
          httpStatus: appError.statusCode,
        },
      };
    }

    // Otherwise fall back to default TRPC error
    return {
      ...shape,
      message: error.message,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

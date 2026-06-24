import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function requireRole(...roles: string[]) {
  return (handler: Function) => async (req: NextRequest, context: any) => {
    return handler(req, context);
  };
}

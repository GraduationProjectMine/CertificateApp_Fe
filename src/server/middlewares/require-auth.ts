import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function requireAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, context);
  };
}

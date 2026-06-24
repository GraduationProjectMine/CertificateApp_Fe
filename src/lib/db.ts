let prismaClient: any = null;

try {
  const { PrismaClient } = require("@prisma/client");
  prismaClient = new PrismaClient();
} catch {
  // Prisma not installed yet — use mock
  prismaClient = {
    student: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d },
    certificate: { findMany: async () => [], findUnique: async () => null, create: async (d: any) => d },
    auditLog: { findMany: async () => [], create: async (d: any) => d },
    $disconnect: async () => {},
  };
}

export default prismaClient;

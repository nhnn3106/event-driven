"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('admin', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin123@gmail.com' },
        update: {
            passwordHash: password,
            fullName: 'Administrator',
            role: 'ADMIN',
        },
        create: {
            email: 'admin123@gmail.com',
            fullName: 'Administrator',
            passwordHash: password,
            role: 'ADMIN',
        },
    });
    console.log('Admin seeded:', admin);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-admin.js.map
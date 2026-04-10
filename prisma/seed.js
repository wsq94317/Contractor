/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();
const hotelHeroNote = `Each key set or individual key requires a separate log submission.
If you are collecting more than one key set or key, please complete multiple log entries, one for each key.
This ensures accurate tracking and accountability for all issued keys.`;

const hotels = [
  {
    code: "SQVB",
    slug: "sydney-qvb",
    name: "YEHS Hotel Sydney QVB",
    shortName: "Sydney QVB",
    address: "143 York St, Sydney NSW",
    heroTitle: "Contractor, Visitor & Temporary Access Log",
    heroNote: hotelHeroNote,
    phone: "02 8417 8888",
    email: "info.sqvb@yehshotel.com.au",
    users: [
      {
        username: "info.sqvb@yehshotel.com.au",
        password: "@SydQVB143+",
        name: "SQVB Staff",
        role: Role.ADMIN,
      },
    ],
  },
  {
    code: "SHS",
    slug: "sydney-harbour-suites",
    name: "YEHS Hotel Sydney Harbour Suites",
    shortName: "Sydney Harbour Suites",
    address: "252 Sussex St, Sydney NSW",
    heroTitle: "Contractor, Visitor & Temporary Access Log",
    heroNote: hotelHeroNote,
    phone: "02 9577 9388",
    email: "info.shs@yehshotel.com.au",
    users: [
      {
        username: "info.shs@yehshotel.com.au",
        password: "@SydHS258+",
        name: "SHS Staff",
        role: Role.ADMIN,
      },
    ],
  },
  {
    code: "SCBD",
    slug: "sydney-cbd",
    name: "YEHS Hotel Sydney CBD",
    shortName: "Sydney CBD",
    address: "88 Liverpool St, Sydney NSW",
    heroTitle: "Contractor, Visitor & Temporary Access Log",
    heroNote: hotelHeroNote,
    phone: "02 9281 9888",
    email: "info.scbd@yehshotel.com.au",
    users: [
      {
        username: "info.scbd@yehshotel.com.au",
        password: "@SydCBD88+",
        name: "SCBD Staff",
        role: Role.ADMIN,
      },
    ],
  },
  {
    code: "MCBD",
    slug: "melbourne-cbd",
    name: "YEHS Hotel Melbourne CBD",
    shortName: "Melbourne CBD",
    address: "600 Little Bourke St, Melbourne VIC",
    heroTitle: "Contractor, Visitor & Temporary Access Log",
    heroNote: hotelHeroNote,
    phone: "03 9600 1188",
    email: "info.mcbd@yehshotel.com.au",
    users: [
      {
        username: "info.mcbd@yehshotel.com.au",
        password: "@MelCBD600+",
        name: "MCBD Staff",
        role: Role.ADMIN,
      },
    ],
  },
];

async function main() {
  for (const hotel of hotels) {
    const createdHotel = await prisma.hotel.upsert({
      where: { code: hotel.code },
      update: {
        slug: hotel.slug,
        name: hotel.name,
        shortName: hotel.shortName,
        address: hotel.address,
        heroTitle: hotel.heroTitle,
        heroNote: hotel.heroNote,
        phone: hotel.phone,
        email: hotel.email,
      },
      create: {
        code: hotel.code,
        slug: hotel.slug,
        name: hotel.name,
        shortName: hotel.shortName,
        address: hotel.address,
        heroTitle: hotel.heroTitle,
        heroNote: hotel.heroNote,
        phone: hotel.phone,
        email: hotel.email,
      },
    });

    const allowedUsernames = hotel.users.map((user) => user.username);

    await prisma.user.deleteMany({
      where: {
        hotelId: createdHotel.id,
        username: {
          notIn: allowedUsernames,
        },
      },
    });

    for (const user of hotel.users) {
      const passwordHash = await bcrypt.hash(user.password, 10);

      await prisma.user.upsert({
        where: {
          hotelId_username: {
            hotelId: createdHotel.id,
            username: user.username,
          },
        },
        update: {
          name: user.name,
          role: user.role,
          isActive: true,
          passwordHash,
        },
        create: {
          hotelId: createdHotel.id,
          username: user.username,
          name: user.name,
          role: user.role,
          passwordHash,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

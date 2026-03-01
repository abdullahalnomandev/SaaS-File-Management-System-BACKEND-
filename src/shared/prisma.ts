import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import config from "../config";


const connectionString = config.database_url ;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export default db ;
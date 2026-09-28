import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});


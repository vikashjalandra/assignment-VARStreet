import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    // Test database connection before starting server
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection verified");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
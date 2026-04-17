import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";

import projectRoutes from "./routes/projects.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();


// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' })); // Limit JSON payloads to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payloads
app.use(express.static("public"));
app.use(cookieParser());


app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);


export default app;
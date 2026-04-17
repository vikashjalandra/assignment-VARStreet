import express from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projects.controller.js";
import {
    createTask,
    getTasks
} from "../controllers/tasks.controller.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.get("/:projectId/tasks", getTasks);
router.post("/:projectId/tasks", createTask);

export default router;
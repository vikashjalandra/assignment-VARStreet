import express from "express";
import {
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/tasks.controller.js";
import { getComments, createComment } from "../controllers/comments.controller.js";

const router = express.Router();

router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/:taskId/comments", getComments);
router.post("/:taskId/comments", createComment);

export default router;
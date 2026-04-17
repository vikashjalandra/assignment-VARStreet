import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import asyncHandler from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { parseIdParam, throwValidationError } from "../lib/requestValidation.js";

const getComments = asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseIdParam(req.params.taskId, "taskId");

    const taskExists = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true },
    });

    if (!taskExists) {
        throw new HttpError(404, "Task not found");
    }

    const comments = await prisma.comment.findMany({
        where: { taskId },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        data: comments,
    });
});

const createComment = asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseIdParam(req.params.taskId, "taskId");
    const { body, author } = req.body as {
        body?: unknown;
        author?: unknown;
    };

    const taskExists = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true },
    });

    if (!taskExists) {
        throw new HttpError(404, "Task not found");
    }

    const errors: Record<string, string> = {};

    let normalizedAuthor = "";
    if (typeof author !== "string" || author.trim().length === 0) {
        errors.author = "author is required";
    } else {
        normalizedAuthor = author.trim();
        if (normalizedAuthor.length > 50) {
            errors.author = "author must be at most 50 characters";
        }
    }

    let normalizedBody = "";
    if (typeof body !== "string" || body.trim().length === 0) {
        errors.body = "body is required";
    } else {
        normalizedBody = body.trim();
        if (normalizedBody.length > 500) {
            errors.body = "body must be at most 500 characters";
        }
    }

    if (Object.keys(errors).length > 0) {
        throwValidationError(errors);
    }

    const newComment = await prisma.comment.create({
        data: {
            body: normalizedBody,
            author: normalizedAuthor,
            taskId,
        },
    });

    res.status(201).json({
        data: newComment,
    });
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParam(req.params.id, "id");

    const existingComment = await prisma.comment.findUnique({ where: { id } });
    if (!existingComment) {
        throw new HttpError(404, "Comment not found");
    }

    const comment = await prisma.comment.delete({
        where: { id },
    });

    res.status(200).json({
        data: comment,
    });
});

export { getComments, createComment, deleteComment };

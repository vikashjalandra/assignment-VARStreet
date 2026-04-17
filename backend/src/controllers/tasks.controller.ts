import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import asyncHandler from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import {
    PRIORITY_VALUES,
    STATUS_VALUES,
    getQueryParam,
    isEnumValue,
    parseIdParam,
    parseOptionalDate,
    throwValidationError,
} from "../lib/requestValidation.js";
import type { PriorityValue, StatusValue } from "../lib/requestValidation.js";

const SORT_BY_VALUES = ["dueDate", "priority", "createdAt"] as const;
const SORT_DIR_VALUES = ["asc", "desc"] as const;

type SortByValue = (typeof SORT_BY_VALUES)[number];
type SortDirValue = (typeof SORT_DIR_VALUES)[number];

const getTasks = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseIdParam(req.params.projectId, "projectId");

    const projectExists = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
    });

    if (!projectExists) {
        throw new HttpError(404, "Project not found");
    }

    const errors: Record<string, string> = {};

    let status: StatusValue | undefined;
    const statusParam = getQueryParam(req.query.status);
    if (statusParam !== undefined) {
        if (!isEnumValue(statusParam, STATUS_VALUES)) {
            errors.status = `status must be one of ${STATUS_VALUES.join(", ")}`;
        } else {
            status = statusParam;
        }
    }

    let priority: PriorityValue | undefined;
    const priorityParam = getQueryParam(req.query.priority);
    if (priorityParam !== undefined) {
        if (!isEnumValue(priorityParam, PRIORITY_VALUES)) {
            errors.priority = `priority must be one of ${PRIORITY_VALUES.join(", ")}`;
        } else {
            priority = priorityParam;
        }
    }

    let sortBy: SortByValue = "createdAt";
    const sortByParam = getQueryParam(req.query.sortBy);
    if (sortByParam !== undefined) {
        if (!isEnumValue(sortByParam, SORT_BY_VALUES)) {
            errors.sortBy = `sortBy must be one of ${SORT_BY_VALUES.join(", ")}`;
        } else {
            sortBy = sortByParam;
        }
    }

    let sortDir: SortDirValue = "desc";
    const sortDirParam = getQueryParam(req.query.sortDir);
    if (sortDirParam !== undefined) {
        if (!isEnumValue(sortDirParam, SORT_DIR_VALUES)) {
            errors.sortDir = "sortDir must be either asc or desc";
        } else {
            sortDir = sortDirParam;
        }
    }

    let page = 1;
    const pageParam = getQueryParam(req.query.page);
    if (pageParam !== undefined) {
        const parsedPage = Number(pageParam);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            errors.page = "page must be a positive integer";
        } else {
            page = parsedPage;
        }
    }

    let pageSize = 10;
    const pageSizeParam = getQueryParam(req.query.pageSize);
    if (pageSizeParam !== undefined) {
        const parsedPageSize = Number(pageSizeParam);
        if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
            errors.pageSize = "pageSize must be a positive integer";
        } else if (parsedPageSize > 50) {
            errors.pageSize = "pageSize must be at most 50";
        } else {
            pageSize = parsedPageSize;
        }
    }

    if (Object.keys(errors).length > 0) {
        throwValidationError(errors);
    }

    const where = {
        projectId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
    };

    let orderBy: { dueDate: SortDirValue } | { priority: SortDirValue } | { createdAt: SortDirValue };
    if (sortBy === "dueDate") {
        orderBy = { dueDate: sortDir };
    } else if (sortBy === "priority") {
        orderBy = { priority: sortDir };
    } else {
        orderBy = { createdAt: sortDir };
    }

    const skip = (page - 1) * pageSize;

    const [data, totalCount] = await Promise.all([
        prisma.task.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
        }),
        prisma.task.count({ where }),
    ]);

    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

    res.status(200).json({
        data,
        page,
        pageSize,
        totalCount,
        totalPages,
    });
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseIdParam(req.params.projectId, "projectId");
    const { title, description, priority, status, dueDate } = req.body as {
        title?: unknown;
        description?: unknown;
        priority?: unknown;
        status?: unknown;
        dueDate?: unknown;
    };

    const projectExists = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
    });

    if (!projectExists) {
        throw new HttpError(404, "Project not found");
    }

    const errors: Record<string, string> = {};

    let normalizedTitle = "";
    if (typeof title !== "string" || title.trim().length === 0) {
        errors.title = "title is required";
    } else {
        normalizedTitle = title.trim();
        if (normalizedTitle.length > 150) {
            errors.title = "title must be at most 150 characters";
        }
    }

    let normalizedDescription: string | null | undefined;
    if (description !== undefined) {
        if (description === null || description === "") {
            normalizedDescription = null;
        } else if (typeof description !== "string") {
            errors.description = "description must be a string";
        } else {
            const trimmedDescription = description.trim();
            if (trimmedDescription.length > 1000) {
                errors.description = "description must be at most 1000 characters";
            } else {
                normalizedDescription = trimmedDescription;
            }
        }
    }

    let normalizedPriority: PriorityValue | undefined;
    if (typeof priority !== "string") {
        errors.priority = "priority is required";
    } else if (!isEnumValue(priority, PRIORITY_VALUES)) {
        errors.priority = `priority must be one of ${PRIORITY_VALUES.join(", ")}`;
    } else {
        normalizedPriority = priority;
    }

    let normalizedStatus: StatusValue | undefined;
    if (typeof status !== "string") {
        errors.status = "status is required";
    } else if (!isEnumValue(status, STATUS_VALUES)) {
        errors.status = `status must be one of ${STATUS_VALUES.join(", ")}`;
    } else {
        normalizedStatus = status;
    }

    let normalizedDueDate: Date | undefined;
    if (dueDate !== undefined) {
        normalizedDueDate = parseOptionalDate(dueDate, "dueDate");
        if (normalizedDueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (normalizedDueDate < today) {
                errors.dueDate = "dueDate must be today or in the future";
            }
        }
    }

    if (Object.keys(errors).length > 0) {
        throwValidationError(errors);
    }

    const task = await prisma.task.create({
        data: {
            projectId,
            title: normalizedTitle,
            priority: normalizedPriority!,
            status: normalizedStatus!,
            ...(normalizedDescription !== undefined ? { description: normalizedDescription } : {}),
            ...(normalizedDueDate !== undefined ? { dueDate: normalizedDueDate } : {}),
        },
    });

    res.status(201).json({ data: task });
});

const getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParam(req.params.id, "id");
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            comments: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!task) {
        throw new HttpError(404, "Task not found");
    }

    res.status(200).json({ data: task });
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParam(req.params.id, "id");
    const { title, description, priority, status, dueDate } = req.body as {
        title?: unknown;
        description?: unknown;
        priority?: unknown;
        status?: unknown;
        dueDate?: unknown;
    };

    if (
        title === undefined &&
        description === undefined &&
        priority === undefined &&
        status === undefined &&
        dueDate === undefined
    ) {
        throwValidationError({
            body: "at least one field (title, description, priority, status, dueDate) is required",
        });
    }

    const errors: Record<string, string> = {};

    let normalizedTitle: string | undefined;
    if (title !== undefined) {
        if (typeof title !== "string") {
            errors.title = "title must be a string";
        } else {
            const trimmedTitle = title.trim();
            if (trimmedTitle.length === 0) {
                errors.title = "title cannot be empty";
            } else if (trimmedTitle.length > 150) {
                errors.title = "title must be at most 150 characters";
            } else {
                normalizedTitle = trimmedTitle;
            }
        }
    }

    let normalizedDescription: string | null | undefined;
    if (description !== undefined) {
        if (description === null || description === "") {
            normalizedDescription = null;
        } else if (typeof description !== "string") {
            errors.description = "description must be a string";
        } else {
            const trimmedDescription = description.trim();
            if (trimmedDescription.length > 1000) {
                errors.description = "description must be at most 1000 characters";
            } else {
                normalizedDescription = trimmedDescription;
            }
        }
    }

    let normalizedPriority: PriorityValue | undefined;
    if (priority !== undefined) {
        if (typeof priority !== "string" || !isEnumValue(priority, PRIORITY_VALUES)) {
            errors.priority = `priority must be one of ${PRIORITY_VALUES.join(", ")}`;
        } else {
            normalizedPriority = priority;
        }
    }

    let normalizedStatus: StatusValue | undefined;
    if (status !== undefined) {
        if (typeof status !== "string" || !isEnumValue(status, STATUS_VALUES)) {
            errors.status = `status must be one of ${STATUS_VALUES.join(", ")}`;
        } else {
            normalizedStatus = status;
        }
    }

    let normalizedDueDate: Date | null | undefined;
    if (dueDate !== undefined) {
        if (dueDate === null || dueDate === "") {
            normalizedDueDate = null;
        } else {
            normalizedDueDate = parseOptionalDate(dueDate, "dueDate") ?? null;
        }
    }

    if (Object.keys(errors).length > 0) {
        throwValidationError(errors);
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
        throw new HttpError(404, "Task not found");
    }

    const task = await prisma.task.update({
        where: { id },
        data: {
            ...(normalizedTitle !== undefined ? { title: normalizedTitle } : {}),
            ...(normalizedDescription !== undefined ? { description: normalizedDescription } : {}),
            ...(normalizedPriority !== undefined ? { priority: normalizedPriority } : {}),
            ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
            ...(normalizedDueDate !== undefined ? { dueDate: normalizedDueDate } : {}),
        },
    });

    res.status(200).json({ data: task });
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const id = parseIdParam(req.params.id, "id");

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
        throw new HttpError(404, "Task not found");
    }

    const task = await prisma.task.delete({
        where: { id },
    });

    res.status(200).json({ data: task });
});

export { getTasks, createTask, getTaskById, updateTask, deleteTask };

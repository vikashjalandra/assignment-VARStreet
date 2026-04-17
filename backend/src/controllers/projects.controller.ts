import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import asyncHandler from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { parseIdParam, throwValidationError } from "../lib/requestValidation.js";

const STATUS_VALUES = ["Todo", "InProgress", "Review", "Done"] as const;
type StatusValue = (typeof STATUS_VALUES)[number];

const createStatusCountMap = (): Record<StatusValue, number> => ({
  Todo: 0,
  InProgress: 0,
  Review: 0,
  Done: 0,
});

const getProjects = asyncHandler(async (_req: Request, res: Response) => {
  const [projects, groupedTaskCounts] = await Promise.all([
    prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.task.groupBy({
      by: ["projectId", "status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const countByProject = new Map<number, Record<StatusValue, number>>();

  for (const project of projects) {
    countByProject.set(project.id, createStatusCountMap());
  }

  for (const row of groupedTaskCounts) {
    const current = countByProject.get(row.projectId) ?? createStatusCountMap();
    current[row.status] = row._count._all;
    countByProject.set(row.projectId, current);
  }

  const data = projects.map((project) => {
    const taskCountByStatus = countByProject.get(project.id) ?? createStatusCountMap();
    const totalTasks = Object.values(taskCountByStatus).reduce((acc, count) => acc + count, 0);

    return {
      ...project,
      taskCountByStatus,
      totalTasks,
    };
  });

  res.status(200).json({ data });
});

const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body as {
    name?: unknown;
    description?: unknown;
  };

  const errors: Record<string, string> = {};

  const normalizedName = typeof name === "string" ? name.trim() : "";
  if (normalizedName.length === 0) {
    errors.name = "name is required";
  } else if (normalizedName.length > 100) {
    errors.name = "name must be at most 100 characters";
  }

  let normalizedDescription: string | null | undefined;

  if (description !== undefined) {
    if (description === null || description === "") {
      normalizedDescription = null;
    } else if (typeof description !== "string") {
      errors.description = "description must be a string";
    } else {
      const trimmedDescription = description.trim();
      if (trimmedDescription.length > 300) {
        errors.description = "description must be at most 300 characters";
      } else {
        normalizedDescription = trimmedDescription;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throwValidationError(errors);
  }

  const existingProject = await prisma.project.findUnique({
    where: { name: normalizedName },
  });

  if (existingProject) {
    throw new HttpError(409, "Project name already exists", {
      name: "name must be unique",
    });
  }

  const project = await prisma.project.create({
    data: {
      name: normalizedName,
      ...(normalizedDescription !== undefined ? { description: normalizedDescription } : {}),
    },
  });

  res.status(201).json({ data: project });
});

const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "id");
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  res.status(200).json({ data: project });
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "id");
  const { name, description } = req.body as {
    name?: unknown;
    description?: unknown;
  };

  if (name === undefined && description === undefined) {
    throwValidationError({
      body: "at least one field (name or description) is required",
    });
  }

  const errors: Record<string, string> = {};

  let normalizedName: string | undefined;
  if (name !== undefined) {
    if (typeof name !== "string") {
      errors.name = "name must be a string";
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        errors.name = "name cannot be empty";
      } else if (trimmedName.length > 100) {
        errors.name = "name must be at most 100 characters";
      } else {
        normalizedName = trimmedName;
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
      if (trimmedDescription.length > 300) {
        errors.description = "description must be at most 300 characters";
      } else {
        normalizedDescription = trimmedDescription;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throwValidationError(errors);
  }

  const currentProject = await prisma.project.findUnique({ where: { id } });

  if (!currentProject) {
    throw new HttpError(404, "Project not found");
  }

  if (normalizedName) {
    const existingProjectWithName = await prisma.project.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (existingProjectWithName && existingProjectWithName.id !== id) {
      throw new HttpError(409, "Project name already exists", {
        name: "name must be unique",
      });
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedDescription !== undefined ? { description: normalizedDescription } : {}),
    },
  });

  res.status(200).json({ data: project });
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "id");

  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject) {
    throw new HttpError(404, "Project not found");
  }

  const deletedProject = await prisma.project.delete({
    where: { id },
  });

  res.status(200).json({ data: deletedProject });
});

export { getProjects, createProject, getProjectById, updateProject, deleteProject };

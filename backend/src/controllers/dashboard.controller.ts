import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import asyncHandler from "../lib/asyncHandler.js";
import { getQueryParam, throwValidationError } from "../lib/requestValidation.js";

const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
	const now = new Date();
	const nextSevenDays = new Date(now);
	nextSevenDays.setDate(now.getDate() + 7);

	const [totalProjects, groupedStatuses, overdueCount, dueWithin7Days] = await Promise.all([
		prisma.project.count(),
		prisma.task.groupBy({
			by: ["status"],
			_count: {
				_all: true,
			},
		}),
		prisma.task.count({
			where: {
				dueDate: { lt: now },
				status: { not: "Done" },
			},
		}),
		prisma.task.count({
			where: {
				dueDate: {
					gte: now,
					lte: nextSevenDays,
				},
				status: { not: "Done" },
			},
		}),
	]);

	const tasksByStatus = {
		Todo: 0,
		InProgress: 0,
		Review: 0,
		Done: 0,
	};

	for (const row of groupedStatuses) {
		tasksByStatus[row.status] = row._count._all;
	}

	res.status(200).json({
		data: {
			totalProjects,
			tasksByStatus,
			overdueCount,
			dueWithin7Days,
		},
	});
});

const getUpcomingDueTasks = asyncHandler(async (req: Request, res: Response) => {
	const errors: Record<string, string> = {};
	let limit = 10;

	const limitParam = getQueryParam(req.query.limit);
	if (limitParam !== undefined) {
		const parsedLimit = Number(limitParam);
		if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
			errors.limit = "limit must be a positive integer";
		} else if (parsedLimit > 50) {
			errors.limit = "limit must be at most 50";
		} else {
			limit = parsedLimit;
		}
	}

	if (Object.keys(errors).length > 0) {
		throwValidationError(errors);
	}

	const now = new Date();
	const nextSevenDays = new Date(now);
	nextSevenDays.setDate(now.getDate() + 7);

	const data = await prisma.task.findMany({
		where: {
			dueDate: {
				gte: now,
				lte: nextSevenDays,
			},
			status: {
				not: "Done",
			},
		},
		orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
		take: limit,
		include: {
			project: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	res.status(200).json({
		data,
		limit,
	});
});

export { getDashboardSummary, getUpcomingDueTasks };

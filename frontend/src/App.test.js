import { render, screen } from "@testing-library/react";
import App from "./App";

const jsonResponse = (body) => ({
  ok: true,
  headers: {
    get: () => "application/json",
  },
  json: async () => body,
});

beforeEach(() => {
  global.fetch = jest.fn((input) => {
    const path = String(input);

    if (path.startsWith("/api/dashboard/upcoming")) {
      return Promise.resolve(jsonResponse({ data: [], limit: 10 }));
    }

    if (path.startsWith("/api/dashboard")) {
      return Promise.resolve(
        jsonResponse({
          data: {
            totalProjects: 0,
            tasksByStatus: {
              Todo: 0,
              InProgress: 0,
              Review: 0,
              Done: 0,
            },
            overdueCount: 0,
            dueWithin7Days: 0,
          },
        })
      );
    }

    return Promise.resolve(jsonResponse({ data: [] }));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders workspace navigation", async () => {
  render(<App />);

  expect(await screen.findByText(/Task Pulse Workspace/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Projects/i })).toBeInTheDocument();
});

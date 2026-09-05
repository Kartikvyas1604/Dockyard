import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("renders a real button with its label", () => {
    render(<Button>Ship</Button>);
    expect(screen.getByRole("button", { name: "Ship" })).toBeTruthy();
  });

  it("disables and sets aria-busy while loading", () => {
    render(<Button loading>Ship</Button>);
    const el = screen.getByRole("button") as HTMLButtonElement;
    expect(el.disabled).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  it("fires onClick when enabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Dock</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

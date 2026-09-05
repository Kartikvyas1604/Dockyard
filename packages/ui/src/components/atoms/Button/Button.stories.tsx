import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Ship strategy" },
};
export const Secondary: Story = {
  args: { children: "Dock" },
};
export const Danger: Story = {
  args: { variant: "danger", children: "Dock strategy" },
};
export const Ghost: Story = {
  args: { variant: "ghost", children: "Reset" },
};
export const Loading: Story = {
  args: { variant: "primary", loading: true, children: "Shipping" },
};

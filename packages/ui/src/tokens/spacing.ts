/** 4px grid — stay on the scale. */
export const spacing = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64] as const;
export type Spacing = (typeof spacing)[number];

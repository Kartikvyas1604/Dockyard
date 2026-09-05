import { Activity, Text, Pressable } from "react-native";
import { colors } from "../../../tokens/colors";
import type { NativeButtonProps } from "./Button.native.props";

/** React Native override — resolved by Metro on mobile builds. */
export function Button({ onPress, label, variant = "secondary", disabled, loading, children }: NativeButtonProps) {
  const bg =
    variant === "primary" ? colors.accent : variant === "danger" ? "transparent" : colors.surfaceRaised;
  const fg = variant === "primary" ? colors.accentForeground : variant === "danger" ? colors.destructive : colors.foreground;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: bg,
        borderColor: variant === "danger" ? colors.destructive : colors.border,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        opacity: disabled || loading ? 0.4 : 1,
      }}
    >
      {children ?? (
        <Text style={{ color: fg, fontFamily: "monospace", fontSize: 12, textTransform: "uppercase" }}>
          {loading ? "Working…" : label}
        </Text>
      )}
      {loading ? <Activity style={{ marginLeft: 8 }} /> : null}
    </Pressable>
  );
}

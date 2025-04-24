import { HTMLProps } from "react";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function mergeProps<T extends object>(
  ...props: (DeepPartial<T> | undefined)[]
): T {
  return props.reduce((merged: T, current) => {
    if (!current) return merged;

    return Object.entries(current).reduce((acc: T, [key, value]) => {
      if (value === undefined) return acc;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        const existingValue = acc[key as keyof T];
        acc[key as keyof T] = mergeProps(
          (existingValue as object) || {},
          value as object
        ) as T[keyof T];
      } else {
        acc[key as keyof T] = value as T[keyof T];
      }

      return acc;
    }, merged);
  }, {} as T);
}

"use client";

import { Field } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";

const switchVariants = tv({
  slots: {
    root: [
      "peer relative inline-flex h-[22px] w-10 items-center rounded-full p-[3px] outline-none transition-colors",
      "bg-border-primary",
      "data-[checked]:bg-accent-green",
      "focus-visible:ring-2 focus-visible:ring-border-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    thumb: [
      "block size-4 rounded-full bg-text-secondary transition-transform duration-200 ease-out",
      "translate-x-0 data-[checked]:translate-x-[18px] data-[checked]:bg-text-inverse",
    ],
    wrapper: "inline-flex items-center gap-[10px]",
    field: "inline-flex items-center gap-[10px]",
    label:
      "font-mono text-[13px] leading-none text-text-secondary peer-data-[checked]:text-accent-green",
    description: "font-sans text-xs leading-none text-text-tertiary",
  },
  variants: {
    labelPlacement: {
      start: {
        wrapper: "flex-row-reverse justify-end",
      },
      end: {
        wrapper: "flex-row justify-start",
      },
    },
  },
  defaultVariants: {
    labelPlacement: "end",
  },
});

export type SwitchVariants = VariantProps<typeof switchVariants>;

export interface SwitchRootProps
  extends Omit<ComponentProps<typeof BaseSwitch.Root>, "children">,
    SwitchVariants {
  children?: ReactNode;
}

export interface SwitchFieldProps {
  children?: ReactNode;
}

export interface SwitchLabelProps {
  children?: ReactNode;
}

export interface SwitchDescriptionProps {
  children?: ReactNode;
}

function isSwitchThumbElement(child: ReactNode) {
  return (
    isValidElement(child) &&
    typeof child.type !== "string" &&
    "displayName" in child.type &&
    child.type.displayName === "SwitchThumb"
  );
}

export function SwitchRoot({
  children,
  className,
  labelPlacement,
  ...props
}: SwitchRootProps) {
  const slots = switchVariants({ labelPlacement });
  const detailChildren: ReactNode[] = [];
  const rootClassName =
    typeof className === "function"
      ? (state: Parameters<NonNullable<typeof className>>[0]) =>
          slots.root({ className: className(state) })
      : slots.root({ className });

  Children.forEach(children, (child) => {
    if (isSwitchThumbElement(child)) {
      return;
    }

    detailChildren.push(child);
  });

  return (
    <Field.Root>
      <Field.Label className={slots.wrapper()}>
        <BaseSwitch.Root className={rootClassName} {...props}>
          <BaseSwitch.Thumb className={slots.thumb()} />
        </BaseSwitch.Root>
        {detailChildren}
      </Field.Label>
    </Field.Root>
  );
}

export function SwitchThumb() {
  return null;
}

SwitchThumb.displayName = "SwitchThumb";

export function SwitchField({ children }: SwitchFieldProps) {
  const { field } = switchVariants();

  return <div className={field()}>{children}</div>;
}

export function SwitchLabel({ children }: SwitchLabelProps) {
  const { label } = switchVariants();

  return <span className={label()}>{children}</span>;
}

export function SwitchDescription({ children }: SwitchDescriptionProps) {
  const { description } = switchVariants();

  return <span className={description()}>{children}</span>;
}

export { switchVariants };

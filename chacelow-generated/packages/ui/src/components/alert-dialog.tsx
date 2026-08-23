"use client";

import { AlertDialog as Primitive } from "@base-ui/react/alert-dialog";
import { Button } from "@chacelow-generated/ui/components/button";
import { cn } from "@chacelow-generated/ui/lib/utils";
import type * as React from "react";

function AlertDialog(props: Primitive.Root.Props) {
  return <Primitive.Root data-slot="alert-dialog" {...props} />;
}
function AlertDialogTrigger(props: Primitive.Trigger.Props) {
  return <Primitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}
function AlertDialogPortal(props: Primitive.Portal.Props) {
  return <Primitive.Portal data-slot="alert-dialog-portal" {...props} />;
}
function AlertDialogOverlay({ className, ...props }: Primitive.Backdrop.Props) {
  return (
    <Primitive.Backdrop
      className={cn(
        "data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  );
}
function AlertDialogContent({ className, ...props }: Primitive.Popup.Props) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <Primitive.Popup
        className={cn(
          "data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-none bg-popover p-4 text-popover-foreground outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
          className,
        )}
        data-slot="alert-dialog-content"
        {...props}
      />
    </AlertDialogPortal>
  );
}
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid gap-1.5 text-center sm:text-left", className)}
      data-slot="alert-dialog-header"
      {...props}
    />
  );
}
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}
function AlertDialogTitle({ className, ...props }: Primitive.Title.Props) {
  return (
    <Primitive.Title
      className={cn("cn-font-heading font-medium text-sm", className)}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}
function AlertDialogDescription({ className, ...props }: Primitive.Description.Props) {
  return (
    <Primitive.Description
      className={cn("text-balance text-muted-foreground text-xs/relaxed", className)}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}
function AlertDialogAction(props: React.ComponentProps<typeof Button>) {
  return <Button data-slot="alert-dialog-action" {...props} />;
}
function AlertDialogCancel({
  variant = "outline",
  size = "default",
  ...props
}: Primitive.Close.Props & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Primitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button size={size} variant={variant} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

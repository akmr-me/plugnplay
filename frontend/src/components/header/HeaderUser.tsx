"use client";
import {
  SignInButton,
  UserButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeaderUser() {
  const { isSignedIn } = useUser();
  return (
    <>
      <div className="flex gap-2 items-center">
        {isSignedIn ? (
          <>
            <UserButton />
            <div
              className={cn(
                buttonVariants({ variant: "destructive", size: "sm" })
              )}
            >
              <SignOutButton />
            </div>
          </>
        ) : (
          <>
            <div className="cursor-pointer">
              <SignInButton mode="modal" />
            </div>
            <div className="cursor-pointer">
              <div
                className={cn(
                  buttonVariants({ variant: "destructive", size: "sm" })
                )}
              >
                <SignUpButton mode="modal" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

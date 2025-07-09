"use client";
import {
  SignInButton,
  UserButton,
  SignOutButton,
  SignUpButton,
  useUser,
  useAuth,
} from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { login } from "@/service/auth";

export default function HeaderUser() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  useEffect(() => {
    console.log({ user });
    async function syncUserInfo() {
      const token = await getToken();
      if (token)
        await login(token, {
          fullname: user?.fullName,
          id: user?.id,
          imageUrl: user?.imageUrl,
          lastSignInAt: user?.lastSignInAt,
          email: user?.emailAddresses[0].emailAddress,
          createdAt: user?.createdAt,
        });
    }
    if (isSignedIn) {
      syncUserInfo();
    }
  }, [isSignedIn]);

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

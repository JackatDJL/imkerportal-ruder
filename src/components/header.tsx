"use client";

import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function Header() {
  const theme = useTheme();
  const theTheme = theme.theme !== "light" ? dark : undefined;

  return (
    <header className="border-b bg-background print:border-none">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" prefetch>
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-10">
              <Image
                src="/transparent-zoom.svg"
                style={{
                  transform: "scale(1.75)",
                }}
                alt="Imkereiportal Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold">
              Imkereiportal Imkerei Ruder
            </span>
            <span className="hidden font-semibold print:block print:text-xl">
              by DJL
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4 print:hidden">
          <ThemeToggle />
          <SignedIn>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>

          <div className="relative h-10">
            <SignedIn>
              <UserButton
                showName
                appearance={{
                  baseTheme: theTheme,
                  elements: {
                    userButtonAvatarBox: {
                      width: "2.5rem",
                      height: "2.5rem",
                    },
                  },
                }}
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
            </SignedIn>
            <SignedOut>
              <Button className="flex h-10 items-center space-x-4" asChild>
                <SignInButton />
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}

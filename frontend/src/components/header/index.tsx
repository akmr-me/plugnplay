import Link from "next/link";
import HeaderUser from "./HeaderUser";
import { Unplug } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

const LinkClassName =
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50";

export default function Header() {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 border-b-2">
      <header className="flex h-16 w-full shrink-0 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <Unplug className="h-6 w-6" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text uppercase">
            Plug <span className="text-amber-300">N</span> Play
          </h1>
          <span className="sr-only">Plug N Play</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Link className={LinkClassName} href="/">
            Home
          </Link>

          <Link className={LinkClassName} href="/canvas">
            Canvas
          </Link>
        </nav>

        <div className="flex">
          <HeaderUser />
          <ModeToggle />
        </div>
      </header>
    </div>
  );
}

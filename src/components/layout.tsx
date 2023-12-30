import Link from "next/link";
import React, { useState } from "react";

type LayoutProps = { children: React.ReactNode };

const sideBarItems = [
  { href: "/", title: "Search" },
  { href: "/inventory", title: "Inventory" },
  { href: "/CompanyProject", title: "Company Project" },
];

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col h-full overflow-y-clip">
      <div className="flex flex-row h-full flex-1">
        <aside
          className={`relative pt-5 h-screen ${
            isOpen ? "w-60" : "w-0"
          } flex-0 bg-blue-500 delay-300 transition-transform`}
        >
          <button
            className="absolute -right-10 px-2 py-5 rounded-r cursor-pointer bg-blue-400 hover:bg-blue-600"
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
          </button>
          <ul className={`${isOpen ? "" : "hidden"}`}>
            {sideBarItems.map(({ href, title }) => (
              <li className="m-2" key={title}>
                <Link
                  className="flex p-2 rounded cursor-pointer bg-blue-400 hover:bg-blue-600"
                  href={href}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

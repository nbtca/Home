import { useState } from "react"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@heroui/react"
import { SITE_TITLE } from "../../consts"
import CALogoWhite from "./assets/CA-logo-white.png"
import GithubMark from "./assets/github-mark.svg"

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems: {
    link: string
    name: string
    target?: string
  }[] = [
    {
      link: "/blog",
      name: "博客",
    },
    {
      link: "/calendar",
      name: "活动",
    },
    {
      link: "/repair",
      name: "维修",
    },
    {
      link: "https://docs.nbtca.space",
      name: "文档",
      target: "_blank",
    },
    {
      link: "/about",
      name: "关于我们",
    },
  ]

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} height="48px" className="">
      <NavbarContent className="flex justify-between items-center px-0 md:px-[22px]">
        <NavbarBrand className="flex gap-4">
          <img
            src="https://oss.nbtca.space/CA-logo.svg"
            alt=""
            className="w-8 aspect-square cursor-pointer dark:hidden"
            onClick={() => window.location.href = "/"}
          />
          <img
            src={CALogoWhite.src}
            alt=""
            className="w-8 aspect-square cursor-pointer hidden dark:block"
            onClick={() => window.location.href = "/"}
          />
          <span className="hidden sm:flex select-none cursor-default text-lg text-[#1d1d1f] dark:text-white">
            {SITE_TITLE}
          </span>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-[24px]" justify="center">
          {
            menuItems.map(item => (
              <NavbarItem key={item.name}>
                <Link color="foreground" className="nav-item-content hover:text-[#2997ff] text-nowrap flex items-center" href={item.link} target={item.target || "_self"}>
                  <span>
                    {item.name}
                  </span>
                  {
                    item.target == "_blank" && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 ml-0.5 inline-block">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    )
                  }
                </Link>
              </NavbarItem>
            ))
          }
          <NavbarItem>
            <Link href="https://github.com/nbtca" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <img src={GithubMark.src} alt="GitHub" className="w-6 h-6" />
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
          style={{ marginTop: "0" }}
        />
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color="foreground"
              className="w-full py-1 font-bold"
              href={item.link}
              size="lg"
              target={item.target || "_self"}
            >
              <span>
                {item.name}
              </span>
              {
                item.target == "_blank" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 ml-1 inline-block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )
              }
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarItem>
          <Link
            color="foreground"
            className="flex items-center gap-2 w-full py-1 font-semibold"
            size="lg"
            href="https://github.com/nbtca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={GithubMark.src} alt="GitHub" className="w-6 h-6" />
            <span>Github</span>
          </Link>
        </NavbarItem>
      </NavbarMenu>
    </Navbar>
  )
}

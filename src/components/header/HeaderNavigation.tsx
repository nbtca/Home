import React from "react"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@nextui-org/react"
import { SITE_TITLE } from "../../consts"

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const menuItems = [
    {
      link: "/archive",
      name: "目录",
    },
    {
      link: "/calendar",
      name: "日历",
    },
    {
      link: "/about",
      name: "关于我们",
    },
    {
      link: "/join-us",
      name: "加入我们",
    },
  ]

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} height="48px">
      <NavbarContent className="flex justify-between items-center">
        <NavbarBrand className="flex gap-4" onClick={() => window.location.href = "/"}>
          <img
            src="https://oss.nbtca.space/CA-logo.svg"
            alt=""
            className="w-8 aspect-square"
          />
          <span className="text-lg text-[#1d1d1f]">
            {SITE_TITLE}
          </span>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {
            menuItems.map(item => (
              <NavbarItem key={item.name}>
                <Link color="foreground" className="nav-item-content hover:text-[#2997ff] text-nowrap" href={item.link}>
                  {item.name}
                </Link>
              </NavbarItem>
            ))
          }
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
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full py-1 font-bold"
              href={item.link}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}

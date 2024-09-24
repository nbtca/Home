// app/page.tsx
import { Button } from "@nextui-org/react"
import { activeClient } from "../../../utils/client"
// import { NextUIProvider } from "@nextui-org/react";

export default function Page() {
  return (
    <div>
      <Button
        onClick={() => {
          activeClient.freshman.postFreshmanAdd({
            requestBody: {
              class: "1",
              name: "1",
              phone: "1",
              qq: "1",
              email: "1",
              number: "1",
              major: "1",
            },
          })
        }}
      >
        Click me
      </Button>
    </div>
  )
}

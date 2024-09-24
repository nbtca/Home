import { Button } from "@nextui-org/react"
import { activeClient } from "../../../utils/client"

export default function Page() {
  return (
    <div>
      <Button
        onClick={() => {
          // 提交表单
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
        提交表单
      </Button>
    </div>
  )
}

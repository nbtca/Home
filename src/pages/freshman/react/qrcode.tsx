import { Button, Link, Code } from "@nextui-org/react"

function QrCodeContent({ qrcode }: { qrcode: string }) {
  return (
    <div className="box-border flex flex-col items-center gap-4 pb-20 mt-6">
      <div
        className="my-4 text-center"
      >
        <div className="text-2xl lg:text-3xl leading-[1.125] font-bold ">
          扫码加群，获取最新信息
        </div>
        <div className="mt-2 text-sm text-gray-500">
          扫描二维码加入计算机协会交流群（QQ）
        </div>
        <div className="mt-2 text-sm text-gray-500 flex items-center justify-center gap-1">
          <Code
            className="flex items-center gap-2 cursor-pointer p-2 sm:p-1 "
            onClick={() => {
              const inputElement = document.querySelector(
                "input[value=\"906370401\"]",
              ) as HTMLInputElement
              if (inputElement) {
                inputElement.select()
                navigator.clipboard.writeText(inputElement.value)
              }
            }}
          >
            群号
            <span>
              906370401
            </span>
            <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="1em" class="">
              <path d="M16 17.1c0 3.5-1.4 4.9-4.9 4.9H6.9C3.4 22 2 20.6 2 17.1v-4.2C2 9.4 3.4 8 6.9 8h4.2c3.5 0 4.9 1.4 4.9 4.9Z"></path><path d="M8 8V6.9C8 3.4 9.4 2 12.9 2h4.2C20.6 2 22 3.4 22 6.9v4.2c0 3.5-1.4 4.9-4.9 4.9H16"></path><path d="M16 12.9C16 9.4 14.6 8 11.1 8"></path>
            </svg>
          </Code>
        </div>
      </div>
      <img
        src={qrcode}
        className="w-64 aspect-square"
      />
      <Link
        href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=paWMZsf3D_x1ToAjFArynzSEXcRXej8h&authKey=BwD40LqNZNYLGgsI%2B1zIo0AyAh0vVRdhCUDzazeZr2RMWDPKHOMQtiHEKLzOw5Nz&noverify=0&group_code=906370401"
        showAnchorIcon={false}
      >
        <Button
          className="w-64"
        >
          点击加群
        </Button>
      </Link>
    </div>
  )
}

export default QrCodeContent

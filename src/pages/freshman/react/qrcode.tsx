import { Button, Input } from "@nextui-org/react"

function QrCodeContent({ qrcode }: { qrcode: string }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        请扫描二维码加入计算机协会交流群（QQ）
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={qrcode}
          style={{
            maxWidth: "320px",
            padding: "20px",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              width: "120px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Input readOnly={true} value="906370401" />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            style={{
              maxWidth: "320px",
            }}
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
            复制到剪切板
          </Button>
        </div>
      </div>
    </>
  )
}

export default QrCodeContent

import { useState } from "react"
import { Button, Input, Textarea } from "@nextui-org/react"
import { activeClient } from "../../../utils/client"

export default function JoinForm() {
  const [formData, setFormData] = useState({ name: "",
    class: "",
    number: "",
    major: "",
    phone: "",
    qq: "",
    email: "",
    memo: "",
  })
  function saveToLocalStorage() {
    localStorage.setItem("formData", JSON.stringify(formData))
  }
  function loadFromLocalStorage() {
    const data = localStorage.getItem("formData")
    if (data) {
      setFormData(JSON.parse(data))
    }
  }
  const [firstRender, setFirstRender] = useState(true)
  if (firstRender) {
    setFirstRender(false)
    loadFromLocalStorage()
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
    setTimeout(() => {
      try {
        saveToLocalStorage()
      }
      catch (error) {
        console.error("Failed to save form data to local storage", error)
      }
    }, 100)
  }
  const handleSubmit = async () => {
    try {
      await activeClient.freshman.postFreshmanAdd({
        requestBody: formData,
      })
      alert("提交成功！ 后续请加群获取！")
      window.location.href = "/freshman/qrcode"
    }
    catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to submit form.")
    }
  }
  return (
    <div>
      <form className="flex flex-col gap-8">
        <div className="flex flex-col md:grid grid-cols-2 gap-4">
          <div className="text-sm text-gray-500 col-span-2">
            我们需要以下信息用于登记
          </div>
          <Input
            name="name"
            placeholder="姓名"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="class"
            placeholder="班级"
            value={formData.class}
            onChange={handleChange}
            required
          />
          <Input
            name="number"
            placeholder="学号"
            value={formData.number}
            onChange={handleChange}
            required
          />
          <Input
            name="major"
            placeholder="专业"
            value={formData.major}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            我们需要以下信息以便联系你
          </div>
          <Input
            name="phone"
            placeholder="电话"
            className=""
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            name="qq"
            placeholder="QQ"
            className=""
            value={formData.qq}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            placeholder="邮箱"
            className=""
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <Textarea
          label="备注"
          name="memo"
          placeholder=""
          className="col-span-2"
          value={formData.memo}
          onChange={handleChange}
        />
      </form>
      <Button className="mt-12" type="submit" color="primary" fullWidth onClick={handleSubmit}>提交</Button>
    </div>
  )
}

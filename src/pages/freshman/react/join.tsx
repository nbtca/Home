import { useState } from "react"
import { Button, Input, Card, CardBody, CardFooter } from "@nextui-org/react"
import { activeClient } from "../../../utils/client"

export default function JoinForm() {
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    number: "",
    major: "",
    phone: "",
    qq: "",
    email: "",
    memo: "",
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }
  const handleSubmit = async () => {
    try {
      await activeClient.freshman.postFreshmanAdd({
        requestBody: formData,
      })
      alert("提交成功！ 后续请加群获取！")
      window.location.href = "/about"
    }
    catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to submit form.")
    }
  }
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <form>
        <Card>
          <CardBody
            style={{
              maxWidth: "700px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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
            <Input
              name="phone"
              placeholder="电话"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input
              name="qq"
              placeholder="QQ"
              value={formData.qq}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              placeholder="邮箱"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              name="memo"
              placeholder="备注"
              value={formData.memo}
              onChange={handleChange}
              required
            />
          </CardBody>
          <CardFooter
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Button onClick={handleSubmit}>提交表单</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

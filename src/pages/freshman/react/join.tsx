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
      alert("Form submitted successfully!")
    }
    catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to submit form.")
    }
  }

  return (
    <div>
      <Card>
        <CardBody>
          <Input
            name="name"
            placeholder="姓名"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            name="class"
            placeholder="班级"
            value={formData.class}
            onChange={handleChange}
          />
          <Input
            name="number"
            placeholder="学号"
            value={formData.number}
            onChange={handleChange}
          />
          <Input
            name="major"
            placeholder="专业"
            value={formData.major}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="电话"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            name="qq"
            placeholder="QQ"
            value={formData.qq}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={handleChange}
          />
        </CardBody>
        <CardFooter>
          <Button onClick={handleSubmit}>提交表单</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

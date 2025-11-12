import { useState, useEffect } from "react"
import { Button, Spinner } from "@heroui/react"
import { makeLogtoClient } from "../../utils/auth"
import UserRepairHistory from "./UserRepairHistory"
import type { UserInfoResponse } from "@logto/browser"
import { checkAuthAndRedirect } from "../../utils/repair"

export default function RepairHistoryPage() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const claims = await checkAuthAndRedirect("/repair/history")
      if (claims) {
        setUserInfo(claims)
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    makeLogtoClient().signIn({
      redirectUri: import.meta.env.PUBLIC_LOGTO_CALLBACK_URL,
      postRedirectUri: "/repair/history",
    })
  }

  const handleCreateNew = () => {
    window.location.href = "/repair/create-ticket"
  }

  if (loading) {
    return (
      <div className="container mx-auto pt-16 pb-20">
        <div className="flex flex-col items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto pt-16 pb-20">
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">请先登录以查看维修历史</p>
          <Button color="primary" onPress={handleLogin}>
            登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto pt-6 pb-20">
      {/* History content */}
      <div className="section-content">
        <UserRepairHistory
          onLogin={handleLogin}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  )
}

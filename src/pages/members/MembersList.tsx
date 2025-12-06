import { useState, useEffect } from "react"
import { saturdayClient } from "../../utils/client"
import type { PublicMember } from "../../store/member"

export default function MembersList() {
  const [members, setMembers] = useState<PublicMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error: apiError } = await saturdayClient.GET("/members", { params: {} })

      if (apiError) {
        setError("Failed to fetch members")
        console.error("Error fetching members:", apiError)
        return
      }

      if (data) {
        setMembers(data)
      }
    }
    catch (error) {
      setError("Failed to fetch members")
      console.error("Error fetching members:", error)
    }
    finally {
      setLoading(false)
    }
  }

  // Group members by year
  const getMemberGroupByYear = (): Record<string, PublicMember[]> => {
    return members
      // Filter out test members
      .filter(
        member =>
          member.memberId != "0000000000" && member.memberId != "2333333333",
      )
      .reduce(
        (acc, cur) => {
          const year = parseInt("20" + cur.memberId.slice(1, 3))
          if (!acc[year]) {
            acc[year] = []
          }
          acc[year].push(cur)
          return acc
        },
        {} as Record<string, PublicMember[]>,
      )
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading members...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  const memberGroupByYear = getMemberGroupByYear()

  return (
    <div>
      {Object.keys(memberGroupByYear)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .map(year => (
          <div key={year} className="py-4 first:pt-2">
            <div className="text-lg lg:text-2xl font-bold pb-2">{year}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              {memberGroupByYear[year].map(member => (
                <MemberCard key={member.memberId} member={member} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

interface MemberCardProps {
  member: PublicMember
}

function MemberCard({ member }: MemberCardProps) {
  const avatar = member.avatar

  return (
    <a
      href={member.link}
      target="_blank"
      rel="noopener noreferrer"
      className="no-link-color"
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full rounded-lg overflow-hidden">
          <div className="w-full aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-300/70">
            {avatar
              ? (
                  <img
                    className="object-cover h-full navigate"
                    src={avatar + "?x-oss-process=image/resize,h_512,m_lfit"}
                    alt=""
                  />
                )
              : (
                  <img
                    className="object-cover h-3/4 navigate"
                    src="https://oss.nbtca.space/CA-logo.svg"
                    alt=""
                  />
                )}
          </div>
        </div>
        <div className="h-16">
          <div className="text-lg">{member.alias}</div>
          <div className="text-sm mt-0.5">{member.profile}</div>
        </div>
      </div>
    </a>
  )
}

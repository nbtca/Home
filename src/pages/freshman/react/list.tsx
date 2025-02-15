import {
  //   Button,
  //   Input,
  Card,
  CardBody,
  CardFooter,
  //   PaginationItem,
} from "@heroui/react"
import {
  activeClient,
  type GetFreshmanListResponse,
} from "../../../utils/client"
// activeClient.freshman.getFreshmanList();
import { useEffect, useState } from "react"
// import { Pagination } from "@heroui/react";
const FreshmanList = () => {
  const [freshmen, setFreshmen] = useState<GetFreshmanListResponse>({
    list: [],
    total: 0,
  })
  const [currentPage] = useState(1) // setCurrentPage
  useEffect(() => {
    const fetchFreshmen = async () => {
      const result = await activeClient.freshman.getFreshmanList({
        page: currentPage,
      })
      setFreshmen(result)
    }
    fetchFreshmen()
  }, [])
  return (
    <div>
      <Card>
        <CardBody>
          {freshmen.list.map(freshman => (
            <div key={freshman.number}>
              <div>{freshman.name}</div>
              <div>{freshman.number}</div>
              <div>{freshman.major}</div>
              <div>{freshman.class}</div>
              <div>{freshman.email}</div>
              <div>{freshman.phone}</div>
              <div>{freshman.qq}</div>
            </div>
          ))}
        </CardBody>
        <CardFooter>
          {/* <PaginationItem
            // count={Math.ceil(freshmen.total / ITEMS_PER_PAGE)}
            page={currentPage}
            onChange={(page) => {
              setCurrentPage(page);
            }}
          /> */}
        </CardFooter>
      </Card>
    </div>
  )
}

export default FreshmanList

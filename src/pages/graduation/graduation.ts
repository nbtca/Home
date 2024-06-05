import { SITE_URL } from "../../consts"

export const useGraduationIdURL = () => {
  const idKey = "id"

  const getId = () => {
    return new URLSearchParams(window.location.search).get(idKey) as string | undefined
  }

  const constructURL = (id: string) => {
    const url = new URL(`/graduation/download`, SITE_URL)
    url.searchParams.append(idKey, id)
    return url.toString()
  }

  return {
    getId,
    constructURL,
  }
}

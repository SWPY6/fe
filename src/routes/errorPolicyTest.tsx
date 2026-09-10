import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useState } from "react"

import { api } from "../api/client"

type Scenario = "initial" | "background" | "local" | "mutation" | "offline"

type TestResponse = {
  value: string
}

const queryUrl = "/api/errorPolicy/query"
const mutationUrl = "/api/errorPolicy/mutation"

export const Route = createFileRoute("/errorPolicyTest")({
  validateSearch(search): { scenario: Scenario } {
    switch (search.scenario) {
      case "background":
      case "local":
      case "mutation":
      case "offline":
        return { scenario: search.scenario }
      default:
        return { scenario: "initial" }
    }
  },
  beforeLoad() {
    if (import.meta.env.MODE !== "e2e") {
      throw notFound()
    }
  },
  component: ErrorPolicyTest,
})

function ErrorPolicyTest() {
  const { scenario } = Route.useSearch()

  switch (scenario) {
    case "background":
      return <BackgroundQuery />
    case "local":
      return <LocalQuery />
    case "mutation":
      return <Mutation />
    case "offline":
      return <OfflineQuery />
    case "initial":
      return <InitialQuery />
  }
}

function InitialQuery() {
  const { data } = useQuery({
    queryKey: ["errorPolicyTest", "initial"],
    queryFn: async ({ signal }) => {
      const response = await api.get<TestResponse>(queryUrl, { signal })
      return response.data
    },
  })

  return <output aria-label="조회 결과">{data?.value}</output>
}

function BackgroundQuery() {
  const query = useQuery({
    queryKey: ["errorPolicyTest", "background"],
    queryFn: async ({ signal }) => {
      const response = await api.get<TestResponse>(queryUrl, { signal })
      return response.data
    },
  })

  return (
    <section aria-labelledby="background-query-heading">
      <h1 id="background-query-heading">백그라운드 조회</h1>
      <output aria-label="조회 결과">{query.data?.value}</output>
      <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>
        새로고침
      </button>
    </section>
  )
}

function LocalQuery() {
  const query = useQuery({
    queryKey: ["errorPolicyTest", "local"],
    queryFn: async ({ signal }) => {
      const response = await api.get<TestResponse>(queryUrl, { signal })
      return response.data
    },
    meta: { errorPresentation: "local" },
  })

  if (query.isError) {
    return <p aria-label="기능 오류">기능에서 요청 오류를 처리했습니다.</p>
  }

  return <output aria-label="조회 결과">{query.data?.value}</output>
}

function Mutation() {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<TestResponse>(mutationUrl)
      return response.data
    },
  })

  return (
    <section aria-labelledby="mutation-heading">
      <h1 id="mutation-heading">변경 요청</h1>
      <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        변경 실행
      </button>
      <output aria-label="변경 결과">{mutation.data?.value}</output>
    </section>
  )
}

function OfflineQuery() {
  const [enabled, setEnabled] = useState(false)
  const query = useQuery({
    queryKey: ["errorPolicyTest", "offline"],
    enabled,
    queryFn: async ({ signal }) => {
      const response = await api.get<TestResponse>(queryUrl, { signal })
      return response.data
    },
  })

  return (
    <section aria-labelledby="offline-query-heading">
      <h1 id="offline-query-heading">연결 상태 조회</h1>
      <button type="button" disabled={enabled} onClick={() => setEnabled(true)}>
        조회 시작
      </button>
      <output aria-label="요청 상태">{query.fetchStatus}</output>
      <output aria-label="조회 결과">{query.data?.value}</output>
    </section>
  )
}

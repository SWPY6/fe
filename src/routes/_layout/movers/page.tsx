// TODO: GET /api/v1/stocks가 서버에 아직 없어 준비 중 화면으로 임시 전환했다.
// API 구현 후 아래 기존 화면 코드와 index.tsx의 loader를 함께 복구한다.
export function MoversPage() {
  return (
    <main className="py-8">
      <section aria-labelledby="movers-title" className="flex flex-col gap-6">
        <h1 id="movers-title" className="typo-section-heading">
          주요 변동 종목
        </h1>
        <p className="typo-body-sm text-muted-foreground">준비 중입니다.</p>
      </section>
    </main>
  )
}

// 기존 주요 변동 종목 화면 — 서버 API 구현 후 복구
// import { ErrorBoundary, Suspense } from "@suspensive/react"
// import { SuspenseQuery } from "@suspensive/react-query"
// import { Link, getRouteApi } from "@tanstack/react-router"
// import { Separated } from "react-simplikit"
//
// import {
//   getReadFlowsSuspenseQueryOptions,
//   getReadStocksSuspenseQueryOptions,
// } from "@/api/generated/api"
// import { PriceNumber } from "@/components/domain/PriceNumber"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Pagination } from "@/components/ui/pagination"
// import { Select } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import { Switch } from "@/components/ui/switch"
// import { Table } from "@/components/ui/table"
// import { Tabs } from "@/components/ui/tabs"
// import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"
//
// import { moversFilterSchema } from "./-schema"
//
// const route = getRouteApi("/_layout/movers/")
//
// export function MoversPage() {
//   const [{ market }] = useGlobalUrlState()
//   const { q, industry, sort, page, includeCaution } = route.useSearch()
//   const navigate = route.useNavigate()
//   const stocksQueryOptions = getReadStocksSuspenseQueryOptions({
//     country: market === "domestic" ? "KR" : "US",
//     q,
//     industry,
//     sort,
//     page,
//     size: 20,
//     includeCaution,
//   })
//
//   return (
//     <main className="py-8">
//       <Tabs.Root
//         value={market}
//         onValueChange={(value) => {
//           if (value === "domestic" || value === "overseas")
//             navigate({
//               search: (previous) => ({ ...previous, market: value, page: 1, industry: undefined }),
//               replace: true,
//             })
//         }}
//         className="gap-8"
//       >
//         <Tabs.List variant="segmented" aria-label="시장 선택">
//           <Tabs.Trigger value="domestic">국내 시장</Tabs.Trigger>
//           <Tabs.Trigger value="overseas">해외 시장</Tabs.Trigger>
//         </Tabs.List>
//         <Separator />
//         <Tabs.Content key={market} value={market} className="min-w-0">
//           <section className="flex flex-col gap-8" aria-labelledby="movers-title">
//             <Separated by={<Separator />}>
//               <div className="flex flex-col gap-6">
//                 <div className="flex flex-wrap items-center justify-between gap-4">
//                   <h1 id="movers-title" className="typo-section-heading">
//                     오늘 크게 움직인 종목
//                   </h1>
//                   <fieldset className="inline-flex flex-wrap rounded-md bg-accent p-1">
//                     <legend className="sr-only">변동 종목 필터</legend>
//                     {moversFilterSchema.options.map((value) => (
//                       <Button
//                         key={value}
//                         size="sm"
//                         variant={sort === value ? "default" : "ghost"}
//                         onClick={() =>
//                           navigate({
//                             search: (previous) => ({ ...previous, sort: value, page: 1 }),
//                             replace: true,
//                           })
//                         }
//                       >
//                         {
//                           {
//                             ALL: "전체 종목",
//                             UP: "상승 TOP",
//                             DOWN: "하락 TOP",
//                             VOLUME: "거래량 급증",
//                           }[value]
//                         }
//                       </Button>
//                     ))}
//                   </fieldset>
//                 </div>
//                 <div className="grid gap-4 rounded-lg bg-muted p-5 md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-end">
//                   <div>
//                     <label htmlFor="stock-search" className="typo-label-sm">
//                       종목 검색
//                     </label>
//                     <Input
//                       id="stock-search"
//                       name="q"
//                       value={q ?? ""}
//                       onChange={(event) => {
//                         const query = event.currentTarget.value
//                         navigate({
//                           search: (previous) => ({ ...previous, q: query, page: 1 }),
//                           replace: true,
//                         })
//                       }}
//                       placeholder="종목명 · 코드 · 티커"
//                       className="mt-2"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="industry-filter" className="typo-label-sm">
//                       산업
//                     </label>
//                     <Select.Root
//                       value={industry ?? "all"}
//                       onValueChange={(value) =>
//                         navigate({
//                           search: (previous) => ({
//                             ...previous,
//                             industry: value === "all" ? undefined : value,
//                             page: 1,
//                           }),
//                           replace: true,
//                         })
//                       }
//                     >
//                       <Select.Trigger id="industry-filter" className="mt-2 w-full">
//                         <Select.Value />
//                       </Select.Trigger>
//                       <Select.Content>
//                         <Select.Item value="all">전체 산업</Select.Item>
//                         <ErrorBoundary fallback="오류가 발생했습니다">
//                           <Suspense fallback="로딩중">
//                             <SuspenseQuery
//                               {...getReadFlowsSuspenseQueryOptions({
//                                 country: market === "domestic" ? "KR" : "US",
//                               })}
//                             >
//                               {({ data: response }) =>
//                                 response.data
//                                   .filter(
//                                     (item, index, items) =>
//                                       item.code &&
//                                       items.findIndex(
//                                         (candidate) => candidate.code === item.code,
//                                       ) === index,
//                                   )
//                                   .map(
//                                     (item) =>
//                                       item.code && (
//                                         <Select.Item key={item.code} value={item.code}>
//                                           {item.displayName}
//                                         </Select.Item>
//                                       ),
//                                   )
//                               }
//                             </SuspenseQuery>
//                           </Suspense>
//                         </ErrorBoundary>
//                       </Select.Content>
//                     </Select.Root>
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={() =>
//                       navigate({
//                         search: (previous) => ({
//                           ...previous,
//                           q: undefined,
//                           industry: undefined,
//                           page: 1,
//                         }),
//                         replace: true,
//                       })
//                     }
//                   >
//                     검색·산업 초기화
//                   </Button>
//                 </div>
//                 <div className="flex items-center justify-between gap-4 typo-body-sm text-muted-foreground">
//                   <span>투자 유의 종목 포함</span>
//                   <Switch
//                     checked={includeCaution}
//                     onCheckedChange={(value) =>
//                       navigate({
//                         search: (previous) => ({ ...previous, includeCaution: value, page: 1 }),
//                         replace: true,
//                       })
//                     }
//                     aria-label="투자 유의 종목 포함"
//                   />
//                 </div>
//               </div>
//               <Table.Root className="min-w-6xl" aria-labelledby="movers-title">
//                 <Table.Header>
//                   <Table.Row>
//                     <Table.Head>순위</Table.Head>
//                     <Table.Head>종목</Table.Head>
//                     <Table.Head className="text-right">현재가</Table.Head>
//                     <Table.Head className="text-right">등락률</Table.Head>
//                     <Table.Head className="text-right">거래량</Table.Head>
//                     <Table.Head className="text-right">평소 거래량 대비</Table.Head>
//                     <Table.Head className="text-right">시가총액</Table.Head>
//                     <Table.Head className="text-right">거래대금</Table.Head>
//                     <Table.Head>관련 맥락</Table.Head>
//                   </Table.Row>
//                 </Table.Header>
//                 <ErrorBoundary
//                   fallback={
//                     <Table.Body>
//                       <Table.Row>
//                         <Table.Cell colSpan={9} className="py-4 typo-body-sm">
//                           오류가 발생했습니다
//                         </Table.Cell>
//                       </Table.Row>
//                     </Table.Body>
//                   }
//                 >
//                   <Suspense
//                     fallback={
//                       <Table.Body>
//                         <Table.Row>
//                           <Table.Cell colSpan={9} className="py-4 typo-body-sm">
//                             로딩중
//                           </Table.Cell>
//                         </Table.Row>
//                       </Table.Body>
//                     }
//                   >
//                     <SuspenseQuery {...stocksQueryOptions}>
//                       {({ data: response }) => (
//                         <>
//                           <Table.Body>
//                             {response.data.items.map((stock, index) => (
//                               <Table.Row key={stock.stockId} className="h-17">
//                                 <Table.Cell>
//                                   {(response.data.page - 1) * response.data.size + index + 1}
//                                 </Table.Cell>
//                                 <Table.Cell>
//                                   <Link
//                                     to="/stocks/$stockId"
//                                     params={{ stockId: String(stock.stockId) }}
//                                     className="block typo-table-label hover:text-primary hover:underline"
//                                   >
//                                     {stock.name}
//                                   </Link>
//                                   <span className="block typo-caption text-muted-foreground">
//                                     {stock.ticker} · {stock.industryName}
//                                     {stock.caution ? " · 투자 유의" : ""}
//                                   </span>
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right">
//                                   <>
//                                     <PriceNumber
//                                       value={stock.price}
//                                       className="text-foreground"
//                                       format={{ maximumFractionDigits: 2 }}
//                                     />{" "}
//                                     {stock.currency}
//                                   </>
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right">
//                                   <PriceNumber
//                                     value={stock.changeRate}
//                                     format={{
//                                       style: "unit",
//                                       unit: "percent",
//                                       signDisplay: "exceptZero",
//                                     }}
//                                   />
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right tabular-nums">
//                                   {stock.indicators.volume?.toLocaleString("ko-KR") ?? "—"}
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right tabular-nums">
//                                   {stock.indicators.volumeRatio20d == null
//                                     ? "—"
//                                     : `${stock.indicators.volumeRatio20d}배`}
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right">
//                                   {stock.indicators.marketCap == null ? (
//                                     "—"
//                                   ) : (
//                                     <>
//                                       <PriceNumber
//                                         value={stock.indicators.marketCap}
//                                         className="text-foreground"
//                                         format={{
//                                           notation: "compact",
//                                         }}
//                                       />{" "}
//                                       {stock.currency}
//                                     </>
//                                   )}
//                                 </Table.Cell>
//                                 <Table.Cell className="text-right">
//                                   {stock.indicators.tradingValue == null ? (
//                                     "—"
//                                   ) : (
//                                     <>
//                                       <PriceNumber
//                                         value={stock.indicators.tradingValue}
//                                         className="text-foreground"
//                                         format={{
//                                           notation: "compact",
//                                         }}
//                                       />{" "}
//                                       {stock.currency}
//                                     </>
//                                   )}
//                                 </Table.Cell>
//                                 <Table.Cell className="text-muted-foreground">
//                                   {stock.contextSummary ?? "—"}
//                                 </Table.Cell>
//                               </Table.Row>
//                             ))}
//
//                             {response.data.items.length === 0 && (
//                               <Table.Row>
//                                 <Table.Cell
//                                   colSpan={9}
//                                   className="py-12 text-center text-muted-foreground"
//                                 >
//                                   검색 결과가 없습니다.
//                                 </Table.Cell>
//                               </Table.Row>
//                             )}
//                           </Table.Body>
//                           <Table.Footer className="border-0 bg-transparent">
//                             <Table.Row>
//                               <Table.Cell colSpan={9}>
//                                 <p className="my-4 typo-caption text-muted-foreground">
//                                   총 {response.data.total}개 종목
//                                 </p>
//                                 <Pagination.Root className="mt-6">
//                                   <Pagination.Content>
//                                     <Pagination.Item>
//                                       <Pagination.Previous
//                                         disabled={page <= 1}
//                                         onClick={() =>
//                                           navigate({
//                                             search: (previous) => ({ ...previous, page: page - 1 }),
//                                           })
//                                         }
//                                       />
//                                     </Pagination.Item>
//                                     <Pagination.Item>
//                                       <Pagination.Status>
//                                         {response.data.page} /{" "}
//                                         {Math.max(
//                                           1,
//                                           Math.ceil(response.data.total / response.data.size),
//                                         )}
//                                       </Pagination.Status>
//                                     </Pagination.Item>
//                                     <Pagination.Item>
//                                       <Pagination.Next
//                                         disabled={page * response.data.size >= response.data.total}
//                                         onClick={() =>
//                                           navigate({
//                                             search: (previous) => ({ ...previous, page: page + 1 }),
//                                           })
//                                         }
//                                       />
//                                     </Pagination.Item>
//                                   </Pagination.Content>
//                                 </Pagination.Root>
//                               </Table.Cell>
//                             </Table.Row>
//                           </Table.Footer>
//                         </>
//                       )}
//                     </SuspenseQuery>
//                   </Suspense>
//                 </ErrorBoundary>
//               </Table.Root>
//             </Separated>
//           </section>
//         </Tabs.Content>
//       </Tabs.Root>
//     </main>
//   )
// }

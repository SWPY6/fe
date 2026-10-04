import { getItemMock, getStockDisclosureItemMock } from "../generated/api.msw"
import type { StockDisclosureResponse, StockNewsResponse } from "../generated/api.schemas"
import { markets } from "./market"
import { stocks } from "./stock"
import type { Stock } from "./stock"

const day = 24 * 60 * 60 * 1000
const fetchedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()

function localDate(value: string, country: Stock["country"]) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: markets[country].timezone }).format(
    new Date(value),
  )
}

// 같은 종목·기간을 다시 조회해도 자료 ID와 내용이 유지되는 수집 스냅샷.
const documents = new Map(
  stocks.map(({ item, country }) => {
    const scenario = (item.stockId - 1) % 8
    const news = Array.from({ length: scenario === 1 ? 0 : 56 }, (_, index) => {
      const generated = getItemMock()
      return {
        ...generated,
        documentId: `news-${item.stockId}-${index}`,
        title: `${item.name} ${generated.title}`,
        publishedAt: new Date(Date.parse(fetchedAt) - index * (day / 4)).toISOString(),
        summary: scenario === 3 ? null : generated.summary,
        publisherName: scenario === 3 ? null : generated.publisherName,
        url: `https://example.com/mock-news/${item.stockId}/${index}`,
        linkKind: "ORIGINAL" as const,
      }
    })
    const disclosures = Array.from(
      { length: scenario === 1 || scenario === 3 ? 0 : scenario === 2 ? 180 : 90 },
      (_, index) => {
        const receivedAt = new Date(
          Date.parse(fetchedAt) - index * (scenario === 2 ? day / 6 : day),
        ).toISOString()
        const publishedAt = country === "KR" || index % 7 === 0 ? null : receivedAt
        return getStockDisclosureItemMock({
          provider: country === "KR" ? "DART" : "SEC",
          providerDocumentId: `disclosure-${item.stockId}-${index}`,
          type: "DISCLOSURE",
          title: country === "KR" ? `${item.name} 모의 경영 공시` : `${item.name} Form 8-K`,
          formType: country === "KR" ? null : "8-K",
          formLabel: country === "KR" ? null : "수시공시(주요사항)",
          issuerName: item.name,
          filerName: country === "KR" ? item.name : null,
          remark: null,
          filedDate: localDate(receivedAt, country),
          publishedAt,
          datePrecision: publishedAt === null ? "DATE" : "SECOND",
          timeBasis: publishedAt === null ? "RECEIPT_DATE" : "ACCEPTANCE_TIME",
          summary: null,
          url: `https://example.com/mock-disclosures/${item.stockId}/${index}`,
          linkKind: country === "KR" ? "DART_VIEWER" : "SEC_DOCUMENT",
        })
      },
    )
    return [item.stockId, { news, disclosures }] as const
  }),
)

export function stockNews(stock: Stock, from: string, to: string) {
  const articles = documents.get(stock.item.stockId)?.news ?? []
  const start = Date.parse(from)
  const end = Date.parse(to)
  const windowCovered =
    (stock.item.stockId - 1) % 8 !== 2 &&
    (articles.length === 0 || start >= Date.parse(articles[articles.length - 1].publishedAt))
  const items = articles
    .filter((article) => {
      const publishedAt = Date.parse(article.publishedAt)
      return publishedAt > start && publishedAt <= end
    })
    .slice(0, 20)

  return {
    stockId: stock.item.stockId,
    country: stock.country,
    window: { from, to },
    fetchedAt,
    windowCovered,
    total: items.length,
    items,
  } satisfies StockNewsResponse
}

export function stockDisclosures(stock: Stock, from: string, to: string) {
  const filings = documents.get(stock.item.stockId)?.disclosures ?? []
  const startDate = localDate(from, stock.country)
  const endDate = localDate(to, stock.country)
  const unmapped = (stock.item.stockId - 1) % 8 === 3
  const matched = filings
    .filter((filing) =>
      filing.publishedAt === null
        ? filing.filedDate >= startDate && filing.filedDate <= endDate
        : Date.parse(filing.publishedAt) > Date.parse(from) &&
          Date.parse(filing.publishedAt) <= Date.parse(to),
    )
    .toSorted(
      (a, b) =>
        b.filedDate.localeCompare(a.filedDate) ||
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") ||
        b.providerDocumentId.localeCompare(a.providerDocumentId),
    )
  const items = matched.slice(0, 100)
  const partial =
    matched.length > 100 ||
    (filings.length > 0 && startDate < filings[filings.length - 1].filedDate)
  const recentStart = new Date(`${endDate}T00:00:00Z`)
  recentStart.setUTCDate(recentStart.getUTCDate() - 90)

  return {
    stockId: stock.item.stockId,
    country: stock.country,
    source: stock.country === "KR" ? "DART" : "SEC",
    window: { from, to },
    windowPrecision: unmapped ? null : stock.country === "KR" ? "DATE_EXPANDED" : "EXACT",
    filedDateRange: unmapped
      ? null
      : {
          from:
            endDate === localDate(new Date().toISOString(), stock.country)
              ? recentStart.toISOString().slice(0, 10)
              : startDate,
          to: endDate,
        },
    fetchedAt: unmapped ? null : fetchedAt,
    coverage: unmapped ? "UNMAPPED" : partial ? "PARTIAL" : "COMPLETE",
    total: items.length,
    items,
  } satisfies StockDisclosureResponse
}

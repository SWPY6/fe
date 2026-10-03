import { faker } from "@faker-js/faker"
import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: {
      target: "./src/api/openapi.generated.json",
    },
    output: {
      target: "./src/api/generated/api.ts",
      client: "react-query",
      httpClient: "axios",
      mode: "split",
      clean: true,
      mock: {
        generators: [{ type: "msw", useExamples: true, locale: "ko" }],
      },
      override: {
        query: {
          version: 5,
          signal: true,
          useSuspenseQuery: true,
        },
        mutator: {
          path: "./src/api/http/client.ts",
          name: "apiRequest",
        },
        mock: {
          // 백엔드 스키마 이름별로 개별 값의 생성 규칙을 등록한다.
          // 숫자 범위와 표시명 목록은 개발용 초기값이며 여기서 직접 조정한다.
          // 등록하지 않은 항목은 기존 example을 사용한다.
          schemas: {
            ApiResultListIndustryTrendResponse: {
              properties: {
                data: () =>
                  faker.helpers
                    .uniqueArray(
                      () =>
                        faker.helpers.arrayElement([
                          "CONSTRUCTION",
                          "ENERGY",
                          "TRANSPORT",
                          "RETAIL",
                          "FOOD_BEVERAGE",
                          "AUTOMOBILE",
                          "STEEL",
                          "TELECOM",
                          "CHEMICAL",
                        ]),
                      9,
                    )
                    .map((code, index) => ({
                      code,
                      displayName: {
                        CONSTRUCTION: "건설",
                        ENERGY: "에너지",
                        TRANSPORT: "운송",
                        RETAIL: "유통",
                        FOOD_BEVERAGE: "음식료",
                        AUTOMOBILE: "자동차",
                        STEEL: "철강",
                        TELECOM: "통신",
                        CHEMICAL: "화학",
                      }[code],
                      rank: index + 1,
                      avgChangeRate: 4 - index,
                      stockCount: 4,
                      currency: "KRW",
                      stocks: Array.from({ length: 4 }, () => ({
                        ticker: faker.string.numeric({ length: 6, allowLeadingZeros: true }),
                        name: faker.company.name(),
                        price: faker.number.int({ min: 1000, max: 500000 }),
                        changeRate: faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
                      })),
                      calculatedAt: faker.date.recent().toISOString(),
                    })),
              },
            },
            ApiResultListIndustryFlowResponse: {
              properties: {
                data: () =>
                  faker.helpers
                    .uniqueArray(
                      () =>
                        faker.helpers.arrayElement([
                          "CONSTRUCTION",
                          "ENERGY",
                          "TRANSPORT",
                          "RETAIL",
                          "FOOD_BEVERAGE",
                          "AUTOMOBILE",
                          "STEEL",
                          "TELECOM",
                          "CHEMICAL",
                        ]),
                      9,
                    )
                    .map((code, index) => ({
                      code,
                      displayName: {
                        CONSTRUCTION: "건설",
                        ENERGY: "에너지",
                        TRANSPORT: "운송",
                        RETAIL: "유통",
                        FOOD_BEVERAGE: "음식료",
                        AUTOMOBILE: "자동차",
                        STEEL: "철강",
                        TELECOM: "통신",
                        CHEMICAL: "화학",
                      }[code],
                      rank: index + 1,
                      avgChangeRate: 4 - index,
                      stockCount: 4,
                      majorStocks: Array.from({ length: 2 }, () => ({
                        ticker: faker.string.numeric({ length: 6, allowLeadingZeros: true }),
                        name: faker.company.name(),
                        changeRate: faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
                      })),
                      calculatedAt: faker.date.recent().toISOString(),
                    })),
              },
            },
            Profile: {
              properties: {
                name: () => faker.company.name(),
                // 국내 6자리 숫자 코드 또는 해외 영문 티커 형식을 생성한다.
                ticker: () =>
                  faker.helpers.arrayElement([
                    faker.string.numeric({ length: 6, allowLeadingZeros: true }),
                    faker.string.alpha({ length: { min: 1, max: 5 }, casing: "upper" }),
                  ]),
                logoUrl: () => faker.image.url({ width: 128, height: 128 }),
              },
            },
            Summary: {
              properties: {
                stockId: () => faker.number.int({ min: 1, max: 10_000 }),
                market: () => faker.helpers.arrayElement(["KR", "US"]),
                currency: () => faker.helpers.arrayElement(["KRW", "USD", "USDT"]),
                timezone: () => faker.helpers.arrayElement(["Asia/Seoul", "America/New_York"]),
              },
            },
            StockQuoteResponse: {
              properties: {
                stockId: () => faker.number.int({ min: 1, max: 10_000 }),
                ticker: () =>
                  faker.helpers.arrayElement([
                    faker.string.numeric({ length: 6, allowLeadingZeros: true }),
                    faker.string.alpha({ length: { min: 1, max: 5 }, casing: "upper" }),
                  ]),
                name: () => faker.company.name(),
                currency: () => faker.helpers.arrayElement(["KRW", "USD", "USDT"]),
                price: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                change: () => faker.number.float({ min: -50_000, max: 50_000, fractionDigits: 2 }),
                changeRate: () => faker.number.float({ min: -30, max: 30, fractionDigits: 2 }),
                priceAt: () => faker.date.recent({ days: 7 }).toISOString(),
                priceTiming: () => faker.helpers.arrayElement(["REALTIME", "DELAYED"]),
              },
            },
            Indicators: {
              properties: {
                previousClose: () =>
                  faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                open: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                high: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                low: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                volume: () => faker.number.int({ min: 0, max: 100_000_000 }),
                volumeRatio20d: () => faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
                marketCap: () => faker.number.int({ min: 1_000_000_000, max: 100_000_000_000_000 }),
                tradingValue: () => faker.number.int({ min: 0, max: 1_000_000_000_000 }),
              },
            },
            Candle: {
              properties: {
                tradeAt: () => faker.date.recent({ days: 90 }).toISOString().slice(0, 10),
                open: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                high: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                low: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                close: () => faker.number.float({ min: 1, max: 500_000, fractionDigits: 2 }),
                volume: () => faker.number.int({ min: 0, max: 100_000_000 }),
                closed: () => faker.datatype.boolean(),
              },
            },
            StockChartResponse: {
              properties: {
                stockId: () => faker.number.int({ min: 1, max: 10_000 }),
                interval: () => faker.helpers.arrayElement(["1D", "1W", "1M", "3M", "1Y"]),
                currency: () => faker.helpers.arrayElement(["KRW", "USD", "USDT"]),
                from: () => faker.date.recent({ days: 90 }).toISOString().slice(0, 10),
                to: () => faker.date.recent({ days: 90 }).toISOString().slice(0, 10),
                asOf: () => faker.date.recent({ days: 7 }).toISOString(),
                averageVolume: () => faker.number.int({ min: 0, max: 100_000_000 }),
              },
            },
            IndicatorCard: {
              properties: {
                indicator: () =>
                  faker.helpers.arrayElement(["KOSPI", "KOSDAQ", "NASDAQ", "SP500", "USD_KRW"]),
                name: () =>
                  faker.helpers.arrayElement([
                    "코스피",
                    "코스닥",
                    "나스닥",
                    "S&P 500",
                    "원/달러 환율",
                  ]),
                unit: () => faker.helpers.arrayElement(["POINT", "KRW"]),
                value: () => faker.number.float({ min: 100, max: 30_000, fractionDigits: 2 }),
                change: () => faker.number.float({ min: -500, max: 500, fractionDigits: 2 }),
                changeRate: () => faker.number.float({ min: -15, max: 15, fractionDigits: 2 }),
                valueAt: () => faker.date.recent({ days: 7 }).toISOString(),
              },
            },
            MarketSummaryResponse: {
              properties: {
                region: () => faker.helpers.arrayElement(["DOMESTIC", "OVERSEAS"]),
              },
            },
            IndustryNewsResponse: {
              properties: {
                code: () =>
                  faker.helpers.arrayElement([
                    "AUTOMOBILE",
                    "CONSTRUCTION",
                    "TRANSPORT",
                    "RETAIL",
                    "FOOD_BEVERAGE",
                    "TELECOM",
                    "STEEL",
                    "ENERGY",
                    "CHEMICAL",
                  ]),
                displayName: () =>
                  faker.helpers.arrayElement([
                    "자동차",
                    "건설",
                    "운송",
                    "유통",
                    "음식료",
                    "통신",
                    "철강",
                    "에너지",
                    "화학",
                  ]),
                direction: () => faker.helpers.arrayElement(["RISING", "FALLING"]),
                rank: () => faker.number.int({ min: 1, max: 9 }),
                avgChangeRate: () => faker.number.float({ min: -15, max: 15, fractionDigits: 2 }),
                stockCount: () => faker.number.int({ min: 0, max: 500 }),
                risingCount: () => faker.number.int({ min: 0, max: 500 }),
                fallingCount: () => faker.number.int({ min: 0, max: 500 }),
                calculatedAt: () => faker.date.recent({ days: 7 }).toISOString(),
              },
            },
            RelatedNewsResponse: {
              properties: {
                title: () =>
                  faker.company.name() +
                  ", " +
                  faker.helpers.arrayElement([
                    "분기 실적 발표",
                    "신규 사업 투자 계획 공개",
                    "해외 시장 진출 발표",
                    "생산 설비 확대 추진",
                  ]),
                publisher: () =>
                  faker.helpers.arrayElement([
                    "연합뉴스",
                    "한국경제",
                    "매일경제",
                    "Reuters",
                    "Bloomberg",
                  ]),
                publishedAt: () => faker.date.recent({ days: 7 }).toISOString(),
                url: () => "https://example.com/news/" + faker.string.numeric(8),
              },
            },
            IndustryFlowResponse: {
              properties: {
                code: () =>
                  faker.helpers.arrayElement([
                    "AUTOMOBILE",
                    "CONSTRUCTION",
                    "TRANSPORT",
                    "RETAIL",
                    "FOOD_BEVERAGE",
                    "TELECOM",
                    "STEEL",
                    "ENERGY",
                    "CHEMICAL",
                  ]),
                displayName: () =>
                  faker.helpers.arrayElement([
                    "자동차",
                    "건설",
                    "운송",
                    "유통",
                    "음식료",
                    "통신",
                    "철강",
                    "에너지",
                    "화학",
                  ]),
                rank: () => faker.number.int({ min: 1, max: 9 }),
                avgChangeRate: () => faker.number.float({ min: -15, max: 15, fractionDigits: 2 }),
                stockCount: () => faker.number.int({ min: 0, max: 500 }),
                calculatedAt: () => faker.date.recent({ days: 7 }).toISOString(),
              },
            },
            MajorStockResponse: {
              properties: {
                ticker: () =>
                  faker.helpers.arrayElement([
                    faker.string.numeric({ length: 6, allowLeadingZeros: true }),
                    faker.string.alpha({ length: { min: 1, max: 5 }, casing: "upper" }),
                  ]),
                name: () => faker.company.name(),
                changeRate: () => faker.number.float({ min: -30, max: 30, fractionDigits: 2 }),
              },
            },
          },
        },
      },
    },
  },
})

import { faker } from "@faker-js/faker"
import { defineConfig } from "orval"

export default defineConfig({
  api: {
    hooks: {
      afterAllFilesWrite: "oxfmt src/api/openapi.generated.json",
    },
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
        generators: [{ type: "msw", delay: false, useExamples: false, arrayItems: true }],
      },
      override: {
        mock: {
          required: true,
          nonNullable: true,
          arrayMin: 1,
          arrayMax: 4,
          schemas: {
            Profile: {
              properties: {
                name: () => faker.company.name(),
                ticker: () => faker.string.alpha({ length: 4, casing: "upper" }),
                logoUrl: null,
              },
            },
            StockQuoteResponse: {
              properties: {
                name: () => faker.company.name(),
                ticker: () => faker.string.alpha({ length: 4, casing: "upper" }),
                price: () => faker.number.float({ min: 20, max: 500, fractionDigits: 2 }),
                change: () => faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
                changeRate: () => faker.number.float({ min: -5, max: 5, fractionDigits: 2 }),
              },
            },
            Indicators: {
              properties: {
                volume: () => faker.number.int({ min: 100_000, max: 2_000_000 }),
                volumeRatio20d: () => faker.number.float({ min: 0.5, max: 3, fractionDigits: 2 }),
                marketCap: () => faker.number.int({ min: 1_000_000_000, max: 100_000_000_000 }),
              },
            },
            Candle: {
              properties: {
                close: () => faker.number.float({ min: 20, max: 500, fractionDigits: 2 }),
                volume: () => faker.number.int({ min: 100_000, max: 2_000_000 }),
              },
            },
            RelatedNewsResponse: {
              properties: {
                publisher: "모의 시장 뉴스",
                url: "https://example.com/mock-news",
              },
            },
            Item: {
              properties: {
                title: () => faker.lorem.sentence(5),
                summary: () => faker.lorem.sentence(),
                source: "example.com",
                publisherName: "모의 시장 뉴스",
                timestampBasis: "NAVER_PROVIDED",
                url: "https://example.com/mock-news",
              },
            },
            StockDisclosureItem: {
              properties: {
                title: "모의 경영 공시",
                summary: null,
                summaryStatus: "UNAVAILABLE",
                url: "https://example.com/mock-disclosures",
              },
            },
          },
        },
        query: {
          version: 5,
          signal: true,
          useSuspenseQuery: true,
        },
        mutator: {
          path: "./src/api/http/client.ts",
          name: "apiRequest",
        },
      },
    },
  },
})

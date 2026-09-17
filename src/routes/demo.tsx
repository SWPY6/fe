import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const FONT_WEIGHTS = [400, 500, 600, 700, 900] as const
const WEIGHT_SAMPLE = "같은 글자를 여러 굵기로 표시합니다. Pretendard 0123456789"

const DemoPage = () => {
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    let active = true

    void document.fonts.ready.then(() => {
      if (active) {
        setFontReady(document.fonts.check('16px "Pretendard Variable"'))
      }
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase">
            Temporary /demo route
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Pretendard font loading</h1>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Font: <strong className="text-white">Pretendard Variable</strong>
            </p>
            <p>
              Status:{" "}
              <strong className={fontReady ? "text-emerald-400" : "text-amber-400"}>
                {fontReady ? "Loaded" : "Loading"}
              </strong>
            </p>
            <p>
              DevTools filter: <strong className="text-white">Font</strong>
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">Weight samples</h2>
          <div className="divide-y divide-slate-800">
            {FONT_WEIGHTS.map((weight) => (
              <div
                key={weight}
                className="grid gap-2 py-5 sm:grid-cols-[5rem_1fr] sm:items-baseline"
              >
                <span className="font-mono text-sm text-blue-400">{weight}</span>
                <p className="text-xl" style={{ fontWeight: weight }}>
                  {WEIGHT_SAMPLE}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SampleCard title="Korean">
            다람쥐 헌 쳇바퀴에 타고파. 금융 데이터와 차트를 확인합니다.
          </SampleCard>
          <SampleCard title="English">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
          </SampleCard>
          <SampleCard title="Numbers">0123456789 ₩1,234,567 +12.34% -5.67%</SampleCard>
        </section>
      </div>
    </main>
  )
}

interface SampleCardProps {
  children: string
  title: string
}

const SampleCard = ({ children, title }: SampleCardProps) => (
  <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="mb-3 text-sm font-semibold tracking-wider text-blue-400 uppercase">{title}</h2>
    <p className="text-lg/8 font-medium wrap-break-word">{children}</p>
  </article>
)

export const Route = createFileRoute("/demo")({ component: DemoPage })

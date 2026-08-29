import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({ component: AboutPage });

function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">프로젝트 소개</h1>
      <p className="mt-6 max-w-2xl leading-7 text-slate-300">
        제품 요구사항이 확정되면 이 라우트부터 실제 화면으로 교체하세요.
      </p>
    </main>
  );
}

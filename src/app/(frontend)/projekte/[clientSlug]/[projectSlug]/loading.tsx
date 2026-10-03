export default function LoadingProject() {
  return (
    <main className="container py-12 lg:py-24" aria-busy="true">
      <p role="status" className="text-accent">Projekt wird geladen …</p>
      <div aria-hidden="true" className="mt-8 space-y-6">
        <div className="h-16 w-3/4 rounded bg-secondary" />
        <div className="aspect-video w-full rounded-2xl bg-secondary" />
      </div>
    </main>
  )
}

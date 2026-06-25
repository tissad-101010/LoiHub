import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'

export default async function HomePage() {
  const lawCount = await prisma.law.count()

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6 p-8">
          <h1 className="text-4xl font-bold">
            Loi<span className="text-red-600">i</span>Hub
          </h1>

          <p className="text-lg text-muted-foreground">
            IA citoyenne pour comprendre,
            analyser et construire la loi.
          </p>

          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">État du système</h2>

            <p className="mt-2 text-sm">
              Nombre de lois enregistrées : <strong>{lawCount}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
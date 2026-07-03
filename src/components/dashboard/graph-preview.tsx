"use client"

import Link from "next/link"
import { Network, ArrowRight } from "lucide-react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from "reactflow"

import "reactflow/dist/style.css"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GraphPreviewProps {
  className?: string
}

/**
 * 🔥 Données statiques (preview produit)
 */
const nodes: Node[] = [
  {
    id: "deputy-1",
    position: { x: 50, y: 50 },
    data: { label: "👤 Député" },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 10,
    },
  },
  {
    id: "law-1",
    position: { x: 250, y: 120 },
    data: { label: "📜 Loi" },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 10,
    },
  },
  {
    id: "amendment-1",
    position: { x: 120, y: 220 },
    data: { label: "✏️ Amendement" },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 10,
    },
  },
]

const edges: Edge[] = [
  {
    id: "e1",
    source: "deputy-1",
    target: "law-1",
    animated: true,
  },
  {
    id: "e2",
    source: "law-1",
    target: "amendment-1",
    animated: true,
  },
]

export function GraphPreview({ className }: GraphPreviewProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Graph des relations</CardTitle>

        <Network className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-4">

        {/* GRAPH VISUEL */}
        <div className="h-64 overflow-hidden rounded-xl border bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
          >
            <Background gap={12} size={1} />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground">
          Visualisation des relations entre députés, lois et amendements.
        </p>

        {/* CTA */}
        <Link
          href="/graph"
          className="
            flex items-center justify-between rounded-lg border
            bg-background px-4 py-2 text-sm transition
            hover:bg-muted/40
          "
        >
          <span>Ouvrir le graphe interactif</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

      </CardContent>
    </Card>
  )
}
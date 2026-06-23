import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function UiDemoPage() {
  return (
    <div className="p-10 space-y-10">
      <h1 className="text-2xl font-bold">LoiHub UI System</h1>

      {/* BUTTON */}
      <div className="space-x-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>

      {/* CARD */}
      <Card className="p-4">
        <p>Carte LoiHub</p>
        <Badge>Projet de loi</Badge>
      </Card>

      {/* INPUT */}
      <Input placeholder="Rechercher une loi..." />

      {/* SELECT */}
      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Choisir une catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="constitution">Constitution</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
        </SelectContent>
      </Select>

      {/* DIALOG */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Ouvrir modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amendement</DialogTitle>
          </DialogHeader>
          <p>Contenu de l’amendement</p>
        </DialogContent>
      </Dialog>

      {/* TABS */}
      <Tabs defaultValue="lois">
        <TabsList>
          <TabsTrigger value="lois">Lois</TabsTrigger>
          <TabsTrigger value="debats">Débats</TabsTrigger>
        </TabsList>
        <TabsContent value="lois">Liste des lois</TabsContent>
        <TabsContent value="debats">Liste des débats</TabsContent>
      </Tabs>

      {/* SHEET */}
      <Sheet>
        <SheetTrigger asChild>
          <Button>Menu</Button>
        </SheetTrigger>
        <SheetContent>
          Navigation LoiHub
        </SheetContent>
      </Sheet>

      {/* TOOLTIP */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            Info LoiHub
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
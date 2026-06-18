import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, History, Cpu } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 lg:p-12 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-blue-500">ABOUT ADVENTURE</h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">History & Technical Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/">
              <Button variant="outline" className="border-border bg-card hover:bg-accent gap-2 rounded-xl h-11 px-6 font-bold shadow-sm transition-all active:scale-95">
                <ArrowLeft className="size-4" /> BACK TO GAME
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8">
          <Card className="border-border bg-card shadow-lg rounded-2xl overflow-hidden border-t-4 border-t-orange-500/50">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-orange-500 uppercase tracking-tight font-black">
                <History className="size-6" /> The History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                <span className="text-foreground font-bold underline decoration-orange-500/30 underline-offset-4">Colossal Cave Adventure</span> (often simply called <span className="italic">Adventure</span>) 
                is the foundational work of the interactive fiction genre, created in the mid-1970s.
              </p>
              <div className="space-y-8 ml-2 md:ml-6 border-l-2 border-border pl-8 py-2">
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 size-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  <h3 className="text-foreground font-black text-xl mb-3 uppercase tracking-tight">The Origins (1975–1976)</h3>
                  <p>
                    Will Crowther, a programmer at BBN and an avid caver, developed the initial version in FORTRAN on a PDP-10 mainframe. 
                    He created it for his daughters following a divorce, blending his intricate knowledge of Kentucky’s Mammoth Cave system 
                    (specifically the Bedquilt section) with elements of <span className="italic">Dungeons & Dragons</span>.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 size-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-foreground font-black text-xl mb-3 uppercase tracking-tight">The Expansion (1977)</h3>
                  <p>
                    Don Woods, a graduate student at Stanford, discovered the game on ARPANET and, with Crowther’s blessing, 
                    expanded it significantly. He introduced fantasy elements (dwarves, giants, and a dragon), magic words like <code className="bg-muted px-2 py-0.5 rounded text-blue-500 font-mono font-bold">XYZZY</code>, 
                    and the famous 350-point scoring system.
                  </p>
                </div>
              </div>
              <p className="pt-4 border-t border-border/50 italic text-base">
                The game’s influence is immeasurable. It directly inspired the creation of <span className="italic font-semibold text-foreground">Zork</span>, 
                the founding of Sierra On-Line, and defined the conventions of text adventures that persist to this day.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-lg rounded-2xl overflow-hidden border-t-4 border-t-blue-500/50">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-blue-500 uppercase tracking-tight font-black">
                <Cpu className="size-6" /> The Next.js Port
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                This project is a <span className="text-foreground font-bold underline decoration-blue-500/30 underline-offset-4">faithful forward-port</span> of the original source code 
                (specifically the <span className="italic">Open Adventure</span> 2.5 version) into a modern web environment.
              </p>
              <ul className="grid gap-6">
                {[
                  {
                    title: "Strict TypeScript",
                    text: "The entire engine is implemented with 100% strict type safety, ensuring the complex state machine of the original game is robust and maintainable.",
                    icon: "✓"
                  },
                  {
                    title: "Next.js 16 & React 19",
                    text: "Leveraging the latest web technologies to provide a performant, responsive, and accessible experience.",
                    icon: "✓"
                  },
                  {
                    title: "Data-Driven Logic",
                    text: "The game world is parsed directly from the original adventure.yaml data, preserving every room, object, and message of the classic.",
                    icon: "✓"
                  },
                  {
                    title: "Modern UI",
                    text: "While the logic is vintage, the interface is modern, featuring an auto-scrolling terminal, context-aware compass controls, and a dynamic inventory system.",
                    icon: "✓"
                  }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-foreground font-black uppercase tracking-tight block mb-1">{item.title}</span>
                      <span className="text-base">{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-6 py-8">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 h-14 text-lg rounded-2xl shadow-xl shadow-blue-500/20 transition-transform active:scale-95 uppercase tracking-tighter">
              Start Adventure
            </Button>
          </Link>
          <footer className="text-center text-muted-foreground text-xs font-mono uppercase tracking-[0.2em] opacity-50">
            Built with technical excellence • MMXXVI
          </footer>
        </div>
      </div>
    </main>
  );
}

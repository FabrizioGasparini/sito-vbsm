import { Button } from "@/components/ui/button"
import { FooterSmall } from "./footer-small"

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background text-center px-6">
                <img
                    src="/images/loghi/lungo-bianco.webp"
                    alt="Logo Volleyball San Martino"
                    className="mb-8 animate-pulse w-full max-w-[1200px]"
                />
                <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-primary" style={{ fontFamily: "Ethnocentric" }}>
                    SITO IN MANUTENZIONE
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-8">
                    Stiamo lavorando per offrirti un’esperienza ancora migliore 🛠️
                    Torna a trovarci presto!
                </p>
                <Button
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary hover:text-white transition-all"
                    asChild
                >
                    <a href="mailto:vbsmcampionati@gmail.com">📩 Contattaci</a>
                </Button>

            </div>
            <FooterSmall />
        </div>
    )
}

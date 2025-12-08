import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const featureHighlights = [
  {
    title: "Private registry ready",
    description:
      "Install shadcn components behind your private registry by pointing the CLI at your scoped endpoint.",
  },
  {
    title: "Tailwind first",
    description:
      "All UI tokens live in the project theme so you can keep the same palettes, shadows, and radii everywhere.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <main className="w-full max-w-5xl space-y-10 rounded-3xl border border-border bg-card/60 p-8 shadow-2xl shadow-primary/20 backdrop-blur-md">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground">
            shandcd private registry demo
          </p>
          <h1 className="text-4xl font-bold leading-tight text-foreground">
            Components curated for your private registry
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            This starter proves out the Button and Card implementations from the
            shadcn template while staying compatible with a private registry
            workflow. Run the CLI locally and keep everything in sync using
            shared tokens.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Component shell</CardTitle>
              <CardDescription>
                Create responsive cards that reuse the same radius, palette, and
                spacing tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the `CardContent` area to host any layout. The default width
                adapts to the parent, and all cards share a shadow that mirrors
                the shadcn registry styling.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm">
                  Secondary action
                </Button>
                <Button>Primary action</Button>
              </div>
            </CardContent>
            <CardFooter className="gap-4">
              <Button variant="outline" className="flex-1">
                Learn more
              </Button>
              <Button variant="secondary" className="flex-1">
                Deploy registry
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow overview</CardTitle>
              <CardDescription>
                Everything stays consistent between the CLI, components, and
                documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureHighlights.map((feature) => (
                <div key={feature.title}>
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="gap-4">
              <Button variant="link">Open CLI</Button>
              <Button variant="default">Sync components</Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}

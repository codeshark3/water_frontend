import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
export const Hero = () => (
  <div className="w-full py-16 lg:py-32">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <div>
            {/* <Badge variant="outline">We&apos;re live!</Badge> */}
            <Image
              src="/assets/images/logo.png"
              alt="logo"
              width={150}
              height={150}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="outline">Welcome</Badge>
            </div>

            <h1 className="font-regular max-w-lg text-left text-5xl tracking-tighter md:text-7xl">
              Unlock the full potential of your research!
            </h1>
            <p className="max-w-md text-left text-xl leading-relaxed tracking-tight text-muted-foreground">
              Gain access to a vast array of data collated by industry experts,
              allowing you to make informed decisions and take actionable steps
              towards your research goals.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button size="lg" className="gap-4" variant="outline">
              Jump on a call <PhoneCall className="h-4 w-4" />
            </Button>
            <Button size="lg" className="gap-4">
              Sign up here <MoveRight className="h-4 w-4" />
            </Button>

            <Link href="/searchpage">
              <Button size="lg" className="gap-4">
                Search Datasets <MoveRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="aspect-square rounded-md bg-muted">
          <Image
            src="/assets/images/hero.png"
            alt="logo"
            width={1024}
            height={1024}
          />
        </div>
      </div>
    </div>
  </div>
);

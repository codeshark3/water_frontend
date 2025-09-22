import { Check } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";
export const Features = () => (
  <div className="w-full py-16 lg:py-32">
    <div className="container mx-auto">
      <div className="container grid grid-cols-1 items-center gap-8 rounded-lg border py-8 lg:grid-cols-2">
        <div className="ml-4 flex flex-col items-center gap-10">
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="outline">Platform</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-regular max-w-xl text-left text-3xl tracking-tighter lg:text-5xl">
                Data is the new gold!
              </h2>
              <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground">
                Our database management system is designed to make it easier and
                faster to find the right data for your research.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:pl-6">
            <div className="flex flex-row items-start gap-6">
              <Check className="mt-2 h-4 w-4 text-primary" />
              <div className="flex flex-col gap-1">
                <p>Easy to use</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve made it easy to use and understand.
                </p>
              </div>
            </div>
            <div className="flex flex-row items-start gap-6">
              <Check className="mt-2 h-4 w-4 text-primary" />
              <div className="flex flex-col gap-1">
                <p>Fast and reliable</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve made it fast and reliable.
                </p>
              </div>
            </div>
            <div className="flex flex-row items-start gap-6">
              <Check className="mt-2 h-4 w-4 text-primary" />
              <div className="flex flex-col gap-1">
                <p>Trusted by industry experts</p>
                <p className="text-sm text-muted-foreground">
                  We have over 60 years of in water research.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mr-4 aspect-square rounded-md bg-muted">
          <Image
            src="/assets/images/features.png"
            alt="logo"
            width={1024}
            height={1024}
          />
        </div>
      </div>
    </div>
  </div>
);

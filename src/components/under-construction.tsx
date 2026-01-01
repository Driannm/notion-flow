"use client";

import * as React from "react";
import { Construction, ArrowLeft, Hammer, Wrench, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnderConstruction() {
  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative overflow-hidden shadow-2xl bg-background text-foreground">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          {/* Main Icon */}
          <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
            <Construction className="w-16 h-16 text-primary animate-pulse" />
            
            {/* Floating Icons */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center animate-bounce" style={{ animationDelay: "0.2s" }}>
              <Hammer className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center animate-bounce" style={{ animationDelay: "0.4s" }}>
              <Wrench className="w-6 h-6 text-primary" />
            </div>

            <div className="absolute top-1/2 -right-4 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: "0.6s" }}>
              <HardHat className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-3xl font-bold">Under Construction</h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            We&apos;re working hard to bring you something amazing. This feature is currently under development and will be available soon.
          </p>

          {/* Progress Indicator */}
          <div className="pt-4">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Development in progress...
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 w-full space-y-3">
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Construction className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Coming Soon</h3>
                <p className="text-xs text-muted-foreground">
                  Stay tuned for exciting new features and improvements
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Hammer className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Being Polished</h3>
                <p className="text-xs text-muted-foreground">
                  We&apos;re making sure everything works perfectly for you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-border">
        <Button
          className="w-full"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
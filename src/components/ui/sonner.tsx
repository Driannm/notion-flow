"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle2, XCircle, Info } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // 👇 Set posisi di atas tengah (seperti Dynamic Island)
      position="top-center" 
      className="toaster group"
      toastOptions={{
        unstyled: true, // Kita reset style default biar bisa full custom
        classNames: {
          toast: 
            "group toast group-[.toaster]:bg-zinc-900/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-0 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/20 group-[.toaster]:rounded-[2rem] group-[.toaster]:p-3 group-[.toaster]:pl-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:w-full group-[.toaster]:max-w-[400px] font-sans",
          title: 
            "group-[.toast]:text-[14px] group-[.toast]:font-semibold group-[.toast]:leading-tight",
          description: 
            "group-[.toast]:text-[13px] group-[.toast]:text-zinc-400 group-[.toast]:leading-tight group-[.toast]:mt-0.5",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-white",
        },
      }}
      // 👇 Custom Icons biar lebih iOS native feel
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
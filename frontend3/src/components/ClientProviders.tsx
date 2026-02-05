"use client";

import { AuthProvider } from "@/context/AuthContext";
import { AuthLoadingProvider } from "@/context/AuthLoadingProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthLoadingProvider>
                <AuthProvider>
                    <TooltipProvider>
                        {children}
                        <Toaster />
                        <Sonner />
                    </TooltipProvider>
                </AuthProvider>
            </AuthLoadingProvider>
        </QueryClientProvider>
    );
}

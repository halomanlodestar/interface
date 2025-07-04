/** @format */

import React from "react";
import { StrategiesProvider } from "@/lib/context/StrategiesContext";
import { WalletProvider } from "@/lib/context/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component that wraps all our context providers in one place
 * This simplifies the main App component and ensures proper provider nesting
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StrategiesProvider>
          <WalletProvider>{children}</WalletProvider>
        </StrategiesProvider>
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      {/* Uncomment the line below to enable React Query Devtools */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default AppProviders;

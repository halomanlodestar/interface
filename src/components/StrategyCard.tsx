/** @format */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, RefreshCw, Grid, TrendingUp } from "lucide-react";
import { RiskLevel, Strategy, StrategyPerformance } from "@/lib/types";
import StartStrategyDialog from "./StartStrategyDialog";
import { FrequencyOption, useCreateDcaPlan } from "@/api";
import { authClient } from "@/lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLeapWalletAddress } from "@/lib/wallet";

const IconMap: Record<string, React.ReactNode> = {
  RefreshCw: <RefreshCw size={20} />,
  Grid: <Grid size={20} />,
  TrendingUp: <TrendingUp size={20} />,
};

// Color map for strategy types
const ColorMap: Record<string, { bg: string; text: string }> = {
  dca: { bg: "bg-blue-100", text: "text-crypto-blue" },
  grid: { bg: "bg-purple-100", text: "text-crypto-purple" },
  momentum: { bg: "bg-amber-100", text: "text-amber-600" },
  custom: { bg: "bg-green-100", text: "text-green-600" },
};

interface StrategyCardProps {
  strategy: Strategy;
  selectedToken: string;
  trending: boolean;
  onViewDetails: (strategyId: string) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  selectedToken,
  trending,
  onViewDetails,
}) => {
  // Get color scheme based on strategy type
  const colorScheme = ColorMap[strategy.type] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  console.log(trending);

  // Get performance data for selected token or first available
  const performance = strategy.performance?.[selectedToken] ||
    (Object.values(strategy.performance || {})[0] as StrategyPerformance) || {
      year: 0,
      sixMonths: 0,
      threeMonths: 0,
      month: 0,
      week: 0,
    };

  // State for strategy dialog
  const [startDialogOpen, setStartDialogOpen] = useState(false);

  const dcaMutation = useCreateDcaPlan();

  const { data: user } = authClient.useSession();

  // Handle starting a strategy
  const handleStartStrategy = async (data: {
    strategyId: string;
    tokenId: string;
    amount: number;
    frequency: string;
    slippage: number;
    recipientAddress?: string;
    riskLevel?: RiskLevel;
    chain: string;
  }) => {
    const amountPerDay = data.amount;

    console.log(data);

    await dcaMutation.mutateAsync({
      userId: user?.user.id, // Adding userId to plan data as well
      amount: amountPerDay,
      userWalletAddress: await getLeapWalletAddress(),
      recipientAddress:
        data.strategyId === "SDCA"
          ? data.recipientAddress
          : await getLeapWalletAddress(),
      frequency: data.frequency as FrequencyOption,
      chain: data.chain,
      riskLevel: data.riskLevel,
      strategyId: data.strategyId,
      tokenSymbol: data.tokenId,
      slippage: data.slippage, // Default to -1 for auto slippage
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center gap-2 w-full">
              <div
                className={`w-10 h-10 rounded-full ${colorScheme.bg} ${colorScheme.text} flex items-center justify-center`}
              >
                {IconMap[strategy.icon as keyof typeof IconMap] || (
                  <RefreshCw size={20} />
                )}
              </div>
              <CardTitle className="flex items-center justify-between gap-2 w-full">
                <span>{strategy.name}</span>
                {trending && (
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer" asChild>
                      <div className="text-xs text-crypto-green font-medium bg-green-100 px-2 py-1 rounded-full">
                        Trending <TrendingUp size={14} className="inline" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Investing in trending strategies can yield higher returns
                      and pawscore.
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardTitle>
            </div>
            <CardDescription className="mt-2">
              {strategy.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700 mb-2">
            Strategy Features
          </div>
          <ul className="space-y-2 text-sm">
            {strategy.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full ${colorScheme.bg} ${colorScheme.text} flex items-center justify-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-4" />

        <div>
          <div className="text-sm font-medium text-slate-700 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span>Historical Performance</span>
              <Info size={14} className="text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              // { label: "1 Year", data: performance.year || 0 },
              { label: "6 Months", data: performance.sixMonths || 0 },
              { label: "3 Months", data: performance.threeMonths || 0 },
              { label: "1 Month", data: performance.month || 0 },
              { label: "7 Days", data: performance.week || 0 },
            ].map((period, index) => (
              <div
                key={index}
                className="bg-slate-50 p-3 rounded-lg text-center"
              >
                <div className="text-crypto-green font-medium text-lg">{`+${period.data}%`}</div>
                <div className="text-xs text-slate-500">{period.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setStartDialogOpen(true)}
        >
          One Click Start
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewDetails(strategy.id)}
        >
          View Details
        </Button>
      </CardFooter>

      {/* Strategy Start Dialog */}
      <StartStrategyDialog
        supportedChains={strategy.supportedChains}
        loading={dcaMutation.isPending}
        strategy={strategy}
        open={startDialogOpen}
        onClose={() => setStartDialogOpen(false)}
        defaultToken={selectedToken}
        onStartStrategy={handleStartStrategy}
      />
    </Card>
  );
};

export default StrategyCard;

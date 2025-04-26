'use client';

import { Project } from "@/lib/api";
import { getToolIcon } from "@/components/thread/utils";
import React from "react";
import { Slider } from "@/components/ui/slider";
import { ApiMessageType } from '@/components/thread/types';
import { CircleDashed, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

// Import tool view components from the tool-views directory
import { CommandToolView } from "./tool-views/CommandToolView";
import { StrReplaceToolView } from "./tool-views/StrReplaceToolView";
import { GenericToolView } from "./tool-views/GenericToolView";
import { FileOperationToolView } from "./tool-views/FileOperationToolView";
import { BrowserToolView } from "./tool-views/BrowserToolView";
import { WebSearchToolView } from "./tool-views/WebSearchToolView";
import { WebCrawlToolView } from "./tool-views/WebCrawlToolView";
import { WebScrapeToolView } from "./tool-views/WebScrapeToolView";
import { DataProviderToolView } from "./tool-views/DataProviderToolView";
import { ExposePortToolView } from "./tool-views/ExposePortToolView";

// Simple input interface
export interface ToolCallInput {
  assistantCall: {
    content?: string;
    name?: string;
    timestamp?: string;
  };
  toolResult?: {
    content?: string;
    isSuccess?: boolean;
    timestamp?: string;
  };
  messages?: ApiMessageType[];
}

// Get the specialized tool view component based on the tool name
function getToolView(
  toolName: string | undefined, 
  assistantContent: string | undefined, 
  toolContent: string | undefined,
  assistantTimestamp: string | undefined,
  toolTimestamp: string | undefined,
  isSuccess: boolean = true,
  project?: Project,
  messages?: ApiMessageType[],
  agentStatus?: string,
  currentIndex?: number,
  totalCalls?: number,
  isStreaming?: boolean
) {
  if (!toolName) return null;
  
  const normalizedToolName = toolName.toLowerCase();
  
  switch (normalizedToolName) {
    case 'execute-command':
      return (
        <CommandToolView 
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
        />
      );
    case 'str-replace':
      return (
        <StrReplaceToolView
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
        />
      );
    case 'expose-port':
      return (
        <ExposePortToolView
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
          isStreaming={isStreaming}
        />
      );
    case 'create-file':
    case 'full-file-rewrite':
    case 'delete-file':
      return (
        <FileOperationToolView 
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
          name={normalizedToolName}
          project={project}
        />
      );
    case 'browser-navigate':
    case 'browser-click':
    case 'browser-extract':
    case 'browser-fill':
    case 'browser-wait':
      return (
        <BrowserToolView
          currentIndex={currentIndex}
          totalCalls={totalCalls}
          agentStatus={agentStatus}
          messages={messages}
          name={normalizedToolName}
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
          project={project}
        />
      );
    case 'web-search':
      return (
        <WebSearchToolView
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
        />
      );
    case 'crawl-webpage':
      return (
        <WebCrawlToolView
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
        />
      );
    case 'scrape-webpage':
      return (
        <WebScrapeToolView
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
        />
      );
    case 'execute-data-provider-call':
    case 'get-data-provider-endpoints':
      return (
        <DataProviderToolView
          name={normalizedToolName}
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
          isStreaming={isStreaming}
        />
      );
    default:
      // Check if it's a browser operation
      if (normalizedToolName.startsWith('browser-')) {
        return (
          <BrowserToolView
            currentIndex={currentIndex}
            totalCalls={totalCalls}
            agentStatus={agentStatus}
            messages={messages}
            name={toolName}
            assistantContent={assistantContent}
            toolContent={toolContent}
            assistantTimestamp={assistantTimestamp}
            toolTimestamp={toolTimestamp}
            isSuccess={isSuccess}
            project={project}
          />
        );
      }
      
      // Fallback to generic view
      return (
        <GenericToolView 
          name={toolName}
          assistantContent={assistantContent}
          toolContent={toolContent}
          assistantTimestamp={assistantTimestamp}
          toolTimestamp={toolTimestamp}
          isSuccess={isSuccess}
          isStreaming={isStreaming}
        />
      );
  }
}

interface ToolCallSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  toolCalls: ToolCallInput[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  messages?: ApiMessageType[];
  agentStatus: string;
  project?: Project;
  renderAssistantMessage?: (assistantContent?: string, toolContent?: string) => React.ReactNode;
  renderToolResult?: (toolContent?: string, isSuccess?: boolean) => React.ReactNode;
}

export function ToolCallSidePanel({
  isOpen,
  onClose,
  toolCalls,
  currentIndex,
  onNavigate,
  messages,
  agentStatus,
  project,
  renderAssistantMessage,
  renderToolResult
}: ToolCallSidePanelProps) {
  // Move hooks outside of conditional
  const [dots, setDots] = React.useState('');
  const currentToolCall = toolCalls[currentIndex];
  const totalCalls = toolCalls.length;
  const currentToolName = currentToolCall?.assistantCall?.name || 'Tool Call';
  const CurrentToolIcon = getToolIcon(currentToolName === 'Tool Call' ? 'unknown' : currentToolName);
  const isStreaming = currentToolCall?.toolResult?.content === "STREAMING";
  const isSuccess = currentToolCall?.toolResult?.isSuccess ?? true;
  const isMobile = useIsMobile();
  
  // Add keyboard shortcut for CMD+I to close panel
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Listen for sidebar toggle events
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleSidebarToggle = (event: CustomEvent) => {
      if (event.detail.expanded) {
        onClose();
      }
    };
    
    window.addEventListener('sidebar-left-toggled', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-left-toggled', handleSidebarToggle as EventListener);
  }, [isOpen, onClose]);
  
  React.useEffect(() => {
    if (!isStreaming) return;
    
    // Create a loading animation with dots
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Handle navigation with safety checks
  const navigateToPrevious = React.useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const navigateToNext = React.useCallback(() => {
    if (currentIndex < totalCalls - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, totalCalls, onNavigate]);

  if (!isOpen) return null;
  
  const renderContent = () => {
    if (!currentToolCall) {
      return (
        <div className="flex flex-col h-full">
          {/* Always show header with close button for empty state */}
          <div className="pt-4 pl-4 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Suna's Computer</h2>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Empty state message */}
          <div className="flex items-center justify-center flex-1 p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">No tool call details available.</p>
          </div>
        </div>
      );
    }
    
    const toolView = getToolView(
      currentToolCall.assistantCall.name,
      currentToolCall.assistantCall.content,
      currentToolCall.toolResult?.content,
      currentToolCall.assistantCall.timestamp,
      currentToolCall.toolResult?.timestamp,
      isStreaming ? true : (currentToolCall.toolResult?.isSuccess ?? true),
      project,
      messages,
      agentStatus,
      currentIndex,
      totalCalls,
      isStreaming
    );

    if (!toolView) {
      return (
        <div className="flex flex-col h-full">
          {/* Header with close button even when no tool view */}
          <div className="pt-4 pl-4 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Suna's Computer</h2>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Error state message */}
          <div className="flex items-center justify-center flex-1 p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">Unable to display tool details.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="pt-4 pl-4 pr-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Suna's Computer</h2>
            </div>
            
            {currentToolCall.toolResult?.content && !isStreaming && (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <CurrentToolIcon className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-300" />
                </div>
                <span className={cn(
                  "text-sm text-zinc-700 dark:text-zinc-300",
                  isMobile && "hidden sm:inline" // Hide on small mobile
                )}>
                  {currentToolName}
                </span>              
                <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  isSuccess 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  {isSuccess ? 'Success' : 'Failed'}
                </div>
                
                {/* Add close button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1.5">
                  <CircleDashed className="h-3 w-3 animate-spin" />
                  <span>Running</span>
                </div>
                
                {/* Add close button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Show close button when no status is available */}
            {!currentToolCall.toolResult?.content && !isStreaming && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {toolView}
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn(
      "fixed inset-y-0 right-0 border-l flex flex-col z-30 h-screen transition-all duration-200 ease-in-out",
      isMobile 
        ? "w-full" 
        : "w-[90%] sm:w-[450px] md:w-[500px] lg:w-[550px] xl:w-[650px]",
      !isOpen && "translate-x-full"
    )}>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {renderContent()}
      </div>
      
      {/* Navigation controls */}
      {totalCalls > 1 && (
        <div className={cn(
          "border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900",
          isMobile ? "p-3" : "p-4 space-y-2"
        )}>
          {!isMobile && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <CurrentToolIcon className="h-3 w-3 text-zinc-800 dark:text-zinc-300" />
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate" title={currentToolName}>
                  {currentToolName} {isStreaming && `(Running${dots})`}
                </span>
              </div>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                Step {currentIndex + 1} of {totalCalls}
              </span>
            </div>
          )}
          
          {isMobile ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToPrevious}
                disabled={currentIndex <= 0}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>
              
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentIndex + 1} / {totalCalls}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToNext}
                disabled={currentIndex >= totalCalls - 1}
                className="h-9 px-3"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateToPrevious}
                  disabled={currentIndex <= 0}
                  className="h-6 w-6 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateToNext}
                  disabled={currentIndex >= totalCalls - 1}
                  className="h-6 w-6 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Slider
                min={0}
                max={totalCalls - 1}
                step={1}
                value={[currentIndex]}
                onValueChange={([newValue]) => onNavigate(newValue)}
                className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-zinc-200 dark:[&>span:first-child]:bg-zinc-800 [&>span:first-child>span]:bg-zinc-500 dark:[&>span:first-child>span]:bg-zinc-400 [&>span:first-child>span]:h-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
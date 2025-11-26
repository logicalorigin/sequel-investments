import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, 
  FolderOpen, 
  ChevronDown, 
  Trash2, 
  Clock,
  FileText,
  Loader2,
  FileDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SavedScenario } from "@shared/schema";

interface ScenarioManagerProps {
  analyzerType: "dscr" | "fix_flip" | "construction";
  currentData: Record<string, any>;
  onLoadScenario: (data: Record<string, any>) => void;
}

export function ScenarioManager({
  analyzerType,
  currentData,
  onLoadScenario,
}: ScenarioManagerProps) {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  // Map fix_flip to fixflip to match schema enum
  const schemaType = analyzerType === 'fix_flip' ? 'fixflip' : analyzerType;
  
  const { data: scenarios = [], isLoading } = useQuery<SavedScenario[]>({
    queryKey: [`/api/scenarios?type=${schemaType}`],
  });

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/scenarios", {
        name,
        type: schemaType,
        data: currentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/scenarios?type=${schemaType}`] });
      setSaveDialogOpen(false);
      setScenarioName("");
      toast({
        title: "Scenario Saved",
        description: "Your analysis has been saved to your library.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save the scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/scenarios/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios", analyzerType] });
      toast({
        title: "Scenario Deleted",
        description: "The scenario has been removed from your library.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your scenario.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(scenarioName.trim());
  };

  const handleLoad = (scenario: SavedScenario) => {
    try {
      const scenarioData = typeof scenario.data === 'string' 
        ? JSON.parse(scenario.data as string) 
        : scenario.data;
      onLoadScenario(scenarioData as Record<string, any>);
      setLoadDialogOpen(false);
      toast({
        title: "Scenario Loaded",
        description: `"${scenario.name}" has been loaded into the analyzer.`,
      });
    } catch {
      toast({
        title: "Load Failed",
        description: "Could not parse the saved scenario data.",
        variant: "destructive",
      });
    }
  };

  const analyzerTypeLabel = {
    dscr: "DSCR",
    fix_flip: "Fix & Flip",
    construction: "Construction",
  }[analyzerType];

  // Filter scenarios by the mapped schema type
  const filteredScenarios = scenarios.filter(s => s.type === schemaType);

  const handleExportPDF = () => {
    window.print();
    toast({
      title: "PDF Export",
      description: "Use your browser's print dialog to save as PDF.",
    });
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-save-scenario">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scenario</DialogTitle>
            <DialogDescription>
              Save this {analyzerTypeLabel} analysis to your library for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                placeholder="e.g., 123 Main St Analysis"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                data-testid="input-scenario-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending || !scenarioName.trim()}
              data-testid="button-confirm-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-load-scenario">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
            {filteredScenarios.length > 0 && (
              <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {filteredScenarios.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Scenario</DialogTitle>
            <DialogDescription>
              Select a saved {analyzerTypeLabel} scenario to load.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading scenarios...</p>
            </div>
          ) : filteredScenarios.length > 0 ? (
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-2">
                {filteredScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer group"
                    onClick={() => handleLoad(scenario)}
                    data-testid={`scenario-item-${scenario.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(scenario.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(scenario.id);
                      }}
                      data-testid={`button-delete-scenario-${scenario.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center">
              <FolderOpen className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No saved scenarios yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save your first analysis to build your library
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        data-testid="button-export-pdf"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
}

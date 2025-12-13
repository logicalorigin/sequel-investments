import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statePaths } from "./USMap";

const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "DC", label: "Washington DC" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
];

interface StateSelectionMapProps {
  selectedStates: string[];
  onToggleState: (stateValue: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function StateButton({ 
  state, 
  isSelected, 
  onToggle 
}: { 
  state: { value: string; label: string }; 
  isSelected: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors text-left w-full ${
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-background hover:bg-muted border"
      }`}
      data-testid={`state-${state.value}`}
    >
      {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
      <span className="truncate">{state.value}</span>
    </button>
  );
}

export function StateSelectionMap({ 
  selectedStates, 
  onToggleState, 
  onSelectAll, 
  onClearAll 
}: StateSelectionMapProps) {
  const quarterLength = Math.ceil(US_STATES.length / 4);
  const col1States = US_STATES.slice(0, quarterLength);
  const col2States = US_STATES.slice(quarterLength, quarterLength * 2);
  const col3States = US_STATES.slice(quarterLength * 2, quarterLength * 3);
  const col4States = US_STATES.slice(quarterLength * 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
            data-testid="button-select-all-states"
          >
            Select All
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            data-testid="button-clear-states"
          >
            Clear All
          </Button>
        </div>
        {selectedStates.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedStates.length} state{selectedStates.length !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex gap-4">
          {/* Left Side - 2 Columns */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col gap-1 w-16">
              {col1States.map((state) => (
                <StateButton
                  key={state.value}
                  state={state}
                  isSelected={selectedStates.includes(state.value)}
                  onToggle={() => onToggleState(state.value)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1 w-16">
              {col2States.map((state) => (
                <StateButton
                  key={state.value}
                  state={state}
                  isSelected={selectedStates.includes(state.value)}
                  onToggle={() => onToggleState(state.value)}
                />
              ))}
            </div>
          </div>

          {/* Center - US Map */}
          <div className="flex-1 min-w-0 flex items-center justify-center">
            <svg 
              viewBox="150 40 820 520" 
              className="w-full h-full"
            >
              {Object.entries(statePaths).map(([stateCode, path]) => {
                const isSelected = selectedStates.includes(stateCode);
                return (
                  <path
                    key={stateCode}
                    d={path}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? "fill-primary stroke-primary-foreground" 
                        : "fill-muted-foreground/25 hover:fill-primary/30 stroke-background"
                    }`}
                    strokeWidth="1"
                    onClick={() => onToggleState(stateCode)}
                    data-testid={`map-state-${stateCode}`}
                  >
                    <title>{US_STATES.find(s => s.value === stateCode)?.label || stateCode}</title>
                  </path>
                );
              })}
            </svg>
          </div>

          {/* Right Side - 2 Columns */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col gap-1 w-16">
              {col3States.map((state) => (
                <StateButton
                  key={state.value}
                  state={state}
                  isSelected={selectedStates.includes(state.value)}
                  onToggle={() => onToggleState(state.value)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1 w-16">
              {col4States.map((state) => (
                <StateButton
                  key={state.value}
                  state={state}
                  isSelected={selectedStates.includes(state.value)}
                  onToggle={() => onToggleState(state.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ALL_STATES = US_STATES;

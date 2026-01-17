import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatesById, getDistrictsByStateId, getBlocksByDistrictId, getVillagesByBlockId } from "@/lib/api";
import { Loader2, Search } from "lucide-react";

type State = {
  id: string;
  code: string;
  name: string;
};

type District = {
  id: string;
  name: string;
};

type Block = {
  id: string;
  name: string;
};

type Village = {
  id: string;
  name: string;
};

export type CoverageValue = {
  stateId?: string;
  districtId?: string;
  blockId?: string;
  villageId?: string;
};

type CoverageSelectorProps = {
  value?: CoverageValue;
  onChange: (value: CoverageValue) => void;
  /** Show district selector (default: true) */
  showDistrict?: boolean;
  /** Show block selector (default: true) */
  showBlock?: boolean;
  /** Show village selector (default: true) */
  showVillage?: boolean;
  disabled?: boolean;
  className?: string;
  /** Labels for optional levels */
  optionalLabel?: string;
};

export function CoverageSelector({
  value,
  onChange,
  showDistrict = true,
  showBlock = true,
  showVillage = true,
  disabled = false,
  className = "",
  optionalLabel = "(Entire region)",
}: CoverageSelectorProps) {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Search state for large lists
  const [districtSearch, setDistrictSearch] = useState("");
  const [blockSearch, setBlockSearch] = useState("");
  const [villageSearch, setVillageSearch] = useState("");

  const MAX_VISIBLE_ITEMS = 50;

  // Load states on mount
  useEffect(() => {
    loadStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (value?.stateId && showDistrict) {
      loadDistricts(value.stateId);
    } else {
      setDistricts([]);
    }
  }, [value?.stateId, showDistrict]);

  // Load blocks when district changes
  useEffect(() => {
    if (value?.districtId && showBlock) {
      loadBlocks(value.districtId);
    } else {
      setBlocks([]);
    }
  }, [value?.districtId, showBlock]);

  // Load villages when block changes
  useEffect(() => {
    if (value?.blockId && showVillage) {
      loadVillages(value.blockId);
    } else {
      setVillages([]);
    }
  }, [value?.blockId, showVillage]);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const response = await getStatesById();
      if (response.success && response.data) {
        setStates(response.data);
      }
    } catch (err) {
      console.error("Failed to load states:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDistricts = async (stateId: string) => {
    try {
      setLoadingDistricts(true);
      const response = await getDistrictsByStateId(stateId);
      if (response.success && response.data) {
        setDistricts(response.data);
      }
    } catch (err) {
      console.error("Failed to load districts:", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadBlocks = async (districtId: string) => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksByDistrictId(districtId);
      if (response.success && response.data) {
        setBlocks(response.data);
      }
    } catch (err) {
      console.error("Failed to load blocks:", err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const loadVillages = async (blockId: string) => {
    try {
      setLoadingVillages(true);
      const response = await getVillagesByBlockId(blockId);
      if (response.success && response.data) {
        setVillages(response.data);
      }
    } catch (err) {
      console.error("Failed to load villages:", err);
    } finally {
      setLoadingVillages(false);
    }
  };

  // Clear search when parent changes
  useEffect(() => {
    setDistrictSearch("");
  }, [value?.stateId]);

  useEffect(() => {
    setBlockSearch("");
  }, [value?.districtId]);

  useEffect(() => {
    setVillageSearch("");
  }, [value?.blockId]);

  // Filtered lists based on search
  const filteredDistricts = districtSearch
    ? districts.filter((d) => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    : districts;

  const filteredBlocks = blockSearch
    ? blocks.filter((b) => b.name.toLowerCase().includes(blockSearch.toLowerCase()))
    : blocks;

  const filteredVillages = villageSearch
    ? villages.filter((v) => v.name.toLowerCase().includes(villageSearch.toLowerCase()))
    : villages;

  // Display lists with limits
  const displayDistricts = filteredDistricts.slice(0, MAX_VISIBLE_ITEMS);
  const displayBlocks = filteredBlocks.slice(0, MAX_VISIBLE_ITEMS);
  const displayVillages = filteredVillages.slice(0, MAX_VISIBLE_ITEMS);

  // Flags for showing "more items" message
  const hasMoreDistricts = !districtSearch && districts.length > MAX_VISIBLE_ITEMS;
  const hasMoreBlocks = !blockSearch && blocks.length > MAX_VISIBLE_ITEMS;
  const hasMoreVillages = !villageSearch && villages.length > MAX_VISIBLE_ITEMS;

  const handleStateChange = (stateId: string) => {
    onChange({
      stateId,
      districtId: undefined,
      blockId: undefined,
      villageId: undefined,
    });
  };

  const handleDistrictChange = (districtId: string) => {
    if (districtId === "__none__") {
      onChange({
        ...value,
        districtId: undefined,
        blockId: undefined,
        villageId: undefined,
      });
    } else {
      onChange({
        ...value,
        districtId,
        blockId: undefined,
        villageId: undefined,
      });
    }
  };

  const handleBlockChange = (blockId: string) => {
    if (blockId === "__none__") {
      onChange({
        ...value,
        blockId: undefined,
        villageId: undefined,
      });
    } else {
      onChange({
        ...value,
        blockId,
        villageId: undefined,
      });
    }
  };

  const handleVillageChange = (villageId: string) => {
    if (villageId === "__none__") {
      onChange({
        ...value,
        villageId: undefined,
      });
    } else {
      onChange({
        ...value,
        villageId,
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>State *</Label>
        <Select
          value={value?.stateId || ""}
          onValueChange={handleStateChange}
          disabled={disabled || loadingStates}
        >
          <SelectTrigger>
            {loadingStates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Select state" />
            )}
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDistrict && (
        <div className="space-y-2">
          <Label>District</Label>
          <Select
            value={value?.districtId || "__none__"}
            onValueChange={handleDistrictChange}
            disabled={disabled || loadingDistricts || !value?.stateId}
          >
            <SelectTrigger>
              {loadingDistricts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Select district (optional)" />
              )}
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="__none__">
                <span className="text-muted-foreground">{optionalLabel}</span>
              </SelectItem>
              {districts.length > 10 && (
                <div className="flex items-center border-b px-3 pb-2">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Search districts..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="h-8 border-0 focus-visible:ring-0 px-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {hasMoreDistricts && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {displayDistricts.length} of {districts.length}. Type to search.
                </div>
              )}
              {displayDistricts.length === 0 && districtSearch ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No districts found
                </div>
              ) : (
                displayDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))
              )}
              {districtSearch && filteredDistricts.length > MAX_VISIBLE_ITEMS && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {MAX_VISIBLE_ITEMS} of {filteredDistricts.length} matches.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {showBlock && value?.districtId && (
        <div className="space-y-2">
          <Label>Block / Taluka</Label>
          <Select
            value={value?.blockId || "__none__"}
            onValueChange={handleBlockChange}
            disabled={disabled || loadingBlocks || !value?.districtId}
          >
            <SelectTrigger>
              {loadingBlocks ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Select block (optional)" />
              )}
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="__none__">
                <span className="text-muted-foreground">{optionalLabel}</span>
              </SelectItem>
              {blocks.length > 10 && (
                <div className="flex items-center border-b px-3 pb-2">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Search blocks..."
                    value={blockSearch}
                    onChange={(e) => setBlockSearch(e.target.value)}
                    className="h-8 border-0 focus-visible:ring-0 px-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {hasMoreBlocks && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {displayBlocks.length} of {blocks.length}. Type to search.
                </div>
              )}
              {displayBlocks.length === 0 && blockSearch ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No blocks found
                </div>
              ) : (
                displayBlocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.name}
                  </SelectItem>
                ))
              )}
              {blockSearch && filteredBlocks.length > MAX_VISIBLE_ITEMS && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {MAX_VISIBLE_ITEMS} of {filteredBlocks.length} matches.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {showVillage && value?.blockId && (
        <div className="space-y-2">
          <Label>Village</Label>
          <Select
            value={value?.villageId || "__none__"}
            onValueChange={handleVillageChange}
            disabled={disabled || loadingVillages || !value?.blockId}
          >
            <SelectTrigger>
              {loadingVillages ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Select village (optional)" />
              )}
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="__none__">
                <span className="text-muted-foreground">{optionalLabel}</span>
              </SelectItem>
              {villages.length > 10 && (
                <div className="flex items-center border-b px-3 pb-2">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Search villages..."
                    value={villageSearch}
                    onChange={(e) => setVillageSearch(e.target.value)}
                    className="h-8 border-0 focus-visible:ring-0 px-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {hasMoreVillages && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {displayVillages.length} of {villages.length}. Type to search.
                </div>
              )}
              {displayVillages.length === 0 && villageSearch ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No villages found
                </div>
              ) : (
                displayVillages.map((village) => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.name}
                  </SelectItem>
                ))
              )}
              {villageSearch && filteredVillages.length > MAX_VISIBLE_ITEMS && (
                <div className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">
                  Showing {MAX_VISIBLE_ITEMS} of {filteredVillages.length} matches.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStates, getDistricts, getBlocks, getVillages, getCountries } from "@/lib/api";
import { Loader2 } from "lucide-react";

type Country = {
  id: string;
  code: string;
  name: string;
};

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

export type LocationValue = {
  countryCode?: string;
  stateCode?: string;
  districtId?: string;
  blockId?: string;
  villageId?: string;
};

type LocationSelectorProps = {
  value?: LocationValue;
  onChange: (value: LocationValue) => void;
  showCountry?: boolean;
  countryFilter?: string;
  disabled?: boolean;
  className?: string;
};

export function LocationSelector({
  value,
  onChange,
  showCountry = false,
  countryFilter,
  disabled = false,
  className = "",
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load countries on mount (if showCountry is true)
  useEffect(() => {
    if (showCountry) {
      loadCountries();
    }
  }, [showCountry]);

  // Load states when country changes or on mount
  useEffect(() => {
    const countryCode = value?.countryCode || countryFilter;
    if (countryCode || !showCountry) {
      loadStates(countryCode);
    }
  }, [value?.countryCode, countryFilter, showCountry]);

  // Load districts when state changes
  useEffect(() => {
    if (value?.stateCode) {
      loadDistricts(value.stateCode);
    } else {
      setDistricts([]);
    }
  }, [value?.stateCode]);

  // Load blocks when district changes
  useEffect(() => {
    if (value?.districtId) {
      loadBlocks(value.districtId);
    } else {
      setBlocks([]);
    }
  }, [value?.districtId]);

  // Load villages when block changes
  useEffect(() => {
    if (value?.blockId) {
      loadVillages(value.blockId);
    } else {
      setVillages([]);
    }
  }, [value?.blockId]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await getCountries({ activeOnly: true }) as { success: boolean; data?: Country[] };
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (err) {
      console.error("Failed to load countries:", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadStates = async (countryCode?: string) => {
    try {
      setLoadingStates(true);
      const response = await getStates(countryCode) as { success: boolean; data?: State[] };
      if (response.success && response.data) {
        setStates(response.data);
      }
    } catch (err) {
      console.error("Failed to load states:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDistricts = async (stateCode: string) => {
    try {
      setLoadingDistricts(true);
      const response = await getDistricts(stateCode) as { success: boolean; data?: District[] };
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
      const response = await getBlocks(districtId) as { success: boolean; data?: Block[] };
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
      const response = await getVillages(blockId) as { success: boolean; data?: Village[] };
      if (response.success && response.data) {
        setVillages(response.data);
      }
    } catch (err) {
      console.error("Failed to load villages:", err);
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    onChange({
      countryCode,
      stateCode: undefined,
      districtId: undefined,
      blockId: undefined,
      villageId: undefined,
    });
  };

  const handleStateChange = (stateCode: string) => {
    onChange({
      ...value,
      stateCode,
      districtId: undefined,
      blockId: undefined,
      villageId: undefined,
    });
  };

  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      districtId,
      blockId: undefined,
      villageId: undefined,
    });
  };

  const handleBlockChange = (blockId: string) => {
    onChange({
      ...value,
      blockId,
      villageId: undefined,
    });
  };

  const handleVillageChange = (villageId: string) => {
    onChange({
      ...value,
      villageId,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showCountry && (
        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={value?.countryCode || ""}
            onValueChange={handleCountryChange}
            disabled={disabled || loadingCountries}
          >
            <SelectTrigger>
              {loadingCountries ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Select country" />
              )}
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>State</Label>
        <Select
          value={value?.stateCode || ""}
          onValueChange={handleStateChange}
          disabled={disabled || loadingStates || (showCountry && !value?.countryCode)}
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
              <SelectItem key={state.id} value={state.code}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>District</Label>
        <Select
          value={value?.districtId || ""}
          onValueChange={handleDistrictChange}
          disabled={disabled || loadingDistricts || !value?.stateCode}
        >
          <SelectTrigger>
            {loadingDistricts ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Select district" />
            )}
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Block / Taluka</Label>
        <Select
          value={value?.blockId || ""}
          onValueChange={handleBlockChange}
          disabled={disabled || loadingBlocks || !value?.districtId}
        >
          <SelectTrigger>
            {loadingBlocks ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Select block" />
            )}
          </SelectTrigger>
          <SelectContent>
            {blocks.map((block) => (
              <SelectItem key={block.id} value={block.id}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Village</Label>
        <Select
          value={value?.villageId || ""}
          onValueChange={handleVillageChange}
          disabled={disabled || loadingVillages || !value?.blockId}
        >
          <SelectTrigger>
            {loadingVillages ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="Select village" />
            )}
          </SelectTrigger>
          <SelectContent>
            {villages.map((village) => (
              <SelectItem key={village.id} value={village.id}>
                {village.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

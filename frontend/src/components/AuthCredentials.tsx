"use client";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import CredentialComponent from "./credential";
import { getAllCredential } from "@/service/node";
import { useAuth, useUser } from "@clerk/nextjs";

export function CustomCombobox({
  onChange,
  value,
  placeholder = "Select credential type...",
  label = "Credential Type",
  onAddCredential,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [credentialTypes, setCredentialTypes] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    async function credentialOptions() {
      const token = await getToken();
      if (!token) return;
      const data = await getAllCredential(token, user.id);
      // console.log("tokens", { data });
      setCredentialTypes(data);
    }
    credentialOptions();
  }, []);

  // Find the selected credential to display its label
  const selectedCredential = credentialTypes.find(
    (credential) => credential.id === value
  );

  // Filter credentials based on search input
  const filteredCredentials = credentialTypes.filter(
    (credential) =>
      credential.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      credential.description
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      credential.type.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (currentValue) => {
    // console.log("select current value", currentValue);
    const selectedCredential = credentialTypes.find(
      (credential) => credential.id === currentValue
    );

    if (selectedCredential) {
      if (onChange) {
        onChange(selectedCredential.id);
      }
    }
    setOpen(false);
    setSearchValue(""); // Clear search when selecting
  };

  const handleAddCredential = () => {
    // console.log("Opening add credential modal");
    setOpen(false);
    setSearchValue(""); // Clear search when adding
    if (onAddCredential) {
      onAddCredential();
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue(""); // Clear search when closing
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={cn(
                "truncate",
                !selectedCredential && "text-muted-foreground"
              )}
            >
              {selectedCredential ? selectedCredential.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search credentials..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              {filteredCredentials.length === 0 && searchValue ? (
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">
                    <p>No credential type found.</p>
                    <p className="text-muted-foreground">
                      You can add a new credential below.
                    </p>
                  </div>
                </CommandEmpty>
              ) : null}

              <CommandGroup>
                {filteredCredentials.map((credential) => (
                  <CommandItem
                    key={credential.id}
                    value={credential.id}
                    onSelect={handleSelect}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === credential.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{credential.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {credential.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}

                {/* Add Credential Item */}
                <CommandItem
                  onSelect={handleAddCredential}
                  className="flex items-center gap-2 border-t border-border mt-2 pt-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">Add New Credential</span>
                    <span className="text-xs text-muted-foreground">
                      Configure a new credential type
                    </span>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Demo component showing usage
export default function AuthCredentials({ authToken, setAuthToken, onChange }) {
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const handleAuthTokenChange = (newValue: string) => {
    setAuthToken(newValue);
  };

  const handleAddCredential = () => {
    setShowCredentialModal(true);
  };

  return (
    <div className="">
      <CustomCombobox
        onChange={handleAuthTokenChange}
        value={authToken}
        placeholder="Select credential type..."
        label="Authentication Token"
        onAddCredential={handleAddCredential}
      />

      {showCredentialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CredentialComponent
            isOpen={showCredentialModal}
            setIsOpen={setShowCredentialModal}
          />
        </div>
      )}
    </div>
  );
}

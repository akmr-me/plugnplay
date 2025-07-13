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
  //   CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import CredentialComponent from "./credential";
import { getAllCredential } from "@/service/node";
import { useAuth, useUser } from "@clerk/nextjs";

// Utility function to merge classes
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// Custom Command components since we can't import them
// const Command = ({ children, ...props }) => (
//   <div
//     {...props}
//     className={cn(
//       "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
//       props.className
//     )}
//   >
//     {children}
//   </div>
// );

const CommandInput = ({
  className,
  onValueChange,
  value,
  placeholder,
  onFocus,
  ...props
}) => (
  <input
    {...props}
    value={value}
    onChange={(e) => {
      console.log(e.target.value);
      onValueChange?.(e.target.value);
    }}
    onFocus={onFocus}
    placeholder={placeholder}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  />
);

// const CommandList = ({ children, ...props }) => (
//   <div
//     {...props}
//     className={cn(
//       "max-h-[300px] overflow-y-auto overflow-x-hidden",
//       props.className
//     )}
//   >
//     {children}
//   </div>
// );

// const CommandEmpty = ({ children, ...props }) => (
//   <div {...props} className={cn("py-6 text-center text-sm", props.className)}>
//     {children}
//   </div>
// );

// const CommandGroup = ({ children, ...props }) => (
//   <div
//     {...props}
//     className={cn("overflow-hidden p-1 text-foreground", props.className)}
//   >
//     {children}
//   </div>
// );

// const CommandItem = ({ children, onSelect, value, className, ...props }) => (
//   <div
//     {...props}
//     className={cn(
//       "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       className
//     )}
//     onClick={() => onSelect?.(value)}
//   >
//     {children}
//   </div>
// );

// Custom UI components
// const Button = ({
//   children,
//   variant = "default",
//   size = "default",
//   className,
//   ...props
// }) => {
//   const baseStyles =
//     "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

//   const variants = {
//     default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
//     ghost: "hover:bg-accent hover:text-accent-foreground",
//     outline:
//       "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
//   };

//   const sizes = {
//     default: "h-9 px-4 py-2",
//     sm: "h-8 rounded-md px-3 text-xs",
//   };

//   return (
//     <button
//       {...props}
//       className={cn(baseStyles, variants[variant], sizes[size], className)}
//     >
//       {children}
//     </button>
//   );
// };

// const Label = ({ children, className, ...props }) => (
//   <label
//     {...props}
//     className={cn(
//       "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
//       className
//     )}
//   >
//     {children}
//   </label>
// );

// const Popover = ({ children, open, onOpenChange }) => {
//   return <div className="relative">{children}</div>;
// };

// const PopoverTrigger = ({ children, asChild }) => {
//   return children;
// };

// const PopoverContent = ({
//   children,
//   className,
//   align = "center",
//   ...props
// }) => {
//   return (
//     <div
//       {...props}
//       className={cn(
//         "absolute top-full mt-1 z-50 w-72 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
//         align === "start" && "left-0",
//         align === "end" && "right-0",
//         align === "center" && "left-1/2 -translate-x-1/2",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

export function CustomCombobox({
  onChange,
  value,
  placeholder = "Search or type credential type...",
  label = "Credential Type",
  onAddCredential,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [credentialTypes, setCredentialTypes] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  // const credentialTypes = [
  //   { value: "bearer-token", label: "Bearer Token" },
  //   { value: "api-key", label: "API Key" },
  //   { value: "basic-auth", label: "Basic Auth" },
  //   { value: "google-oauth", label: "Google OAuth" },
  // ];

  useEffect(() => {
    async function credentialOptions() {
      const token = await getToken();
      if (!token) return;
      const data = await getAllCredential(token, user.id);
      console.log("tokens", { data });
      setCredentialTypes(data);
    }
    credentialOptions();
  }, []);

  // Filter credentials based on input
  const filteredCredentials = credentialTypes.filter(
    (credential) =>
      credential.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      credential.description.toLowerCase().includes(inputValue.toLowerCase()) ||
      credential.type.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
    // Call parent onChange immediately for real-time updates
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSelect = (currentValue) => {
    const selectedCredential = credentialTypes.find(
      (credential) => credential.id === currentValue
    );

    if (selectedCredential) {
      setInputValue(selectedCredential.name);
      if (onChange) {
        onChange(selectedCredential.name);
      }
    }
    console.log("false from handleSelect");
    setOpen(false);
  };

  const handleAddCredential = () => {
    console.log("true from handleAddCredential");
    setOpen(false);
    if (onAddCredential) {
      onAddCredential();
    }
  };
  console.log({ open });

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <CommandInput
              placeholder={placeholder}
              value={inputValue}
              onValueChange={handleInputChange}
              className="h-10 border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
              onClick={() => setOpen(true)}
              onFocus={() => setOpen((prev) => true)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setOpen(open)}
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        {open && (
          <PopoverContent className="w-72 p-0" align="center">
            <Command>
              <CommandList>
                {filteredCredentials.length === 0 ? (
                  <CommandEmpty>
                    <div className="py-6 text-center text-sm">
                      <p>No credential type found.</p>
                      <p className="text-muted-foreground">
                        You can type a custom value or add a new credential.
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
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === credential.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{credential.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {credential.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}

                  {/* Add Credential Item */}
                  <CommandItem
                    onSelect={handleAddCredential}
                    className="flex items-center gap-2 border-t border-border mt-2 pt-2"
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
        )}
      </Popover>
    </div>
  );
}

// Demo component showing usage
export default function ComboboxDemo() {
  const [authToken, setAuthToken] = useState("");
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const handleAuthTokenChange = (newValue) => {
    setAuthToken(newValue);
    console.log("Auth token changed to:", newValue);
  };

  const handleAddCredential = () => {
    setShowCredentialModal(true);
    console.log("Opening credential modal...");
  };

  return (
    <div className="">
      <CustomCombobox
        onChange={handleAuthTokenChange}
        value={authToken}
        placeholder="Search or type credential type..."
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

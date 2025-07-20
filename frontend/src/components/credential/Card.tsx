"use client";
import { CREDENTIAL_TYPES } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { deleteCredential } from "@/service/node";
import { toast } from "sonner";
import { useState } from "react";

interface Credential {
  id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
}

interface CredentialCardProps {
  credential: Credential;
  fetchCredentials: () => Promise<void>;
}

const CredentialCard = ({
  credential,
  fetchCredentials,
}: CredentialCardProps) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const IconComponent = CREDENTIAL_TYPES[credential.type]?.icon;

  const handleDelete = async () => {
    const token = await getToken();
    if (!token || !user?.id) return;
    try {
      setIsDeleting(true);
      await deleteCredential(token, user.id, credential.id);
      await fetchCredentials();
      toast.success("Credential deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete credential.", {
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
      <CardContent className="px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {credential.name}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {CREDENTIAL_TYPES[credential.type]?.label}
                </span>
              </div>
              {credential.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {credential.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4 flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-medium">
                Created
              </div>
              <div
                className="text-sm text-foreground font-medium"
                title={credential.created_at}
              >
                {new Date(credential.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* <button
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Edit credential"
              >
                <Edit2 className="w-4 h-4" />
              </button> */}
              <button
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                title="Delete credential"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CredentialCard;

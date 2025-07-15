"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GoogleOAuth() {
  let clientId;
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Configure your Gmail OAuth credentials to enable email sending
      </div>

      {/* Client ID */}
      <div className="space-y-2">
        <Label htmlFor="client-id" className="text-sm font-medium">
          Client ID
        </Label>
        <Input
          id="client-id"
          placeholder="Your Google OAuth Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Client Secret */}
      <div className="space-y-2">
        <Label htmlFor="client-secret" className="text-sm font-medium">
          Client Secret
        </Label>
        <div className="relative">
          <Input
            id="client-secret"
            type={showClientSecret ? "text" : "password"}
            placeholder="Your Google OAuth Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="w-full pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowClientSecret(!showClientSecret)}
          >
            {showClientSecret ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Refresh Token */}
      <div className="space-y-2">
        <Label htmlFor="refresh-token" className="text-sm font-medium">
          Refresh Token
        </Label>
        <div className="relative">
          <Input
            id="refresh-token"
            type={showRefreshToken ? "text" : "password"}
            placeholder="Your Google OAuth Refresh Token"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            className="w-full pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowRefreshToken(!showRefreshToken)}
          >
            {showRefreshToken ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Access Token (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="access-token" className="text-sm font-medium">
          Access Token{" "}
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </Label>
        <div className="relative">
          <Input
            id="access-token"
            type={showAccessToken ? "text" : "password"}
            placeholder="Your Google OAuth Access Token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowAccessToken(!showAccessToken)}
          >
            {showAccessToken ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Credentials Status */}
      <div
        className={`rounded-lg p-3 ${
          isCredentialsValid() ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-4 w-4" />
          <span className="text-sm font-medium">Credentials Status</span>
        </div>
        <div className="text-sm">
          {isCredentialsValid()
            ? "✓ Credentials are configured"
            : "⚠ Missing required credentials"}
        </div>
      </div>
    </div>
  );
}

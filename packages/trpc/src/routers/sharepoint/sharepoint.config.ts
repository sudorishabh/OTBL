export interface SharePointConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteUrl: string;
  driveId?: string;
}

export function getSharePointConfig(
  appEnv: Record<string, any>
): SharePointConfig {
  const tenantId = appEnv.SHAREPOINT_TENANT_ID;
  const clientId = appEnv.SHAREPOINT_CLIENT_ID;
  const clientSecret = appEnv.SHAREPOINT_CLIENT_SECRET;
  const siteUrl = appEnv.SHAREPOINT_SITE_URL;
  const driveId = appEnv.SHAREPOINT_DRIVE_ID;

  if (!tenantId) {
    throw new Error("SHAREPOINT_TENANT_ID environment variable is not set");
  }
  if (!clientId) {
    throw new Error("SHAREPOINT_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("SHAREPOINT_CLIENT_SECRET environment variable is not set");
  }
  if (!siteUrl) {
    throw new Error("SHAREPOINT_SITE_URL environment variable is not set");
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    siteUrl,
    driveId,
  };
}

export function isSharePointConfigured(appEnv: Record<string, any>): boolean {
  return !!(
    appEnv.SHAREPOINT_TENANT_ID &&
    appEnv.SHAREPOINT_CLIENT_ID &&
    appEnv.SHAREPOINT_CLIENT_SECRET &&
    appEnv.SHAREPOINT_SITE_URL
  );
}

export const GRAPH_API_BASE_URL = "https://graph.microsoft.com/v1.0";
export const TOKEN_ENDPOINT_TEMPLATE =
  "https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";

export function getTokenEndpoint(tenantId: string): string {
  return TOKEN_ENDPOINT_TEMPLATE.replace("{tenantId}", tenantId);
}

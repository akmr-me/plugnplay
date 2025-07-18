import httpx
import json

from app.services.prepare_auth_header import prepare_auth_header


async def send_custom_http_request(
    http_data: dict,
):
    method = http_data.get("httpMethod", "GET").upper()
    url = http_data["url"]

    # Body
    body = http_data.get("bodyContent") if http_data.get("includeBody") else None

    # Headers
    headers = {
        h["key"]: h["value"] for h in http_data.get("headers", []) if h.get("enabled")
    }

    # Auth (token/header) - delegate to your function
    auth_type = http_data.get("authType")
    credential_id = http_data.get("credentialId")
    if auth_type and credential_id:
        auth_headers = await prepare_auth_header(credential_id, auth_type)
        print("Auth Headers:", auth_headers)
        headers.update(auth_headers)

    # Query Params
    params = (
        {
            qp["key"]: qp["value"]
            for qp in http_data.get("queryParams", [])
            if qp.get("enabled") and qp["key"]
        }
        if http_data.get("includeQueryParams")
        else None
    )

    # Automatically convert body to JSON string if needed
    content = json.dumps(body) if body else None

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=method, url=url, headers=headers, params=params, content=content
        )

        print("HTTP Response:", response.status_code, response.text)

        try:
            # Try to parse and return JSON if available
            return response.json()
        except httpx.HTTPError:
            # If not JSON (e.g., plain text or HTML), return structured fallback
            return {
                "status_code": response.status_code,
                "text": response.text,
            }

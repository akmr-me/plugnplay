from app.core.db.context import db_context
from ..crud.crud_credentials import crud_credentials
from ..schemas.credential import CredentialRead

import base64


async def prepare_auth_header(credential_id: str, auth_type: str) -> dict:
    """
    Prepares the authorization header for API requests using the provided credential ID and token.

    Args:
        credential_id (str): The ID of the credential to be used.
        token (str): The token associated with the credential.

    Returns:
        dict: A dictionary containing the authorization header.
    """
    if credential_id:
        db = db_context.get()
        credential = await crud_credentials.get(
            db=db, id=credential_id, schema_to_select=CredentialRead
        )
    print(credential)

    match auth_type:
        case "custom":
            print("custom auth type")
            auth_header = {
                "Authorization": f"{credential['custom_token']}",
            }
        case "bearer":
            print("beared weekend!")
            auth_header = {
                "Authorization": f"Bearer {credential['bearer_token']}",
            }
        case "api-key":
            print("api-keyapi-keyapi-key")
            auth_header = {"x-api-key": credential["api_key_value"]}
        case "basic":
            print("basic auth type")

            credentials = f"{credential['username']}:{credential['password']}"
            basic_auth = base64.b64encode(credentials.encode()).decode()
            print("basic auth", basic_auth)
            auth_header = {
                "Authorization": f"Basic {basic_auth}",
            }
        case _:
            print("Just another day.")

    return auth_header

from fastcrud import FastCRUD

from ..models.credential import Credential
from ..schemas.credential import (
    CredentialCreateInternal,
    CredentialDelete,
    CredentialRead,
    CredentialUpdate,
    CredentialCreate,
)

CRUDCredential = FastCRUD[
    Credential,
    CredentialCreateInternal,
    CredentialUpdate,
    CredentialCreate,
    CredentialDelete,
    CredentialRead,
]

crud_credentials = CRUDCredential(Credential)

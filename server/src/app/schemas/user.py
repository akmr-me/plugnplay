from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class UserBase(BaseModel):
    full_name: Annotated[
        str, Field(min_length=2, max_length=30, examples=["User Userson"])
    ]
    # username: Annotated[str, Field(min_length=2, max_length=20, pattern=r"^[a-z0-9]+$", examples=["userson"])]
    email: Annotated[EmailStr, Field(examples=["user.userson@example.com"])]
    # user_id from clerk
    user_id: Annotated[
        str,
        Field(
            min_length=10, max_length=50, examples=["user_2z3mZ1xkTpZ2pzxgjsDs1WL7TIP"]
        ),
    ]


class User(TimestampSchema, UserBase, UUIDSchema, PersistentDeletion):
    image_url: Annotated[
        str,
        Field(
            default="https://www.profileimageurl.com",
            examples=["https://www.profileimageurl.com"],
        ),
    ]
    is_superuser: bool = False
    tier_id: int | None = None
    last_sign_in_at: datetime | None = Field(default=None)


class UserRead(BaseModel):
    id: int

    full_name: Annotated[
        str,
        Field(
            min_length=2, max_length=20, pattern=r"^[a-z0-9]+$", examples=["userson"]
        ),
    ]
    email: Annotated[EmailStr, Field(examples=["user.userson@example.com"])]
    user_id: Annotated[
        str,
        Field(
            min_length=10, max_length=50, examples=["user_2z3mZ1xkTpZ2pzxgjsDs1WL7TIP"]
        ),
    ]
    image_url: str
    tier_id: int | None
    last_sign_in_at: datetime | None = Field(default=None)
    created_at: datetime


class UserCreate(UserBase):
    model_config = ConfigDict(extra="forbid")

    full_name: Annotated[
        str,
        Field(
            min_length=2, max_length=20, pattern=r"^[a-z0-9]+$", examples=["userson"]
        ),
    ]
    email: Annotated[EmailStr, Field(examples=["user.userson@example.com"])]
    user_id: Annotated[
        str,
        Field(
            min_length=10, max_length=50, examples=["user_2z3mZ1xkTpZ2pzxgjsDs1WL7TIP"]
        ),
    ]
    image_url: str
    last_sign_in_at: datetime | None = Field(default=None)
    created_at: datetime


class UserCreateInternal(UserBase):
    hashed_password: str


class UserUpdate(BaseModel):
    pass
    # model_config = ConfigDict(extra="forbid")

    # name: Annotated[
    #     str | None,
    #     Field(min_length=2, max_length=30, examples=["User Userberg"], default=None),
    # ]
    # username: Annotated[
    #     str | None,
    #     Field(
    #         min_length=2,
    #         max_length=20,
    #         pattern=r"^[a-z0-9]+$",
    #         examples=["userberg"],
    #         default=None,
    #     ),
    # ]
    # email: Annotated[
    #     EmailStr | None, Field(examples=["user.userberg@example.com"], default=None)
    # ]
    # profile_image_url: Annotated[
    #     str | None,
    #     Field(
    #         pattern=r"^(https?|ftp)://[^\s/$.?#].[^\s]*$",
    #         examples=["https://www.profileimageurl.com"],
    #         default=None,
    #     ),
    # ]


class UserUpdateInternal(UserUpdate):
    updated_at: datetime


class UserTierUpdate(BaseModel):
    tier_id: int


class UserDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class UserRestoreDeleted(BaseModel):
    is_deleted: bool

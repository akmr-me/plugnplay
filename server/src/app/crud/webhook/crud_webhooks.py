from fastcrud import FastCRUD

from ...models.webhook.webhook import Webhook
from ...schemas.webhook.webhook import (
    WebhookCreate,
    WebhookDelete,
    WebhookRead,
    WebhookUpdate,
    WebhookCreateInternal,
)

CRUDWebhook = FastCRUD[
    Webhook,
    WebhookCreateInternal,
    WebhookUpdate,
    WebhookCreate,
    WebhookDelete,
    WebhookRead,
]

crud_webhooks = CRUDWebhook(Webhook)

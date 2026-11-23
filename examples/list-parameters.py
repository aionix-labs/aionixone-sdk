import os

from aionix_client import AionixOne

client = AionixOne(
    gateway_url=os.environ["AIONIX_GATEWAY_URL"],
    tenant=os.environ["AIONIX_TENANT"],
    api_key=os.environ["AIONIX_API_KEY"],
)
print(client.paramstore.param.list(limit=10))

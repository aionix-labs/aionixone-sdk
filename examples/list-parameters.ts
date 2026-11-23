import { AionixOne } from '@aionix/client';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name}`);
  return value;
}

const client = new AionixOne({
  gatewayUrl: required('AIONIX_GATEWAY_URL'),
  credentials: {
    kind: 'apiKey',
    tenant: required('AIONIX_TENANT'),
    apiKey: required('AIONIX_API_KEY'),
  },
});
console.log(await client.paramstore.param.list({ limit: 10 }));

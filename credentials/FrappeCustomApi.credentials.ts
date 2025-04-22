import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class FrappeCustomApi implements ICredentialType {
  name = 'FrappeCustomApi';
  displayName = 'Frappe Custom Api';
  // Replace with your own docs links when building your own nodes
  documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://hr.mbwcloud.com:8003',
      description: 'URL của Frappe instance',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      description: 'API Key từ Frappe',
    },
    {
      displayName: 'API Secret',
      name: 'apiSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API Secret từ Frappe',
    },
  ];

  authenticate = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Basic " + $credentials.apiKey + ":" + $credentials.apiSecret | encodeBase64()}}',
      },
    },
  } as IAuthenticateGeneric;
}

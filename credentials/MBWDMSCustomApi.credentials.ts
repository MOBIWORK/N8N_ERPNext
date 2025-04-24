import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class MBWDMSCustomApi implements ICredentialType {
  name = 'MBWDMSCustomApi';
  displayName = 'MBW DMS Custom API';
  documentationUrl = '';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://trackauto.mobiwork.vn:3036',
      description: 'URL của hệ thống MBW DMS',
    },
    {
      displayName: 'Org ID',
      name: 'orgid',
      type: 'string',
      default: '',
      description: 'Mã tổ chức DMS',
    },
    {
      displayName: 'DMS Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Access Token để truy cập DMS',
    },
  ];
}

import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

export class FrappeCustom implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MBWD ERPNext',
    name: 'frappeCustom',
    icon: 'file:erpnext.svg',
    group: ['transform'],
    version: 1,
    description: 'Tích hợp với Frappe/ERPNext API',
    defaults: {
      name: 'Frappe Custom',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'FrappeCustomApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Brand',
            value: 'Brand',
            description: 'Lấy danh sách các Brand',
          },
        ],
        default: 'Brand',
        description: 'DocType để thao tác',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Lấy danh sách các Brand',
            action: 'Lấy danh sách các Brand',
          },
        ],
        default: 'get',
        description: 'Hành động thực hiện',
      },

      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        default: 'brand_name, is_sync',
        description: 'Các trường cần lấy từ Brand',
      },
    ],
  };

  async execute(this: any): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    // Lấy credentials
    const credentials = await this.getCredentials('FrappeCustomApi');
    
    const baseUrl = credentials?.baseUrl;
    const apiKey = credentials?.apiKey;
    const apiSecret = credentials?.apiSecret;

    if (!baseUrl || !apiKey || !apiSecret) {
      throw new Error('Base URL, API Key, hoặc API Secret không hợp lệ.');
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        if (resource === 'Brand' && operation === 'get') {
          // Gọi API với Basic Authentication
          responseData = await this.helpers.httpRequest({
            url: `${baseUrl}/api/resource/Warehouse`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader,
            },
          });
        }

        returnData.push({
          json: responseData?.data || responseData,
        });
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw new Error(`Lỗi: ${error.message}`);
      }
    }

    return [returnData];
  }
}

import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  IExecuteFunctions,
} from 'n8n-workflow';

import axios, { AxiosRequestConfig } from 'axios';

export class MBWDMSCustom implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MBW DMS',
    name: 'mbwdmsCustom',
    icon: 'file:mbw.svg',
    group: ['transform'],
    version: 1,
    description: 'Tích hợp với hệ thống DMS qua API',
    defaults: {
      name: 'MBW DMS',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'MBWDMSCustomApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get List Documents',
            value: 'get',
            description: 'Lấy danh sách bản ghi từ DMS',
          },
        ],
        default: 'get',
        description: 'Chọn hành động cần thực hiện',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('MBWDMSCustomApi');
    const baseUrl = credentials.baseUrl as string;
    const orgid = credentials.orgid as string;
    const accessToken = credentials.accessToken as string;

    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      if (operation === 'get') {
        const config: AxiosRequestConfig = {
          method: 'GET',
          url: `${baseUrl}/dms/api/documents`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'orgid': orgid,
          },
        };

        try {
          const response = await axios(config);
          returnData.push({ json: response.data });
        } catch (error) {
          throw new Error(`Lỗi khi gọi API: ${(error as Error).message}`);
        }
      }
    }

    return [returnData];
  }
}

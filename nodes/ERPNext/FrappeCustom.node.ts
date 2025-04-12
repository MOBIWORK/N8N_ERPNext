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
              name: 'ToDo',
              value: 'ToDo',
            },
          ],
          default: 'ToDo',
          description: 'DocType để thao tác',
        },
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          noDataExpression: true,
          options: [
            {
              name: 'Create',
              value: 'create',
              description: 'Tạo tài liệu mới',
              action: 'Create a ToDo',
            },
            {
              name: 'Get',
              value: 'get',
              description: 'Lấy tài liệu',
              action: 'Get a ToDo',
            },
          ],
          default: 'create',
          description: 'Hành động thực hiện',
        },
        {
          displayName: 'Description',
          name: 'description',
          type: 'string',
          default: '',
          description: 'Mô tả cho ToDo',
          displayOptions: {
            show: {
              operation: ['create'],
              resource: ['ToDo'],
            },
          },
        },
        {
          displayName: 'Document Name',
          name: 'docName',
          type: 'string',
          default: '',
          description: 'Tên tài liệu để lấy',
          displayOptions: {
            show: {
              operation: ['get'],
              resource: ['ToDo'],
            },
          },
        },
      ],
    };
  
    async execute(this: any): Promise<INodeExecutionData[][]> {
      const items = this.getInputData();
      const returnData: INodeExecutionData[] = [];
      const resource = this.getNodeParameter('resource', 0) as string;
      const operation = this.getNodeParameter('operation', 0) as string;
  
      for (let i = 0; i < items.length; i++) {
        try {
          let responseData;
          if (resource === 'ToDo') {
            if (operation === 'create') {
              const description = this.getNodeParameter('description', i) as string;
              responseData = await this.helpers.httpRequestWithAuthentication('FrappeCustomApi', {
                url: `/api/resource/ToDo`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: { description },
              });
            } else if (operation === 'get') {
              const docName = this.getNodeParameter('docName', i) as string;
              responseData = await this.helpers.httpRequestWithAuthentication('FrappeCustomApi', {
                url: `/api/resource/ToDo/${docName}`,
                method: 'GET',
              });
            }
          }
          returnData.push({
            json: responseData.data || responseData,
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
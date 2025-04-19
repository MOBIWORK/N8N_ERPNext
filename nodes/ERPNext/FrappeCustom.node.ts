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
      name: 'MBWD ERPNext',
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
        displayName: 'DocType',
        name: 'doctype',
        type: 'string',
        default: '',
        description: 'Nhập tên DocType để thao tác (VD: Item, Customer...)',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get List Documents',
            value: 'get',
            description: 'Lấy danh sách bản ghi',
          },
        ],
        default: 'get',
        description: 'Hành động thực hiện',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        default: 'name',
        description: 'Các trường cần lấy, phân tách bằng dấu phẩy (VD: name,is_active)',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 20,
        description: 'Giới hạn số lượng bản ghi trả về',
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Thêm filter',
        default: {},
        options: [
          {
            name: 'filter',
            displayName: 'Filter',
            values: [
              {
                displayName: 'Field',
                name: 'field',
                type: 'string',
                default: '',
                required: true,
              },
              {
                displayName: 'Operator',
                name: 'operator',
                type: 'options',
                options: [
                  { name: 'IS (=)', value: 'eq' },
                  { name: 'Greater Than (>)', value: 'gt' },
                  { name: 'Less Than (<)', value: 'lt' },
                  { name: 'Greater or Equal (>=)', value: 'gte' },
                  { name: 'Less or Equal (<=)', value: 'lte' },
                  { name: 'Not Equal (!=)', value: 'neq' },
                  { name: 'Like', value: 'like' },
                  { name: 'In', value: 'in' },
                  { name: 'Not In', value: 'notin' },
                ],
                default: 'eq',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                required: true,
              },
            ],
          },
        ],
      },
    ],
  };

  async execute(this: any): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Lấy các tham số từ node
    const doctype = this.getNodeParameter('doctype', 0) as string;
    const fields = this.getNodeParameter('fields', 0) as string;
    const limit = this.getNodeParameter('limit', 0) as number;

    const filtersRaw = this.getNodeParameter('filters.filter', 0, []) as {
      field: string;
      operator: string;
      value: string;
    }[];

    const operatorMap: { [key: string]: string } = {
      eq: '=',
      gt: '>',
      lt: '<',
      gte: '>=',
      lte: '<=',
      neq: '!=',
      like: 'like',
      in: 'in',
      notin: 'not in',
    };

    // Lấy thông tin credentials
    const credentials = await this.getCredentials('FrappeCustomApi');
    const baseUrl = credentials?.baseUrl;
    const apiKey = credentials?.apiKey;
    const apiSecret = credentials?.apiSecret;

    if (!baseUrl || !apiKey || !apiSecret) {
      throw new Error('Thiếu thông tin baseUrl, apiKey hoặc apiSecret.');
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    for (let i = 0; i < items.length; i++) {
      try {
        const qs: any = {
          fields: JSON.stringify(fields.split(',').map(f => f.trim())),
          limit, // Thêm tham số limit vào query string
        };

        // Xây dựng filters nếu có
        if (filtersRaw.length > 0) {
          const frappeFilters = filtersRaw.map(filter => [
            filter.field,
            operatorMap[filter.operator],
            filter.value,
          ]);
          qs.filters = JSON.stringify(frappeFilters);
        }

        // Gửi request API
        const response = await this.helpers.httpRequest({
          method: 'GET',
          url: `${baseUrl}/api/resource/${doctype}`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          qs,
        });

        const data = response.data || response;
        returnData.push({ json: data });
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

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
        description: 'Nhập tên DocType để thao tác (VD: Sales Order, Customer,...)',
        displayOptions: {
          show: {
            operation: ['get', 'create', 'update'],
          },
        },
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
          {
            name: 'Create Document',
            value: 'create',
            description: 'Tạo bản ghi mới',
          },
          {
            name: 'Update Document',
            value: 'update',
            description: 'Cập nhật bản ghi',
          },
          {
            name: 'Get Projected Quantity',
            value: 'getProjectedQty',
            description: 'Lấy số lượng dự báo của sản phẩm',
          },
        ],
        default: 'get',
        description: 'Chọn hành động thực hiện',
      },
      {
        displayName: 'Item Code',
        name: 'item_code',
        type: 'string',
        default: '',
        description: 'Mã sản phẩm cần lấy projected_qty',
        displayOptions: {
          show: {
            operation: ['getProjectedQty'],
          },
        },
      },
      {
        displayName: 'Last Updated',
        name: 'last_updated',
        type: 'string',
        default: '',
        description: 'Lọc theo ngày cập nhật (YYYY-MM-DD HH:MM:SS)',
        displayOptions: {
          show: {
            operation: ['getProjectedQty'],
          },
        },
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        default: 'name',
        description: 'Các trường cần lấy khi thao tác GET (VD: name, customer, total_amount)',
        displayOptions: {
          show: {
            operation: ['get'],
          },
        },
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
        displayOptions: {
          show: {
            operation: ['get'],
          },
        },
      },
      {
        displayName: 'Data (JSON)',
        name: 'parameters',
        type: 'json',
        default: '{}',
        description: 'Dữ liệu JSON gửi lên khi tạo hoặc cập nhật bản ghi',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
          },
        },
      },
    ],
  };

  async execute(this: any): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const operation = this.getNodeParameter('operation', 0) as string;
    let doctype = '';
    if (operation !== 'getProjectedQty') {
      doctype = this.getNodeParameter('doctype', 0) as string;
    }
    const fields = this.getNodeParameter('fields', 0, '') as string;
    const filtersRaw = this.getNodeParameter('filters.filter', 0, []) as {
      field: string;
      operator: string;
      value: string;
    }[];

    const operatorMap: { [key: string]: string } = {
      eq: '=', gt: '>', lt: '<', gte: '>=', lte: '<=',
      neq: '!=', like: 'like', in: 'in', notin: 'not in',
    };

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
        let response;

        if (operation === 'create' && doctype === 'Sales Order') {
          const parameters = items[i].json;

          response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${baseUrl}/api/method/mbw_integration_dms.mbw_integration_dms.api_n8n.sales_order.create_sale_order_n8n`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: parameters,
            json: true,
          });
        }

        else if (operation === 'create' && doctype === 'Customer') {
          const parameters = items[i].json;

          response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${baseUrl}/api/method/mbw_integration_dms.mbw_integration_dms.api_n8n.customer.create_customers_n8n`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: parameters,
            json: true,
          });
        }

        else if (operation === 'create' && doctype === 'DMS KPI') {
          const parameters = items[i].json;

          response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${baseUrl}/api/method/mbw_integration_dms.mbw_integration_dms.api_n8n.kpi.get_kpi_dms`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: parameters,
            json: true,
          });
        }

        else if (operation === 'create' && doctype === 'DMS Timesheets') {
          const parameters = items[i].json;

          response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${baseUrl}/api/method/mbw_integration_dms.mbw_integration_dms.api_n8n.timesheet.get_timesheet_dms`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: parameters,
            json: true,
          });
        }

        else if (operation === 'update' && doctype === 'Customer') {
          const parameters = this.getNodeParameter('parameters', i, {}) as object;

          response = await this.helpers.httpRequest({
            method: 'PUT',
            url: `${baseUrl}/api/method/mbw_integration_dms.mbw_integration_dms.api_n8n.customer.update_customer_n8n`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: parameters,
            json: true,
          });
        }

        else if (operation === 'get') {
          const fieldsArray = fields.split(',').map(f => f.trim());
          const filters = filtersRaw.map(filter => [
            filter.field,
            operatorMap[filter.operator] || '=',
            filter.value,
          ]);

          response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${baseUrl}/api/resource/${doctype}`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            qs: {
              fields: JSON.stringify(fieldsArray),
              filters: JSON.stringify(filters),
            },
          });

          response = response.data || response;
        }

        else if (operation === 'getProjectedQty') {
          const itemCode = this.getNodeParameter('item_code', i, '') as string;
          const lastUpdated = this.getNodeParameter('last_updated', i, '') as string;

          const queryParams: Record<string, string> = {};
          if (itemCode) queryParams.item_code = itemCode;
          if (lastUpdated) queryParams.last_updated = lastUpdated;

          response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${baseUrl}/api/method/mbw_integration_dms.api.get_projected_qty_item.get_projected_qty`,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          });

          response = response.message || response;
        }

        returnData.push({ json: response });
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

*** Cài đặt n8n:
- clone repo từ git về
git clone https://github.com/MOBIWORK/N8N_ERPNext.git
cd N8N_ERPNext

1. Cài đặt Node.js (phiên bản khuyến nghị: LTS 20)
- curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
- sudo apt install -y nodejs
Kiểm tra:
- node -v
- npm -v

2. Cài pnpm
- sudo npm install -g pnpm
check: pnpm -v

3. cài đặt dependencies của dự án
- pnpm setup (Lệnh pnpm setup dùng để thiết lập môi trường pnpm đúng cách)
- source ~/.bashrc
- pnpm install (pnpm i)

4. Cài đặt n8n bằng npm
- npm install n8n -g (sudo pnpm install n8n -g)

5. public custom node n8n:
- pnpm run build (sau khi chạy sẽ tạo folder dist chứa custom node và creadential)
- pnpm link

6. Cài đặt nút vào phiên bản n8n cục bộ
- mkdir -p ~/.n8n/custom/
- cd ~/.n8n/custom/
- pnpm link node-package-name (trong file package.json của source code)
- Tạo file môi trường .env nếu cần
- n8n start (Có thể chạy n8n start ở cả N8N_ERPNext hoặc ~/.n8n/custom/)

7. Sau khi cập nhật code mới:
- cd N8N_ERPNext -> pnpm run build để update -> n8n start


*** Cách tạo các custom nodes N8N
Có 2 folder chính là credentials và nodes
1. Folder credentials chưa các file có đuôi .crdentials.ts (vd MBWCustomApi.crdentials.ts) có tác dụng:
- Khai báo thông tin cần nhập để kết nối API
- Tạo form UI cho người dùng nhập trong phần "Credentials" của n8n
- Xác định kiểu xác thực (Bearer token, Basic Auth, OAuth2,...)

2. Folder nodes chứa các file .svg, .node.json và .node.ts
- File .svg sẽ là icon của node
- File .node.ts: Đây là file TypeScript chứa code thực thi chính của node (logic, gọi API, xử lý dữ liệu, v.v.).
- File .node.json -  Khai báo metadata UI, đây là file JSON chứa metadata mô tả node: tên, biểu tượng, phiên bản, các trường cần nhập, các lựa chọn,... (tương tự như phần description ở trên, nhưng ở dạng tách riêng và dễ build tự động)
- File .node.json không bắt buộc phải có

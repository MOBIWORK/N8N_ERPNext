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
cd N8N_ERPNext -> pnpm run build để update -> n8n start
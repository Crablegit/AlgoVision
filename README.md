# 🌟 AlgoVision AI - Trực Quan Hóa Thuật Toán & Đề Bài Bằng Gemini 2.0 Flash

Ứng dụng web trực quan hóa thuật toán và bài toán lập trình (LeetCode, Codeforces, thuật toán tự tạo) được thiết kế theo phong cách **Neumorphism (Soft UI)** sang trọng, hiệu ứng chuyển động mượt mà bằng **Framer Motion**, sử dụng **React + TypeScript + Vite + Tailwind CSS**.

Ứng dụng chạy **100% Client-side**: Người dùng tự nhập **Gemini API Key** miễn phí của họ (được lưu an toàn trong `localStorage`), giúp bạn có thể đưa lên **Vercel** hay **GitHub Pages** hoàn toàn miễn phí mà không lo phát sinh chi phí hay lộ API Key.

---

## 🚀 Tính năng nổi bật

- 🎨 **Thiết kế Neumorphism (Soft UI):** Bề mặt xám mềm thanh lịch, hiệu ứng đổ bóng lồi/lõm xúc giác sống động khi tương tác.
- ⚡ **Gemini 2.0 Flash AI:** Đọc hiểu đề bài, trích xuất cấu trúc dữ liệu và sinh các bước mô phỏng thuật toán kèm giải thích chi tiết bằng tiếng Việt.
- 🎬 **Bộ tua bước (Step-by-step Player):** Tự động chạy (Play), Tạm dừng (Pause), Tiến/Lùi từng bước, thanh gạt chỉnh tốc độ mô phỏng.
- 🎯 **Con trỏ & Biến trạng thái động:** Các con trỏ (`left`, `right`, `i`, `j`, `mid`) lướt mượt mà dưới các phần tử nhờ Framer Motion; hiển thị bảng theo dõi biến thời gian thực.
- 🔑 **Tự chủ API Key:** Có modal cài đặt API Key, kiểm tra tính hợp lệ trước khi lưu.
- 📦 **Tích hợp sẵn bài mẫu:** Có sẵn các bài mẫu (Two Sum, Binary Search, Bubble Sort) để người dùng có thể trải nghiệm ngay lập tức.

---

## 🛠️ Hướng dẫn chạy thử ở máy cá nhân (Local)

### 1. Cài đặt thư viện:
Mở terminal (PowerShell hoặc CMD) tại thư mục `algo-visualizer` và chạy:
```bash
npm install
```

### 2. Chạy môi trường phát triển:
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ: `http://localhost:3000` (hoặc `http://localhost:5173`).

---

## 🌐 HƯỚNG DẪN THỦ CÔNG: Đưa lên GitHub & Deploy lên Vercel (Miễn phí 100%)

### BƯỚC 1: Đẩy mã nguồn lên GitHub

1. Truy cập [github.com](https://github.com) và đăng nhập vào tài khoản của bạn.
2. Bấm vào dấu **`+`** ở góc trên cùng bên phải $\rightarrow$ Chọn **New repository**.
3. Đặt tên kho lưu trữ (ví dụ: `algo-visualizer`), chọn chế độ **Public**, sau đó bấm **Create repository**.
4. Mở terminal tại thư mục dự án `algo-visualizer` trên máy của bạn và chạy lần lượt các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "feat: first release AlgoVision AI with Neumorphism and Gemini 2.0 Flash"
   git branch -M main
   git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/algo-visualizer.git
   git push -u origin main
   ```
   *(Thay `TÊN_GITHUB_CỦA_BẠN` bằng username GitHub thực tế của bạn).*

---

### BƯỚC 2: Deploy lên Vercel (Chỉ mất 1 phút)

1. Truy cập [vercel.com](https://vercel.com) và chọn **Sign Up** hoặc **Log In** bằng chính tài khoản GitHub của bạn.
2. Tại trang Dashboard của Vercel, bấm nút **"Add New..."** ở góc trên bên phải $\rightarrow$ Chọn **"Project"**.
3. Bạn sẽ thấy danh sách các repository trên GitHub của mình. Tìm repository `algo-visualizer` và bấm nút **"Import"**.
4. Tại màn hình cấu hình:
   - **Framework Preset:** Vercel sẽ tự động chọn là `Vite`.
   - **Root Directory:** Giữ nguyên `./`.
   - **Build and Output Settings:** Giữ nguyên mặc định (`npm run build` và `dist`).
   - **Environment Variables:** **KHÔNG CẦN ĐIỀN GÌ CẢ** (vì ứng dụng cho phép người dùng tự điền API Key ngay trên giao diện web).
5. Bấm nút **"Deploy"**.
6. Đợi khoảng 30 - 45 giây để Vercel tiến hành build. Khi hoàn tất, Vercel sẽ cung cấp cho bạn một đường link công khai (ví dụ: `https://algo-visualizer-xyz.vercel.app`).

---

### BƯỚC 3: Cách lấy Google Gemini API Key miễn phí để sử dụng

1. Truy cập [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Đăng nhập bằng tài khoản Google (Gmail).
3. Bấm nút **Create API key** $\rightarrow$ Chọn một project Google Cloud có sẵn (hoặc bấm tạo mới).
4. Copy chuỗi khóa (bắt đầu bằng `AIzaSy...`).
5. Truy cập vào trang web của bạn trên Vercel, bấm nút **"Cài đặt API Key"** ở góc phải trên, dán key vào và bấm **"Kiểm tra & Lưu"**.

🎉 **Chúc mừng bạn đã sở hữu ứng dụng trực quan hóa thuật toán AI của riêng mình!**

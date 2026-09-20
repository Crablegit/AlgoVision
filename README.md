# 🌸 AlgoVision • Created by Crabrian
> **Công cụ trực quan hóa đề bài và Custom Test cho các bài toán Lập trình thi đấu (Competitive Programming)**

AlgoVision là ứng dụng web chạy **100% Client-Side** giúp các lập trình viên thi đấu (CP) và người luyện thuật toán (LeetCode, Codeforces, VNOI, CSES,...) hiểu ngay đề bài và cách test case mẫu vận hành một cách trực quan, sinh động nhất.

---

## ⚡ Bản chất hoạt động của AlgoVision (Architecture & Mechanism)

AlgoVision không phải là một bài giảng lý thuyết khô khan, cũng không hiển thị những đoạn văn dài dòng về phân tích độ phức tạp $O(n)$ hay $O(n^2)$. **Bản chất của AlgoVision là một "Công cụ mô phỏng trạng thái trực quan" (Visual State Machine)** hoạt động theo quy trình khép kín:

```
+-------------------------------------------------------------------------+
|                              NGƯỜI DÙNG                                 |
|  1. Chụp ảnh màn hình đề bài (Ctrl + V) hoặc gõ Raw Text                |
|  2. (Tùy chọn) Nhập Input / Output mẫu riêng muốn kiểm tra              |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                     GOOGLE GEMINI 3.1 FLASH LITE                        |
|  - Trích xuất cấu trúc dữ liệu chính của bài toán                       |
|  - Xác định loại hiển thị tối ưu nhất (Tree, Grid, Intervals, Graph,...) |
|  - Mô phỏng từng bước chạy của Test mẫu thành chuỗi JSON Frames         |
|  - BẮT BUỘC kết thúc bằng Output mẫu chính xác của đề bài               |
+-------------------------------------------------------------------------+
                                    │
                                    ▼ (JSON Frames)
+-------------------------------------------------------------------------+
|                      ALGOVISION RENDERING ENGINE                        |
|  - Dispatcher điều hướng dữ liệu đến Visualizer Component chuyên biệt   |
|  - Trình phát từng bước (Play / Pause / Next / Prev / Speed Control)     |
|  - Mở khóa khung "Custom Test Case" để người dùng tự mô phỏng test riêng|
+-------------------------------------------------------------------------+
```

### 1. 100% Client-Side & Bảo mật API Key
- Toàn bộ ứng dụng chạy trực tiếp trên trình duyệt của người dùng (React + TypeScript + Vite + Tailwind CSS).
- **Không có máy chủ trung gian (No Backend Server):** API Key của bạn được lưu an toàn trong `localStorage` của trình duyệt cá nhân và gửi trực tiếp qua kết nối HTTPS được mã hóa đến Google Gemini API. Không ai có thể xem hay lấy cắp key của bạn.

### 2. Cơ chế ưu tiên Input / Output mẫu (100% Strict Priority)
- **Nếu bạn nhập "Input mẫu" hoặc "Output mẫu":** Hệ thống sẽ **bắt buộc 100%** AI mô phỏng chính xác test này, không tự ý bịa hay sửa đổi giá trị.
- **Nếu bạn để trống:** AI sẽ tự động đọc hình ảnh/văn bản đề bài để bóc tách đúng **Test ví dụ 1 (Sample 1)** và mô phỏng.

### 3. Quy trình 2 giai đoạn (Two-Stage Workflow)
- **Giai đoạn 1 (Hiểu đề bài):** Nạp đề bài để xem trực quan hóa test ví dụ mẫu của đề bài.
- **Giai đoạn 2 (Thử nghiệm Custom Test):** Sau khi nạp đề, hệ thống sẽ mở khóa thêm mục **"Mô phỏng Custom Test Case"** bên dưới. Bạn có thể nhập bất kỳ test case tùy ý nào của mình để xem thuật toán xử lý ra sao từng bước.

---

## 🎨 Các dạng bài toán được hỗ trợ trực quan hóa (Visualizer Modes)

Hệ thống tự động phân tích và kích hoạt bộ dựng hình (Renderer) tối ưu nhất cho từng dạng bài:

### 1. 🌳 Cây phân cấp (Tree - Top-Down Hierarchical Layout)
* **Phù hợp với:** Các bài toán cây có gốc, cây nhị phân, duyệt cây (DFS, BFS), LCA (tổ tiên chung gần nhất), đường đi trên cây, tính tổng cây con (subtree queries).
* **Tính năng chuyên biệt:**
  - **Bố cục phân cấp từ trên xuống:** Tự động tính toán độ rộng của từng cây con (`subtree width`) để các nhánh rẽ đều hai bên và **không bao giờ bị đè lên nhau**.
  - **Xác định gốc linh hoạt theo đề bài (`rootId`):** Tuyệt đối **không mặc định gốc là 1**. AI tự động đọc đề bài để xác định gốc (ví dụ: gốc là `0`, `1`, hoặc đỉnh $r$ bất kỳ theo input). Đỉnh gốc được đánh dấu viền sáng và nhãn `[ROOT]`.
  - Đỉnh và cạnh phát sáng khi đang được duyệt hoặc nằm trên đường đi kết quả.

### 2. 🔲 Bảng 2D / Ma trận (2D Grid & Matrix)
* **Phù hợp với:** Các bài toán bảng ký tự, tìm từ (word search), tìm hình chữ nhật con có diện tích nhỏ nhất bao phủ tập ký tự, quy hoạch động trên lưới 2D, loang DFS/BFS trên mê cung.
* **Tính năng chuyên biệt:**
  - Vẽ trọn vẹn lưới $N \times M$ với đầy đủ tọa độ hàng và cột.
  - Tô sáng các ô thỏa mãn điều kiện với hiệu ứng đổi màu theo trạng thái (`comparing`, `found`, `swapping`).
  - Vẽ khung chữ nhật con (`selectedBox`) phát sáng hồng bao quanh vùng kết quả tối ưu.

### 3. 📏 Hệ trục số & Tập đoạn thẳng phủ nhau (Intervals & Number Line)
* **Phù hợp với:** Bài toán phủ đoạn thẳng, xếp lịch công việc (interval scheduling), tìm đoạn giao nhau lớn nhất, gộp khoảng (merge intervals).
* **Tính năng chuyên biệt:**
  - Trục số ngang với các mốc tọa độ chính xác.
  - Các đoạn thẳng `[start, end]` được xếp tầng thông minh theo chiều dọc để tránh chồng lấn, thanh đoạn thẳng phát sáng hồng khi được chọn.

### 4. 🕸️ Đồ thị, DSU & Đường đi ngắn nhất (Graph & Circular)
* **Phù hợp với:** Đồ thị tổng quát, tìm đường đi ngắn nhất (Dijkstra, BFS), tập hợp rời rạc DSU (Disjoint Set Union - Kruskal), chu trình đồ thị, bài toán vòng tròn xoay vòng (Josephus).
* **Tính năng chuyên biệt:**
  - Hiển thị các đỉnh (nodes) và các cạnh nối (edges) có trọng số.
  - DSU: Các đỉnh cùng một nhóm/thành phần liên thông sẽ có cùng mã màu đại diện.
  - Đường đi ngắn nhất: Tô sáng đường đi được chọn từ điểm xuất phát đến đích.
  - Dạng vòng tròn (`circular`): Tự động dàn đều các đỉnh theo đường tròn cho các bài toán xoay vòng.

### 5. 📊 Mảng 1D & Con trỏ động (1D Array & Pointers)
* **Phù hợp với:** Tìm kiếm nhị phân (Binary Search), hai con trỏ (Two Pointers), cửa sổ trượt (Sliding Window), sắp xếp.
* **Tính năng chuyên biệt:**
  - Các phần tử mảng hiển thị trực quan kèm giá trị và chỉ số index.
  - Các con trỏ (`left`, `right`, `i`, `j`, `mid`) di chuyển mượt mà dưới từng phần tử.
  - Bảng theo dõi biến thời gian thực hiển thị giá trị các biến phụ trợ qua từng bước.

---

## 🎮 Giao diện & Trải nghiệm (UI/UX)

- **Phong cách Cyber-Sakura:** Sự kết hợp giữa sắc xanh bóng đêm Midnight Blue (`#070b14`) hiện đại và màu hồng Sakura (`#ff7597`) công nghệ.
- **Hiệu ứng cánh hoa anh đào Pixel:** Nền canvas với hiệu ứng lá hoa anh đào pixel 8-bit rơi tuần hoàn, nhẹ nhàng và không làm giảm hiệu năng.
- **Font chữ Consolas:** Font monospaced lập trình tiêu chuẩn, sắc nét, dễ đọc cho dân công nghệ.
- **Nút điều khiển bước chuẩn:** Bộ nút hình tam giác thuần túy (`◀`, `▶`), nút Play/Pause tự động và thanh trượt điều chỉnh tốc độ từ 0.5s đến 2.5s mỗi bước.

---

## 🔑 Hướng dẫn lấy Gemini API Key miễn phí (Chỉ mất 1 phút)

1. Truy cập vào trang: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Đăng nhập bằng tài khoản Google (Gmail) của bạn.
3. Bấm vào nút **"Create API key"** (Tạo khóa API).
4. Sao chép đoạn mã khóa (chuỗi ký tự bắt đầu bằng `AIzaSy...`).
5. Mở trang web **AlgoVision**, bấm vào nút **"API Key"** ở góc phải trên cùng, dán key vào và bấm **"Kiểm tra & Lưu"**.

---

## 🚀 Hướng dẫn tự cài đặt và Deploy

### 1. Chạy trên máy cá nhân (Local Development)
```bash
# Clone mã nguồn
git clone https://github.com/Crablegit/algo-visualizer.git
cd algo-visualizer

# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
Trình duyệt sẽ tự động mở tại `http://localhost:5173`.

### 2. Tải lên GitHub & Deploy lên Vercel (Miễn phí 100%)
1. Đẩy mã nguồn lên repository GitHub của bạn.
2. Truy cập [vercel.com](https://vercel.com) $\rightarrow$ Đăng nhập bằng GitHub.
3. Bấm **"Add New..."** $\rightarrow$ Chọn **"Project"** $\rightarrow$ Chọn repository `algo-visualizer`.
4. Vercel sẽ tự động nhận diện Vite. Bạn chỉ cần bấm nút **"Deploy"** mà không cần cấu hình biến môi trường nào.

---

## 👨‍💻 Tác giả

Được phát triển bởi **Crabrian**  
GitHub: [https://github.com/Crablegit](https://github.com/Crablegit)

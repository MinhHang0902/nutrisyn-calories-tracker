# NutriSyn — Tài Liệu Mô Tả Chi Tiết Hệ Thống

> **Phiên bản:** 1.0 | **Cập nhật:** 2025

---

## 1. Tổng Quan Hệ Thống

NutriSyn là nền tảng web ứng dụng trí tuệ nhân tạo hỗ trợ người dùng theo dõi và tối ưu hóa chế độ dinh dưỡng cá nhân. Hệ thống kết hợp nhận dạng hình ảnh, tính toán khoa học về năng lượng, tư vấn tự động và giao tiếp chat thông minh để tạo ra trải nghiệm dinh dưỡng toàn diện.

**Mục tiêu cốt lõi:**

- Tự động nhận diện và tính giá trị dinh dưỡng từ ảnh / video bữa ăn được tải lên
- Cá nhân hóa khuyến nghị dinh dưỡng dựa trên hồ sơ thể trạng
- Hỗ trợ tư vấn theo thời gian thực qua chat AI
- Lưu trữ và phân tích lịch sử ăn uống để theo dõi tiến trình

---

## 2. Kiến Trúc Hệ Thống

### 2.1. Các tầng chính

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Giao diện người dùng, upload ảnh/video, chat UI, biểu đồ |
| Backend | NestJS | Business logic, Auth JWT, Nutrition Engine, Rule Engine, API |
| AI Service | Python + FastAPI | Nhận dạng món ăn, tính dinh dưỡng, chat tư vấn AI |
| Database | PostgreSQL | Lưu hồ sơ người dùng, lịch sử bữa ăn, lịch sử chat |
| Cloud Storage | S3 / tương đương | Lưu trữ ảnh và video bữa ăn |

> **Lưu ý triển khai:** Toàn bộ hệ thống chạy trực tiếp trên máy chủ, **không sử dụng Docker**. Mỗi service (Frontend, Backend NestJS, AI Service FastAPI) được khởi động độc lập bằng process manager (PM2) hoặc chạy thủ công trong môi trường development.

### 2.2. Luồng xử lý chính

1. Người dùng tải lên ảnh / video → Frontend gửi lên Backend
2. Backend chuyển tiếp sang AI Service (FastAPI) để nhận dạng món ăn
3. AI trả về danh sách món + ước lượng khẩu phần
4. Backend mapping với database dinh dưỡng, tính calories & macro
5. Backend đánh giá so với mục tiêu cá nhân, sinh gợi ý
6. Kết quả trả về Frontend hiển thị trực quan

---

## 3. Frontend — Smart UI

### 3.1. Triết lý thiết kế Smart UI

NutriSyn Frontend được xây dựng theo triết lý **Smart UI** — giao diện không chỉ hiển thị dữ liệu mà còn chủ động phản hồi, dẫn dắt và thích nghi theo hành vi người dùng. Mỗi màn hình đều tự điều chỉnh nội dung, trạng thái và gợi ý dựa trên dữ liệu thực của người dùng.

**Nguyên tắc Smart UI áp dụng:**

- **Contextual Feedback** — Mọi kết quả (calories, macro, đánh giá) đều được trình bày với màu sắc, icon và thông điệp phù hợp ngữ cảnh, không chỉ là số liệu thô
- **Progressive Disclosure** — Hiển thị thông tin theo tầng: tóm tắt trước, chi tiết khi cần, tránh overload dữ liệu
- **Reactive State** — Giao diện cập nhật tức thì khi dữ liệu thay đổi, không cần reload trang
- **Guided Experience** — Hệ thống dẫn dắt người dùng mới qua các bước onboarding, gợi ý hành động tiếp theo ở mỗi màn hình
- **Adaptive Layout** — Bố cục tự điều chỉnh theo kích thước màn hình (desktop, tablet, mobile)

### 3.2. Công nghệ & Thư viện Frontend

#### Framework & Core

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| Next.js | 14 (App Router) | Framework chính, SSR/SSG, file-based routing |
| React | 18 | UI component library, hooks, context |
| TypeScript | 5.x | Type safety toàn bộ codebase |

#### UI Component & Styling

| Thư viện | Mục đích |
|---|---|
| **Tailwind CSS** | Utility-first CSS, responsive design, dark mode |
| **shadcn/ui** | Bộ component chuẩn: Button, Dialog, Card, Form, Tabs, Badge, Tooltip... |
| **Radix UI** | Headless UI primitives — nền tảng của shadcn/ui, accessible by default |
| **Lucide React** | Icon library nhất quán, hơn 1000 icon SVG |
| **class-variance-authority (CVA)** | Quản lý variant của component (size, color, state) |
| **clsx / tailwind-merge** | Kết hợp class Tailwind an toàn, tránh conflict |
| **next-themes** | Hỗ trợ Dark Mode / Light Mode, lưu preference người dùng |

#### Animation & UX

| Thư viện | Mục đích |
|---|---|
| **Framer Motion** | Animation mượt mà cho page transition, card entrance, loading state |
| **React Spring** | Animation vật lý cho progress bar, animated counter (số tăng dần) |
| **Auto Animate** | Tự động animate khi thêm / xóa phần tử trong danh sách |

#### Form & Validation

| Thư viện | Mục đích |
|---|---|
| **React Hook Form** | Quản lý form state, hiệu năng cao, ít re-render |
| **Zod** | Schema validation TypeScript-first, dùng chung với React Hook Form |
| **@hookform/resolvers** | Kết nối Zod với React Hook Form |

#### Data Fetching & State Management

| Thư viện | Mục đích |
|---|---|
| **TanStack Query (React Query) v5** | Server state management, caching, auto-refetch, loading/error state |
| **Axios** | HTTP client gọi API Backend và AI Service |
| **Zustand** | Client state management nhẹ cho auth, user profile, UI state |
| **js-cookie** | Lưu trữ JWT token phía client |

#### Data Visualization

| Thư viện | Mục đích |
|---|---|
| **Recharts** | Biểu đồ calories theo ngày/tuần, xu hướng cân nặng (LineChart, BarChart) |
| **Chart.js + react-chartjs-2** | Biểu đồ macro tròn (Doughnut/Pie Chart), progress ring |
| **Radix UI Progress** | Progress bar động cho tiến độ calories / macro trong ngày |

#### Upload & Media

| Thư viện | Mục đích |
|---|---|
| **React Dropzone** | Drag & drop upload ảnh / video, validate định dạng và dung lượng |
| **react-image-crop** | Crop / xem trước ảnh trước khi upload |
| **browser-image-compression** | Nén ảnh client-side trước khi gửi lên server, giảm tải băng thông |

#### Chat UI

| Thư viện | Mục đích |
|---|---|
| **Vercel AI SDK** | Streaming chat response từ AI, useChat hook |
| **react-markdown** | Render markdown trong câu trả lời của AI |
| **remark-gfm** | Hỗ trợ bảng, checkbox, strikethrough trong markdown |
| **date-fns** | Format timestamp của tin nhắn (vd: "2 phút trước") |

#### Tiện ích khác

| Thư viện | Mục đích |
|---|---|
| **Sonner** | Notification toast (thành công, lỗi, cảnh báo) |
| **cmdk** | Command palette / search (shadcn/ui Command component) |
| **@tanstack/react-table** | Bảng dữ liệu lịch sử ăn uống có sort, filter, pagination |
| **dayjs** | Xử lý ngày tháng, tính khoảng cách thời gian |
| **numeral.js** | Format số (calories, gram) theo chuẩn đọc dễ |

### 3.3. Cấu trúc thư mục Frontend

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group: login, register
│   ├── (dashboard)/            # Route group: protected pages
│   │   ├── dashboard/
│   │   ├── nutriscan/
│   │   ├── nutrition-finder/
│   │   ├── meal-planner/
│   │   ├── bmi/
│   │   ├── chat/
│   │   ├── history/
│   │   └── results/
│   ├── layout.tsx              # Root layout (font, theme, toast)
│   └── page.tsx                # Trang chủ (Index)
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── smart/                  # Smart UI components (contextual)
│   │   ├── NutritionGauge      # Gauge tròn tiến độ macro, đổi màu theo mức
│   │   ├── MealScoreBadge      # Badge đánh giá bữa ăn (xanh/vàng/đỏ)
│   │   ├── SmartAlert          # Alert thông minh theo ngữ cảnh dinh dưỡng
│   │   └── DailySummaryCard    # Tóm tắt dinh dưỡng trong ngày, realtime
│   ├── charts/                 # Các loại biểu đồ
│   ├── forms/                  # Form components (profile, login...)
│   ├── upload/                 # Dropzone, preview, progress bar upload
│   ├── chat/                   # Chat bubble, message list, input
│   └── layout/                 # Navbar, Sidebar, Footer
│
├── hooks/                      # Custom React hooks
│   ├── useNutritionGoal.ts     # Tính toán tiến độ macro trong ngày
│   ├── useMealHistory.ts       # Fetch & cache lịch sử bữa ăn
│   └── useSmartSuggestion.ts   # Logic gợi ý rule-based phía client
│
├── lib/
│   ├── api/                    # Axios instances, API calls
│   ├── validations/            # Zod schemas
│   └── utils.ts                # Helper functions
│
├── stores/                     # Zustand stores
│   ├── authStore.ts
│   └── userProfileStore.ts
│
└── types/                      # TypeScript type definitions
```

### 3.4. Smart UI — Các Component Đặc trưng

#### NutritionGauge
Gauge tròn hiển thị tiến độ từng macro trong ngày. Tự động đổi màu theo mức độ: xanh (trong ngưỡng) → vàng (gần đủ) → đỏ (vượt mức). Số liệu animate tăng dần khi load bằng React Spring.

#### MealScoreBadge
Badge đánh giá bữa ăn vừa phân tích, hiển thị ngay bên cạnh ảnh. Kết hợp màu nền, icon và text mô tả ngắn (vd: "✅ Phù hợp mục tiêu", "⚠️ Hơi nhiều carbs").

#### SmartAlert
Alert box tự xuất hiện theo ngữ cảnh: nếu protein thiếu → alert màu cam kèm gợi ý món bổ sung ngay, không cần người dùng chủ động hỏi. Dismiss được và không lặp lại trong phiên.

#### DailySummaryCard
Card tóm tắt cố định trên Dashboard, cập nhật realtime sau mỗi bữa ăn. Hiển thị calories đã nạp / còn lại, progress bar 4 macro, trạng thái ngày hôm nay.

#### Upload Zone
Khu vực upload có drag & drop, preview ảnh/video inline, progress bar upload, hiển thị lỗi định dạng trực tiếp không cần submit form. Ảnh được nén tự động client-side trước khi gửi.

---

## 4. Mô Tả Chi Tiết Tính Năng

### 4.1. Xác Thực Người Dùng (Authentication)

| Chức năng | Mô tả |
|---|---|
| Đăng ký tài khoản | Tạo tài khoản mới với email, mật khẩu; validate bằng Zod schema |
| Đăng nhập | Xác thực thông tin, cấp JWT token lưu vào cookie |
| Quản lý phiên | Tự động làm mới token, đăng xuất an toàn, xử lý session hết hạn |
| Protected Routes | Middleware Next.js kiểm tra token, redirect về `/login` nếu chưa xác thực |

---

### 4.2. Hồ Sơ Dinh Dưỡng Cá Nhân

**Thông tin đầu vào:**

- Tuổi, giới tính
- Chiều cao (cm), cân nặng (kg)
- Mức độ vận động: Ít vận động / Vận động vừa / Vận động nhiều
- Mục tiêu: Giảm cân / Tăng cơ / Giữ cân

**Kết quả hệ thống tính toán:**

| Chỉ số | Công thức / Ý nghĩa |
|---|---|
| BMI | Cân nặng (kg) / Chiều cao² (m) — Phân loại: Gầy / Bình thường / Thừa cân / Béo phì |
| BMR (Mifflin-St Jeor) | Nam: 10×W + 6.25×H − 5×A + 5 &nbsp;\|&nbsp; Nữ: 10×W + 6.25×H − 5×A − 161 |
| TDEE | BMR × Hệ số vận động (1.2 → 1.725 tùy mức độ) |
| Calories mục tiêu/ngày | TDEE ± thâm hụt / thặng dư (tùy mục tiêu) |
| Phân bổ Macro | Protein / Carbs / Fat theo tỉ lệ phù hợp mục tiêu |

---

### 4.3. AI NutriScan — Phân Tích Dinh Dưỡng Từ Hình Ảnh / Video

**Quy trình xử lý:**

1. Người dùng tải lên ảnh hoặc video từ thiết bị (hỗ trợ drag & drop)
2. Client-side nén ảnh trước khi gửi để tối ưu tốc độ
3. AI kiểm tra tệp có chứa thức ăn không (file validation)
4. Nhận dạng từng món ăn trong ảnh / các frame của video
5. Ước lượng khẩu phần: Nhỏ / Vừa / Lớn
6. Mapping với database dinh dưỡng, tổng hợp kết quả

**Thông tin dinh dưỡng trả về:**

| Chỉ số | Đơn vị | Ghi chú |
|---|---|---|
| Calories | kcal | Tổng năng lượng bữa ăn |
| Protein | g | Chất đạm |
| Carbohydrates | g | Tinh bột & đường tổng |
| Fat | g | Chất béo tổng |
| Sugar | g | Đường đơn |
| Fiber | g | Chất xơ |
| Sodium | mg | Muối |
| Calcium | mg | Canxi |
| Iron | mg | Sắt |

**Kết quả hiển thị:**

- Tổng calories bữa ăn
- Chi tiết dinh dưỡng từng món
- Biểu đồ Doughnut tỉ lệ macro (Protein / Carbs / Fat)
- MealScoreBadge đánh giá phù hợp ngay bên cạnh ảnh

---

### 4.4. AI Nutrition Finder — Tra Cứu Dinh Dưỡng Theo Tên Món

- Nhập tên món ăn (ví dụ: cơm trắng, phở bò, salad rau)
- Chọn hoặc nhập khẩu phần (gram, chén, tô...)
- **Sử dụng OpenAI API (GPT-3.5)** để trả về đầy đủ bảng dinh dưỡng chính xác tương tự NutriScan
- Fallback sang local database nếu OpenAI API không khả dụng

---

### 4.5. AI Meal Planner — Lập Kế Hoạch Bữa Ăn

**Tham số đầu vào:**

- Nguyên liệu ưa thích / có sẵn
- Phong cách ẩm thực (Cuisine): Việt Nam, Châu Á, Địa Trung Hải, v.v.
- Loại bữa ăn: Sáng (Breakfast) / Trưa (Lunch) / Tối (Dinner)
- Mục tiêu calories của bữa

**Kết quả:**

- Đề xuất 3–4 món ăn phù hợp (mỗi món ăn có tổng số calories gần hoặc đúng với mục tiêu calories chứ không phải 3-4 món cộng lại mới ra calories mục tiêu)
- Thông tin dinh dưỡng ước tính cho từng món
- Hướng dẫn nấu đơn giản

---

### 4.6. Máy Tính BMI & Chỉ Số Sức Khỏe

| Đầu vào | Kết quả tính toán |
|---|---|
| Cân nặng, Chiều cao | BMI + Phân loại (Gầy / Bình thường / Thừa cân / Béo phì) |
| Tuổi, Giới tính | BMR (nhu cầu năng lượng cơ bản) |
| Mức vận động | TDEE (tổng năng lượng tiêu hao mỗi ngày) |

---

### 4.7. Đánh Giá Mức Độ Phù Hợp & Cảnh Báo Dinh Dưỡng

| Phân loại | Màu hiển thị | Điều kiện |
|---|---|---|
| Phù hợp | 🟢 Xanh lá | Calories và macro trong ngưỡng mục tiêu |
| Cần điều chỉnh | 🟡 Vàng cam | Vượt hoặc thiếu nhẹ (10–20%) |
| Vượt mức | 🔴 Đỏ | Vượt quá ngưỡng khuyến nghị (>20%) |
| Thiếu dinh dưỡng | 🟠 Cam nhạt | Một hoặc nhiều macro dưới mức cần thiết |

**Nội dung đánh giá bao gồm:**

- Calories bữa ăn so với lượng còn lại trong ngày
- Macro hiện tại (Protein / Carbs / Fat) so với macro mục tiêu
- Tiến độ tổng ngày (đã nạp / còn lại / đã vượt)

---

### 4.8. Gợi Ý Bữa Ăn Tiếp Theo (Rule-based Engine)

| Điều kiện | Gợi ý hệ thống |
|---|---|
| Calories còn lại thấp | Đề xuất bữa nhẹ: salad, trái cây, yaourt |
| Protein thiếu hụt | Ăn thêm ức gà, trứng, sữa chua Hy Lạp, đậu phụ |
| Carbs vượt mức | Bữa tiếp theo ưu tiên rau xanh, protein nạc, hạn chế tinh bột |
| Fat vượt mức | Chọn món luộc/hấp, tránh chiên xào |
| Fiber thiếu | Bổ sung thêm rau củ, ngũ cốc nguyên cám |

**Ví dụ tin nhắn gợi ý:**

- *"Bạn đã nạp đủ tinh bột hôm nay, bữa tối nên ưu tiên ức gà + rau xanh."*
- *"Protein còn thiếu ~25g, có thể bổ sung trứng luộc hoặc sữa chua Hy Lạp."*

---

### 4.9. Dashboard — Bảng Điều Khiển Cá Nhân

Trang tổng quan Smart UI: DailySummaryCard cập nhật realtime, SmartAlert tự động xuất hiện theo ngữ cảnh.

| Widget | Nội dung |
|---|---|
| Weight Tracker | Biểu đồ LineChart theo dõi cân nặng theo thời gian, ghi nhận cân nặng mới |
| Nutrition Goals | Hiển thị và chỉnh sửa mục tiêu calories / macro hàng ngày |
| Progress Tracker | NutritionGauge 4 macro + progress bar calories, cập nhật sau mỗi bữa ăn |
| Meal Recommendations | SmartAlert gợi ý bữa ăn phù hợp dựa trên ngữ cảnh ngày hiện tại |

---

### 4.10. Chat Tư Vấn Dinh Dưỡng AI

**Tính năng:**

- Giao tiếp tự nhiên qua ngôn ngữ hội thoại
- AI nhận biết ngữ cảnh: bữa ăn gần nhất, hồ sơ cá nhân, mục tiêu dinh dưỡng
- **Sử dụng Google Gemini API** cho câu trả lời thông minh
- Render markdown với bảng và danh sách
- Timestamp mỗi tin nhắn format "X phút trước" (date-fns)
- Lưu toàn bộ lịch sử chat để tham khảo sau

**Ví dụ câu hỏi người dùng:**

- *"Bữa trưa này có phù hợp với mục tiêu giảm cân không?"*
- *"Tối nay tôi nên ăn gì để bù protein?"*
- *"Tôi có thể ăn phở mà vẫn giảm cân không?"*
- *"Hôm nay tôi đã ăn đủ chất xơ chưa?"*

---

### 4.11. Lịch Sử Ăn Uống & Phân Tích Tiến Trình

Bảng lịch sử dùng TanStack Table hỗ trợ sort, filter, phân trang.

| Loại dữ liệu lưu | Chi tiết |
|---|---|
| Bữa ăn | Ảnh / video, danh sách món, calories, macro, thời gian |
| Đánh giá dinh dưỡng | Phân loại phù hợp, so sánh với mục tiêu ngày |
| Lịch sử chat | Câu hỏi, câu trả lời, timestamp |
| Chỉ số cơ thể | Cân nặng theo ngày, BMI, tiến trình mục tiêu |

**Tính năng xem lại:**

- Xem theo ngày / tuần / tháng
- Biểu đồ BarChart xu hướng calories và macro (Recharts)
- So sánh tiến trình với mục tiêu ban đầu

---

## 5. Công Nghệ Sử Dụng

### 5.1. Tổng hợp Frontend

| Nhóm | Thư viện chính |
|---|---|
| Framework | Next.js 14, React 18, TypeScript 5 |
| UI & Styling | Tailwind CSS, shadcn/ui, Radix UI, Lucide React |
| Animation | Framer Motion, React Spring, Auto Animate |
| Form & Validation | React Hook Form, Zod |
| State & Fetching | TanStack Query v5, Zustand, Axios |
| Biểu đồ | Recharts, Chart.js + react-chartjs-2 |
| Upload & Media | React Dropzone, browser-image-compression |
| Chat | Vercel AI SDK, react-markdown, remark-gfm |
| Tiện ích | Sonner, TanStack Table, dayjs, numeral.js |

### 5.2. Backend & Infrastructure

| Layer | Công nghệ | Mục đích cụ thể |
|---|---|---|
| Backend | NestJS (TypeScript) | REST API, Auth JWT, Nutrition Engine, Rule Engine |
| AI Service | Python + FastAPI | Food recognition, nutrition calc, AI chat, meal suggestion |
| Database | PostgreSQL | Persistent storage: users, meals, chat history |
| Cloud Storage | S3 / tương đương | Lưu trữ ảnh và video bữa ăn do người dùng tải lên |
| Process Manager | PM2 | Quản lý process Frontend, Backend, AI Service — **không dùng Docker** |

---

## 6. Danh Sách Màn Hình (Pages)

| Trang | Đường dẫn | Mô tả |
|---|---|---|
| Trang chủ | `/` | Giới thiệu sản phẩm, CTA đăng ký / đăng nhập |
| Đăng ký | `/register` | Form tạo tài khoản mới |
| Đăng nhập | `/login` | Form xác thực người dùng |
| Dashboard | `/dashboard` | Bảng điều khiển Smart UI tổng hợp |
| AI NutriScan | `/nutriscan` | Upload ảnh / video, phân tích dinh dưỡng |
| AI Nutrition Finder | `/nutrition-finder` | Tra cứu dinh dưỡng theo tên món |
| AI Meal Planner | `/meal-planner` | Lập kế hoạch thực đơn AI |
| BMI Calculator | `/bmi` | Tính BMI, BMR, TDEE |
| Chat Tư Vấn | `/chat` | Giao tiếp AI dinh dưỡng, streaming response |
| Lịch Sử Ăn Uống | `/history` | Xem lại bữa ăn theo ngày / tuần, bảng có filter |
| Kết Quả | `/results` | Hiển thị kết quả phân tích chi tiết |
| Hướng Dẫn | `/how-to-use` | Hướng dẫn sử dụng ứng dụng |
| 404 | `/404` | Trang không tìm thấy |

---

## 7. Luồng Sử Dụng Chính

### 7.1. Lần đầu sử dụng

1. Đăng ký tài khoản
2. Nhập hồ sơ cá nhân (tuổi, cân nặng, chiều cao, mục tiêu)
3. Hệ thống tính BMI, BMR, TDEE, đặt mục tiêu calories/macro
4. Chuyển đến Dashboard — Smart UI hiển thị DailySummaryCard trống, hướng dẫn bước tiếp theo

### 7.2. Ghi nhận bữa ăn

1. Vào AI NutriScan → tải lên ảnh hoặc video từ thiết bị qua Upload Zone (drag & drop)
2. AI nhận diện món ăn → hiển thị bảng dinh dưỡng + MealScoreBadge
3. Người dùng xác nhận → lưu bữa ăn vào lịch sử
4. Dashboard cập nhật realtime, SmartAlert đưa ra gợi ý bữa tiếp theo

### 7.3. Tư vấn dinh dưỡng

1. Vào trang Chat
2. Đặt câu hỏi về dinh dưỡng, bữa ăn, mục tiêu
3. AI stream câu trả lời có markdown, ngữ cảnh cá nhân hóa
4. Lịch sử chat được lưu tự động

---

## 8. Yêu Cầu Phi Chức Năng

| Tiêu chí | Yêu cầu |
|---|---|
| Hiệu năng | Phản hồi API < 2 giây; ảnh nén client-side trước khi upload |
| Bảo mật | JWT Auth, HTTPS, bcrypt, validate input bằng Zod |
| Khả năng mở rộng | Tách biệt AI Service giúp scale độc lập, không phụ thuộc container |
| Khả dụng | UI responsive Tailwind, hỗ trợ desktop và mobile browser |
| Accessibility | Radix UI đảm bảo ARIA, keyboard navigation chuẩn WCAG |
| Developer Experience | TypeScript end-to-end, ESLint, Prettier, hot reload |
| Triển khai | PM2 quản lý process, **không sử dụng Docker** |

---

*— Hết tài liệu —*

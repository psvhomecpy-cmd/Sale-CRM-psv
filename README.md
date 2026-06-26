# PSV HOME CRM

Ứng dụng CRM nội bộ cho PSV HOME — quản lý đại lý, pipeline bán hàng, catalog & báo giá, đơn hàng & công nợ, bảo hành/kỹ thuật, KPI sales, khu vực, follow-up, AI Advisor và báo cáo.

- **Công nghệ:** React 18 + Vite 5 + Recharts
- **Component chính:** `PSV_HOME_CRM_v4.jsx` (toàn bộ app trong 1 file, ~2060 dòng)

---

## ⚠️ Quan trọng: KHÔNG chạy trực tiếp trên Google Drive

Google Drive đồng bộ file liên tục nên **không cài được `node_modules`** trong thư mục này
(lỗi `EPERM` / `ENOTEMPTY`). Vì vậy app được **phát triển ở ổ đĩa cục bộ**:

| | Đường dẫn | Vai trò |
|---|---|---|
| 📁 Bản gốc (Drive) | `…\DATA CLAUDE\CRM PSV` | Nơi lưu trữ / sao lưu mã nguồn |
| 💻 Bản chạy (local) | `C:\dev\psv-home-crm` | Nơi cài đặt & chạy dev server |

---

## Cách chạy app

1. Mở thư mục `C:\dev\psv-home-crm`
2. **Double-click `start.bat`** (hoặc mở terminal và gõ `npm run dev`)
3. Trình duyệt tự mở tại **http://localhost:5173**

### Sao lưu mã nguồn về Google Drive
Sau khi chỉnh sửa code trong `C:\dev\psv-home-crm`, double-click **`sync-to-drive.bat`**
để copy mã nguồn (không kèm `node_modules`) lên Drive.

---

## Lệnh thủ công (terminal)

```bash
cd C:\dev\psv-home-crm
npm install      # chỉ chạy lần đầu hoặc khi đổi máy
npm run dev      # chạy dev server (http://localhost:5173)
npm run build    # build bản production vào thư mục dist/
npm run preview  # xem thử bản đã build
```

> Yêu cầu: **Node.js** đã được cài (bản LTS). Kiểm tra: `node -v`

---

## Dữ liệu

App lưu mọi thay đổi vào **localStorage** của trình duyệt — **không mất khi đóng/mở lại**.
Dùng nút **Export / Import (.json)** trong app để sao lưu định kỳ & chia sẻ dữ liệu giữa các máy/thiết bị.

> Lưu ý: localStorage gắn theo **từng trình duyệt + từng máy**. Muốn đồng bộ nhiều máy → Export rồi Import.

---

## 🌐 Dùng hằng ngày (không cần Node)

Có 2 cách dùng app thật, không cần dev server:

### 1) File HTML đơn — `PSV_HOME_CRM.html`
Một file duy nhất (~800KB) đã gói sẵn toàn bộ app. **Double-click mở bằng Chrome/Edge là dùng được ngay**,
chạy offline, dữ liệu lưu trong trình duyệt. Có thể copy file này sang máy khác / USB / Drive.

Build lại file này sau khi sửa code:
```bash
# Windows PowerShell
$env:SINGLE="1"; npm run build      # → dist/index.html (đổi tên thành PSV_HOME_CRM.html)
```

### 2) Web online — GitHub Pages (truy cập qua link)
Đã cấu hình deploy tự động (`.github/workflows/deploy.yml`). Mỗi lần `git push`, app tự build & lên web.

**Bật 1 lần:** vào repo trên GitHub → **Settings → Pages → Source: GitHub Actions** → Save.
Sau đó link sẽ là: **https://psvhomecpy-cmd.github.io/Sale-CRM-psv/**

```bash
npm run build   # build thường (local)
# GHPAGES=1 npm run build   # build cho Pages (CI tự đặt env này)
```

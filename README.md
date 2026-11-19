# Thiệp Cưới Điện Tử Song Hỷ (`songhy-v4-do-burgundy`)

Mẫu thiệp cưới điện tử hoàn chỉnh bằng **HTML, CSS và JavaScript thuần 100%** (zero-build, không framework, không `node_modules`). Hỗ trợ giao diện responsive trên cả máy tính và điện thoại, cá nhân hóa tên khách mời qua URL (`?kinhmoi=`), và lưu trữ **RSVP** cùng **Sổ lưu bút** thực tế trên **Google Sheets**.

## Tính năng chính

- **Bìa cổng mở thiệp 3D & Phong bì con dấu sáp**: Hiệu ứng tháo ruy-băng mở thiệp mượt mà, phong bì đa lớp kèm thiệp mini và ảnh cưới polaroid.
- **Cá nhân hóa lời mời (`?kinhmoi=`)**: Thêm `?kinhmoi=Tên+Khách` vào đường dẫn để hiển thị tên riêng của từng khách mời ngay trên bìa cổng và đầu thiệp.
- **Thông tin hai gia đình, nghi lễ & bản đồ**: Hỗ trợ hiển thị Nhà gái / Nhà trai (hoặc chỉ 1 bên), danh sách nghi lễ và nút chỉ đường Google Maps.
- **Đếm ngược & Lịch trái tim**: Bộ đếm ngược thời gian thực tới giờ làm lễ, lịch tháng tự động đánh dấu ngày cưới và nút lưu sự kiện vào **Google Calendar** / **Apple Calendar** (`.ics`).
- **Album ảnh cưới Coverflow 3D & Lightbox**: Vuốt ngang hoặc bấm nút chuyển ảnh, phóng to toàn màn hình và điều hướng bằng phím mũi tên.
- **Sổ lưu bút & Xác nhận tham dự (RSVP)**: Hoạt động ở chế độ Demo (`localStorage`) khi chưa gắn link, và đồng bộ hai chiều với **Google Sheets** qua `google-apps-script/Code.gs` khi đã cấu hình `googleSheets.scriptUrl`.
- **Hộp mừng cưới QR & Nhạc nền**: Hỗ trợ ảnh QR ngân hàng cục bộ hoặc tạo QR tự động qua VietQR, sao chép số tài khoản, tải mã QR, cùng trình phát nhạc nền có thể cắt đoạn lặp.
- **Các mục tùy chọn**: Dễ dàng bật/tắt Câu chuyện tình yêu (`story`), Lịch trình buổi lễ (`schedule`), Dresscode (`dressCode`), hoặc hiệu ứng cánh hoa rơi trong `config.js`.

## Cấu trúc thư mục

```text
thiep-cuoi/
├── index.html                  # Trang HTML5 thuần (mở trực tiếp file:// hoặc deploy tĩnh)
├── config.js                   # File cấu hình cá nhân duy nhất cần chỉnh sửa
├── css/
│   └── styles.css              # Hệ thống giao diện & hiệu ứng Desktop / Mobile
├── js/
│   ├── config-loader.js        # Đọc config.js, xử lý ?kinhmoi=, render nội dung động
│   ├── sheets-client.js        # Kết nối Google Apps Script & chế độ Demo localStorage
│   └── app.js                  # Tương tác mở thiệp, album, QR, nhạc, form RSVP/lời chúc
├── assets/
│   ├── decor/                  # 19 họa tiết trang trí (.avif)
│   ├── photos/                 # 22 ảnh cưới mẫu (cover, keepsake, 16 ảnh album, 4 ảnh flatlay)
│   ├── audio/                  # Nhạc nền mẫu (ido911.mp3)
│   └── qr/                     # Ảnh QR mẫu (.png/.svg) cho chú rể & cô dâu
├── google-apps-script/
│   └── Code.gs                 # Mã Google Apps Script triển khai Web App cho Google Sheets
├── HUONG_DAN_CAI_DAT.md        # Hướng dẫn chi tiết cách sửa config.js, cài đặt Google Sheets & hosting
└── README.md                   # Tài liệu tổng quan dự án
```

## Bắt đầu nhanh (Quick Start)

1. **Xem trước ngay**: Nhấp đúp vào `index.html` để mở trực tiếp trên trình duyệt (hoặc chạy `npx serve .` để xem qua máy chủ cục bộ).
2. **Thay thông tin cá nhân**: Mở `config.js`, chỉnh sửa tên cô dâu chú rể, gia đình, ngày giờ, địa điểm, ảnh trong `assets/photos/`, nhạc trong `assets/audio/` và thông tin QR trong `assets/qr/`.
3. **Kết nối Google Sheets thực tế** *(tùy chọn)*: Triển khai file `google-apps-script/Code.gs` trong Google Sheets của bạn và dán URL Web App (`/exec`) vào `googleSheets.scriptUrl` trong `config.js`.
4. **Gửi thiệp cá nhân hóa**: Chia sẻ đường link kèm tham số `?kinhmoi=Anh+Minh` (hoặc `?kinhmoi=Gia+%C4%91%C3%ACnh+Anh+Tu%E1%BA%A5n`).

## Tài liệu hướng dẫn chi tiết

Xem đầy đủ từng bước chỉnh sửa `config.js`, thiết lập & kiểm tra Google Sheets (`Code.gs`, `?action=health`, `?action=wishes`, duyệt cột `Approved`), và xuất bản miễn phí lên **GitHub Pages / Netlify / Vercel** tại:

👉 **[HUONG_DAN_CAI_DAT.md](./HUONG_DAN_CAI_DAT.md)**

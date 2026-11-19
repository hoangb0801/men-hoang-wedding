# Hướng Dẫn Cài Đặt & Tùy Chỉnh Thiệp Cưới Song Hỷ

Tài liệu này hướng dẫn từng bước cách thay đổi thông tin cá nhân trong `config.js`, kết nối **Google Sheets** thực tế qua **Google Apps Script (`Code.gs`)** để lưu **RSVP** & **Wishes** (Sổ lưu bút), và xuất bản thiệp cưới miễn phí lên Internet.

---

## Mục lục

1. [Lưu ý nhanh trước khi bắt đầu](#lưu-ý-nhanh-trước-khi-bắt-đầu)
2. [Phần 1: Chỉnh sửa thông tin cá nhân trong `config.js`](#phần-1-chỉnh-sửa-thông-tin-cá-nhân-trong-configjs)
3. [Phần 2: Thiết lập Google Sheets thực tế để lưu RSVP & Lời chúc](#phần-2-thiết-lập-google-sheets-thực-tế-để-lưu-rsvp--lời-chúc)
4. [Phần 3: Xem trước trên máy & xuất bản miễn phí lên Internet](#phần-3-xem-trước-trên-máy--xuất-bản-miễn-phí-lên-internet)

---

## Lưu ý nhanh trước khi bắt đầu

- **Trình soạn thảo & mã hóa UTF-8**: Nên mở `config.js` bằng **VS Code**, **Notepad++** hoặc **Notepad** (Windows) và lưu ở định dạng **UTF-8** để tiếng Việt có dấu hiển thị chính xác.
- **Quy tắc cú pháp trong `config.js`**:
  - Giữ nguyên cặp dấu nháy đơn `'...'` (hoặc nháy kép `"..."`) và dấu phẩy `,` ở cuối mỗi dòng.
  - Nếu bên trong nội dung có dấu nháy đơn (ví dụ `O'Brien`), hãy viết thành `\'` hoặc bọc chuỗi bằng dấu nháy kép `"..."`.
  - Muốn xuống dòng bên trong câu trích dẫn hoặc tiêu đề, dùng ký tự `\n`.
- **Chế độ Demo vs Chế độ Google Sheets thực tế**:
  - Khi `googleSheets.scriptUrl` để trống `''`, thiệp chạy ở **Chế độ Demo**: dữ liệu RSVP và lời chúc lưu tạm trong `localStorage` trên trình duyệt hiện tại và không gửi ra mạng.
  - Khi bạn dán URL Web App (`/exec`) từ Google Apps Script vào `googleSheets.scriptUrl`, mọi xác nhận tham dự (`RSVP`) và lời chúc (`Wishes`) sẽ được lưu và đồng bộ trực tiếp với bảng tính Google Sheets của bạn.

---

## Phần 1: Chỉnh sửa thông tin cá nhân trong `config.js`

Mở file `config.js` ở thư mục gốc của dự án. Toàn bộ thông tin hiển thị trên thiệp được chia thành 19 nhóm rõ ràng bên trong `window.WEDDING_CONFIG`.

### 1.1. Tiêu đề trang, tên cô dâu chú rể & con dấu sáp (`meta`, `couple`)

- **`meta`**:
  - `title`: Tiêu đề hiển thị trên tab trình duyệt (ví dụ `'Trần Mến & Minh Hoàng'`).
  - `description`: Mô tả ngắn khi chia sẻ đường link thiệp lên Zalo, Facebook, Messenger.
  - `lang`: Giữ `'vi'`.
- **`couple`**:
  - `brideShort`, `groomShort`: Tên ngắn hiển thị ở màn hình Hero đầu trang và thiệp mini trong phong bì.
  - `brideFull`, `groomFull`: Họ tên đầy đủ hiển thị ở phần thông báo tiệc cưới (`#v4-announce`).
  - `monogram`: 2 chữ cái viết tắt in nổi trên con dấu sáp (ví dụ `'MH'`). Nếu để trống `''`, hệ thống tự lấy chữ cái đầu của `brideShort` và `groomShort`.
  - `displayOrder`: Chọn `'bride-first'` (Cô dâu trước) hoặc `'groom-first'` (Chú rể trước).
  - `greetingPrefix`: Lời mở đầu trước tên khách mời (mặc định `'Trân trọng kính mời:'`).
  - `defaultGuestName`: Tên mặc định khi link không gắn tham số khách mời (mặc định `'Quý khách'`).
  - `quote`: Câu trích dẫn dưới phần thông tin hai gia đình (dùng `\n` để ngắt dòng).
  - `coverPhoto`: Đường dẫn ảnh polaroid chính lồng trong phong bì đầu trang.

### 1.2. Thông tin hai gia đình (`families`)

Chỉnh sửa `sectionTitle`, `prelude`, `welcomeLine` và hai đối tượng `brideSide` (Nhà gái), `groomSide` (Nhà trai) với các trường `title`, `father`, `mother`, `address`.

- **Mẹo**: Nếu thiệp chỉ tổ chức một bên gia đình, bạn có thể đặt `brideSide: null` hoặc `groomSide: null` (hoặc để trống cả 4 trường bên trong bên đó) — giao diện sẽ tự ẩn cột trống và căn giữa cột còn lại.

### 1.3. Ngày giờ tiệc chính, âm lịch, các nghi lễ, đếm ngược & lịch (`announce`, `ceremonies`, `countdown`, `calendar`)

- **`announce`** (Tiệc mời chính):
  - `eyebrow`, `day` (số ngày lớn), `monthYear` (`'tháng 11 năm 2026'`), `timeText`, `lunarDate`, `receptionTime`.
  - `venueName`: Tên nhà hàng / trung tâm tiệc cưới. Nếu tổ chức tại tư gia và chỉ muốn hiện địa chỉ như bản mẫu, để `venueName: ''`.
  - `address`: Địa chỉ tổ chức tiệc.
  - `mapLabel` & `mapUrl`: Mở Google Maps, tìm địa điểm, nhấn **Chia sẻ (Share) → Sao chép đường liên kết (Copy link)** rồi dán vào `mapUrl`. Nếu để `mapUrl: ''`, nút chỉ đường sẽ tự ẩn.
- **`ceremonies`** (Danh sách các nghi lễ):
  - Là một mảng `[...]`, mỗi mục gồm `title`, `timeText`, `address`, `note`. Bạn có thể thêm hoặc xóa bớt nghi lễ (nếu để `ceremonies: []`, khối nghi lễ sẽ tự ẩn).
- **`countdown`** (Đồng hồ đếm ngược):
  - `targetIso`: Mốc thời gian chuẩn ISO 8601 kèm múi giờ Việt Nam `+07:00`, ví dụ `'2026-11-28T08:00:00+07:00'`.
  - `targetTimeLabel`: Dòng chữ phía trên đồng hồ đếm ngược.
- **`calendar`** (Lịch tháng trái tim & nút Lưu ngày cưới):
  - `year`, `month` (1–12), `highlightDay` (ngày đánh dấu hình trái tim), `weekStartsOn` (`'CN'` hoặc `'T2'`).
  - `googleEvent`: Thông tin khi khách bấm **Google Calendar** hoặc **Apple Calendar** (`.ics`):
    - `startUtc` và `endUtc` dùng giờ **UTC** theo định dạng `YYYYMMDDTHHmmssZ`.
    - **Cách quy đổi giờ Việt Nam (+07:00) sang UTC**: Lấy giờ Việt Nam **trừ đi 7 tiếng**. Ví dụ: `08:00` sáng ngày `28/11/2026` giờ VN = `20261128T010000Z`; `11:00` giờ VN = `20261128T040000Z`.
  - `icsFileName`: Tên file lịch tải về cho Apple Calendar / Outlook.

### 1.4. Thay ảnh cưới (`couple.coverPhoto`, `album.photos`, `keepsake.photo`, `story`)

1. Chép ảnh cưới của bạn vào thư mục `assets/photos/` (khuyên dùng định dạng `.jpg`, `.png`, `.webp` hoặc `.avif`, dung lượng khoảng 200 KB – 1.5 MB/ảnh để khách mở bằng 4G tải nhanh).
2. Giữ nguyên tên file cũ để thay thế trực tiếp, hoặc cập nhật đường dẫn mới trong `config.js`:
   - `couple.coverPhoto`: Ảnh bìa trong phong bì.
   - `album.photos`: Danh sách ảnh trong Album Coverflow 3D & Lightbox (`{ src: './assets/photos/...', alt: '...' }`). Bạn có thể tăng hoặc giảm số lượng ảnh tùy ý.
   - `keepsake.photo`: Ảnh khung kỷ niệm cuối trang.
   - `story.portraitPhoto` và `story.snapshotPhoto`: Hai ảnh trong mục Câu chuyện (khi `story.enabled: true`).

### 1.5. Thay nhạc nền & cắt đoạn phát (`music`)

1. Chép file nhạc `.mp3` vào `assets/audio/` và cập nhật `music.src` (ví dụ `'./assets/audio/bai-hat-cua-ban.mp3'`), đồng thời đổi `music.label` và `music.volume` (`0.0` đến `1.0`).
2. **Cách cắt / lặp đoạn điệp khúc (`startSec`, `endSec`)**:
   - Phát từ đầu đến hết bài rồi lặp lại: đặt `startSec: 0, endSec: 0`.
   - Phát lặp lại một đoạn cụ thể (ví dụ từ giây thứ 45 đến giây thứ 105): đặt `startSec: 45, endSec: 105`.
3. Nếu muốn tắt nhạc nền hoàn toàn, đặt `music.enabled: false`.

### 1.6. Tài khoản ngân hàng & mã QR mừng cưới (`gifts`)

Trong `gifts.accounts`, mỗi tài khoản (Chú rể / Cô dâu) có 2 cách cấu hình ảnh QR:

- **Cách 1 — Dùng ảnh QR tĩnh tự tải từ ứng dụng ngân hàng (Khuyên dùng)**:
  1. Lưu ảnh QR của bạn vào `assets/qr/` (ví dụ `./assets/qr/groom-qr.png` và `./assets/qr/bride-qr.png`).
  2. Điền `bankName`, `accountHolder` (viết hoa không dấu), `accountNumber`, `qrImage`.
  3. **Quan trọng**: Để **`vietQrBankBin: ''`** (chuỗi rỗng). Nếu `vietQrBankBin` có giá trị, hệ thống sẽ ưu tiên gọi ảnh từ `img.vietqr.io` trước rồi mới fallback sang `qrImage`.
- **Cách 2 — Tự động tạo QR động qua VietQR**:
  1. Điền mã BIN 6 chữ số của ngân hàng vào `vietQrBankBin`, điền `accountNumber`, `accountHolder`, và nội dung chuyển khoản mặc định `addInfo`.
  2. Có thể để `qrImage: ''` hoặc giữ ảnh QR cục bộ ở `qrImage` làm ảnh dự phòng khi mất kết nối tới `img.vietqr.io`.

**Bảng mã BIN một số ngân hàng phổ biến:**

| Ngân hàng | Mã BIN (`vietQrBankBin`) | Ngân hàng | Mã BIN (`vietQrBankBin`) |
|---|---|---|---|
| Vietcombank | `970436` | ACB | `970416` |
| VietinBank | `970415` | VPBank | `970432` |
| BIDV | `970418` | TPBank | `970423` |
| Techcombank | `970407` | Sacombank | `970403` |
| MBBank | `970422` | VIB | `970441` |

### 1.7. Bật/tắt các mục tùy chọn & hiệu ứng (`enabled`, `behavior`)

Bạn có thể bật (`true`) hoặc tắt (`false`) từng phần ngay trong `config.js`:

| Khóa cấu hình | Giá trị mặc định | Công dụng |
|---|---|---|
| `story.enabled` | `false` | Hiện mục Câu chuyện tình yêu dạng flatlay |
| `schedule.enabled` | `false` | Hiện timeline Lịch trình buổi lễ trong dải nhung đỏ |
| `guestbook.enabled` | `true` | Hiện mục Sổ lưu bút & danh sách lời chúc |
| `rsvp.enabled` | `true` | Hiện thiệp Xác nhận tham dự (RSVP) |
| `gifts.enabled` | `true` | Hiện Hộp mừng cưới & mã QR |
| `dressCode.enabled` | `false` | Hiện gợi ý màu sắc trang phục (Dresscode) |
| `music.enabled` | `true` | Hiện nút bật/tắt nhạc nền |
| `behavior.enableGateOpening` | `true` | Hiện màn mở bìa cổng 3D lúc mới vào trang |
| `behavior.autoScroll` | `true` | Tự động cuộn nhẹ sau khi mở thiệp (dừng ngay khi khách chạm/cuộn) |
| `behavior.enableFallingPetals` | `true` | Hiệu ứng cánh hoa rơi trang trí |

- **Câu hỏi phụ trong RSVP (`rsvp.customQuestions`)**: Mặc định đang được chú thích (`//`). Bạn có thể bỏ `//` ở đầu các dòng mẫu trong `config.js` để bật câu hỏi *Bạn là khách của* (`Nhà gái` / `Nhà trai`) hoặc *Số người tham dự*. Nếu để `options: []`, hệ thống tự hiển thị ô nhập chữ tự do.

### 1.8. Tạo link mời riêng cho từng khách (`?kinhmoi=`)

Bạn có thể cá nhân hóa lời chào trên bìa cổng và phần đầu thiệp bằng cách thêm `?kinhmoi=` vào cuối đường dẫn trang web:

- Ví dụ:
  - `https://ten-mien-cua-ban/?kinhmoi=Anh+Minh`
  - `https://ten-mien-cua-ban/?kinhmoi=Gia%20%C4%91%C3%ACnh%20Ch%C3%BA%20H%E1%BA%A3i`
  - Dùng dấu `+` hoặc `%20` thay cho khoảng trắng khi gửi link qua tin nhắn/Zalo.
- Khi có `?kinhmoi=...`, thiệp sẽ ghép `couple.greetingPrefix` + tên khách (ví dụ: `Trân trọng kính mời: Anh Minh`). Khi không có tham số này, thiệp hiển thị `couple.defaultGuestName` (`Quý khách`). Tên tham số có thể đổi ở `behavior.guestQueryParam`.

---

## Phần 2: Thiết lập Google Sheets thực tế để lưu RSVP & Lời chúc

Dự án đã cung cấp sẵn file mã kết nối tại `google-apps-script/Code.gs`. Bạn chỉ cần làm theo đúng 10 bước dưới đây:

### Bước 1: Tạo bảng tính Google Sheets mới
1. Đăng nhập tài khoản Google của bạn và truy cập [sheets.google.com](https://sheets.google.com).
2. Nhấn **Trống (Blank)** để tạo một bảng tính mới và đặt tên dễ nhớ (ví dụ: `Thiep Cuoi - RSVP & Loi Chuc`).

### Bước 2: Mở trình soạn thảo Apps Script
Trên thanh menu của bảng tính vừa tạo, chọn **Tiện ích mở rộng (Extensions) → Apps Script**.

### Bước 3: Dán mã từ `google-apps-script/Code.gs`
1. Trong trình soạn thảo Apps Script, xóa toàn bộ đoạn mã mẫu `function myFunction() {}` có sẵn trong file `Code.gs`.
2. Mở file `google-apps-script/Code.gs` trong thư mục dự án, sao chép **toàn bộ nội dung** và dán vào `Code.gs` trên trình duyệt.
3. Nhấn biểu tượng đĩa mềm **Lưu (Ctrl + S)**.

### Bước 4: Triển khai thành Ứng dụng web (Web app)
1. Nhấn nút **Triển khai (Deploy)** ở góc trên bên phải → chọn **Lần triển khai mới (New deployment)**.
2. Ở dòng *Chọn loại (Select type)* (biểu tượng bánh răng), chọn **Ứng dụng web (Web app)**.
3. Điền các thông số sau **chính xác từng mục**:
   - **Mô tả (Description)**: Nhập tùy ý (ví dụ: `Wedding Sheets API v1`).
   - **Thực thi dưới danh nghĩa (Execute as)**: Chọn **Tôi (Me)** (email của bạn).
   - **Người có quyền truy cập (Who has access)**: Bắt buộc chọn **Bất kỳ ai (Anyone)** *(để khách mời mở thiệp trên điện thoại không cần đăng nhập Google vẫn gửi được RSVP và lời chúc)*.

### Bước 5: Ủy quyền truy cập (Authorize access)
1. Nhấn **Triển khai (Deploy)** → nhấn **Ủy quyền truy cập (Authorize access)**.
2. Chọn tài khoản Google của bạn.
3. Nếu Google hiện cảnh báo *"Google hasn't verified this app"* (*Google chưa xác minh ứng dụng này*), nhấn **Nâng cao (Advanced)** → nhấn **Đi tới ... (không an toàn) / Go to ... (unsafe)** → nhấn **Cho phép (Allow)**. *(Đây là script do chính bạn tạo trong tài khoản cá nhân của mình nên hoàn toàn an toàn).*

### Bước 6: Sao chép URL Web App (`/exec`)
Sau khi triển khai xong, màn hình sẽ hiện mục **URL ứng dụng web (Web app URL)** có dạng:
```text
https://script.google.com/macros/s/AKfycb.../exec
```
Nhấn **Sao chép (Copy)** URL này. *(Lưu ý: URL hợp lệ luôn kết thúc bằng `/exec`, không phải `/dev`).*

### Bước 7: Gắn `scriptUrl` vào `config.js`
Mở `config.js`, cuộn xuống mục `19. KẾT NỐI GOOGLE SHEETS` (`googleSheets`), dán URL vừa sao chép vào trường `scriptUrl`:
```js
  googleSheets: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycb.../exec',
    timeoutMs: 10000,
    fallbackToDemo: true,
    demoNotice: '...'
  }
```
Lưu file `config.js` lại.

### Bước 8: Kiểm tra kết nối nhanh
1. Mở một tab trình duyệt mới và truy cập:
   - `URL_CUA_BAN?action=health` → Phải hiển thị JSON dạng `{"ok":true,"service":"thiep-cuoi-sheets",...}`.
   - `URL_CUA_BAN?action=wishes` → Phải hiển thị `{"ok":true,"wishes":[...]}`.
   - Lúc này quay lại bảng tính Google Sheets, bạn sẽ thấy `Code.gs` đã tự động tạo sẵn 2 tab **`RSVP`** và **`Wishes`** với hàng tiêu đề chuẩn.
2. Mở trang thiệp cưới (nhấn F5 tải lại nếu đang mở):
   - Dòng thông báo *"Chế độ xem trước (Demo)"* sẽ tự động biến mất.
   - Gửi thử 1 xác nhận tham dự ở mục **Xác nhận tham dự (RSVP)** và 1 lời chúc ở **Sổ lưu bút**.
   - Kiểm tra bảng tính Google Sheets xem dòng dữ liệu mới đã xuất hiện trong tab **`RSVP`** và **`Wishes`** chưa, sau đó tải lại trang thiệp xem lời chúc vừa gửi có hiển thị lại không.

### Bước 9: Quản lý & duyệt/ẩn lời chúc bằng cột `Approved`
- Tab **`RSVP`** gồm các cột: `Timestamp`, `Name`, `Phone`, `Side`, `Attendance`, `Guests`, `Note`, `Answers`.
- Tab **`Wishes`** gồm các cột: `Timestamp`, `Id`, `Name`, `Relation`, `Message`, `Approved`.
- Mỗi lời chúc mới gửi lên mặc định có `Approved = TRUE` (hiển thị ngay trên thiệp). Nếu muốn **ẩn** một lời chúc không mong muốn, bạn chỉ cần sửa ô `Approved` ở dòng tương ứng thành `FALSE` (hoặc `0` / `no`) mà không cần xóa dòng — khi khách tải lại thiệp, lời chúc đó sẽ không còn hiển thị.

### Bước 10: Xử lý sự cố thường gặp
- **Đã sửa `Code.gs` nhưng không thấy thay đổi**: Trong Apps Script, nếu bạn sửa mã rồi chỉ bấm `Ctrl + S`, bản `/exec` đang chạy sẽ chưa cập nhật. Bạn phải vào **Triển khai (Deploy) → Quản lý các lần triển khai (Manage deployments) → biểu tượng Chỉnh sửa (bút chì) → Phiên bản (Version): Phiên bản mới (New version) → Triển khai (Deploy)**.
- **Bị lỗi 401/403 hoặc chuyển sang trang đăng nhập Google**: Kiểm tra lại Bước 4, đảm bảo *Người có quyền truy cập (Who has access)* đã chọn **Bất kỳ ai (Anyone)** chứ không phải *Chỉ mình tôi*.
- **Trang thiệp vẫn hiện thông báo Demo**: Kiểm tra lại `googleSheets.scriptUrl` trong `config.js` xem đã lưu file chưa, URL có kết thúc bằng `/exec` không, và có chứa ký tự placeholder (`YOUR_`, `EXAMPLE`, `<...>`) hoặc khoảng trắng thừa không.
- **Lỗi quá thời gian (timeout)**: Mặc định `timeoutMs` là `10000` (10 giây). Khi mạng yếu hoặc Google Apps Script khởi động lạnh (cold start), bạn có thể tăng lên `15000`.

---

## Phần 3: Xem trước trên máy & xuất bản miễn phí lên Internet

Dự án viết bằng HTML/CSS/JavaScript thuần 100%, **không cần cài `node_modules` hay công cụ build**.

### 3.1. Mở xem trực tiếp (`file://`)
- Nhấp đúp trực tiếp vào file `index.html` để mở ngay bằng Google Chrome, Microsoft Edge hoặc Safari.
- Cả chế độ Demo (`localStorage`) lẫn kết nối Google Sheets đều hoạt động bình thường trên `file://`.

### 3.2. Chạy máy chủ cục bộ (khuyên dùng khi kiểm thử trên điện thoại cùng Wi-Fi)
Tại thư mục gốc chứa `index.html`, mở Terminal / PowerShell và chạy một trong hai lệnh sau:
- **Nếu máy có Node.js**:
  ```bash
  npx serve .
  ```
- **Nếu máy có Python**:
  ```bash
  python -m http.server 8080
  ```
*(Lưu ý: Không chạy `npm init` hay cài `node_modules` vào bên trong thư mục dự án để giữ mã nguồn gọn sạch khi upload hosting).*

### 3.3. Xuất bản miễn phí lên Internet

#### Cách A: GitHub Pages (Miễn phí, ổn định lâu dài)
1. Tạo tài khoản tại [github.com](https://github.com) và tạo một repository mới (Public).
2. Tải lên toàn bộ các file và thư mục (`index.html`, `config.js`, `css/`, `js/`, `assets/`, `google-apps-script/`, v.v. — giữ nguyên cấu trúc thư mục).
3. Vào **Settings → Pages → Build and deployment → Source: Deploy from a branch**, chọn nhánh `main` và thư mục `/ (root)` → nhấn **Save**.
4. Chờ 1–2 phút, GitHub sẽ cấp đường dẫn dạng `https://ten-tai-khoan.github.io/ten-repo/`.

#### Cách B: Netlify Drop (Nhanh nhất, không cần biết Git)
1. Truy cập [app.netlify.com/drop](https://app.netlify.com/drop) và đăng nhập miễn phí.
2. Kéo và thả **toàn bộ thư mục dự án** vào khung tải lên trên trình duyệt.
3. Sau vài giây bạn sẽ có ngay đường link `https://....netlify.app` (có thể đổi tên miền phụ trong *Site configuration*).

#### Cách C: Vercel
1. Đăng nhập [vercel.com](https://vercel.com) → **Add New → Project** (import từ GitHub repo của bạn hoặc dùng lệnh `npx vercel --prod`).
2. Vì dự án là web tĩnh thuần, giữ nguyên *Root Directory* là `./`, để trống *Build Command* và *Output Directory* → nhấn **Deploy**.

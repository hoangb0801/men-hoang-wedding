/**
 * ============================================================================
 * CẤU HÌNH THIỆP CƯỚI CÁ NHÂN (window.WEDDING_CONFIG)
 * ============================================================================
 * Hướng dẫn nhanh cho người dùng:
 * 1. Bạn chỉ cần chỉnh sửa nội dung bên trong file này (giữ nguyên dấu nháy ''
 *    và dấu phẩy , ở cuối mỗi dòng).
 * 2. Để xuống dòng trong câu trích dẫn hoặc lời nhắn, dùng ký tự \n.
 * 3. Để bật/tắt một mục (Câu chuyện, Lịch trình, Sổ lưu bút, RSVP, Hộp mừng cưới,
 *    Dresscode), đổi `enabled: true` (bật) hoặc `enabled: false` (tắt).
 * 4. Để lưu RSVP & Lời chúc thực tế vào Google Sheets riêng, dán URL Web App
 *    vào `googleSheets.scriptUrl` ở cuối file (xem HUONG_DAN_CAI_DAT.md).
 * 5. File này là script thuần (classic script), mở trực tiếp index.html qua
 *    file:// hoặc đưa lên hosting tĩnh (GitHub Pages, Netlify, Vercel...) đều
 *    chạy ngay mà không cần build.
 * ============================================================================
 */
window.WEDDING_CONFIG = {
  // 1. THÔNG TIN SEO & TIÊU ĐỀ TAB TRÌNH DUYỆT
  meta: {
    title: 'Minh Hoàng & Trần Mến', // Tiêu đề hiển thị trên tab trình duyệt
    description: 'Trân trọng kính mời bạn đến chung vui cùng chúng tôi trong ngày trọng đại!', // Mô tả ngắn khi chia sẻ liên kết
    lang: 'vi' // Mã ngôn ngữ HTML ('vi')
  },

  // 2. THÔNG TIN CÔ DÂU & CHÚ RỂ
  couple: {
    brideShort: 'Minh Hoàng',       // Tên cô dâu hiển thị ngắn (trên tiêu đề hero & thiệp mini)
    groomShort: 'Trần Mến',     // Tên chú rể hiển thị ngắn
    brideFull: 'Minh Hoàng',        // Họ tên đầy đủ cô dâu (có thể đổi thành VD: 'Trần Thị Mến')
    groomFull: 'Trần Mến',      // Họ tên đầy đủ chú rể (có thể đổi thành VD: 'Bùi Minh Hoàng')
    monogram: 'HM',               // 2 chữ cái viết tắt in nổi trên con dấu sáp (Wax Seal)
    displayOrder: 'bride-first',  // Thứ tự hiển thị: 'bride-first' (Cô dâu trước) hoặc 'groom-first' (Chú rể trước)
    greetingPrefix: 'Trân trọng kính mời:', // Lời chào trước tên khách mời (kết hợp tham số ?kinhmoi=...)
    defaultGuestName: 'Quý khách', // Tên hiển thị mặc định khi URL không có ?kinhmoi=...
    quote: 'Love makes\neverything beautiful.', // Câu trích dẫn dưới phần thông tin hai gia đình
    coverPhoto: './assets/photos/cover.png'   // Ảnh polaroid chính lồng trong phong bì đầu trang
  },

  // 3. THÔNG TIN HAI GIA ĐÌNH (NHÀ GÁI & NHÀ TRAI)
  families: {
    sectionTitle: 'Thông tin lễ cưới',       // Tiêu đề mục hai gia đình
    prelude: 'Hai mái nhà, một gia đình',    // Dòng dẫn phía trên hai cột nhà gái / nhà trai
    welcomeLine: 'Chúng tôi rất hân hạnh được đón tiếp bạn trong ngày vui của gia đình.', // Lời chào đón bên dưới hai gia đình
    brideSide: {
      title: 'Nhà trai',                     // Nhãn cột nhà trai
      father: 'Ông: Bùi Ngọc Ánh',           // Họ tên bố chú rể
      mother: 'Bà: Đào Thị Sen',             // Họ tên mẹ chú rể
      address: 'Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc' // Địa chỉ tư gia nhà trai
    },
    groomSide: {
      title: 'Nhà gái',                      // Nhãn cột nhà gái
      father: 'Ông: Trần Văn Hải',           // Họ tên bố cô dâu
      mother: 'Bà: Bùi Thị Lên',             // Họ tên mẹ cô dâu
      address: '02 ngách 12 ngõ 563 Thọ Sơn, Đại Nghĩa, Mỹ Đức, Hà Nội' // Địa chỉ tư gia nhà gái
    }
  },

  // 4. THÔNG BÁO TIỆC MỪNG CHÍNH & CHỈ ĐƯỜNG GOOGLE MAPS
  announce: {
    eyebrow: 'Kính mời tham dự tiệc chung vui của gia đình chúng tôi', // Dòng tiêu đề nhỏ phía trên tên cô dâu chú rể
    day: '27',                    // Ngày diễn ra tiệc chính (hiển thị chữ số lớn)
    monthYear: 'tháng 11 năm 2026', // Tháng và năm diễn ra tiệc chính
    timeText: 'Vào lúc 16:00, Thứ Sáu', // Giờ và thứ của buổi tiệc
    lunarDate: '( Tức ngày 19 tháng 10 năm Bính Ngọ )', // Ngày âm lịch tương ứng
    receptionTime: 'Đón khách: 16:00', // Giờ đón khách
    venueName: '',                // Tên nhà hàng / địa điểm (để '' nếu chỉ hiện địa chỉ như bản mẫu)
    address: 'Gần cổng chợ Rưng, Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc', // Địa chỉ tổ chức tiệc chính
    mapLabel: 'Chỉ đường',        // Chữ hiển thị trên nút mở bản đồ
    mapUrl: 'https://maps.app.goo.gl/4ki7YdR6wDFitKFh7' // Đường dẫn Google Maps
  },

  // 5. DANH SÁCH CÁC NGHI LỄ (CÓ THỂ THÊM HOẶC BỚT PHẦN TỬ TRONG MẢNG)
  ceremonies: [
    {
      title: 'Lễ thành hôn (nhà trai)', // Tên nghi lễ
      timeText: '11:05 · Thứ Bảy, 28 tháng 11, 2026', // Thời gian diễn ra nghi lễ
      address: 'Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc', // Địa điểm diễn ra nghi lễ
      note: 'Ngày chung đôi của chúng mình ❤️' // Ghi chú nhỏ bên dưới địa chỉ
    },
    {
      title: 'Lễ vu quy (nhà gái)',
      timeText: '08:00 · Thứ Bảy, 28 tháng 11, 2026',
      address: '02 ngách 12 ngõ 563 Thọ Sơn, Đại Nghĩa, Mỹ Đức, HN',
      note: 'Ngày chung đôi của chúng mình ❤️'
    }
  ],

  // 6. ĐỒNG HỒ ĐẾM NGƯỢC TỚI GIỜ LÀM LỄ
  countdown: {
    targetIso: '2026-11-28T08:00:00+07:00', // Mốc thời gian đích chuẩn ISO 8601 kèm múi giờ +07:00 (Việt Nam)
    targetTimeLabel: 'Đếm ngược tới ngày cưới' // Tiêu đề phía trên bộ đếm ngày/giờ/phút/giây
  },

  // 7. LỊCH THÁNG ĐÁNH DẤU TRÁI TIM & NÚT "LƯU NGÀY CƯỚI"
  calendar: {
    year: 2026,                   // Năm hiển thị trên lịch tháng
    month: 11,                    // Tháng hiển thị (từ 1 đến 12)
    highlightDay: 28,             // Ngày trọng đại được đánh dấu hình trái tim
    weekStartsOn: 'CN',           // Ngày bắt đầu tuần: 'CN' (Chủ Nhật) hoặc 'T2' (Thứ Hai)
    googleEvent: {
      title: 'Đám cưới Minh Hoàng & Trần Mến', // Tiêu đề sự kiện khi lưu vào Google Calendar
      startUtc: '20261128T010000Z', // Giờ bắt đầu theo chuẩn UTC (08:00 giờ VN = 01:00Z)
      endUtc: '20261128T040000Z',   // Giờ kết thúc theo chuẩn UTC (11:00 giờ VN = 04:00Z)
      details: 'Gần cổng chợ Rưng, Khu 5 , Tứ Trưng, Vĩnh Tường, Vĩnh Phúc',                  // Mô tả thêm cho sự kiện lịch (để '' nếu không cần)
      location: '02 ngách 12 ngõ 563 Thọ Sơn, Đại Nghĩa, Mỹ Đức, Hà Nội' // Địa điểm gắn trên lịch
    },
    icsFileName: 'Đám cưới Minh Hoàng & Trần Mến.ics' // Tên file .ics tải về cho Apple Calendar / Outlook
  },

  // 8. LỊCH TRÌNH BUỔI LỄ (TÙY CHỌN — ĐẶT enabled: true ĐỂ HIỂN THỊ TRONG DẢI NHUNG ĐỎ)
  schedule: {
    enabled: false,               // false = ẩn để giữ nguyên bố cục /i/hoang-men; true = hiển thị timeline
    title: 'Lịch trình buổi lễ',  // Tiêu đề mục lịch trình
    items: [
      {
        time: '08:00',            // Mốc giờ
        title: 'Lễ vu quy (nhà gái)', // Tên hoạt động
        description: 'Làm lễ gia tiên tại tư gia nhà gái' // Mô tả ngắn
      },
      {
        time: '11:05',
        title: 'Lễ thành hôn (nhà trai)',
        description: 'Đón dâu và cử hành lễ thành hôn tại nhà trai'
      },
      {
        time: '16:00',
        title: 'Đón khách',
        description: 'Chụp ảnh lưu niệm cùng gia đình và bạn bè'
      },
      {
        time: '17:30',
        title: 'Tiệc mừng',
        description: 'Khai tiệc chung vui cùng hai gia đình'
      }
    ]
  },

  // 9. CÂU CHUYỆN TÌNH YÊU (TÙY CHỌN — ĐẶT enabled: true ĐỂ HIỂN THỊ BỐ CỤC FLATLAY)
  story: {
    enabled: false,               // false = ẩn để giữ nguyên bố cục /i/hoang-men; true = hiển thị mục Câu chuyện
    eyebrow: 'Câu chuyện của chúng tôi', // Tiêu đề nhỏ phía trên
    headline: 'Và những ngày sau,\nvẫn cùng nhau.', // Tiêu đề chữ viết tay chính
    body: 'Từ những lần gặp gỡ tình cờ, đến một hành trình đầy yêu thương. Cảm ơn vì đã luôn ở đây, cùng nhau viết tiếp những chương mới.', // Đoạn văn kể chuyện
    portraitPhoto: './assets/photos/anh-cuoi-can-canh.avif', // Ảnh tròn trong bố cục flatlay
    snapshotPhoto: './assets/photos/anh-cuoi-tung-hoa.avif', // Ảnh chụp ngang kèm lịch mini
    linkLabel: 'Chi tiết'         // Chữ liên kết cuộn tới phần thông báo tiệc
  },

  // 10. ALBUM ẢNH CƯỚI (COVERFLOW 3D + LIGHTBOX PHÓNG TO)
  album: {
    title: 'Album ảnh cưới',      // Tiêu đề mục album
    caption: 'Những khoảnh khắc chúng mình muốn giữ mãi.', // Dòng chú thích chữ viết tay
    photos: [
      { src: './assets/photos/gallery-01.png', alt: 'Ảnh cưới 1' },
      { src: './assets/photos/gallery-02.png', alt: 'Ảnh cưới 2' },
      { src: './assets/photos/gallery-03.png', alt: 'Ảnh cưới 3' },
      { src: './assets/photos/gallery-04.png', alt: 'Ảnh cưới 4' },
      { src: './assets/photos/gallery-05.png', alt: 'Ảnh cưới 5' },
      { src: './assets/photos/gallery-06.png', alt: 'Ảnh cưới 6' },
      { src: './assets/photos/gallery-07.png', alt: 'Ảnh cưới 7' },
      { src: './assets/photos/gallery-08.png', alt: 'Ảnh cưới 8' },
      { src: './assets/photos/gallery-09.png', alt: 'Ảnh cưới 9' },
      { src: './assets/photos/gallery-10.png', alt: 'Ảnh cưới 10' },
      { src: './assets/photos/gallery-11.png', alt: 'Ảnh cưới 11' },
      { src: './assets/photos/gallery-12.png', alt: 'Ảnh cưới 12' },
      { src: './assets/photos/gallery-13.png', alt: 'Ảnh cưới 13' },
      { src: './assets/photos/gallery-14.png', alt: 'Ảnh cưới 14' },
      { src: './assets/photos/gallery-15.png', alt: 'Ảnh cưới 15' },
      { src: './assets/photos/gallery-16.png', alt: 'Ảnh cưới 16' }
    ]
  },

  // 11. SỔ LƯU BÚT / GỬI LỜI CHÚC (BẬT MẶC ĐỊNH ĐỂ DÙNG VỚI GOOGLE SHEETS HOẶC DEMO)
  guestbook: {
    enabled: true,                // true = bật sổ lưu bút; false = ẩn
    title: 'Sổ lưu bút',          // Tiêu đề mục sổ lưu bút
    subtitle: 'Để lại một lời chúc cho cô dâu chú rể nhé.', // Lời nhắn gợi mở
    namePlaceholder: 'Nhập tên của bạn*',       // Chữ gợi ý ô nhập tên
    messagePlaceholder: 'Nhập lời chúc của bạn*', // Chữ gợi ý ô nhập lời chúc
    submitLabel: 'Gửi lời chúc',  // Chữ trên nút gửi lời chúc
    suggestLabel: 'Gợi ý một lời chúc', // Nhãn trợ năng cho nút cây đũa thần gợi ý
    suggestedWishes: [            // Danh sách câu chúc gợi ý xoay vòng khi bấm nút gợi ý
      'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương như ngày đầu!',
      'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường.',
      'Mừng ngày trọng đại! Chúc hai bạn cười nhiều hơn giận, yêu nhiều hơn mỗi ngày.',
      'Chúc gia đình nhỏ luôn ấm áp, bình an và tràn đầy tiếng cười.'
    ],
    sampleWishes: [               // Các lời chúc mẫu hiển thị sẵn khi chạy ở chế độ Demo
      {
        id: 'sample-1',
        name: 'Bạn Hoàng',
        relation: 'Bạn thân chú rể',
        message: 'Chúc 2 bạn mãi yêu nhau, đầu bạc răng long!',
        createdAt: '2026-11-04T13:44:00+07:00'
      },
      {
        id: 'sample-2',
        name: 'Hoài Nam',
        relation: 'Đồng nghiệp',
        message: 'Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường!',
        createdAt: '2026-11-04T13:43:00+07:00'
      },
      {
        id: 'sample-3',
        name: 'Chị Huyền',
        relation: 'Gia đình nhà gái',
        message: 'Chúc hai em trăm năm hạnh phúc, vợ chồng đồng lòng.',
        createdAt: '2026-11-04T13:42:00+07:00'
      }
    ]
  },

  // 12. XÁC NHẬN THAM DỰ (RSVP)
  rsvp: {
    enabled: true,                // true = bật biểu mẫu RSVP; false = ẩn
    title: 'Xác nhận tham dự',    // Tiêu đề thiệp RSVP
    intro: 'Cô dâu chú rể rất mong được đón bạn. Hãy cho chúng mình biết bạn có đến được không nhé.', // Lời mời xác nhận
    namePlaceholder: 'Nhập tên của bạn*', // Chữ gợi ý ô nhập tên khách
    attendYesLabel: 'Mình sẽ đến', // Lựa chọn đồng ý tham dự
    attendNoLabel: 'Rất tiếc, mình không đến được', // Lựa chọn báo vắng
    submitLabel: 'Gửi xác nhận',  // Chữ trên nút gửi xác nhận
    customQuestions: [            // Câu hỏi phụ tùy chọn (bỏ chú thích bên dưới nếu muốn thêm câu hỏi)
      // { id: 'side', label: 'Bạn là khách của', options: ['Nhà gái', 'Nhà trai', 'Cả hai bên'] },
      // { id: 'guests', label: 'Số người tham dự', options: ['1 người', '2 người', 'Đi cùng gia đình'] }
    ]
  },

  // 13. HỘP MỪNG CƯỚI & MÃ QR CHUYỂN KHOẢN
  gifts: {
    enabled: false,                // true = bật hộp mừng cưới; false = ẩn
    title: 'Hộp mừng cưới',       // Tiêu đề mục mừng cưới
    subtitle: 'Nếu không tới dự được, bạn có thể gửi lời chúc qua đây.', // Lời nhắn dưới tiêu đề
    accounts: [
      {
        id: 'groom',              // Mã định danh tài khoản
        roleLabel: 'Chú rể',      // Nhãn hiển thị dưới phong bì
        bankName: 'Vietcombank',  // Tên ngân hàng
        accountHolder: 'BUI MINH HOANG', // Tên chủ tài khoản (viết hoa không dấu)
        accountNumber: '0123456789',     // Số tài khoản
        qrImage: './assets/qr/groom-qr.png', // Đường dẫn ảnh QR cục bộ (hoặc thay bằng ảnh QR ngân hàng của bạn)
        vietQrBankBin: '',        // Mã BIN ngân hàng VietQR (VD Vietcombank: '970436') nếu để qrImage: ''
        addInfo: 'Mung cuoi Minh Hoang & Tran Men' // Nội dung chuyển khoản gợi ý
      },
      {
        id: 'bride',
        roleLabel: 'Cô dâu',
        bankName: 'Vietcombank',
        accountHolder: 'TRAN THI MEN',
        accountNumber: '9876543210',
        qrImage: './assets/qr/bride-qr.png',
        vietQrBankBin: '',
        addInfo: 'Mung cuoi Minh Hoang & Tran Men'
      }
    ]
  },

  // 14. DRESSCODE / TRANG PHỤC GỢI Ý (TÙY CHỌN — ĐẶT enabled: true ĐỂ HIỂN THỊ)
  dressCode: {
    enabled: false,               // false = ẩn để giữ bố cục /i/hoang-men; true = hiển thị bảng màu gợi ý
    title: 'Dresscode',           // Tiêu đề mục dresscode
    description: 'Sắc đỏ rượu vang, ngà và kem', // Mô tả trang phục gợi ý
    colors: [                     // Các ô màu gợi ý
      { name: 'Đỏ rượu vang', hex: '#6d1a24' },
      { name: 'Ngà ấm', hex: '#e9dfd1' },
      { name: 'Kem giấy dó', hex: '#f8f3ec' }
    ]
  },

  // 15. KHUNG ẢNH KỶ NIỆM (KEEPSAKE)
  keepsake: {
    photo: './assets/photos/keepsake.png', // Đường dẫn ảnh trong khung kỷ niệm cuối trang
    caption: 'A lifetime\nof love, in every detail.' // Dòng chữ viết tay dưới khung ảnh
  },

  // 16. LỜI CẢM ƠN CUỐI THIỆP (CLOSING)
  closing: {
    scriptTitle: 'Thank you',     // Dòng chữ cảm ơn lớn kiểu viết tay
    message: 'Cảm ơn bạn đã đến và cùng chúng mình viết nên một phần thật đẹp trong ngày đặc biệt này.', // Lời cảm ơn
    dateText: '27.11.2026'        // Ngày kỷ niệm hiển thị ở chân thiệp
  },

  // 17. NHẠC NỀN
  music: {
    enabled: true,                // true = bật nút nhạc nền; false = tắt nhạc hoàn toàn
    src: './assets/audio/ido911.mp3', // Đường dẫn file nhạc MP3 cục bộ
    volume: 0.3,                  // Âm lượng phát từ 0.0 đến 1.0 (bản mẫu: 0.3)
    startSec: 0,                  // Giây bắt đầu phát (0 = phát từ đầu bài)
    endSec: 0,                    // Giây kết thúc vòng lặp (0 = phát hết bài rồi lặp lại)
    label: 'I Do - 911'           // Tên bài hát hiển thị cho trợ năng (aria-label)
  },

  // 18. HÀNH VI & HIỆU ỨNG TƯƠNG TÁC
  behavior: {
    enableGateOpening: true,      // true = hiện bìa cổng mở thiệp 3D khi mới vào trang
    autoScroll: true,             // true = tự động cuộn nhẹ sau khi mở thiệp (tự dừng ngay khi khách chạm/cuộn)
    enableFallingPetals: true,    // true = bật hiệu ứng cánh hoa rơi trang trí
    guestQueryParam: 'kinhmoi'    // Tên tham số URL để cá nhân hóa tên khách (VD: ?kinhmoi=Anh+Minh)
  },

  // 19. KẾT NỐI GOOGLE SHEETS (LƯU RSVP & SỔ LƯU BÚT THỰC TẾ)
  googleSheets: {
    // Dán URL Web App Google Apps Script vào đây (VD: 'https://script.google.com/macros/s/.../exec').
    // Khi để trống '', trang tự động chạy chế độ Demo (lưu tạm trong localStorage của trình duyệt).
    scriptUrl: 'https://script.google.com/macros/s/AKfycbyOfoiVocWA8yubjPqX5JSB2xOWQLEZ8x5YwC8la8fYuH8yZlBCbiZyA0-22gisk4Dl/exec',
    timeoutMs: 10000,             // Thời gian chờ phản hồi tối đa từ Google Sheets (ms)
    fallbackToDemo: true,         // true = nếu chưa cấu hình scriptUrl hoặc mất mạng sẽ chuyển sang chế độ Demo an toàn
    demoNotice: 'Chế độ xem trước (Demo): Dữ liệu đang lưu tạm trên trình duyệt này. Xem HUONG_DAN_CAI_DAT.md để kết nối Google Sheets thực tế.' // Thông báo khi chạy ở chế độ Demo
  }
};

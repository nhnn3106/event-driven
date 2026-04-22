Bài toán: Movie Ticket System
Một hệ thống đặt vé xem phim với yêu cầu xử lý bất đồng bộ (asynchronous) để đảm
bảo hệ thống scalable.
❖ Yêu cầu chức năng:
• Quản lý phim:
• Xem danh sách phim
• Thêm / sửa phim
• Quản lý người dùng:
• Đăng ký / đăng nhập
• Đặt vé:
• Chọn phim + số ghế
• Tạo booking
• Thanh toán:
• Thanh toán vé (giả lập)
• Cập nhật trạng thái booking
• Thông báo
• Gửi thông báo khi đặt vé thành công
❖ Yêu cầu kiến trúc:
Áp dụng Event-Driven Architecture:
• Các service KHÔNG gọi trực tiếp nhau
• Giao tiếp qua Message Broker (Kafka / RabbitMQ / Redis PubSub)
Luồng event chính:
User → Booking Service → (Publish Event)
→ Payment Service (Consume)
→ Notification Service (Consume)
Danh sách Event:
Event Mô tả
USER_REGISTERED Người dùng đăng ký
BOOKING_CREATED Tạo booking
PAYMENT_COMPLETED Thanh toán xong
BOOKING_FAILED Thanh toán thất bại
Phân công 5 người:
❖ Người 1– Frontend (ReactJS)
UI:
Login/Register
• Danh sách phim
• Đặt vé
Gọi API chỉ vào 1 service (Gateway hoặc Booking Service)
Không gọi trực tiếp tất cả service
❖ Người 2 – User Service (Spring Boot)
API:
• POST /register
• POST /login
Khi đăng ký:
• Publish event: USER_REGISTERED
❖ Người 3 – Movie Service
API:
• GET /movies
• POST /movies
Yêu cầu:
• Không cần event phức tạp
❖ Người 4 – Booking Service (CORE)
API:
• POST /bookings
• GET / bookings
Khi tạo booking:
• Publish event: BOOKING_CREATED
KHÔNG xử lý payment trực tiếp
❖ Người 5 – Payment + Notification Service
Payment:
• Listen: BOOKING_CREATED
• Xử lý: Random success/fail
• Publish:
PAYMENT_COMPLETED hoặc BOOKING_FAILED
Notification:
• Listen: PAYMENT_COMPLETED
• Output: "Booking #123 thành công!"
Notification:
• Gọi API hoặc log:
User A đã đặt đơn #123 thành công
Mô hình triển khai trên LAN:
Service IP
User 192.168.?.?:8081
Movie 192.168.?.?:8082
Booking 192.168.?.?:8083
Payment 192.168.?.?:8084
Frontend 192.168.?.?:8085
Broker chạy riêng:
Kafka / RabbitMQ: 192.168.?.?:9092
Kịch bản Test (BẮT BUỘC DEMO)
1. User đăng ký → log event
2. Chọn phim→ đặt vé
3. Payment xử lý
4. Notification hiển thị kết quả
Bonus (nếu làm nhanh)
1. Dead Letter Queue
2. Retry mechanism
3. Event log (lưu lịch sử event)
4. Dashboard realtimeAPI Gateway (Spring Cloud Gateway)
Tiêu chí chấm điểm
Tiêu chí Điểm
Đúng Event-Driven 3
Publish/Consume đúng 2.5
Flow hoạt động end-to-end 2
Không gọi trực tiếp service 1.5
Demo + log rõ ràng 1
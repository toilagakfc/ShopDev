const Contact = require("../../models/contact.model");
const contactMailHelper = require("../../helpers/sendMail.helper");

module.exports.index = async (req, res) => {
    try {
        const { fullName, email, phone, content } = req.body;
        // vị trí tự động tăng
        const maxPositionContact = await Contact.findOne({
            attributes: ["position"],
            order: [["position", "DESC"]]
        });
        let newPosition = 1;
        if (maxPositionContact) {
            newPosition = maxPositionContact.position + 1;
        }
        // data liện hệ
        const dataContact = {
            fullName,
            email,
            phone,
            content,
            status: 1,
            position: newPosition
        };
        const subject = "Thông tin liên hệ mới";
        const text = `Họ tên: ${fullName}\nEmail: ${email}\nSố điện thoại: ${phone}\nNội dung: ${content}`;
        contactMailHelper.contactMail(email, subject, text);

        // Lấy position lớn nhất hiện có
        const newContact = await Contact.create(dataContact);

        // trả ra các trường cần dùng
        const responseData = {
            id: newContact.id,
            fullName: newContact.fullName,
            email: newContact.email,
            phone: newContact.phone,
            content: newContact.content,
            position: newContact.position,
            createdAt: newContact.createdAt
        };

        res.status(201).json({
            code: "success",
            message: "Gửi thông tin liên hệ thành công!",
            contact: responseData
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}
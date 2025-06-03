import React from 'react';

const ContactSection = () => {
  return (
    <section id="contactSection" className="contactSection">
      <div className="contactContainer">
        <div className="contactForm scroll-animation slide-in-left">
          <h2 className="sectionTitle">Liên Hệ Với Chúng Tôi</h2>
          <p className="contactSubtitle">Bạn có câu hỏi? Chúng tôi rất muốn lắng nghe từ bạn.</p>
          <form>
            <div className="formGroup">
              <input type="text" placeholder="Họ và Tên" className="formInput" />
            </div>
            <div className="formGroup">
              <input type="email" placeholder="Địa Chỉ Email" className="formInput" />
            </div>
            <div className="formGroup">
              <textarea placeholder="Tin Nhắn Của Bạn" className="formTextarea"></textarea>
            </div>
            <button type="submit" className="submitButton">Gửi Tin Nhắn</button>
          </form>
        </div>
        <div className="contactInfo scroll-animation slide-in-right">
          <h3>Thông Tin Liên Hệ</h3>
          <div className="infoItem">
            <span className="infoIcon locationIcon"></span>
            <span className="infoText">123 Đường Thiên Nhiên, Quận Xanh, TP. Hồ Chí Minh</span>
          </div>
          <div className="infoItem">
            <span className="infoIcon phoneIcon"></span>
            <span className="infoText">(028) 3456-7890</span>
          </div>
          <div className="infoItem">
            <span className="infoIcon emailIcon"></span>
            <span className="infoText">info@coconature.com</span>
          </div>
          <div className="socialLinks">
            <button className="socialIcon facebookIcon" aria-label="Facebook"></button>
            <button className="socialIcon instagramIcon" aria-label="Instagram"></button>
            <button className="socialIcon twitterIcon" aria-label="Twitter"></button>
            <button className="socialIcon youtubeIcon" aria-label="Youtube"></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

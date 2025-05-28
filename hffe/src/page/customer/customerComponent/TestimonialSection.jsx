import React from 'react';

const TestimonialSection = () => {
  // This data could come from context in a real app
  const testimonials = [
    {
      stars: '★★★★★',
      text: '"Tôi rất thích ly rượu từ dừa này! Nó độc đáo, bền và làm cho đồ uống của tôi thậm chí còn ngon hơn."',
      authorName: 'Thu Hương'
    },
    {
      stars: '★★★★★',
      text: '"Hộp đựng từ dừa thật tuyệt vời để lưu trữ. Nhỏ gọn, tự nhiên và trông rất đẹp trên kệ bếp của tôi."',
      authorName: 'Minh Tâm'
    },
    {
      stars: '★★★★★',
      text: '"Bộ thìa dừa này là món đồ không thể thiếu trong nhà bếp của tôi. Đẹp, tiện dụng và làm từ vật liệu bền vững."',
      authorName: 'Quang Minh'
    }
  ];

  return (
    <section className="testimonialSection">
      <div className="sectionHeader scroll-animation fade-in">
        <h2 className="sectionTitle">Khách Hàng Nói Gì Về Chúng Tôi</h2>
      </div>
      <div className="testimonialGrid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonialCard scroll-animation slide-in-up">
            <div className="testimonialStars">{testimonial.stars}</div>
            <p className="testimonialText">{testimonial.text}</p>
            <div className="testimonialAuthor">
              <div className="authorAvatar"></div>
              <p className="authorName">{testimonial.authorName}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;

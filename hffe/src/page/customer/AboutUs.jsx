import React from 'react';
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import './css/AboutUs.css';
import { FaLeaf, FaHandshake, FaShieldAlt, FaHeart } from 'react-icons/fa';

const AboutUs = () => {
  // Scrolls to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-us-page">
      <MainHeader />
      
      <div className="page-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <h1>Về Chúng Tôi</h1>
            <p>Đồng hành cùng bạn trên hành trình khám phá ẩm thực tự nhiên và lành mạnh</p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="about-section story-section">
          <div className="container">
            <div className="section-grid">
              <div className="section-content">
                <h2>Câu Chuyện Của Chúng Tôi</h2>
                <p>Han Foods được thành lập vào năm 2018 với sứ mệnh mang đến những sản phẩm thực phẩm tự nhiên, an toàn và dinh dưỡng cho người tiêu dùng Việt Nam.</p>
                <p>Xuất phát từ tâm huyết của những người sáng lập - những người luôn trăn trở về vấn đề an toàn thực phẩm và mong muốn người Việt được tiếp cận với nguồn thực phẩm sạch, Han Foods đã không ngừng nỗ lực để trở thành người bạn đồng hành tin cậy trong hành trình chăm sóc sức khỏe của mỗi gia đình.</p>
                <p>Chúng tôi tin rằng thực phẩm không chỉ là nguồn năng lượng mà còn là nguồn dưỡng chất quý giá cho cơ thể. Với phương châm "Thiên nhiên - An toàn - Dinh dưỡng", Han Foods cam kết mang đến những sản phẩm chất lượng cao, được sản xuất theo quy trình nghiêm ngặt, đảm bảo giữ nguyên giá trị dinh dưỡng và hương vị tự nhiên.</p>
              </div>
              <div className="section-image">
                <img src="/assets/about-story.jpg" alt="Câu chuyện Han Foods" />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="about-section values-section">
          <div className="container">
            <h2 className="section-title">Giá Trị Cốt Lõi</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <FaLeaf />
                </div>
                <h3>Thiên Nhiên</h3>
                <p>Chúng tôi cam kết sử dụng nguyên liệu tự nhiên, không hóa chất, không phẩm màu và chất bảo quản độc hại.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaShieldAlt />
                </div>
                <h3>An Toàn</h3>
                <p>Mỗi sản phẩm đều trải qua quy trình kiểm soát chất lượng nghiêm ngặt, đảm bảo an toàn tuyệt đối cho người sử dụng.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaHandshake />
                </div>
                <h3>Trách Nhiệm</h3>
                <p>Chúng tôi cam kết minh bạch thông tin và xây dựng mối quan hệ bền vững với khách hàng, đối tác và cộng đồng.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaHeart />
                </div>
                <h3>Tận Tâm</h3>
                <p>Mỗi sản phẩm được làm ra với sự tâm huyết và tình yêu, như thể chúng tôi đang làm cho chính gia đình mình.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Production Process */}
        <section className="about-section process-section">
          <div className="container">
            <div className="section-grid reverse">
              <div className="section-image">
                <img src="/assets/production-process.jpg" alt="Quy trình sản xuất" />
              </div>
              <div className="section-content">
                <h2>Quy Trình Sản Xuất</h2>
                <p>Tại Han Foods, chúng tôi tự hào về quy trình sản xuất hiện đại, kết hợp công nghệ tiên tiến và phương pháp truyền thống để tạo ra những sản phẩm chất lượng cao mà vẫn giữ được hương vị tự nhiên.</p>
                <p>Mỗi nguyên liệu đầu vào đều được tuyển chọn kỹ lưỡng từ những nhà cung cấp uy tín, đảm bảo nguồn gốc xuất xứ rõ ràng. Các sản phẩm của chúng tôi không sử dụng chất bảo quản nhân tạo, phẩm màu hay hương liệu hóa học.</p>
                <p>Quy trình sản xuất tuân thủ nghiêm ngặt các tiêu chuẩn về an toàn vệ sinh thực phẩm, được chứng nhận bởi các tổ chức uy tín trong và ngoài nư��c như ISO 22000, HACCP...</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certificate Section */}
        <section className="about-section certificate-section">
          <div className="container">
            <h2 className="section-title">Chứng Nhận Chất Lượng</h2>
            <div className="certificate-grid">
              <div className="certificate-item">
                <img src="/assets/cert-haccp.png" alt="Chứng nhận HACCP" />
                <p>HACCP</p>
              </div>
              <div className="certificate-item">
                <img src="/assets/cert-iso22000.png" alt="Chứng nhận ISO 22000" />
                <p>ISO 22000</p>
              </div>
              <div className="certificate-item">
                <img src="/assets/cert-organic.png" alt="Chứng nhận Organic" />
                <p>USDA Organic</p>
              </div>
              <div className="certificate-item">
                <img src="/assets/cert-nonfda.png" alt="Chứng nhận NonFDA" />
                <p>Non-GMO Project</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="about-section team-section">
          <div className="container">
            <h2 className="section-title">Đội Ngũ Của Chúng Tôi</h2>
            <p className="section-subtitle">Han Foods là nơi hội tụ của những con người đam mê ẩm thực, có kinh nghiệm và chuyên môn trong ngành thực phẩm, cùng chung tay xây dựng một thương hiệu uy tín, mang đến những sản phẩm chất lượng cao.</p>
            
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <img src="/assets/team-member1.jpg" alt="Đội ngũ" />
                </div>
                <h4>Nguyễn Văn A</h4>
                <p>Founder & CEO</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <img src="/assets/team-member2.jpg" alt="Đội ngũ" />
                </div>
                <h4>Trần Thị B</h4>
                <p>Food Specialist</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <img src="/assets/team-member3.jpg" alt="Đội ngũ" />
                </div>
                <h4>Lê Văn C</h4>
                <p>Quality Control Manager</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MainFooter />
    </div>
  );
};

export default AboutUs;

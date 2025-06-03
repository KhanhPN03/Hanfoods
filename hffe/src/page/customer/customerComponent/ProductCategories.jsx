import React from 'react';

const ProductCategories = () => {
  const categories = [
    {
      imgClass: "kitchenwareImg",
      title: "Dụng Cụ Nhà Bếp Từ Dừa",
      description: "Các sản phẩm thân thiện với môi trường cho nhà bếp",
      animationClass: "slide-in-left"
    },
    {
      imgClass: "cosmeticsImg",
      title: "Mỹ Phẩm Từ Dừa",
      description: "Chăm sóc tự nhiên cho da & tóc",
      animationClass: "slide-in-bottom"
    },
    {
      imgClass: "foodImg",
      title: "Thực Phẩm Từ Dừa",
      description: "Món ăn lành mạnh & ngon miệng",
      animationClass: "slide-in-right"
    }
  ];

  return (
    <div className="productCategories">
      {categories.map((category, index) => (
        <div key={index} className={`categoryCard scroll-animation ${category.animationClass}`}>
          <div className={`categoryImg ${category.imgClass}`}></div>
          <h3 className="categoryTitle">{category.title}</h3>
          <p className="categoryDesc">{category.description}</p>
          <button className="categoryBtn">Xem Bộ Sưu Tập</button>
        </div>
      ))}
    </div>
  );
};

export default ProductCategories;

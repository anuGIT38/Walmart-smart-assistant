import React from "react";

const ProductDetails = ({ product }) => {
  return (
    <div className="product-display">
      {/* Product Header */}
      <div className="product-header">
        {/* {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        )} */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{product.price}</p>
          <p className="product-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < Math.floor(product.rating) ? "★" : "☆"}</span>
            ))}{" "}
            ({product.reviewCount} reviews)
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <p className="product-description">{product.description}</p>
      <p className="product-location">📍 {product.location}</p>

      {/* Ingredients Analysis */}
      <div className="ingredients-section">
        <h4>Ingredients Analysis</h4>
        {product.ingredients ? (
          <ul className="ingredients-list">
            {product.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient}
                {product.warnings?.includes(ingredient) && (
                  <span className="warning-badge">
                    ⚠️ Contains potentially harmful ingredient
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No ingredient information available</p>
        )}
      </div>

      {/* Nutrition Facts */}
      {product.nutrition && (
        <div className="nutrition-section">
          <h4>Nutrition Facts (per serving)</h4>
          <ul>
            <li>Calories: {product.nutrition.calories}</li>
            <li>Fat: {product.nutrition.fat}</li>
            <li>Protein: {product.nutrition.protein}</li>
          </ul>
        </div>
      )}

      {/* Sustainability Info */}
      {product.sustainability && (
        <div className="sustainability-section">
          <h4>Sustainability</h4>
          <ul>
            {product.sustainability.palmOilFree && <li>🌱 Palm oil free</li>}
            {product.sustainability.organic && <li>🌿 Certified organic</li>}
            <li>♻️ Packaging: {product.sustainability.packaging}</li>
          </ul>
        </div>
      )}

      {/* Discounts */}
      {product.discounts && product.discounts.length > 0 && (
        <div className="discounts-section">
          <h4>Special Offers</h4>
          <ul>
            {product.discounts.map((discount, index) => (
              <li key={index} className="discount-item">
                🎉 {discount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives */}
      {product.alternatives && (
        <div className="alternatives-section">
          <h4>Similar Products</h4>
          <table className="alternatives-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Eco-Friendly</th>
              </tr>
            </thead>
            <tbody>
              {product.alternatives.map((alt, index) => (
                <tr key={index}>
                  <td>{alt.name}</td>
                  <td>{alt.price}</td>
                  <td>{alt.ecoFriendly ? "✅ Yes" : "❌ No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Reviews */}
      {product.reviews && (
        <div className="reviews-section">
          <h4>Customer Reviews</h4>
          <div className="review-list">
            {product.reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <span className="review-user">{review.user}</span>
                  <span className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                    ))}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

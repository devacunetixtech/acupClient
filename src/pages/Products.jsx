// src/pages/Products.jsx
import React from "react";
import Button from "../components/Button";

const Products = () => {
    const products = [
        {
            id: 1,
            name: "Wireless Headphones",
            price: 99.99,
            description: "High-quality over-ear wireless headphones with noise cancellation.",
            image: "https://images.philips.com/is/image/philipsconsumer/491e2dd5e0d1466f8ee5b0cd010451ae?wid=700&hei=700&$pnglarge$"
        },
        {
            id: 2,
            name: "Smartwatch",
            price: 149.99,
            description: "Track your fitness and notifications in style.",
            image: "https://cdn-img.oraimo.com/fit-in/600x600/AE/product/2023/11/21/OSW-801-680-7.jpg"
        },
        {
            id: 3,
            name: "Gaming Mouse",
            price: 59.99,
            description: "RGB lighting and ultra-fast response time.",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbkbzImLmUp0OqmDKEZ8ldk5no6fPIsn662w&s"
        },
        {
            id: 4,
            name: "4K Monitor",
            price: 299.99,
            description: "Ultra HD display for stunning visuals.",
            image: "https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/75/5266602/1.jpg?8126"
        },
        {
            id: 5,
            name: "Bluetooth Speaker",
            price: 79.99,
            description: "Portable speaker with deep bass and clear sound.",
            image: "https://m.media-amazon.com/images/I/61Fq2bX+JDL._AC_SL1500_.jpg"
        },
        {
            id: 6,
            name: "External Hard Drive",
            price: 89.99,
            description: "2TB portable hard drive for all your storage needs.",
            image: "https://m.media-amazon.com/images/I/81qkz1kT0DL._AC_SL1500_.jpg"
        },
        {
            id: 7,
            name: "Fitness Tracker",
            price: 49.99,
            description: "Monitor your health and activity levels.",
            image: "https://m.media-amazon.com/images/I/61jLi8nXJDL._AC_SL1500_.jpg"
        },
        {
            id: 8,
            name: "E-Reader",
            price: 129.99,
            description: "Read your favorite books on the go with this lightweight e-reader.",
            image: "https://m.media-amazon.com/images/I/61bG6yKXJDL._AC_SL1000_.jpg"
        },
        {
            id: 9,
            name: "Action Camera",
            price: 199.99,
            description: "Capture your adventures in stunning 4K resolution.",
            image: "https://m.media-amazon.com/images/I/61kX1g6kXDL._AC_SL1500_.jpg"
        },
        {
            id: 10,
            name: "Noise-Cancelling Earbuds",
            price: 129.99,
            description: "Compact earbuds with active noise cancellation.",
            image: "https://m.media-amazon.com/images/I/51b5YG6YxkL._AC_SL1500_.jpg"
        }
    ];

    const handleBuy = (name) => {
        alert(`You bought: ${name}`);
    };

    const handleView = (name) => {
        alert(`Viewing details for: ${name}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Available Products</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl p-6 flex flex-col items-center text-center"
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-40 h-40 object-contain mb-4"
                        />
                        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                        <p className="text-lg font-bold text-blue-600 mb-4">${product.price}</p>

                        <div className="flex gap-3">
                            <Button
                                title="Buy Now"
                                color="bg-green-500 hover:bg-green-600 text-white"
                                test={() => handleBuy(product.name)}
                            />
                            <Button
                                title="View"
                                color="bg-blue-500 hover:bg-blue-600 text-white"
                                test={() => handleView(product.name)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;

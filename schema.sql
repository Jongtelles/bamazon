DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50),
    department_name VARCHAR(50),
    price INT(11),
    stock_quantity INT(11),
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Dog Squeegee", "Pets", 100, 10),
("Diamond-Plated Cheese Grater", "Kitchen", 5000, 22),
("All-Over Hair Dryer", "Grooming", 35, 65),
("Computer-Smell Candle", "Home", 30, 146),
("Always Correctly-Hung Toilet Paper Holder", "Bath", 15, 175),
("Reverse Toaster", "Appliances", 40, 233),
("Upside-Down Hammock", "Outdoors", 120, 192),
("Gold-Plated Calculator", "Electronics", 2000, 507),
("Good Fun Kid Toy", "Kids", 20, 80),
("Mysterious Gift", "Unknown", 9999, 1);
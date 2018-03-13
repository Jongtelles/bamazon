DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(30),
    department_name VARCHAR(30),
    price INT(11),
    stock_quantity INT(11),
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Dog Squeegee", "Pets", 100, 10),
("Hair and body dryer", "Grooming", 20, 100),
("Mysterious Gift", "Unknown", 9999, 1);
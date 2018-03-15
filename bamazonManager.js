const mysql = require('mysql');
const inquirer = require('inquirer')
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

const start = () => {
    inquirer.prompt([{
        message: "Hi there Manager, what would you like to do?",
        type: "list",
        name: "choice",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    }]).then(
        (answer) => {
            switch (answer.choice) {
                case "View Products for Sale":
                    viewProducts();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add New Product":
                    newProduct();
                    break;
            }
        });
}

const viewProducts = () => {
    connection.query("SELECT * FROM products", (err, results) => {
        if (err) throw err;
        let productsArr = [];
        for (let i = 0; i < results.length; i++) {
            let tableItem = `id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price} | current stock: ${results[i].stock_quantity}`
            productsArr.push(tableItem);
        }
        console.log(productsArr);
    });
}

const lowInventory = () => {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, results) => {
        if (err) throw err;
        let productsArr = [];
        for (let i = 0; i < results.length; i++) {
            let tableItem = `id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price} | current stock: ${results[i].stock_quantity}`
            productsArr.push(tableItem);
        }
        if (productsArr = []) {
            console.log(`No products with less than 5 items in stock!`)
            return
        } else console.log(`Products with less than 5 items in stock:`);
        console.log(productsArr);
    });
}

const productUpdater = (currentInv, stock, id) => {
    connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: currentInv + stock
        },
        {
            item_id: id
        }
    ], (err) => {
        if (err) throw err;
    });
}

const addInventory = () => {
    connection.query("SELECT * FROM products", (err, results) => {
        if (err) throw err
        inquirer.prompt([{
                message: "What product would you like to add inventory to?",
                type: "list",
                name: "choice",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        let tableItem = `id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price} | current stock: ${results[i].stock_quantity}`
                        choiceArray.push(tableItem);
                    }
                    return choiceArray;
                },
            },
            {
                name: "howMany",
                type: "input",
                message: "How many would you like to add?"
            }
        ]).then((answer) => {
            let convertedChoice;
            let chosenItem;
            let additionalStock;
            let currentInv;
            //TODO: since an object is not returned to the user, we need this hack to get the correct choice, it will not work with more than 10 inventoy items so I need to refactor
            if (answer.choice[4] == 1 && answer.choice[5] == 0) {
                convertedChoice = 10;
            } else {
                convertedChoice = parseInt(answer.choice[4]);
            }
            for (let i = 0; i < results.length; i++) {
                if (results[i].item_id === convertedChoice) {
                    chosenItem = results[i];
                }
            }
            additionalStock = parseInt(answer.howMany);
            currentInv = parseInt(chosenItem.stock_quantity);
            productUpdater(currentInv, additionalStock, chosenItem.item_id);
            console.log(`Success! Added ${additionalStock} additional stock to ${chosenItem.product_name}`);
        });
    });
}

// Product Constructor
function Product(name, department, price, stock) {
    this.name = name;
    this.dept = department;
    this.price = price;
    this.stock = stock;
}

const newProduct = () => {
    inquirer.prompt([{
            message: "What is the name of the product you're adding to inventory?",
            type: "input",
            name: "newProductName",
        },
        {
            //TODO: update this to a list from the db
            message: "What department does the product belong to?",
            type: "input",
            name: "newProductDept",
        },
        {
            message: "What is the product's price?",
            type: "number",
            name: "newProductPrice",
        },
        {
            message: "How many of the product are in stock?",
            type: "number",
            name: "newProductStock",
        }
    ]).then((answer) => {
        let newProduct = new Product(answer.newProductName, answer.newProductDept, answer.newProductPrice, answer.newProductStock);
        console.log(newProduct);
        let query = `INSERT INTO products (product_name, department_name, price, stock_quantity)
        VALUES ('${newProduct.name}', '${newProduct.dept}', ${newProduct.price}, ${newProduct.stock});`;
        console.log(query);
        connection.query(query, (err, results) => {
            if (err) throw err;
            else console.log('Success! Added new product to inventory:');
            console.log(newProduct);
        });
    });
}

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});
// Boilerplate setup for mysql
const mysql = require('mysql');
const inquirer = require('inquirer')
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

// main function that will ask for user input
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
            let tableItem = `
            id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price} | current stock: ${results[i].stock_quantity}`
            productsArr.push(tableItem);
        }
        console.log(`\n ${productsArr} \n`);
        return ask();
    });
}

const ask = () => {
    inquirer.prompt([{
        type: 'confirm',
        name: 'ask',
        message: 'Want to do something else? (just hit enter for yes) \n',
        default: true
    }]).then((answer) => {
        if (answer.ask) {
            start();
        } else
            return console.log(`Bye!`);
    });
}

const lowInventory = () => {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", (err, results) => {
        if (err) throw err;
        let productsArr = [];
        for (let i = 0; i < results.length; i++) {
            let tableItem = `
            id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price} | current stock: ${results[i].stock_quantity}`;
            productsArr.push(tableItem);
        }
        if (results.length == 0) {
            console.log(`\n No products with less than 5 items in stock! \n`)
            return ask();
        } else
            console.log(`\n Products with less than 5 items in stock: ${productsArr} \n`);
        return ask();
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
    return
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
                type: "number",
                message: "How many would you like to add?"
            }
        ]).then((answer) => {
            let converted = answer.choice.split('|');
            converted = converted[0].split(':');
            let convertedChoice = parseInt(converted[1].trim());
            let chosenItem;
            let additionalStock;
            let currentInv;
            let tempId;
            for (let i = 0; i < results.length; i++) {
                if (results[i].item_id === convertedChoice) {
                    chosenItem = results[i];
                }
            }
            additionalStock = parseInt(answer.howMany);
            currentInv = parseInt(chosenItem.stock_quantity);
            tempId = parseInt(chosenItem.item_id);
            productUpdater(currentInv, additionalStock, tempId);
            console.log(`\n Success! Added ${additionalStock} additional stock to ${chosenItem.product_name}. New current stock: ${currentInv + additionalStock}\n`);
            return ask();
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
        let query = `INSERT INTO products (product_name, department_name, price, stock_quantity)
        VALUES ('${newProduct.name}', '${newProduct.dept}', ${newProduct.price}, ${newProduct.stock});`;
        connection.query(query, (err, results) => {
            if (err) throw err;
            console.log(`\n Success! Added new product to inventory: ${JSON.stringify(newProduct)} \n`);
            return ask();
        });
    });
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    start();
});
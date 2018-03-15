const mysql = require('mysql');
const inquirer = require('inquirer');
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
    connection.query("SELECT * FROM products", (err, results) => {
        if (err) throw err;
        inquirer.prompt([{
                message: "?",
                type: "rawlist",
                name: "choice",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        let tableItem = `id: ${results[i].item_id} | product: ${results[i].product_name} | department: ${results[i].department_name} | price: $${results[i].price}`
                        choiceArray.push(tableItem);
                    }
                    return choiceArray;
                },
            },
            {
                name: "howMany",
                type: "input",
                message: "How many would you like to buy?"
            }
        ]).then((answer) => {
            let chosenItem;
            let convertedChoice;
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
            if (chosenItem.stock_quantity > 0 && parseInt(answer.howMany) <= chosenItem.stock_quantity) {
                let purchaseTotal = chosenItem.price * parseInt(answer.howMany);
                connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: chosenItem.stock_quantity - parseInt(answer.howMany)
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    (error) => {
                        if (err) throw err;
                        console.log(`Purchase successful! Your total was:$${purchaseTotal}`);
                        start();
                    });
            } else {
                console.log("Sorry, not enough in stock!")
                start();
            }
        });
    });
}

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});